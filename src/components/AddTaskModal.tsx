'use client'
import { useState } from 'react'
import { type Property, type Task } from '@/lib/supabase'
import { STATUS_LABELS } from '@/lib/constants'

interface Props {
  properties: Property[]
  currentProp: string
  onAdd: (task: Omit<Task, 'id' | 'created_at'>) => void
  onClose: () => void
}

const DEPARTMENTS = [
  { code: 'PM', label: 'PM — Property Mgmt' },
  { code: 'DC', label: 'DC — Dev & Construction' },
  { code: 'OPS', label: 'OPS — Operations' },
  { code: 'SLS', label: 'SLS — Sales' },
]

export default function AddTaskModal({ properties, currentProp, onAdd, onClose }: Props) {
  const defaultProp = currentProp === 'all' ? (properties[0]?.id || '') : currentProp
  const [name, setName] = useState('')
  const [propId, setPropId] = useState(defaultProp)
  const [dept, setDept] = useState<Task['department']>('PM')
  const [unit, setUnit] = useState('')
  const [status, setStatus] = useState(0)
  const [due, setDue] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10)
  })
  const [assignee, setAssignee] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), property_id: propId, department: dept, unit_area: unit, status: status as Task['status'], due_date: due, assignee_initials: assignee.toUpperCase() || '??' })
  }

  const labelStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: '6px' }
  const groupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', width: '480px', maxWidth: '95vw', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Add New Task</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={groupStyle}>
            <label style={labelStyle}>Task name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Describe the task..." required autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={groupStyle}>
              <label style={labelStyle}>Property</label>
              <select value={propId} onChange={e => setPropId(e.target.value)}>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Department</label>
              <select value={dept} onChange={e => setDept(e.target.value as Task['department'])}>
                {DEPARTMENTS.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={groupStyle}>
              <label style={labelStyle}>Unit / Area</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. Unit 4B, Lobby" />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={e => setStatus(Number(e.target.value))}>
                {STATUS_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={groupStyle}>
              <label style={labelStyle}>Due date</label>
              <input type="date" value={due} onChange={e => setDue(e.target.value)} required />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Assignee initials</label>
              <input value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="e.g. MB" maxLength={3} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Cancel</button>
            <button type="submit" style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 500 }}>Add task</button>
          </div>
        </form>
      </div>
    </div>
  )
}
