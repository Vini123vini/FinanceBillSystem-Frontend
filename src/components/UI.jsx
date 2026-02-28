import { useState, useEffect } from 'react'
import { C, STATUS_META } from '../utils/theme'

export function Badge({ status, label }) {
  const m = STATUS_META[status] || STATUS_META.draft
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:99,
      fontSize:11, fontWeight:600, background:m.bg, color:m.color, whiteSpace:'nowrap', flexShrink:0,
      border:`1px solid ${m.color}22` }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:m.dot||m.color, flexShrink:0 }}/>
      {label || m.label}
    </span>
  )
}

export function Avatar({ name='', color=C.accent, size=32 }) {
  const ini = name.split(' ').map(n=>n[0]).filter(Boolean).slice(0,2).join('').toUpperCase()
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:`${color}18`,
      border:`2px solid ${color}33`, display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.36, fontWeight:700, color, flexShrink:0 }}>
      {ini||'?'}
    </div>
  )
}

export function Card({ children, style:s={}, onClick, pad=0 }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={()=>onClick&&setHov(true)}
      onMouseLeave={()=>onClick&&setHov(false)}
      style={{ background:hov?C.cardHover:C.card, border:`1px solid ${hov?C.accentBorder:C.border}`,
        borderRadius:14, padding:pad, transition:'all 0.15s',
        boxShadow: hov ? '0 4px 20px #6C47FF0F' : '0 1px 4px #0000000A',
        ...s, ...(onClick?{cursor:'pointer'}:{}) }}>
      {children}
    </div>
  )
}

export function CardHead({ title, sub, right }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'18px 22px 0' }}>
      <div>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif" }}>{title}</div>
        {sub&&<div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{sub}</div>}
      </div>
      {right&&<div style={{ flexShrink:0 }}>{right}</div>}
    </div>
  )
}

