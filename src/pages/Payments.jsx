import { useState, useEffect, useCallback } from 'react'
import { paymentsAPI, invoicesAPI } from '../utils/api'
import { C, fmt, fmtDate } from '../utils/theme'
import { Card, CardHead, Avatar, Badge, Btn, Spinner, EmptyState, Modal, Input, Select, PageHeader, ConfirmModal } from '../components/UI'
import toast from 'react-hot-toast'

function RecordModal({ open, onClose, onSuccess }) {
  const [invoices, setInvoices] = useState([])
  const [form, setForm] = useState({ invoice:'', amount:'', paymentDate:new Date().toISOString().split('T')[0], paymentMethod:'upi', referenceNumber:'', notes:'' })
  const [saving, setSaving] = useState(false)
  useEffect(()=>{
    if(open) invoicesAPI.list({ status:'pending', limit:100 }).then(r=>setInvoices(r.data.data||[])).catch(()=>{})
  },[open])
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  const selectedInv = invoices.find(i=>i._id===form.invoice)
  const save=async()=>{
    if(!form.invoice||!form.amount) return toast.error('Select invoice and enter amount')
    setSaving(true)
    try { await paymentsAPI.create({...form, amount:parseFloat(form.amount)}); toast.success('Payment recorded!'); onSuccess(); onClose() }
    catch(e){ toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Record Payment" width={460}>
      <Select label="Invoice *" value={form.invoice} onChange={e=>{
        const inv=invoices.find(i=>i._id===e.target.value)
        setForm(f=>({...f,invoice:e.target.value,amount:inv?.balanceDue||''}))
      }} options={[{value:'',label:'Select an invoice…'},...invoices.map(i=>({value:i._id,label:`${i.invoiceNumber} · ${i.client?.name} · ${fmt(i.balanceDue)}`}))]}/>
      {selectedInv&&(
        <div style={{ background:'#F0FDF4', border:'1px solid #16A34A33', borderRadius:9, padding:'10px 14px', marginBottom:13, fontSize:12 }}>
          <span style={{ color:C.muted }}>Balance Due: </span>
          <strong style={{ color:C.green }}>{fmt(selectedInv.balanceDue)}</strong>
        </div>
      )}
      <Input label="Amount *" type="number" value={form.amount} onChange={e=>set('amount',e.target.value)}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Input label="Date" type="date" value={form.paymentDate} onChange={e=>set('paymentDate',e.target.value)}/>
        <Select label="Method" value={form.paymentMethod} onChange={e=>set('paymentMethod',e.target.value)}
          options={['upi','neft','rtgs','bank_transfer','cheque','cash','card'].map(m=>({value:m,label:m.toUpperCase().replace('_',' ')}))}/>
      </div>
      <Input label="Reference / TXN ID" value={form.referenceNumber} onChange={e=>set('referenceNumber',e.target.value)} placeholder="Optional"/>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="success" onClick={save} disabled={saving}>{saving?'Saving…':'Record Payment'}</Btn>
      </div>
    </Modal>
  )
}

const METHOD_ICONS = {upi:'📱',neft:'🏦',rtgs:'🏦',bank_transfer:'💳',cheque:'📋',cash:'💵',card:'💳',other:'💰'}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [total, setTotal] = useState(0)
  const [totalAmt, setTotalAmt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showRec, setShowRec] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load=useCallback(async()=>{
    setLoading(true)
    try {
      const r=await paymentsAPI.list({limit:100})
      setPayments(r.data.data); setTotal(r.data.total); setTotalAmt(r.data.totalAmount||0)
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  },[])
  useEffect(()=>{ load() },[load])

  const thisMonth = payments.filter(p=>{ const d=new Date(p.paymentDate),n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()}).reduce((s,p)=>s+p.amount,0)
  const methods = payments.reduce((a,p)=>{ a[p.paymentMethod]=(a[p.paymentMethod]||0)+p.amount; return a },{})
  const topMethod = Object.entries(methods).sort((a,b)=>b[1]-a[1])[0]

  return (
    <div style={{ padding:'28px 32px' }} className="page-content">
      <RecordModal open={showRec} onClose={()=>setShowRec(false)} onSuccess={load}/>
      <ConfirmModal open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={async()=>{
        try { await paymentsAPI.delete(deleteId); toast.success('Deleted'); load() }
        catch { toast.error('Error') }
      }} title="Delete Payment" message="This will reverse the payment from the invoice balance."/>

      <PageHeader title="Payments" subtitle={`${total} transactions recorded`}
        right={<Btn variant="primary" onClick={()=>setShowRec(true)}>+ Record Payment</Btn>}/>

      {/* Green summary banner */}
      <div style={{ background:`linear-gradient(135deg, ${C.green}18, ${C.greenBright}18)`, border:`1px solid ${C.green}30`, borderRadius:16,
        padding:'22px 28px', marginBottom:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-20, top:-20, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }}/>
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:11, color:C.green, fontWeight:700, letterSpacing:'0.5px', marginBottom:4, opacity:0.8 }}>TOTAL COLLECTED</div>
            <div style={{ fontSize:32, fontWeight:800, color:C.green, fontFamily:"'Syne',sans-serif", letterSpacing:'-0.5px' }}>{fmt(totalAmt)}</div>
          </div>
          <div style={{ display:'flex', gap:24 }}>
            {[['This Month',fmt(thisMonth)],['Transactions',total],['Top Method',topMethod?topMethod[0].toUpperCase().replace('_',' '):'—']].map(([l,v])=>(
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:700, color:C.text }}>{v}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Methods mini cards */}
      {Object.keys(methods).length > 0 && (
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
          {Object.entries(methods).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([m,amt])=>(
            <div key={m} style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:10,
              padding:'10px 16px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 1px 4px #0000000A' }}>
              <span style={{ fontSize:18 }}>{METHOD_ICONS[m]||'💰'}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.green }}>{fmt(amt)}</div>
                <div style={{ fontSize:10, color:C.muted }}>{m.toUpperCase().replace('_',' ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 90px 110px 130px 110px 60px', padding:'8px 22px',
          fontSize:10, fontWeight:700, color:C.subtle, letterSpacing:'0.8px', textTransform:'uppercase',
          borderBottom:`1px solid ${C.border}`, background:'#FAFAFA', borderRadius:'12px 12px 0 0' }}>
          {['Client','Amount','Date','Method','Invoice',''].map(h=><span key={h}>{h}</span>)}
        </div>
        {loading ? <Spinner/> : payments.length===0 ? (
          <EmptyState icon="💳" title="No payments yet" subtitle="Record a payment when a client pays" action="+ Record Payment" onAction={()=>setShowRec(true)}/>
        ) : payments.map(p=>(
          <div key={p._id} style={{ display:'grid', gridTemplateColumns:'1fr 90px 110px 130px 110px 60px', padding:'13px 22px',
            alignItems:'center', borderBottom:`1px solid ${C.border}`, transition:'background 0.1s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#F0FDF4'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <Avatar name={p.client?.name||'?'} color={p.client?.color||C.accent} size={30}/>
              <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{p.client?.name}</div>
            </div>
            {/* Green amount */}
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.green }}>{fmt(p.amount)}</div>
            </div>
            <span style={{ fontSize:12, color:C.muted }}>{fmtDate(p.paymentDate)}</span>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
              <span style={{ fontSize:16 }}>{METHOD_ICONS[p.paymentMethod]||'💰'}</span>
              <span style={{ color:C.textSub }}>{p.paymentMethod?.toUpperCase().replace('_',' ')}</span>
            </div>
            <span style={{ fontSize:11, color:C.accent, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>{p.invoice?.invoiceNumber||'—'}</span>
            <button onClick={()=>setDeleteId(p._id)} style={{ background:'#FEF2F2', border:'1px solid #DC262622', borderRadius:6, padding:'4px 8px', color:C.red, cursor:'pointer', fontSize:11, fontWeight:600 }}>Del</button>
          </div>
        ))}
      </Card>
    </div>
  )
}
