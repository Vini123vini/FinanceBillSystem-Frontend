import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invoicesAPI, paymentsAPI } from '../utils/api'
import { C, fmt, fmtDate } from '../utils/theme'
import { Badge, Btn, Modal, Input, Select, Spinner, ConfirmModal } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function RecordPaymentModal({ open, onClose, invoice, onSuccess }) {
  const max = invoice?.balanceDue || 0
  const [form, setForm] = useState({ amount:'', paymentDate:new Date().toISOString().split('T')[0], paymentMethod:'upi', referenceNumber:'', notes:'' })
  const [saving, setSaving] = useState(false)
  useEffect(()=>{ setForm(f=>({...f, amount:max||''})) },[max])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const save = async() => {
    if(!form.amount) return toast.error('Enter amount')
    if(parseFloat(form.amount)>max) return toast.error(`Max payable is ${fmt(max)}`)
    setSaving(true)
    try {
      await paymentsAPI.create({ ...form, invoice: invoice._id, amount:parseFloat(form.amount) })
      toast.success('Payment recorded!')
      onSuccess()
      onClose()
    } catch(e) { toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Record Payment" width={440}>
      <div style={{ background:C.accentSoft, border:`1px solid ${C.accentBorder}`, borderRadius:10, padding:'12px 14px', marginBottom:16 }}>
        <div style={{ fontSize:11, color:C.muted }}>Balance Due</div>
        <div style={{ fontSize:20, fontWeight:700, color:C.accent, fontFamily:"'Syne',sans-serif" }}>{fmt(max)}</div>
      </div>
      <Input label="Amount *" type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} max={max}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Input label="Payment Date" type="date" value={form.paymentDate} onChange={e=>set('paymentDate',e.target.value)}/>
        <Select label="Payment Method" value={form.paymentMethod} onChange={e=>set('paymentMethod',e.target.value)}
          options={['upi','neft','rtgs','bank_transfer','cheque','cash','card','other'].map(m=>({value:m,label:m.toUpperCase().replace('_',' ')}))}/>
      </div>
      <Input label="Reference / Transaction ID" value={form.referenceNumber} onChange={e=>set('referenceNumber',e.target.value)} placeholder="Optional"/>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="success" onClick={save} disabled={saving}>{saving?'Saving…':'Record Payment'}</Btn>
      </div>
    </Modal>
  )
}