export function StatCard({ icon, label, value, change, positive, accent=C.accent }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px',
      position:'relative', overflow:'hidden', boxShadow:'0 1px 4px #0000000A',
      transition:'box-shadow 0.15s' }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 4px 20px ${accent}18`}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px #0000000A'}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`${accent}14`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{icon}</div>
        {change!==undefined&&(
          <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:99,
            background:positive===false?'#FEF2F2':'#F0FDF4',
            color:positive===false?C.red:C.green,
            border:`1px solid ${positive===false?C.red:C.green}22` }}>
            {positive===false?'▼':'▲'} {change}
          </span>
        )}
      </div>
      <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', color:C.text, marginBottom:4, fontFamily:"'Syne',sans-serif" }}>{value}</div>
      <div style={{ fontSize:12, color:C.muted }}>{label}</div>
      <div style={{ position:'absolute', right:-18, bottom:-18, width:80, height:80, borderRadius:'50%', background:`${accent}08`, pointerEvents:'none' }}/>
    </div>
  )
}

export function Btn({ children, onClick, variant='primary', size='md', disabled=false, type='button', style:s={} }) {
  const base = { border:'none', borderRadius:9, cursor:disabled?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif",
    fontWeight:600, transition:'all 0.15s', display:'inline-flex', alignItems:'center', gap:6, flexShrink:0,
    opacity:disabled?0.5:1,
    ...(size==='sm'?{fontSize:12,padding:'6px 12px'}:size==='lg'?{fontSize:15,padding:'13px 24px'}:{fontSize:13,padding:'9px 17px'}) }
  const variants = {
    primary:   { background:C.accent, color:'#fff', boxShadow:`0 2px 10px ${C.accent}44` },
    secondary: { background:C.bg, border:`1px solid ${C.border}`, color:C.textSub },
    ghost:     { background:'transparent', color:C.muted },
    danger:    { background:'#FEF2F2', color:C.red, border:`1px solid ${C.red}33` },
    success:   { background:'#F0FDF4', color:C.green, border:`1px solid ${C.green}33` },
    outline:   { background:'transparent', border:`1px solid ${C.border}`, color:C.textSub },
  }
  return <button type={type} onClick={onClick} disabled={disabled} style={{...base,...variants[variant],...s}}>{children}</button>
}

export function Input({ label, required, error, style:s={}, ...props }) {
  return (
    <div style={{ marginBottom:13, ...s }}>
      {label&&<label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textSub, marginBottom:5 }}>
        {label}{required&&<span style={{ color:C.red }}> *</span>}
      </label>}
      <input {...props} style={{ width:'100%', background:C.surface, border:`1.5px solid ${error?C.red:C.border}`,
        borderRadius:9, padding:'9px 13px', color:C.text, fontSize:13, outline:'none',
        fontFamily:"'DM Sans',sans-serif", transition:'border-color 0.15s' }}
        onFocus={e=>e.target.style.borderColor=C.accent}
        onBlur={e=>e.target.style.borderColor=error?C.red:C.border}/>
      {error&&<div style={{ fontSize:11, color:C.red, marginTop:3 }}>{error}</div>}
    </div>
  )
}

export function Textarea({ label, required, rows=3, ...props }) {
  return (
    <div style={{ marginBottom:13 }}>
      {label&&<label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textSub, marginBottom:5 }}>
        {label}{required&&<span style={{ color:C.red }}> *</span>}
      </label>}
      <textarea rows={rows} {...props} style={{ width:'100%', background:C.surface,
        border:`1.5px solid ${C.border}`, borderRadius:9, padding:'9px 13px', color:C.text,
        fontSize:13, outline:'none', resize:'vertical', fontFamily:"'DM Sans',sans-serif" }}
        onFocus={e=>e.target.style.borderColor=C.accent}
        onBlur={e=>e.target.style.borderColor=C.border}/>
    </div>
  )
}

export function Select({ label, required, options=[], ...props }) {
  return (
    <div style={{ marginBottom:13 }}>
      {label&&<label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textSub, marginBottom:5 }}>
        {label}{required&&<span style={{ color:C.red }}> *</span>}
      </label>}
      <select {...props} style={{ width:'100%', background:C.surface, border:`1.5px solid ${C.border}`,
        borderRadius:9, padding:'9px 13px', color:C.text, fontSize:13, outline:'none',
        fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}
        onFocus={e=>e.target.style.borderColor=C.accent}
        onBlur={e=>e.target.style.borderColor=C.border}>
        {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
      </select>
    </div>
  )
}

export function Modal({ open, onClose, title, children, width=520 }) {
  useEffect(()=>{
    const h=e=>{if(e.key==='Escape')onClose()}
    if(open)document.addEventListener('keydown',h)
    return()=>document.removeEventListener('keydown',h)
  },[open,onClose])
  if(!open)return null
  return (
    <div style={{ position:'fixed', inset:0, background:'#0F0A2E55', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:16, width:'100%',
        maxWidth:width, maxHeight:'90vh', overflow:'auto',
        boxShadow:'0 24px 80px #0F0A2E22', animation:'fadeUp 0.18s ease' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'18px 22px', borderBottom:`1px solid ${C.border}`,
          position:'sticky', top:0, background:'#fff', zIndex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif" }}>{title}</div>
          <button onClick={onClose} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:7,
            width:28, height:28, cursor:'pointer', color:C.muted, fontSize:14,
            display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ padding:'20px 22px' }}>{children}</div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, danger=true }) {
  const [loading, setLoading] = useState(false)
  return (
    <Modal open={open} onClose={onClose} title={title||'Confirm'} width={380}>
      <p style={{ color:C.textSub, fontSize:13, marginBottom:20, lineHeight:1.6 }}>{message}</p>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant={danger?'danger':'primary'} disabled={loading} onClick={async()=>{
          setLoading(true)
          try{await onConfirm()}finally{setLoading(false)}
          onClose()
        }}>{loading?'Processing…':'Confirm'}</Btn>
      </div>
    </Modal>
  )
}

export function Spinner({ size=36, fullPage=true }) {
  const el = (
    <div style={{ width:size, height:size, borderRadius:'50%',
      border:`2px solid ${C.border}`, borderTopColor:C.accent,
      animation:'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  return fullPage
    ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, padding:60 }}>{el}</div>
    : el
}

export function EmptyState({ icon='📭', title, subtitle, action, onAction }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'56px 24px', textAlign:'center' }}>
      <div style={{ fontSize:44, marginBottom:14 }}>{icon}</div>
      <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6, fontFamily:"'Syne',sans-serif" }}>{title}</div>
      {subtitle&&<div style={{ fontSize:13, color:C.muted, marginBottom:20, maxWidth:300 }}>{subtitle}</div>}
      {action&&<Btn variant="primary" onClick={onAction}>{action}</Btn>}
    </div>
  )
}

export function Toggle({ checked, onChange }) {
  return (
    <div onClick={()=>onChange(!checked)} style={{ width:42, height:24, borderRadius:12,
      background:checked?C.accent:C.border, cursor:'pointer', position:'relative',
      transition:'background 0.2s', flexShrink:0, border:`1.5px solid ${checked?C.accent:C.border}` }}>
      <div style={{ position:'absolute', top:2, left:checked?19:2, width:16, height:16,
        borderRadius:'50%', background:'#fff', transition:'left 0.2s',
        boxShadow:'0 1px 4px #0002' }}/>
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder='Search…', style:s={} }) {
  return (
    <div style={{ position:'relative', ...s }}>
      <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
        color:C.muted, fontSize:13, pointerEvents:'none' }}>🔍</span>
      <input value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:'100%', background:C.surface, border:`1.5px solid ${C.border}`,
          borderRadius:9, padding:'8px 13px 8px 34px', color:C.text, fontSize:13, outline:'none',
          fontFamily:"'DM Sans',sans-serif" }}
        onFocus={e=>e.target.style.borderColor=C.accent}
        onBlur={e=>e.target.style.borderColor=C.border}/>
    </div>
  )
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
      marginBottom:24, gap:12, flexWrap:'wrap' }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.text, fontFamily:"'Syne',sans-serif",
          margin:0, letterSpacing:'-0.5px' }}>{title}</h1>
        {subtitle&&<p style={{ fontSize:13, color:C.muted, margin:'4px 0 0' }}>{subtitle}</p>}
      </div>
      {right&&<div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>{right}</div>}
    </div>
  )
}
