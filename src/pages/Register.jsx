import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { C } from '../utils/theme'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', businessName:'' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const nav = useNavigate()
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async(e) => {
    e.preventDefault()
    if(form.password.length < 6) return toast.error('Password min. 6 characters')
    setLoading(true)
    try { await register(form); nav('/') }
    catch(err) { toast.error(err.response?.data?.message||'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:56, height:56, background:`linear-gradient(135deg, ${C.accent}, #A78BFA)`,
            borderRadius:16, display:'inline-flex', alignItems:'center', justifyContent:'center',
            fontSize:26, fontWeight:700, color:'#fff', marginBottom:14, boxShadow:`0 8px 24px ${C.accent}33` }}>₹</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:C.text, fontFamily:"'Syne',sans-serif", margin:0 }}>Create Account</h1>
          <p style={{ fontSize:13, color:C.muted, marginTop:4 }}>Start managing your finances today</p>
        </div>

        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:18,
          padding:'32px 28px', boxShadow:`0 8px 40px ${C.accent}0D` }}>
          <form onSubmit={submit}>
            {[['name','Full Name','text','Your full name'],['businessName','Business Name','text','Optional'],['email','Email Address','email','you@example.com'],['password','Password','password','Min. 6 characters']].map(([k,l,t,p])=>(
              <div key={k} style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textSub, marginBottom:5 }}>{l}</label>
                <input type={t} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={p}
                  style={{ width:'100%', background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:10,
                    padding:'11px 14px', color:C.text, fontSize:13, outline:'none',
                    fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor=C.accent}
                  onBlur={e=>e.target.style.borderColor=C.border}/>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{
              width:'100%', marginTop:6,
              background:`linear-gradient(135deg, ${C.accent}, #A78BFA)`,
              border:'none', borderRadius:10, padding:'12px',
              color:'#fff', fontSize:14, fontWeight:700,
              cursor:loading?'wait':'pointer', fontFamily:"'DM Sans',sans-serif",
              boxShadow:`0 4px 16px ${C.accent}44`,
            }}>
              {loading ? 'Creating…' : 'Create Account →'}
            </button>
          </form>
          <div style={{ textAlign:'center', marginTop:18, fontSize:13, color:C.muted }}>
            Already have an account? <Link to="/login" style={{ color:C.accent, textDecoration:'none', fontWeight:700 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
