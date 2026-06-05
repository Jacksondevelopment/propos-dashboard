'use client'
import { useState } from 'react'
import { supabase, type BudgetItem, type Property } from '@/lib/supabase'

interface Props {
  properties: Property[]
  currentProp: string
  budgetItems: BudgetItem[]
  onClose: () => void
  onSaved: () => void
}

export default function EditBudgetModal({ properties, currentProp, budgetItems, onClose, onSaved }: Props) {
  const defaultProp = currentProp === 'all' ? (properties[0]?.id || '') : currentProp
  const [propId, setPropId] = useState(defaultProp)
  const [items, setItems] = useState<BudgetItem[]>(budgetItems.filter(b => b.property_id === defaultProp))
  const [newName, setNewName] = useState('')
  const [newBudgeted, setNewBudgeted] = useState('')
  const [newSpent, setNewSpent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handlePropChange(id: string) {
    setPropId(id)
    setItems(budgetItems.filter(b => b.property_id === id))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('budget_items').insert([{
      property_id: propId, name: newName.trim(),
      budgeted: Number(newBudgeted) || 0, spent: Number(newSpent) || 0
    }]).select().single()
    if (error) setError(error.message)
    else { setItems(prev => [...prev, data]); setNewName(''); setNewBudgeted(''); setNewSpent(''); onSaved() }
    setSaving(false)
  }

  async function handleUpdate(id: string, field: 'spent' | 'budgeted', value: number) {
    await supabase.from('budget_items').update({ [field]: value }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
    onSaved()
  }

  async function handleDelete(id: string) {
    await supabase.from('budget_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    onSaved()
  }

  const labelStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: '6px' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', width: '560px', maxWidth: '95vw', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Manage Budget</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Property</label>
          <select value={propId} onChange={e => handlePropChange(e.target.value)}>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Existing items */}
        {items.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>Existing line items</div>
            {items.map(item => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 32px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text)' }}>{item.name}</div>
                <input type="number" defaultValue={item.budgeted} onBlur={e => handleUpdate(item.id, 'budgeted', Number(e.target.value))}
                  style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="Budgeted" />
                <input type="number" defaultValue={item.spent} onBlur={e => handleUpdate(item.id, 'spent', Number(e.target.value))}
                  style={{ padding: '6px 8px', fontSize: '12px' }} placeholder="Spent" />
                <button onClick={() => handleDelete(item.id)} style={{ background: 'var(--red2)', border: 'none', color: 'var(--red)', borderRadius: '6px', cursor: 'pointer', padding: '6px', fontSize: '14px' }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Add new item */}
        <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '12px' }}>Add new line item</div>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px auto', gap: '8px', alignItems: 'flex-end' }}>
            <div>
              <label style={labelStyle}>Item name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Roof Repair" required />
            </div>
            <div>
              <label style={labelStyle}>Budgeted ($)</label>
              <input type="number" value={newBudgeted} onChange={e => setNewBudgeted(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Spent ($)</label>
              <input type="number" value={newSpent} onChange={e => setNewSpent(e.target.value)} placeholder="0" />
            </div>
            <button type="submit" disabled={saving} style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 500, whiteSpace: 'nowrap' }}>
              + Add
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
