'use client'
import { useState } from 'react'
import { supabase, type Property } from '@/lib/supabase'

interface Props {
  property: Property
  onClose: () => void
  onSaved: () => void
}

const COLORS = ['blue', 'green', 'amber', 'purple', 'teal', 'red']

export default function EditPropertyModal({ property, onClose, onSaved }: Props) {
  const [name, setName] = useState(property.name)
  const [address, setAddress] = useState(property.address)
  const [units, setUnits] = useState(property.units)
  const [color, setColor] = useState(property.color)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const COLOR_HEX: Record<string, string> = {
    blue: '#4f8ef7', green: '#3ecf8e', amber: '#f5a623',
    purple: '#9b72f5', teal: '#2dd4bf', red: '#f25c5c'
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('properties')
      .update({ name, address, units, color })
      .eq('id', property.id)
    if (error) setError(error.message)
    else { onSaved(); onClose() }
    setSaving(false)
  }

  const labelStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: '6px' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', width: '460px', maxWidth: '95vw', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Edit Property</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Property name</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Total units</label>
              <input type="number" value={units} onChange={e => setUnits(Number(e.target.value))} min={0} />
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setColor(c)} style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: COLOR_HEX[c],
                    cursor: 'pointer', border: color === c ? '3px solid white' : '3px solid transparent',
                    boxShadow: color === c ? `0 0 0 2px ${COLOR_HEX[c]}` : 'none',
                    transition: 'all .15s'
                  }} />
                ))}
              </div>
            </div>
          </div>
          {error && <div style={{ background: 'var(--red2)', color: 'var(--red)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 500, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
