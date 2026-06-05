'use client'
import { useState } from 'react'
import { supabase, type Milestone, type Property } from '@/lib/supabase'
import { STATUS_LABELS } from '@/lib/constants'

interface Props {
  properties: Property[]
  currentProp: string
  milestones: Milestone[]
  onClose: () => void
  onSaved: () => void
}

export default function EditMilestonesModal({ properties, currentProp, milestones, onClose, onSaved }: Props) {
  const defaultProp = currentProp === 'all' ? (properties[0]?.id || '') : currentProp
  const [propId, setPropId] = useState(defaultProp)
  const [items, setItems] = useState<Milestone[]>(milestones.filter(m => m.property_id === defaultProp))
  const [newName, setNewName] = useState('')
  const [newPct, setNewPct] = useState('0')
  const [newDue, setNewDue] = useState('')
  const [newStatus, setNewStatus] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handlePropChange(id: string) {
    setPropId(id)
    setItems(milestones.filter(m => m.property_id === id))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newDue) return
    setSaving(true)
    const { data, error } = await supabase.from('milestones').insert([{
      property_id: propId, name: newName.trim(),
      percent: Number(newPct), due_date: newDue, status: newStatus
    }]).select().single()
    if (error) setError(error.message)
    else { setItems(prev => [...prev, data]); setNewName(''); setNewPct('0'); setNewDue(''); onSaved() }
    setSaving(false)
  }

  async function handleUpdate(id: string, field: string, value: any) {
    await supabase.from('milestones').update({ [field]: value }).eq('id', id)
    setItems(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
    onSaved()
  }

  async function handleDelete(id: string) {
    await supabase.from('milestones').delete().eq('id', id)
    setItems(prev => prev.filter(m => m.id !== id))
    onSaved()
  }

  const labelStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: '6px' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', width: '580px', maxWidth: '95vw', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Manage Milestones</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Property</label>
          <select value={propId} onChange={e => handlePropChange(e.target.value)}>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {items.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>Current milestones</div>
            {items.map(m => (
              <div key={m.id} style={{ padding: '10px', background: 'var(--bg3)', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 120px 100px 32px', gap: '8px', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{m.name}</div>
                  <input type="number" defaultValue={m.percent} min={0} max={100}
                    onBlur={e => handleUpdate(m.id, 'percent', Number(e.target.value))}
                    style={{ padding: '5px 8px', fontSize: '12px' }} placeholder="%" />
                  <input type="date" defaultValue={m.due_date}
                    onBlur={e => handleUpdate(m.id, 'due_date', e.target.value)}
                    style={{ padding: '5px 8px', fontSize: '12px' }} />
                  <select defaultValue={m.status} onChange={e => handleUpdate(m.id, 'status', Number(e.target.value))} style={{ padding: '5px 8px', fontSize: '12px' }}>
                    {STATUS_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
                  </select>
                  <button onClick={() => handleDelete(m.id)} style={{ background: 'var(--red2)', border: 'none', color: 'var(--red)', borderRadius: '6px', cursor: 'pointer', padding: '6px 8px', fontSize: '14px' }}>×</button>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <div style={{ background: 'var(--bg4)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.percent}%`, background: 'var(--blue)', borderRadius: '2px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '12px' }}>Add new milestone</div>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div><label style={labelStyle}>Milestone name</label><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Roof Replacement Phase 1" required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '10px' }}>
              <div><label style={labelStyle}>% Done</label><input type="number" value={newPct} onChange={e => setNewPct(e.target.value)} min={0} max={100} /></div>
              <div><label style={labelStyle}>Due date</label><input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} required /></div>
              <div><label style={labelStyle}>Status</label>
                <select value={newStatus} onChange={e => setNewStatus(Number(e.target.value))}>
                  {STATUS_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '9px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 500 }}>
              {saving ? 'Adding...' : '+ Add milestone'}
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
