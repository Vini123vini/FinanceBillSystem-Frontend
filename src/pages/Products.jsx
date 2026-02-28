import { useState, useEffect, useCallback } from 'react'
import { productsAPI } from '../utils/api'
import { C, fmt } from '../utils/theme'
import { Card, Badge, Btn, Spinner, EmptyState, Modal, Input, Select, SearchInput, PageHeader, ConfirmModal } from '../components/UI'
import toast from 'react-hot-toast'

const CATS = ['development','design','consulting','marketing','support','infrastructure','general']

function ProductForm({ open, onClose, onSuccess, initial }) {
  const empty = { name:'', type:'service', category:'general', rate:'', unit:'unit', taxRate:'18', sku:'', description:'', status:'active', trackStock:false, stock:0 }
  const [form, setForm] = useState(initial||empty)
  const [saving, setSaving] = useState(false)
  useEffect(()=>{ setForm(initial||empty) },[initial])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const save = async()=>{
    if(!form.name||!form.rate) return toast.error('Name and rate required')
    setSaving(true)
    try {
      if(initial?._id){ await productsAPI.update(initial._id,form); toast.success('Updated!') }
      else { await productsAPI.create(form); toast.success('Product added!') }
      onSuccess(); onClose()
    } catch(e){ toast.error(e.response?.data?.message||'Error') }
    finally { setSaving(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title={initial?'Edit Product':'Add Product / Service'} width={520}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Input label="Name *" value={form.name} onChange={e=>set('name',e.target.value)} required style={{ gridColumn:'1/-1' }}/>
        <Select label="Type" value={form.type} onChange={e=>set('type',e.target.value)} options={['service','product'].map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}))}/>
        <Select label="Category" value={form.category} onChange={e=>set('category',e.target.value)} options={CATS.map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}))}/>
        <Input label="Rate (INR) *" type="number" value={form.rate} onChange={e=>set('rate',e.target.value)} required/>
        <Input label="Unit" value={form.unit} onChange={e=>set('unit',e.target.value)} placeholder="unit / hour / project"/>
        <Input label="Tax Rate (%)" type="number" value={form.taxRate} onChange={e=>set('taxRate',e.target.value)}/>
        <Input label="SKU" value={form.sku} onChange={e=>set('sku',e.target.value.toUpperCase())} placeholder="Optional"/>
        <Select label="Status" value={form.status} onChange={e=>set('status',e.target.value)} options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]}/>
      </div>
      <Input label="Description" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Brief description"/>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save} disabled={saving}>{saving?'Saving…':initial?'Update':'Add Product'}</Btn>
      </div>
    </Modal>
  )
}

const typeColors = { service:C.accent, product:C.teal||C.cyan }

export default function Products() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async()=>{
    setLoading(true)
    try {
      const r = await productsAPI.list({ search:search||undefined, type:filterType||undefined, limit:100 })
      setProducts(r.data.data); setTotal(r.data.total)
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  },[search,filterType])

  useEffect(()=>{ load() },[load])

  return (
    <div style={{ padding:'28px 32px' }} className="page-content">
      <ProductForm open={showForm||!!editItem} onClose={()=>{setShowForm(false);setEditItem(null)}} onSuccess={load} initial={editItem}/>
      <ConfirmModal open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={async()=>{
        try { await productsAPI.delete(deleteId); toast.success('Deleted'); load() }
        catch { toast.error('Error') }
      }} title="Delete Product" message="This product will be permanently deleted."/>

      <PageHeader title="Products & Services" subtitle={`${total} items in catalog`}
        right={<>
          <SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ width:200 }}/>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px', color:C.muted, fontSize:12, cursor:'pointer' }}>
            <option value="">All Types</option>
            <option value="service">Services</option>
            <option value="product">Products</option>
          </select>
          <Btn variant="primary" onClick={()=>setShowForm(true)}>+ Add Product</Btn>
        </>}/>

      <Card>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 90px 100px 80px 80px 80px', padding:'8px 22px',
          fontSize:10, fontWeight:700, color:C.subtle, letterSpacing:'0.8px', textTransform:'uppercase', borderBottom:`1px solid ${C.border}` }}>
          {['Name','Type','Rate','Tax','Status',''].map(h=><span key={h}>{h}</span>)}
        </div>
        {loading ? <Spinner/> : products.length===0 ? (
          <EmptyState icon="📦" title="No products yet" subtitle="Add products and services to use in invoices" action="+ Add Product" onAction={()=>setShowForm(true)}/>
        ) : products.map(p=>(
          <div key={p._id} style={{ display:'grid', gridTemplateColumns:'1fr 90px 100px 80px 80px 80px', padding:'13px 22px',
            alignItems:'center', borderBottom:`1px solid ${C.border}`, transition:'background 0.1s' }}
            onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{p.name}</div>
              <div style={{ fontSize:11, color:C.muted }}>{p.category} · per {p.unit}{p.sku?` · ${p.sku}`:''}</div>
            </div>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600,
              padding:'3px 8px', borderRadius:99, background:`${typeColors[p.type]||C.accent}20`, color:typeColors[p.type]||C.accent }}>
              {p.type}
            </span>
            <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{fmt(p.rate)}</span>
            <span style={{ fontSize:12, color:C.muted }}>{p.taxRate}%</span>
            <Badge status={p.status}/>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>setEditItem(p)} style={{ background:C.border, border:'none', borderRadius:5, padding:'4px 8px', color:C.muted, cursor:'pointer', fontSize:11 }}>Edit</button>
              <button onClick={()=>setDeleteId(p._id)} style={{ background:C.redSoft, border:'none', borderRadius:5, padding:'4px 8px', color:C.red, cursor:'pointer', fontSize:11 }}>Del</button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
