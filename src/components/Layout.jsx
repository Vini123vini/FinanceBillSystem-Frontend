import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './Sidebar'
import { C } from '../utils/theme'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display:'flex', height:'100vh', background:C.bg, overflow:'hidden' }}>
      <div className="desktop-only" style={{ display:'flex', flexShrink:0, height:'100%' }}>
        <Sidebar />
      </div>

      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:200 }}>
          <div style={{ position:'absolute', inset:0, background:'#1E124566' }} onClick={()=>setMobileOpen(false)}/>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, zIndex:201 }}>
            <Sidebar mobile onClose={()=>setMobileOpen(false)}/>
          </div>
        </div>
      )}

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Mobile topbar */}
        <div style={{ display:'none' }} className="mobile-topbar">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'12px 16px', borderBottom:`1px solid ${C.border}`,
            background:C.sidebar }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, background:`linear-gradient(135deg, ${C.accent}, #A78BFA)`,
                borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:16, fontWeight:700, color:'#fff' }}>₹</div>
              <span style={{ fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif", color:C.text }}>Kanakku</span>
            </div>
            <button onClick={()=>setMobileOpen(true)} style={{
              background:C.accentSoft, border:`1px solid ${C.accentBorder}`,
              borderRadius:9, width:36, height:36, cursor:'pointer', color:C.accent, fontSize:16,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>☰</button>
          </div>
        </div>

        <main style={{ flex:1, overflow:'auto' }}>
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" toastOptions={{
        style: { background:'#fff', color:C.text, border:`1px solid ${C.border}`, fontSize:13, boxShadow:'0 4px 20px #7C5CFC11' },
        success: { iconTheme:{ primary:C.green, secondary:'#fff' } },
        error:   { iconTheme:{ primary:C.red,   secondary:'#fff' } },
      }}/>
      <style>{`
        @media (max-width:768px){
          .desktop-only{display:none!important;}
          .mobile-topbar{display:flex!important;flex-direction:column;}
        }
      `}</style>
    </div>
  )
}
