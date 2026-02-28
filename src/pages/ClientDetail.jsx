import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsAPI } from '../utils/api'
import { C, fmt, fmtDate } from '../utils/theme'
import { Badge, Btn, Avatar, Spinner, Card, CardHead } from '../components/UI'
import toast from 'react-hot-toast'

export default function ClientDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    clientsAPI.get(id).then(r=>setData(r.data.data)).catch(()=>{ toast.error('Not found'); nav('/clients') }).finally(()=>setLoading(false))
  },[id])

  if(loading) return <Spinner/>
  if(!data) return null
  const { invoices=[], stats={} } = data

  return (
    <div style={{ padding:'28px 32px', maxWidth:900, margin:'0 auto' }} className="page-content">
      <button onClick={()=>nav('/clients')} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 12px', color:C.muted, cursor:'pointer', fontSize:12, marginBottom:20 }}>← Customers</button>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:20 }}>
        {/* Profile */}
        <div>
          <Card style={{ padding:'24px', marginBottom:16 }}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <Avatar name={data.name} color={data.color||C.accent} size={60}/>
              <div style={{ fontSize:15, fontWeight:800, color:C.text, marginTop:10, fontFamily:"'Syne',sans-serif" }}>{data.name}</div>
              <div style={{ fontSize:12, color:C.muted }}>{data.company}</div>
              <div style={{ marginTop:8 }}><Badge status={data.status}/></div>
            </div>
            {data.email && <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>✉ {data.email}</div>}
            {data.phone && <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}> {data.phone}</div>}
            {data.city && <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>📍 {data.city}{data.state?`, ${data.state}`:''}</div>}
            {data.gstin && <div style={{ fontSize:11, color:C.muted, fontFamily:"'DM Mono',monospace", marginTop:8 }}>GST: {data.gstin}</div>}
            <Btn variant="primary" onClick={()=>nav('/invoices')} style={{ width:'100%', justifyContent:'center', marginTop:16 }}>+ Create Invoice</Btn>
          </Card>

          {/* Stats */}
          {[['Total Invoices',stats.totalInvoices||0,C.accent],['Total Paid',fmt(stats.totalPaid||0),C.green],['Outstanding',fmt(stats.outstanding||0),C.red]].map(([l,v,c])=>(
            <div key={l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 18px', marginBottom:10 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:18, fontWeight:700, color:c, fontFamily:"'Syne',sans-serif" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Invoices */}
        <Card>
          <CardHead title="Invoice History" sub={`${invoices.length} invoices`}/>
          <div style={{ padding:'14px 0 4px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 110px 100px 90px', padding:'6px 22px',
              fontSize:10, fontWeight:700, color:C.subtle, letterSpacing:'0.8px', textTransform:'uppercase', borderBottom:`1px solid ${C.border}` }}>
              {['Invoice #','Amount','Due Date','Status'].map(h=><span key={h}>{h}</span>)}
            </div>
            {invoices.length===0 ? (
              <div style={{ padding:'32px', textAlign:'center', color:C.muted, fontSize:13 }}>No invoices yet</div>
            ) : invoices.map(inv=>(
              <div key={inv._id} onClick={()=>nav(`/invoices/${inv._id}`)}
                style={{ display:'grid', gridTemplateColumns:'1fr 110px 100px 90px', padding:'12px 22px',
                  alignItems:'center', borderBottom:`1px solid ${C.border}`, cursor:'pointer', transition:'background 0.1s' }}
                onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span style={{ fontSize:12, fontWeight:600, color:C.accent, fontFamily:"'DM Mono',monospace" }}>{inv.invoiceNumber}</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{fmt(inv.totalAmount)}</span>
                <span style={{ fontSize:12, color:C.muted }}>{fmtDate(inv.dueDate)}</span>
                <Badge status={inv.status}/>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
