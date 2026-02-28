import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../utils/api'
import { C } from '../utils/theme'
import { Card, Btn, Input, Select, Toggle, PageHeader } from '../components/UI'
import toast from 'react-hot-toast'

const TABS = [
  ['profile',       '👤', 'Profile'],
  ['business',      '🏢', 'Business'],
  ['invoices',      '📄', 'Invoice Settings'],
  ['notifications', '🔔', 'Notifications'],
  ['security',      '🔐', 'Security'],
]

function Section({ title, subtitle, children }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, marginBottom:16, overflow:'hidden' }}>
      <div style={{ padding:'18px 22px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif" }}>{title}</div>
        {subtitle && <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{subtitle}</div>}
      </div>
      <div style={{ padding:'20px 22px' }}>{children}</div>
    </div>
  )
}

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || ''
  })
  const [business, setBusiness] = useState({
    name: user?.business?.name || '', address: user?.business?.address || '',
    city: user?.business?.city || '', state: user?.business?.state || '',
    pincode: user?.business?.pincode || '', gstin: user?.business?.gstin || '',
  })
  const [invS, setInvS] = useState({
    prefix: user?.invoiceSettings?.prefix || 'INV',
    defaultDueDays: user?.invoiceSettings?.defaultDueDays || 30,
    defaultTaxRate: user?.invoiceSettings?.defaultTaxRate || 18,
    defaultNotes: user?.invoiceSettings?.defaultNotes || '',
    currencySymbol: user?.invoiceSettings?.currencySymbol || '₹',
  })
  const [notifs, setNotifs] = useState(user?.notifications || {
    invoiceSent: true, paymentReceived: true, invoiceOverdue: true,
    weeklyReport: false, monthlyReport: true,
  })
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const save = async (data, msg) => {
    setSaving(true)
    try {
      const r = await authAPI.updateProfile(data)
      updateUser(r.data.user)
      toast.success(msg || 'Saved!')
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving') }
    finally { setSaving(false) }
  }

  const changePwd = async () => {
    if (!pwd.currentPassword) return toast.error('Enter current password')
    if (pwd.newPassword !== pwd.confirmPassword) return toast.error('Passwords do not match')
    if (pwd.newPassword.length < 6) return toast.error('Min. 6 characters')
    setSaving(true)
    try {
      await authAPI.updatePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
      toast.success('Password updated!')
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const setNotif = async (key, val) => {
    const n = { ...notifs, [key]: val }
    setNotifs(n)
    await save({ notifications: n }, 'Notification preference saved')
  }

  const ini = (user?.name || '').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ padding: '28px 32px' }} className="page-content">
      <PageHeader title="Settings" subtitle="Manage your account and business preferences" />

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Sidebar Nav */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, height: 'fit-content', overflow: 'hidden' }}>
          {/* User card at top */}
          <div style={{ padding: '18px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${C.accent}, #9589FF)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff' }}>{ini}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: C.muted }}>Admin</div>
            </div>
          </div>
          {TABS.map(([id, icon, label]) => (
            <div key={id} onClick={() => setTab(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 16px',
                fontSize: 13, cursor: 'pointer', borderBottom: `1px solid ${C.border}`,
                color: tab === id ? C.accent : C.muted,
                background: tab === id ? C.accentSoft : 'transparent',
                fontWeight: tab === id ? 600 : 400, transition: 'all 0.12s' }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === 'profile' && (
            <Section title="Profile Information" subtitle="Your personal account details">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Full Name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                <Input label="Phone" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <Input label="Email Address" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
              <Btn variant="primary" onClick={() => save({ name: profile.name, email: profile.email, phone: profile.phone }, 'Profile updated!')} disabled={saving}>
                Save Profile
              </Btn>
            </Section>
          )}

          {tab === 'business' && (
            <Section title="Business Details" subtitle="Shown on invoices and documents">
              <Input label="Business / Company Name" value={business.name} onChange={e => setBusiness(b => ({ ...b, name: e.target.value }))} />
              <Input label="Address" value={business.address} onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Input label="City" value={business.city} onChange={e => setBusiness(b => ({ ...b, city: e.target.value }))} />
                <Input label="State" value={business.state} onChange={e => setBusiness(b => ({ ...b, state: e.target.value }))} />
                <Input label="Pincode" value={business.pincode} onChange={e => setBusiness(b => ({ ...b, pincode: e.target.value }))} />
              </div>
              <Input label="GSTIN" value={business.gstin} onChange={e => setBusiness(b => ({ ...b, gstin: e.target.value.toUpperCase() }))} placeholder="29AAFCS1234A1Z5" />
              <Btn variant="primary" onClick={() => save({ business }, 'Business info saved!')} disabled={saving}>
                Save Business Info
              </Btn>
            </Section>
          )}

          {tab === 'invoices' && (
            <Section title="Invoice Settings" subtitle="Default values applied to new invoices">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Invoice Prefix" value={invS.prefix} onChange={e => setInvS(s => ({ ...s, prefix: e.target.value }))} placeholder="INV" />
                <Input label="Currency Symbol" value={invS.currencySymbol} onChange={e => setInvS(s => ({ ...s, currencySymbol: e.target.value }))} />
                <Input label="Default Due Days" type="number" value={invS.defaultDueDays} onChange={e => setInvS(s => ({ ...s, defaultDueDays: Number(e.target.value) }))} />
                <Input label="Default Tax Rate (%)" type="number" value={invS.defaultTaxRate} onChange={e => setInvS(s => ({ ...s, defaultTaxRate: Number(e.target.value) }))} />
              </div>
              <div style={{ marginBottom: 13 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 5 }}>Default Notes</label>
                <textarea value={invS.defaultNotes} rows={3} onChange={e => setInvS(s => ({ ...s, defaultNotes: e.target.value }))}
                  placeholder="Thank you for your business."
                  style={{ width: '100%', boxSizing: 'border-box', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 13px', color: C.text, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: "'DM Sans',sans-serif" }}
                  onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
              </div>
              <Btn variant="primary" onClick={() => save({ invoiceSettings: invS }, 'Invoice settings saved!')} disabled={saving}>
                Save Invoice Settings
              </Btn>
            </Section>
          )}

          {tab === 'notifications' && (
            <Section title="Notifications" subtitle="Control which email alerts you receive">
              {[
                ['invoiceSent',     'Invoice Sent',      'When an invoice is sent to a client'],
                ['paymentReceived', 'Payment Received',   'When a payment is recorded on an invoice'],
                ['invoiceOverdue',  'Invoice Overdue',    'When an invoice passes its due date'],
                ['weeklyReport',    'Weekly Summary',     'A weekly digest of your business activity'],
                ['monthlyReport',   'Monthly Report',     'Detailed monthly financial report'],
              ].map(([key, label, sub]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>
                  </div>
                  <Toggle checked={notifs[key] || false} onChange={val => setNotif(key, val)} />
                </div>
              ))}
            </Section>
          )}

          {tab === 'security' && (
            <Section title="Change Password" subtitle="Update your account password">
              <Input label="Current Password" type="password" value={pwd.currentPassword} onChange={e => setPwd(p => ({ ...p, currentPassword: e.target.value }))} />
              <Input label="New Password" type="password" value={pwd.newPassword} onChange={e => setPwd(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 6 characters" />
              <Input label="Confirm New Password" type="password" value={pwd.confirmPassword} onChange={e => setPwd(p => ({ ...p, confirmPassword: e.target.value }))} />
              <Btn variant="primary" onClick={changePwd} disabled={saving}>
                Update Password
              </Btn>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
