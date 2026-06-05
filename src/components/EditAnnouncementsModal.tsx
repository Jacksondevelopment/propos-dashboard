'use client'
import { useState } from 'react'
import { supabase, type Announcement, type Property } from '@/lib/supabase'

interface Props {
  properties: Property[]
  currentProp: string
  announcements: Announcement[]
  onClose: () => void
  onSaved: () => void
}

const ICONS = ['📢', '🏗️', '⚠️', '✅', '💬', '🔧', '🏠', '📋', '🔑', '💡']

export default function EditAnnouncementsModal({ properties, currentProp, announcements, onClose, onSaved }: Props) {
  const defaultProp = currentProp === 'all' ? (properties[0]?.id || '') : currentProp
  const [propId, setPropId] = useState(defaultProp)
  const [items, setItems] = useState<Announcement[]>(announcements.filter(a => a.property_id === defaultProp))
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newIcon, setNewIcon] = useState('📢')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handlePropChange(id: string) {
    setPropId(id)
    setItems(announcements.filter(a => a.property_id === id))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('announcements').insert([{
      property_id: propId, title: newTitle.trim(), body: newBody.trim(), icon: newIcon
    }]).select().single()
    if (error) setError(error.message)
    else { setItems(prev => [data, ...prev]); setNewTitle(''); setNewBody(''); onSaved() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('announcements').delete().eq('id', id)
    setItems(prev => prev.filter(a => a.id !== id))
    onSaved()
  }

  const labelStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: '6px' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', width: '520px', maxWidth: '95vw', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Manage Announcements</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Property</label>
          <select value={propId} onChange={e => handlePropChange(e.target.value)}>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Existing announcements */}
        {items.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>Current announcements</div>
            {items.map(a => (
              <div key={a.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px', background: 'var(--bg3)', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '20px' }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{a.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{a.body}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{new Date(a.created_at).toLocaleDateString()}</div>
                </div>
                <button onClick={() => handleDelete(a.id)} style={{ background: 'var(--red2)', border: 'none', color: 'var(--red)', borderRadius: '6px', cursor: 'pointer', padding: '6px 8px', fontSize: '14px', flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Add new */}
        <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '12px' }}>Post new announcement</div>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Icon</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ICONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setNewIcon(icon)} style={{
                    fontSize: '20px', padding: '4px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: newIcon === icon ? 'var(--blue3)' : 'var(--bg4)',
                    outline: newIcon === icon ? '2px solid var(--blue)' : 'none'
                  }}>{icon}</button>
                ))}
              </div>
            </div>
            <div><label style={labelStyle}>Title</label><input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Roof work starts Monday" required /></div>
            <div><label style={labelStyle}>Details</label><textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Add more details..." style={{ height: '70px', resize: 'none', lineHeight: 1.5 }} /></div>
            <button type="submit" disabled={saving} style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '9px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 500 }}>
              {saving ? 'Posting...' : '+ Post announcement'}
            </button>
          </form>
        </div>

        {error && <div style={{ background: 'var(--red2)', color: 'var(--red)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginTop: '12px' }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button onClick={onClose} style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 500 }}>Done</button>
        </div>
      </div>
    </div>
  )
}
