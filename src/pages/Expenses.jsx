import { useState, useEffect, useCallback } from 'react'
import { expensesAPI } from '../utils/api'
import { C, fmt, fmtDate } from '../utils/theme'
import { Card, Btn, Spinner, EmptyState, Modal, Input, Select, PageHeader, ConfirmModal } from '../components/UI'
import toast from 'react-hot-toast'

const CATS = ['office','travel','utilities','marketing','software','hardware','salaries','taxes','other']
const CAT_ICONS = {office:'🏢',travel:'✈️',utilities:'💡',marketing:'📣',software:'💻',hardware:'🖥️',salaries:'👥',taxes:'🧾',other:'📌'}

function ExpenseForm({ open, onClose, onSuccess, initial }) {
  const empty = { title:'', category:'office', amount:'', date:new Date().toISOString().split('T')[0], paymentMethod:'cash', vendor:'', notes:'' }
  const [form, setForm] = useState(initial||empty)
  const [saving, setSaving] = useState(false)
  useEffect(()=>{ setForm(initial||empty) },[initial])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const save = async()=>{
    if(!form.title||!form.amount) return toast.error('Title and amount required')
    setSaving(true)
    try {
      if(initial?._id){ await expensesAPI.update(initial._id,form); toast.success('Updated!') }
      else { await expensesAPI.create(form); toast.success('Added!') }
      onSuccess(); onClose()
    } catch(e){ toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title={initial?'Edit Expense':'Add Expense'} width={480}>
      <Input label="Title *" value={form.title} onChange={e=>set('title',e.target.value)} required/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Select label="Category" value={form.category} onChange={e=>set('category',e.target.value)}
          options={CATS.map(c=>({value:c,label:`${CAT_ICONS[c]} ${c.charAt(0).toUpperCase()+c.slice(1)}`}))}/>
        <Input label="Amount (INR) *" type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} required/>
        <Input label="Date *" type="date" value={form.date} onChange={e=>set('date',e.target.value)} required/>
        <Select label="Payment Method" value={form.paymentMethod} onChange={e=>set('paymentMethod',e.target.value)}
          options={['cash','card','upi','neft','bank_transfer','cheque'].map(m=>({value:m,label:m.toUpperCase().replace('_',' ')}))}/>
      </div>
      <Input label="Vendor" value={form.vendor} onChange={e=>set('vendor',e.target.value)} placeholder="Vendor name"/>
      <Input label="Notes" value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Notes or reference"/>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save} disabled={saving}>{saving?'Saving…':initial?'Update':'Add Expense'}</Btn>
      </div>
    </Modal>
  )
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [totalAmt, setTotalAmt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async()=>{
    setLoading(true)
    try {
      const r = await expensesAPI.list({ limit:200 })
      setExpenses(r.data.data); setTotalAmt(r.data.totalAmount||0)
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  },[])
  useEffect(()=>{ load() },[load])

  const catTotals = expenses.reduce((a,e)=>{ a[e.category]=(a[e.category]||0)+e.amount; return a },{})
  const topCat = Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0]
  const thisMonth = expenses.filter(e=>{ const d=new Date(e.date),n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()}).reduce((s,e)=>s+e.amount,0)

  return (
    <div style={{ padding:'28px 32px' }} className="page-content">
      <ExpenseForm open={showForm||!!editItem} onClose={()=>{setShowForm(false);setEditItem(null)}} onSuccess={load} initial={editItem}/>
      <ConfirmModal open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={async()=>{
        try { await expensesAPI.delete(deleteId); toast.success('Deleted'); load() }
        catch { toast.error('Error') }
      }} title="Delete Expense" message="This expense will be permanently deleted."/>

      <PageHeader title="Expenses" subtitle="Track your business expenditure"
        right={<Btn variant="primary" onClick={()=>setShowForm(true)}>+ Add Expense</Btn>}/>

      <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[['Total Expenses',fmt(totalAmt),C.red],['This Month',fmt(thisMonth),C.yellow],['Transactions',expenses.length,C.accent],['Top Category',topCat?`${CAT_ICONS[topCat[0]]} ${topCat[0]}`:'—',C.green]].map(([l,v,c])=>(
          <div key={l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 18px' }}>
            <div style={{ fontSize:20, fontWeight:700, color:c, fontFamily:"'Syne',sans-serif" }}>{v}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{l}</div>
          </div>
        ))}
      </div>

      <Card>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 110px 110px 110px 80px', padding:'8px 22px',
          fontSize:10, fontWeight:700, color:C.subtle, letterSpacing:'0.8px', textTransform:'uppercase', borderBottom:`1px solid ${C.border}` }}>
          {['Title','Category','Amount','Date','Method',''].map(h=><span key={h}>{h}</span>)}
        </div>
        {loading ? <Spinner/> : expenses.length===0 ? (
          <EmptyState icon="💸" title="No expenses yet" subtitle="Track your business expenses" action="+ Add Expense" onAction={()=>setShowForm(true)}/>
        ) : expenses.map(e=>(
          <div key={e._id} style={{ display:'grid', gridTemplateColumns:'1fr 100px 110px 110px 110px 80px', padding:'13px 22px',
            alignItems:'center', borderBottom:`1px solid ${C.border}`, transition:'background 0.1s' }}
            onMouseEnter={ev=>ev.currentTarget.style.background=C.cardHover}
            onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{e.title}</div>
              {e.vendor&&<div style={{ fontSize:11, color:C.muted }}>{e.vendor}</div>}
            </div>
            <span style={{ fontSize:12, color:C.textSub }}>{CAT_ICONS[e.category]||'📌'} {e.category}</span>
            <span style={{ fontSize:13, fontWeight:700, color:C.red }}>{fmt(e.amount)}</span>
            <span style={{ fontSize:12, color:C.muted }}>{fmtDate(e.date)}</span>
            <span style={{ fontSize:11, color:C.muted }}>{(e.paymentMethod||'').toUpperCase().replace('_',' ')}</span>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>setEditItem(e)} style={{ background:C.border, border:'none', borderRadius:5, padding:'4px 8px', color:C.muted, cursor:'pointer', fontSize:11 }}>Edit</button>
              <button onClick={()=>setDeleteId(e._id)} style={{ background:C.redSoft, border:'none', borderRadius:5, padding:'4px 8px', color:C.red, cursor:'pointer', fontSize:11 }}>Del</button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