export default function InvoiceDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPay, setShowPay] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = useCallback(async()=>{
    try { const r = await invoicesAPI.get(id); setData(r.data.data) }
    catch { toast.error('Invoice not found'); nav('/invoices') }
    finally { setLoading(false) }
  },[id])

  useEffect(()=>{ load() },[load])

  if(loading) return <Spinner/>
  if(!data) return null
  const inv = data

  const updateStatus = async(status) => {
    try {
      await invoicesAPI.setStatus(id, status)
      await load()
      toast.success(`Status updated to ${status}`)
    } catch { toast.error('Failed to update status') }
  }

  const deleteInv = async() => {
    try { await invoicesAPI.delete(id); toast.success('Invoice deleted'); nav('/invoices') }
    catch { toast.error('Delete failed') }
  }

  const pct = inv.totalAmount > 0 ? (inv.amountPaid / inv.totalAmount) * 100 : 0

  return (
    <div style={{ padding:'28px 32px', maxWidth:960, margin:'0 auto' }} className="page-content">
      <RecordPaymentModal open={showPay} onClose={()=>setShowPay(false)} invoice={inv} onSuccess={load}/>
      <ConfirmModal open={confirmDelete} onClose={()=>setConfirmDelete(false)} onConfirm={deleteInv} title="Delete Invoice" message={`Delete invoice ${inv.invoiceNumber}? This cannot be undone.`}/>

      {/* Topbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>nav('/invoices')} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 12px', color:C.muted, cursor:'pointer', fontSize:12 }}>← Back</button>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:C.text, fontFamily:"'Syne',sans-serif" }}>{inv.invoiceNumber}</div>
            <div style={{ fontSize:12, color:C.muted }}>Created {fmtDate(inv.createdAt)}</div>
          </div>
          <Badge status={inv.status}/>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {inv.status!=='paid'&&inv.balanceDue>0 && <Btn variant="success" onClick={()=>setShowPay(true)}>💳 Record Payment</Btn>}
          {inv.status==='draft' && <Btn variant="outline" onClick={()=>updateStatus('sent')}>Send Invoice</Btn>}
          {inv.status==='sent' && <Btn variant="outline" onClick={()=>updateStatus('pending')}>Mark Pending</Btn>}
          <Btn variant="danger" onClick={()=>setConfirmDelete(true)}>Delete</Btn>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:20 }}>
        {/* Main Invoice Card */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
          {/* Header */}
          <div style={{ padding:'28px 32px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ width:38, height:38, background:`linear-gradient(135deg, ${C.accent}, #9589FF)`, borderRadius:10,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff', marginBottom:10 }}>₹</div>
              <div style={{ fontSize:11, color:C.muted, letterSpacing:'0.5px', marginBottom:3 }}>FROM</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{user?.business?.name || user?.name}</div>
              {user?.business?.address && <div style={{ fontSize:12, color:C.muted }}>{user.business.address}</div>}
              {user?.business?.city && <div style={{ fontSize:12, color:C.muted }}>{user.business.city}, {user.business.state}</div>}
              {user?.business?.gstin && <div style={{ fontSize:11, color:C.muted, fontFamily:"'DM Mono',monospace" }}>GSTIN: {user.business.gstin}</div>}
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:22, fontWeight:800, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>{inv.invoiceNumber}</div>
              <div style={{ fontSize:12, color:C.muted }}>Issue: {fmtDate(inv.issueDate)}</div>
              <div style={{ fontSize:12, color:inv.status==='overdue'?C.red:C.muted }}>Due: {fmtDate(inv.dueDate)}</div>
            </div>
          </div>

          {/* To */}
          <div style={{ padding:'18px 32px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:'0.5px', marginBottom:6 }}>BILLED TO</div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{inv.client?.name}</div>
            <div style={{ fontSize:12, color:C.muted }}>{inv.client?.company}</div>
            <div style={{ fontSize:12, color:C.muted }}>{inv.client?.email}</div>
            {inv.client?.gstin && <div style={{ fontSize:11, color:C.muted, fontFamily:"'DM Mono',monospace" }}>GSTIN: {inv.client.gstin}</div>}
          </div>

          {/* Line Items */}
          <div style={{ padding:'0 32px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 70px 100px 80px 110px', padding:'10px 0',
              fontSize:10, fontWeight:700, color:C.subtle, letterSpacing:'0.8px', textTransform:'uppercase', borderBottom:`1px solid ${C.border}` }}>
              {['Description','Qty','Rate','Tax','Amount'].map(h=><span key={h}>{h}</span>)}
            </div>
            {(inv.lineItems||[]).map((it,i)=>(
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 70px 100px 80px 110px', padding:'12px 0',
                borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
                <span style={{ color:C.text }}>{it.description}</span>
                <span style={{ color:C.muted }}>{it.quantity}</span>
                <span style={{ color:C.muted }}>{fmt(it.rate)}</span>
                <span style={{ color:C.muted }}>{it.taxRate}%</span>
                <span style={{ fontWeight:600, color:C.text }}>{fmt(it.amount||(it.quantity*it.rate))}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ padding:'18px 32px', borderTop:`1px solid ${C.border}` }}>
            {[['Subtotal',inv.subtotal],['Tax',inv.taxAmount],inv.discountAmount>0?['Discount',-(inv.discountAmount)]:null].filter(Boolean).map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
                <span style={{ color:C.muted }}>{l}</span>
                <span style={{ color:v<0?C.green:C.text }}>{fmt(Math.abs(v))}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:`1px solid ${C.border}`, marginTop:4 }}>
              <span style={{ fontSize:14, fontWeight:700, color:C.text }}>Total</span>
              <span style={{ fontSize:20, fontWeight:800, color:C.text, fontFamily:"'Syne',sans-serif" }}>{fmt(inv.totalAmount)}</span>
            </div>
          </div>

          {inv.notes && (
            <div style={{ padding:'14px 32px 24px' }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:5 }}>NOTES</div>
              <div style={{ fontSize:13, color:C.textSub, lineHeight:1.6 }}>{inv.notes}</div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Payment Progress */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:14 }}>Payment Status</div>
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
                <span style={{ color:C.muted }}>Paid</span>
                <span style={{ fontWeight:700, color:C.green }}>{fmt(inv.amountPaid)}</span>
              </div>
              <div style={{ height:8, borderRadius:4, background:C.border }}>
                <div style={{ height:'100%', borderRadius:4, width:`${Math.min(pct,100)}%`, background:C.green, transition:'width 0.4s' }}/>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginTop:5, color:C.muted }}>
                <span>{Math.round(pct)}% paid</span>
                <span>Due: {fmt(inv.balanceDue)}</span>
              </div>
            </div>
            {inv.balanceDue > 0 && (
              <Btn variant="success" onClick={()=>setShowPay(true)} style={{ width:'100%', justifyContent:'center' }}>
                Record Payment
              </Btn>
            )}
          </div>

          {/* Client */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:12 }}>Client</div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:`${inv.client?.color||C.accent}25`,
                border:`1.5px solid ${inv.client?.color||C.accent}55`, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, fontWeight:700, color:inv.client?.color||C.accent }}>
                {inv.client?.name?.split(' ').map(n=>n[0]).slice(0,2).join('')}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{inv.client?.name}</div>
                <div style={{ fontSize:11, color:C.muted }}>{inv.client?.company}</div>
              </div>
            </div>
            {inv.client?.email && <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>✉ {inv.client.email}</div>}
            {inv.client?.phone && <div style={{ fontSize:12, color:C.muted }}> {inv.client.phone}</div>}
            <Btn variant="outline" size="sm" onClick={()=>nav(`/clients/${inv.client?._id}`)} style={{ marginTop:10, width:'100%', justifyContent:'center' }}>View Client</Btn>
          </div>

          {/* Payment History */}
          {(data.payments||[]).length > 0 && (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:12 }}>Payments</div>
              {(data.payments||[]).map(p=>(
                <div key={p._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{fmt(p.amount)}</div>
                    <div style={{ fontSize:10, color:C.muted }}>{fmtDate(p.paymentDate)} · {p.paymentMethod?.toUpperCase()}</div>
                  </div>
                  <Badge status="paid" label="✓"/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
