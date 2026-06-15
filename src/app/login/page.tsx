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
      else setMsg('Account created! Please wait for your access to be confirmed.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f4f5f7', padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/jdc-logo.png" alt="Jackson Development Company" style={{
            width: '180px', height: 'auto', margin: '0 auto 16px', display: 'block', borderRadius: '4px'
          }} />
          <div style={{ fontSize: '12px', color: '#aaaaaa', letterSpacing: '.5px' }}>Property Management Dashboard</div>
        </div>

        {/* Login card */}
        <div style={{
          background: '#ffffff', border: '1px solid #e0e1e5', borderRadius: '12px',
          padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111214', marginBottom: '4px' }}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          <p style={{ fontSize: '13px', color: '#8a8d96', marginBottom: '24px' }}>
            {mode === 'login' ? 'Enter your credentials to continue' : 'Request access to the dashboard'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#4a4d56', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@jacksondevelopment.net" required />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#4a4d56', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#dc2626' }}>
                {error}
              </div>
            )}
            {msg && (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#16a34a' }}>
                {msg}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: '#111214', color: '#ffffff', border: 'none', padding: '11px',
              borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.7 : 1, marginTop: '4px',
              letterSpacing: '.5px'
            }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Request access'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#8a8d96' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMsg('') }}
              style={{ background: 'none', border: 'none', color: '#111214', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#aaaaaa', letterSpacing: '.5px' }}>
          © 2025 Jackson Development Company. All rights reserved.
        </p>
      </div>
    </div>
  )
}
