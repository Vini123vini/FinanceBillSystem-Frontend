import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashAPI } from '../utils/api'
import { C, fmt, fmtShort, MONTHS } from '../utils/theme'
import { StatCard, Card, CardHead, Avatar, Badge, Spinner, PageHeader } from '../components/UI'
import { useAuth } from '../context/AuthContext'

function BarChart({ data=[], expenses=[] }) {
  const max=Math.max(...data,...expenses,1)
  const [hov,setHov]=useState(null)
  return (
    <div style={{ padding:'16px 22px 18px' }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:110 }}>
        {data.map((v,i)=>(
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', height:'100%', cursor:'pointer', position:'relative' }}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            {hov===i&&v>0&&(
              <div style={{ position:'absolute', top:-26, left:'50%', transform:'translateX(-50%)',
                fontSize:10, background:C.text, color:'#fff', borderRadius:5, padding:'2px 7px', whiteSpace:'nowrap', zIndex:2 }}>{fmt(v)}</div>
            )}
            <div style={{ flex:1, display:'flex', alignItems:'flex-end', width:'100%', gap:1 }}>
              <div style={{ flex:1, borderRadius:'4px 4px 2px 2px', minHeight:v>0?4:0, height:`${(v/max)*100}%`,
                background:hov===i?C.accent:`${C.accent}44`, transition:'all 0.2s' }}/>
              {expenses[i]>0&&<div style={{ flex:1, borderRadius:'4px 4px 2px 2px', minHeight:3, height:`${(expenses[i]/max)*100}%`,
                background:hov===i?C.red:`${C.red}33`, transition:'all 0.2s' }}/>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:4, marginTop:8 }}>
        {MONTHS.map(m=><div key={m} style={{ flex:1, textAlign:'center', fontSize:9, color:C.subtle }}>{m}</div>)}
      </div>
      <div style={{ display:'flex', gap:16, marginTop:10 }}>
        {[['Revenue',C.accent],['Expenses',C.red]].map(([l,c])=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:10, height:3, borderRadius:2, background:c }}/>
            <span style={{ fontSize:11, color:C.muted }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutChart({ paid=0, pending=0, overdue=0 }) {
  const tot=paid+pending+overdue||1
  const pP=(paid/tot)*100, pN=(pending/tot)*100, pO=(overdue/tot)*100
  const r=52,cx=68,cy=68,circ=2*Math.PI*r
  const segs=[{p:pP,c:C.green},{p:pN,c:C.yellow},{p:pO,c:C.red}]
  let off=0
  return (
    <div style={{ padding:'8px 22px 4px', display:'flex', flexDirection:'column', alignItems:'center' }}>
      <svg width={136} height={136} viewBox="0 0 136 136">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={14}/>
        {segs.map((s,i)=>{
          const dash=(s.p/100)*circ, rot=-90+(off/100)*360; off+=s.p
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.c} strokeWidth={14}
            strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round" transform={`rotate(${rot} ${cx} ${cy})`}/>
        })}
        <text x={cx} y={cy-4} textAnchor="middle" fill={C.text} fontSize="18" fontWeight="800" fontFamily="'Syne',sans-serif">{Math.round(pP)}%</text>
        <text x={cx} y={cy+13} textAnchor="middle" fill={C.muted} fontSize="10">Paid</text>
      </svg>
      <div style={{ display:'flex', gap:14, marginBottom:4 }}>
        {[['Paid',C.green,Math.round(pP)],['Pending',C.yellow,Math.round(pN)],['Overdue',C.red,Math.round(pO)]].map(([l,c,v])=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:2, background:c }}/>
            <span style={{ fontSize:11, color:C.muted }}>{l}</span>
            <span style={{ fontSize:11, fontWeight:700, color:C.text }}>{v}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [d,setD]=useState(null)
  const [loading,setLoading]=useState(true)
  const nav=useNavigate()
  const { user }=useAuth()

  useEffect(()=>{
    dashAPI.stats().then(r=>setD(r.data.data)).catch(console.error).finally(()=>setLoading(false))
  },[])

  if(loading) return <Spinner/>
  const data=d||{}
  const growth=data.revenueGrowth||0

  return (
    <div style={{ padding:'28px 32px' }} className="page-content">

      {/* Light violet welcome banner */}
      <div style={{ background:`linear-gradient(135deg, ${C.accent}18 0%, #A78BFA18 100%)`,
        border:`1px solid ${C.accentBorder}`, borderRadius:16, padding:'22px 28px', marginBottom:24,
        position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-30, top:-30, width:180, height:180, borderRadius:'50%', background:`${C.accent}08` }}/>
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:C.text, fontFamily:"'Syne',sans-serif", margin:0 }}>
              Welcome back, {user?.name?.split(' ')[0]||'User'} 👋
            </h1>
            <p style={{ fontSize:13, color:C.muted, marginTop:4 }}>
              {new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
            </p>
          </div>
          <button onClick={()=>nav('/invoices')} style={{ background:C.accent, border:'none', borderRadius:10,
            padding:'10px 20px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
            fontFamily:"'DM Sans',sans-serif", boxShadow:`0 4px 14px ${C.accent}44` }}>
            + New Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        <StatCard icon="₹" label="Total Revenue" value={fmt(data.totalRevenue)} accent={C.green} change={`${Math.abs(growth)}%`} positive={growth>=0}/>
        <StatCard icon="📄" label="Total Invoices" value={data.totalInvoices||0} accent={C.accent}/>
        <StatCard icon="⏳" label="Pending Amount" value={fmt(data.pendingAmount)} accent={C.yellow} change={`${data.pendingInvoices||0} invoices`}/>
        <StatCard icon="⚠️" label="Overdue Amount" value={fmt(data.overdueAmount)} accent={C.red} change={`${data.overdueInvoices||0} invoices`} positive={false}/>
      </div>

      {/* Charts */}
      <div className="dash-bottom" style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:20, marginBottom:20 }}>
        <Card>
          <CardHead title="Revenue vs Expenses" sub="Monthly breakdown — current year"
            right={<span style={{ fontSize:11, color:C.accent, background:C.accentSoft, padding:'3px 9px', borderRadius:99, fontWeight:600, border:`1px solid ${C.accentBorder}` }}>2025</span>}/>
          <BarChart data={data.revenueByMonth||[]} expenses={data.expByMonth||[]}/>
        </Card>
        <Card>
          <CardHead title="Invoice Status" sub="Distribution"/>
          <DonutChart paid={data.paidInvoices} pending={data.pendingInvoices} overdue={data.overdueInvoices}/>
          <div style={{ padding:'0 22px 18px' }}>
            {[['Paid',data.paidInvoices,C.green],['Pending',data.pendingInvoices,C.yellow],['Overdue',data.overdueInvoices,C.red],['Draft',data.draftInvoices,C.blue]].map(([l,v,c])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:c }}/>
                  <span style={{ fontSize:12, color:C.muted }}>{l}</span>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{v||0}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent */}
      <div className="dash-bottom" style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        <Card>
          <CardHead title="Recent Invoices" sub="Latest transactions"
            right={<button onClick={()=>nav('/invoices')} style={{ background:C.accentSoft, border:`1px solid ${C.accentBorder}`, borderRadius:7, padding:'5px 11px', color:C.accent, fontSize:12, cursor:'pointer', fontWeight:600 }}>View all →</button>}/>
          <div style={{ padding:'12px 0 4px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 80px', padding:'6px 22px',
              fontSize:10, fontWeight:700, color:C.subtle, letterSpacing:'0.8px', textTransform:'uppercase', borderBottom:`1px solid ${C.border}` }}>
              {['Client','Amount','Due','Status'].map(h=><span key={h}>{h}</span>)}
            </div>
            {(data.recentInvoices||[]).map(inv=>(
              <div key={inv._id} onClick={()=>nav(`/invoices/${inv._id}`)}
                style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 80px', padding:'11px 22px',
                  alignItems:'center', borderBottom:`1px solid ${C.border}`, cursor:'pointer', transition:'background 0.1s' }}
                onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <Avatar name={inv.client?.name||'?'} color={inv.client?.color||C.accent} size={28}/>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{inv.client?.name}</div>
                    <div style={{ fontSize:10, color:C.muted, fontFamily:"'DM Mono',monospace" }}>{inv.invoiceNumber}</div>
                  </div>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{fmt(inv.totalAmount)}</span>
                <span style={{ fontSize:11, color:inv.status==='overdue'?C.red:C.muted }}>{fmtShort(inv.dueDate)}</span>
                <Badge status={inv.status}/>
              </div>
            ))}
            {(!data.recentInvoices||!data.recentInvoices.length)&&(
              <div style={{ padding:'24px', textAlign:'center', color:C.muted, fontSize:13 }}>No invoices yet</div>
            )}
          </div>
        </Card>

        <Card>
          <CardHead title="Recent Payments" sub="Latest received"/>
          <div style={{ padding:'12px 0 4px' }}>
            {(data.recentPayments||[]).map(p=>(
              <div key={p._id} style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 22px', borderBottom:`1px solid ${C.border}` }}>
                <Avatar name={p.client?.name||'?'} color={p.client?.color||C.accent} size={32}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.client?.name}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{fmtShort(p.paymentDate)}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.green }}>{fmt(p.amount)}</div>
                  <div style={{ fontSize:9, fontWeight:700, color:C.green, background:C.greenSoft, padding:'1px 6px', borderRadius:99, marginTop:2, border:`1px solid ${C.green}22` }}>PAID</div>
                </div>
              </div>
            ))}
            {(!data.recentPayments||!data.recentPayments.length)&&(
              <div style={{ padding:'32px', textAlign:'center', color:C.muted, fontSize:13 }}>No payments yet</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
