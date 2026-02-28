import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientsAPI } from '../utils/api'
import { C, fmt } from '../utils/theme'
import { Card, Avatar, Badge, Btn, Spinner, EmptyState, Modal, Input, Select, SearchInput, PageHeader, ConfirmModal } from '../components/UI'
import toast from 'react-hot-toast'

function ClientForm({ open, onClose, onSuccess, initial }) {
  const empty = { name:'', email:'', phone:'', company:'', gstin:'', address:'', city:'', state:'', notes:'', status:'active' }
  const [form, setForm] = useState(initial||empty)
  const [saving, setSaving] = useState(false)
  useEffect(()=>{ setForm(initial||empty) },[initial])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const save = async() => {
    if(!form.name) return toast.error('Name is required')
    setSaving(true)
    try {
      if(initial?._id) { await clientsAPI.update(initial._id,form); toast.success('Client updated!') }
      else { await clientsAPI.create(form); toast.success('Client added!') }
      onSuccess(); onClose()
    } catch(e) { toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title={initial?'Edit Client':'Add Customer'} width={520}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Input label="Full Name *" value={form.name} onChange={e=>set('name',e.target.value)} required/>
        <Input label="Company" value={form.company} onChange={e=>set('company',e.target.value)}/>
        <Input label="Email" type="email" value={form.email} onChange={e=>set('email',e.target.value)}/>
        <Input label="Phone" value={form.phone} onChange={e=>set('phone',e.target.value)}/>
        <Input label="GSTIN" value={form.gstin} onChange={e=>set('gstin',e.target.value.toUpperCase())} style={{ gridColumn:'1/-1' }}/>
        <Input label="Address" value={form.address} onChange={e=>set('address',e.target.value)} style={{ gridColumn:'1/-1' }}/>
        <Input label="City" value={form.city} onChange={e=>set('city',e.target.value)}/>
        <Input label="State" value={form.state} onChange={e=>set('state',e.target.value)}/>
        <Select label="Status" value={form.status} onChange={e=>set('status',e.target.value)} style={{ gridColumn:'1/-1' }}
          options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]}/>
      </div>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save} disabled={saving}>{saving?'Saving…':initial?'Update':'Add Customer'}</Btn>
      </div>
    </Modal>
  )
}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const nav = useNavigate()

  const load = useCallback(async()=>{
    setLoading(true)
    try {
      const r = await clientsAPI.list({ search:search||undefined, limit:100 })
      setClients(r.data.data); setTotal(r.data.total)
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  },[search])

  useEffect(()=>{ load() },[load])

  const doDelete = async() => {
    try { await clientsAPI.delete(deleteId); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  return (
    <div style={{ padding:'28px 32px' }} className="page-content">
      <ClientForm open={showForm||!!editItem} onClose={()=>{setShowForm(false);setEditItem(null)}} onSuccess={load} initial={editItem}/>
      <ConfirmModal open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={doDelete} title="Delete Customer" message="This customer will be permanently deleted."/>
      <PageHeader title="Customers" subtitle={`${total} total customers`}
        right={<>
          <SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers…" style={{ width:220 }}/>
          <Btn variant="primary" onClick={()=>setShowForm(true)}>+ Add Customer</Btn>
        </>}/>
      
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
        {loading ? <Spinner/> : clients.length===0 ? (
          <div style={{ gridColumn:'1/-1' }}><EmptyState icon="👥" title="No customers yet" subtitle="Add your first customer to start creating invoices" action="+ Add Customer" onAction={()=>setShowForm(true)}/></div>
        ) : clients.map(c=>(
          <div key={c._id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14,
            padding:'20px', cursor:'pointer', transition:'all 0.15s' }}
            onClick={()=>nav(`/clients/${c._id}`)}
            onMouseEnter={e=>{e.currentTarget.style.background=C.cardHover; e.currentTarget.style.borderColor=c.color||C.accentBorder}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.card; e.currentTarget.style.borderColor=C.border}}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Avatar name={c.name} color={c.color||C.accent} size={40}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{c.name}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{c.company||c.email||'No company'}</div>
                </div>
              </div>
              <Badge status={c.status}/>
            </div>
            {c.email && <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>✉ {c.email}</div>}
            {c.city && <div style={{ fontSize:12, color:C.muted, marginBottom:14 }}>📍 {c.city}{c.state?`, ${c.state}`:''}</div>}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={e=>{e.stopPropagation();setEditItem(c)}}
                style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:7, padding:'6px', fontSize:11, color:C.muted, cursor:'pointer' }}>Edit</button>
              <button onClick={e=>{e.stopPropagation();setDeleteId(c._id)}}
                style={{ flex:1, background:C.redSoft, border:`1px solid ${C.red}33`, borderRadius:7, padding:'6px', fontSize:11, color:C.red, cursor:'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
