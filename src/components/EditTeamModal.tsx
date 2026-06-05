'use client'
import { useState } from 'react'
import { supabase, type TeamMember, type Property } from '@/lib/supabase'
import { DEPT_COLORS, DEPARTMENTS, DEPT_LABELS } from '@/lib/constants'

interface Props {
  properties: Property[]
  currentProp: string
  teamMembers: TeamMember[]
  onClose: () => void
  onSaved: () => void
}

export default function EditTeamModal({ properties, currentProp, teamMembers, onClose, onSaved }: Props) {
  const defaultProp = currentProp === 'all' ? (properties[0]?.id || '') : currentProp
  const [propId, setPropId] = useState(defaultProp)
  const [members, setMembers] = useState<TeamMember[]>(teamMembers.filter(m => m.property_id === defaultProp))
  const [newName, setNewName] = useState('')
  const [newInitials, setNewInitials] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newDept, setNewDept] = useState<TeamMember['department']>('PM')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handlePropChange(id: string) {
    setPropId(id)
    setMembers(teamMembers.filter(m => m.property_id === id))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('team_members').insert([{
      property_id: propId, name: newName.trim(),
      initials: newInitials.toUpperCase().trim(), email: newEmail.trim(), department: newDept
    }]).select().single()
    if (error) setError(error.message)
    else { setMembers(prev => [...prev, data]); setNewName(''); setNewInitials(''); setNewEmail(''); onSaved() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
    onSaved()
  }

  async function handleUpdate(id: string, field: string, value: string) {
    await supabase.from('team_members').update({ [field]: value }).eq('id', id)
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
    onSaved()
  }

  const labelStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: '6px' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', width: '560px', maxWidth: '95vw', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Manage Team</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Property</label>
          <select value={propId} onChange={e => handlePropChange(e.target.value)}>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {members.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>Current team</div>
            {members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: DEPT_COLORS[m.department] || '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: '#fff', flexShrink: 0 }}>{m.initials}</div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 60px 90px 1fr', gap: '6px' }}>
                  <input defaultValue={m.name} onBlur={e => handleUpdate(m.id, 'name', e.target.value)} style={{ padding: '5px 8px', fontSize: '12px' }} />
                  <input defaultValue={m.initials} onBlur={e => handleUpdate(m.id, 'initials', e.target.value.toUpperCase())} style={{ padding: '5px 8px', fontSize: '12px' }} maxLength={3} />
                  <select defaultValue={m.department} onChange={e => handleUpdate(m.id, 'department', e.target.value)} style={{ padding: '5px 8px', fontSize: '12px' }}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input defaultValue={m.email} onBlur={e => handleUpdate(m.id, 'email', e.target.value)} style={{ padding: '5px 8px', fontSize: '12px' }} placeholder="email" />
                </div>
                <button onClick={() => handleDelete(m.id)} style={{ background: 'var(--red2)', border: 'none', color: 'var(--red)', borderRadius: '6px', cursor: 'pointer', padding: '6px 8px', fontSize: '14px' }}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '12px' }}>Add team member</div>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px', gap: '10px' }}>
              <div><label style={labelStyle}>Full name</label><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Smith" required /></div>
              <div><label style={labelStyle}>Initials</label><input value={newInitials} onChange={e => setNewInitials(e.target.value)} placeholder="JS" maxLength={3} required /></div>
              <div><label style={labelStyle}>Dept</label>
                <select value={newDept} onChange={e => setNewDept(e.target.value as TeamMember['department'])}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'flex-end' }}>
              <div><label style={labelStyle}>Email</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@company.com" /></div>
              <button type="submit" disabled={saving} style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 500, whiteSpace: 'nowrap' }}>+ Add</button>
            </div>
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
