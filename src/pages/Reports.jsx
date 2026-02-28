import { useState, useEffect } from 'react'
import { reportsAPI } from '../utils/api'
import { C, fmt, MONTHS } from '../utils/theme'
import { Card, CardHead, Spinner, PageHeader } from '../components/UI'

function AreaChart({ revenue=[], expenses=[] }) {
  const max=Math.max(...revenue,...expenses,1)
  const W=500,H=80
  const pts=(data)=>data.map((v,i)=>`${(i/(data.length-1||1))*W},${H-(v/max)*H}`)
  const line=(data)=>`M ${pts(data).join(' L ')}`
  const area=(data)=>{const p=pts(data);return`M ${p[0]} L ${p.join(' L ')} L ${W},${H} L 0,${H} Z`}
  return (
    <div style={{ padding:'8px 22px 12px' }}>
      <svg viewBox={`0 0 ${W} ${H+4}`} style={{ width:'100%', height:100 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.green} stopOpacity={0.25}/>
            <stop offset="100%" stopColor={C.green} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="eg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.red} stopOpacity={0.15}/>
            <stop offset="100%" stopColor={C.red} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <path d={area(revenue)} fill="url(#rg2)"/>
        <path d={line(revenue)} fill="none" stroke={C.green} strokeWidth={2}/>
        <path d={area(expenses)} fill="url(#eg2)"/>
        <path d={line(expenses)} fill="none" stroke={C.red} strokeWidth={1.5} strokeDasharray="5,3"/>
      </svg>
      <div style={{ display:'flex', gap:4, marginTop:6 }}>
        {MONTHS.map(m=><div key={m} style={{ flex:1, textAlign:'center', fontSize:9, color:C.subtle }}>{m}</div>)}
      </div>
      <div style={{ display:'flex', gap:18, marginTop:10 }}>
        {[['Revenue',C.green,'solid'],['Expenses',C.red,'dashed']].map(([l,c])=>(
          <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:14, height:2.5, background:c, borderRadius:2 }}/>
            <span style={{ fontSize:11, color:C.muted }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Reports() {
  const [data, setData] = useState(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    reportsAPI.summary(year).then(r=>setData(r.data.data)).catch(console.error).finally(()=>setLoading(false))
  },[year])

  if(loading) return <Spinner/>
  const d=data||{}
  const maxTopClient=Math.max(...(d.topClients||[]).map(c=>c.totalPaid),1)
  const methodTotal=(d.paymentMethods||[]).reduce((s,m)=>s+m.total,0)||1

  return (
    <div style={{ padding:'28px 32px' }} className="page-content">
      <PageHeader title="Reports & Analytics" subtitle="Your financial performance at a glance"
        right={
          <div style={{ display:'flex', gap:6 }}>
            {[new Date().getFullYear()-2,new Date().getFullYear()-1,new Date().getFullYear()].map(y=>(
              <button key={y} onClick={()=>setYear(y)}
                style={{ background:year===y?C.accent:'#fff', border:`1.5px solid ${year===y?C.accent:C.border}`,
                  borderRadius:9, padding:'7px 14px', fontSize:12, fontWeight:700,
                  color:year===y?'#fff':C.muted, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                  boxShadow:year===y?`0 2px 10px ${C.accent}44`:'none' }}>
                {y}
              </button>
            ))}
          </div>
        }/>

      {/* Green profit summary banner */}
      <div style={{ background:`linear-gradient(135deg, ${C.green}18, ${C.greenBright}18)`, border:`1px solid ${C.green}30`, borderRadius:16,
        padding:'22px 28px', marginBottom:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-20, top:-20, width:150, height:150, borderRadius:'50%', background:`${C.green}08` }}/>
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:11, color:C.green, fontWeight:700, letterSpacing:'0.5px', marginBottom:4, opacity:0.8 }}>NET PROFIT · {year}</div>
            <div style={{ fontSize:32, fontWeight:800, color:C.green, fontFamily:"'Syne',sans-serif" }}>{fmt(d.netProfit||0)}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>
              Profit margin: {d.totalRevenue>0?(((d.netProfit||0)/d.totalRevenue)*100).toFixed(1):0}%
            </div>
          </div>
          <div style={{ display:'flex', gap:28 }}>
            {[['Revenue',fmt(d.totalRevenue||0),C.green],['Expenses',fmt(d.totalExpenses||0),C.red]].map(([l,v,c])=>(
              <div key={l}>
                <div style={{ fontSize:18, fontWeight:700, color:c }}>{v}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:24 }}>
        {[
          ['Gross Revenue',fmt(d.totalRevenue||0),C.green],
          ['Total Expenses',fmt(d.totalExpenses||0),C.red],
          ['Net Profit',fmt(d.netProfit||0),(d.netProfit||0)>=0?C.green:C.red],
          ['Profit Margin',`${d.totalRevenue>0?(((d.netProfit||0)/d.totalRevenue)*100).toFixed(1):0}%`,C.accent],
          ['Invoice Count',(d.statusBreakdown||[]).reduce((s,x)=>s+x.count,0),C.accent],
        ].map(([l,v,c])=>(
          <div key={l} style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 18px', boxShadow:'0 1px 4px #0000000A' }}>
            <div style={{ fontSize:10, color:C.muted, marginBottom:6, fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase' }}>{l}</div>
            <div style={{ fontSize:18, fontWeight:800, color:c, fontFamily:"'Syne',sans-serif" }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="dash-bottom" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <Card>
          <CardHead title="Revenue vs Expenses" sub={`Monthly trend · ${year}`}
            right={<span style={{ fontSize:11, background:'#F0FDF4', color:C.green, padding:'3px 8px', borderRadius:99, fontWeight:600, border:'1px solid #16A34A22' }}>Green = Revenue</span>}/>
          <AreaChart revenue={d.revenueByMonth||[]} expenses={d.expenseByMonth||[]}/>
        </Card>
        <Card>
          <CardHead title="Invoice Status" sub="Breakdown by status"/>
          <div style={{ padding:'16px 22px 20px' }}>
            {(d.statusBreakdown||[]).map(s=>{
              const totalInv=(d.statusBreakdown||[]).reduce((a,x)=>a+x.count,0)||1
              const colors={paid:C.green,pending:C.yellow,overdue:C.red,draft:C.blue,sent:C.cyan}
              return (
                <div key={s._id} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:13 }}>
                    <span style={{ fontWeight:600, color:C.text }}>{s._id?.charAt(0).toUpperCase()+s._id?.slice(1)}</span>
                    <span style={{ color:C.muted, fontSize:12 }}>{s.count} · {fmt(s.totalAmount)}</span>
                  </div>
                  <div style={{ height:7, borderRadius:4, background:C.border }}>
                    <div style={{ height:'100%', borderRadius:4, width:`${(s.count/totalInv)*100}%`, background:colors[s._id]||C.muted, transition:'width 0.5s' }}/>
                  </div>
                </div>
              )
            })}
            {(!d.statusBreakdown||!d.statusBreakdown.length)&&<div style={{ textAlign:'center', color:C.muted, padding:'24px 0', fontSize:13 }}>No data for {year}</div>}
          </div>
        </Card>
      </div>

      <div className="dash-bottom" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Top clients — green bars */}
        <Card>
          <CardHead title="Top Clients by Revenue" sub="Ranked by amount collected"/>
          <div style={{ padding:'16px 22px 20px' }}>
            {(d.topClients||[]).map((c,i)=>(
              <div key={c._id} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:`${C.green}18`, border:`1.5px solid ${C.green}33`,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:C.green }}>
                      {i+1}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{c.client?.name}</div>
                      <div style={{ fontSize:10, color:C.muted }}>{c.client?.company}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:C.green }}>{fmt(c.totalPaid)}</span>
                </div>
                <div style={{ height:6, borderRadius:3, background:C.border }}>
                  <div style={{ height:'100%', borderRadius:3, background:`linear-gradient(90deg, ${C.green}, ${C.greenBright})`,
                    width:`${(c.totalPaid/maxTopClient)*100}%`, transition:'width 0.5s' }}/>
                </div>
              </div>
            ))}
            {(!d.topClients||!d.topClients.length)&&<div style={{ textAlign:'center', color:C.muted, padding:'24px 0' }}>No data</div>}
          </div>
        </Card>

        {/* Payment methods */}
        <Card>
          <CardHead title="Payment Methods" sub="Revenue by collection channel"/>
          <div style={{ padding:'16px 22px 20px' }}>
            {(d.paymentMethods||[]).map(m=>{
              const icons={upi:'📱',neft:'🏦',rtgs:'🏦',bank_transfer:'💳',cheque:'📋',cash:'💵',card:'💳',other:'💰'}
              const pct=((m.total/methodTotal)*100)
              return (
                <div key={m._id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <span style={{ fontSize:18, width:26 }}>{icons[m._id]||'💰'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12 }}>
                      <span style={{ color:C.text, fontWeight:600 }}>{m._id?.toUpperCase().replace('_',' ')}</span>
                      <span style={{ color:C.muted }}>{m.count} · {fmt(m.total)}</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:C.border }}>
                      <div style={{ height:'100%', borderRadius:3, width:`${pct}%`,
                        background:`linear-gradient(90deg, ${C.accent}, #A78BFA)`, transition:'width 0.5s' }}/>
                    </div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:C.accent, width:32, textAlign:'right' }}>{pct.toFixed(0)}%</span>
                </div>
              )
            })}
            {(!d.paymentMethods||!d.paymentMethods.length)&&<div style={{ textAlign:'center', color:C.muted, padding:'24px 0' }}>No data</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
