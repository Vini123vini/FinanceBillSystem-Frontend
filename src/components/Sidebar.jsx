import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { C } from '../utils/theme'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to:'/',         icon:'⊞', label:'Dashboard', end:true },
  { to:'/invoices', icon:'◈', label:'Invoices'           },
  { to:'/clients',  icon:'◉', label:'Customers'          },
  { to:'/payments', icon:'◆', label:'Payments'           },
  { to:'/products', icon:'◫', label:'Products'           },
  { to:'/expenses', icon:'◳', label:'Expenses'           },
  { to:'/reports',  icon:'◬', label:'Reports'            },
]

export default function Sidebar({ mobile, onClose }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const ini = (user?.name||'').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()||'U'
  const eff = mobile ? false : collapsed

  return (
    <aside style={{
      width: mobile ? 240 : eff ? 66 : 240,
      minWidth: mobile ? 240 : eff ? 66 : 240,
      background: C.sidebar,
      borderRight: `1px solid ${C.sideBorder}`,
      display: 'flex', flexDirection: 'column',
      flexShrink: 0, overflow: 'hidden',
      position: 'relative', height: '100%',
      transition: 'width 0.22s ease, min-width 0.22s ease',
    }}>

      {/* Logo */}
      <div style={{
        padding: eff ? '22px 0 18px' : '22px 20px 18px',
        display: 'flex', alignItems: 'center', gap: 11,
        justifyContent: eff ? 'center' : 'flex-start',
        borderBottom: `1px solid ${C.sideBorder}`,
      }}>
        <div style={{
          width: 38, height: 38, flexShrink: 0,
          background: `linear-gradient(135deg, ${C.accent} 0%, #A78BFA 100%)`,
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: '#fff',
          boxShadow: `0 4px 14px ${C.accent}44`,
        }}>₹</div>
        {!eff && (
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: C.text, letterSpacing: '-0.5px' }}>BillSystem</div>
            <div style={{ fontSize: 10, color: C.sideMuted }}>Finance Suite</div>
          </div>
        )}
      </div>

      {/* Desktop collapse */}
      {!mobile && (
        <button onClick={() => setCollapsed(c => !c)} style={{
          position: 'absolute', top: 26, right: eff ? 8 : 12,
          width: 20, height: 20, borderRadius: 5,
          background: C.accentSoft, border: `1px solid ${C.accentBorder}`,
          color: C.accent, cursor: 'pointer', fontSize: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {eff ? '▶' : '◀'}
        </button>
      )}

      {/* Mobile close */}
      {mobile && (
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 14,
          width: 28, height: 28, borderRadius: 7,
          background: C.accentSoft, border: `1px solid ${C.accentBorder}`,
          color: C.accent, cursor: 'pointer', fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px 8px', overflowY: 'auto' }}>
        {!eff && (
          <div style={{ fontSize: 9, fontWeight: 700, color: C.subtle, letterSpacing: '1.5px',
            textTransform: 'uppercase', padding: '0 10px', marginBottom: 6 }}>Main Menu</div>
        )}
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            onClick={mobile ? onClose : undefined}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: eff ? 0 : 10,
              padding: eff ? '10px 0' : '9px 12px',
              justifyContent: eff ? 'center' : 'flex-start',
              borderRadius: 9, textDecoration: 'none', marginBottom: 2,
              background: isActive ? C.sideActiveBg : 'transparent',
              color: isActive ? C.sideActive : C.sideMuted,
              fontWeight: isActive ? 700 : 400,
              fontSize: 13.5,
              transition: 'all 0.13s',
              border: isActive ? `1px solid ${C.accentBorder}` : '1px solid transparent',
            })}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
            {!eff && item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px 10px 16px', borderTop: `1px solid ${C.sideBorder}` }}>
        <NavLink to="/settings" onClick={mobile ? onClose : undefined}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: eff ? 0 : 10,
            padding: eff ? '10px 0' : '9px 12px',
            justifyContent: eff ? 'center' : 'flex-start',
            borderRadius: 9, textDecoration: 'none', marginBottom: 8,
            color: isActive ? C.sideActive : C.sideMuted,
            background: isActive ? C.sideActiveBg : 'transparent',
            border: isActive ? `1px solid ${C.accentBorder}` : '1px solid transparent',
            fontSize: 13.5,
          })}>
          <span style={{ fontSize: 15 }}>⚙</span>
          {!eff && 'Settings'}
        </NavLink>

        {/* User card */}
        {!eff ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px',
            borderRadius: 10, background: '#fff', border: `1px solid ${C.sideBorder}`,
            boxShadow: '0 1px 4px #7C5CFC0A' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${C.accent}, #A78BFA)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff' }}>{ini}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: C.sideMuted }}>Admin</div>
            </div>
            <button onClick={logout} title="Logout"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sideMuted, fontSize: 15 }}>⇦</button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.accent}, #A78BFA)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff' }}>{ini}</div>
          </div>
        )}
      </div>
    </aside>
  )
}
