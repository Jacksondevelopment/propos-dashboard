'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMsg('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else window.location.href = '/'
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMsg('Check your email to confirm your account.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px',
        padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{
            width: '36px', height: '36px', background: 'var(--blue)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="ti ti-building" style={{ color: '#fff', fontSize: '18px' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)' }}>PropOS</span>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
          {mode === 'login' ? 'Sign in to your team' : 'Create account'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '28px' }}>
          {mode === 'login' ? 'Property management dashboard' : 'Join your property management team'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {error && (
            <div style={{ background: 'var(--red2)', border: '1px solid var(--red)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--red)' }}>
              {error}
            </div>
          )}
          {msg && (
            <div style={{ background: 'var(--green2)', border: '1px solid var(--green)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--green)' }}>
              {msg}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: 'var(--blue)', color: '#fff', border: 'none', padding: '11px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit', opacity: loading ? 0.7 : 1, marginTop: '4px'
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMsg('') }}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
