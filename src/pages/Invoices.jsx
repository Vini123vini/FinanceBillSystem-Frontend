import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoicesAPI, clientsAPI } from '../utils/api'
import { C, fmt, fmtDate, STATUS_META } from '../utils/theme'
import { Card, Avatar, Badge, Btn, Spinner, EmptyState, Modal, Input, Select, Textarea, SearchInput, PageHeader } from '../components/UI'
import toast from 'react-hot-toast'

const TABS = ['all','draft','sent','pending','paid','overdue']

function NewInvoiceModal({ open, onClose, onSuccess }) {
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({ client:'', dueDate:'', notes:'', lineItems:[{description:'',quantity:1,rate:'',taxRate:18}] })
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    if(open) clientsAPI.list({limit:100}).then(r=>setClients(r.data.data||[])).catch(()=>{})
  },[open])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const setItem = (i,k,v) => setForm(f=>({...f,lineItems:f.lineItems.map((it,idx)=>idx===i?{...it,[k]:v}:it)}))
  const addItem = () => setForm(f=>({...f,lineItems:[...f.lineItems,{description:'',quantity:1,rate:'',taxRate:18}]}))
  const removeItem = (i) => setForm(f=>({...f,lineItems:f.lineItems.filter((_,idx)=>idx!==i)}))

  const calc = () => {
    return form.lineItems.reduce((s,it)=>{
      const a=(parseFloat(it.quantity)||0)*(parseFloat(it.rate)||0)
      const t=a*(parseFloat(it.taxRate)||0)/100
      return{sub:s.sub+a,tax:s.tax+t}
    },{sub:0,tax:0})
  }
  const {sub,tax} = calc()

  const save = async() => {
    if(!form.client) return toast.error('Select a client')
    if(!form.lineItems.some(it=>it.description&&it.rate)) return toast.error('Add at least one item')
    setSaving(true)
    try {
      const r = await invoicesAPI.create({ ...form, lineItems:form.lineItems.filter(it=>it.description&&it.rate) })
      toast.success('Invoice created!')
      onSuccess(r.data.data._id)
      onClose()
    } catch(e) { toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }

  const clientOpts = [{value:'',label:'Select a client…'},...clients.map(c=>({value:c._id,label:`${c.name}${c.company?` · ${c.company}`:''}`}))]

  return (
    <Modal open={open} onClose={onClose} title="New Invoice" width={680}>
      <Select label="Client *" value={form.client} onChange={e=>set('client',e.target.value)} options={clientOpts}/>
      <Input label="Due Date" type="date" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)}
        style={{ marginBottom:13 }} min={new Date().toISOString().split('T')[0]}/>
      
      <div style={{ marginBottom:13 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <label style={{ fontSize:12, fontWeight:600, color:C.textSub }}>Line Items</label>
          <Btn variant="ghost" size="sm" onClick={addItem}>+ Add Item</Btn>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 70px 90px 80px 32px', padding:'8px 12px',
            fontSize:10, fontWeight:700, color:C.subtle, letterSpacing:'0.8px', textTransform:'uppercase',
            borderBottom:`1px solid ${C.border}`, background:C.card }}>
            {['Description','Qty','Rate','Tax%',''].map(h=><span key={h}>{h}</span>)}
          </div>
          {form.lineItems.map((it,i)=>(
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 70px 90px 80px 32px', padding:'8px 12px', gap:6, borderBottom:`1px solid ${C.border}`, alignItems:'center' }}>
              <input value={it.description} onChange={e=>setItem(i,'description',e.target.value)} placeholder="Item description"
                style={{ background:'transparent', border:'none', outline:'none', color:C.text, fontSize:12, fontFamily:"'DM Sans',sans-serif", width:'100%' }}/>
              <input type="number" value={it.quantity} onChange={e=>setItem(i,'quantity',e.target.value)} min={1}
                style={{ background:'transparent', border:'none', outline:'none', color:C.text, fontSize:12, fontFamily:"'DM Mono',monospace", width:'100%' }}/>
              <input type="number" value={it.rate} onChange={e=>setItem(i,'rate',e.target.value)} placeholder="0"
                style={{ background:'transparent', border:'none', outline:'none', color:C.text, fontSize:12, fontFamily:"'DM Mono',monospace", width:'100%' }}/>
              <input type="number" value={it.taxRate} onChange={e=>setItem(i,'taxRate',e.target.value)} placeholder="0"
                style={{ background:'transparent', border:'none', outline:'none', color:C.text, fontSize:12, fontFamily:"'DM Mono',monospace", width:'100%' }}/>
              <button onClick={()=>removeItem(i)} disabled={form.lineItems.length<=1}
                style={{ background:'none', border:'none', color:C.red, cursor:'pointer', fontSize:14, opacity:form.lineItems.length<=1?0.3:1 }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:10, gap:20, fontSize:12 }}>
          <span style={{ color:C.muted }}>Subtotal: <strong style={{ color:C.text }}>{fmt(sub)}</strong></span>
          <span style={{ color:C.muted }}>Tax: <strong style={{ color:C.text }}>{fmt(tax)}</strong></span>
          <span style={{ color:C.muted }}>Total: <strong style={{ color:C.accent, fontSize:14 }}>{fmt(sub+tax)}</strong></span>
        </div>
      </div>

      <Textarea label="Notes" value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2} placeholder="Thank you for your business."/>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save} disabled={saving}>{saving?'Creating…':'Create Invoice'}</Btn>
      </div>
    </Modal>
  )
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const nav = useNavigate()

  const load = useCallback(async()=>{
    setLoading(true)
    try {
      const r = await invoicesAPI.list({ status: tab==='all'?undefined:tab, search: search||undefined, limit:100 })
      setInvoices(r.data.data)
      setTotal(r.data.total)
    } catch{ toast.error('Failed to load') }
    finally { setLoading(false) }
  },[tab, search])

  useEffect(()=>{ load() },[load])

  return (
    <div style={{ padding:'28px 32px' }} className="page-content">
      <NewInvoiceModal open={showNew} onClose={()=>setShowNew(false)} onSuccess={id=>nav(`/invoices/${id}`)}/>
      <PageHeader title="Invoices" subtitle={`${total} total invoices`}
        right={<Btn variant="primary" onClick={()=>setShowNew(true)}>+ New Invoice</Btn>}/>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:18, overflowX:'auto', paddingBottom:4 }}>
        {TABS.map(t=>{
          const meta = STATUS_META[t]
          return (
            <button key={t} onClick={()=>setTab(t)}
              style={{ padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap',
                background:tab===t?C.accent:C.surface, color:tab===t?'#fff':C.muted,
                transition:'all 0.15s', fontFamily:"'DM Sans',sans-serif" }}>
              {t==='all'?'All':meta?.label||t}
            </button>
          )
        })}
        <div style={{ flex:1 }}/>
        <SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by #…" style={{ width:200 }}/>
      </div>

      <Card>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 110px 110px 90px 90px', padding:'8px 22px',
          fontSize:10, fontWeight:700, color:C.subtle, letterSpacing:'0.8px', textTransform:'uppercase',
          borderBottom:`1px solid ${C.border}` }}>
          {['Client / Invoice','Amount','Due Date','Status',''].map(h=><span key={h}>{h}</span>)}
        </div>
        {loading ? <Spinner/> : invoices.length===0 ? (
          <EmptyState icon="📄" title="No invoices found" subtitle="Create your first invoice to get started" action="+ New Invoice" onAction={()=>setShowNew(true)}/>
        ) : invoices.map(inv=>(
          <div key={inv._id} onClick={()=>nav(`/invoices/${inv._id}`)}
            style={{ display:'grid', gridTemplateColumns:'1fr 110px 110px 90px 90px', padding:'13px 22px',
              alignItems:'center', borderBottom:`1px solid ${C.border}`, cursor:'pointer', transition:'background 0.1s' }}
            onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Avatar name={inv.client?.name||'?'} color={inv.client?.color||C.accent} size={32}/>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{inv.client?.name||'Unknown'}</div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:"'DM Mono',monospace" }}>{inv.invoiceNumber}</div>
              </div>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{fmt(inv.totalAmount)}</span>
            <span style={{ fontSize:12, color:inv.status==='overdue'?C.red:C.muted }}>{fmtDate(inv.dueDate)}</span>
            <Badge status={inv.status}/>
            <span style={{ fontSize:11, color:C.muted }}>→</span>
          </div>
        ))}
      </Card>
    </div>
  )
}
