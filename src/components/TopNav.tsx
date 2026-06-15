'use client'
import { type Property } from '@/lib/supabase'

interface Props {
  properties: Property[]
  currentProp: string
  setCurrentProp: (id: string) => void
  viewMode: 'all' | 'bysite'
  setViewMode: (m: 'all' | 'bysite') => void
  onAddTask: () => void
  onExport: () => void
  onSignOut: () => void
  userEmail?: string
}

export default function TopNav({ properties, currentProp, setCurrentProp, viewMode, setViewMode, onAddTask, onExport, onSignOut, userEmail }: Props) {
  const allProps = [{ id: 'all', name: 'All Properties' }, ...properties]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      background: '#111214',
      borderBottom: '1px solid #2a2a2a',
      padding: '0 16px', height: '56px', flexShrink: 0, overflow: 'hidden'
    }}>
      {/* JDC Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '24px', flexShrink: 0 }}>
        <img src="/jdc-logo.png" alt="Jackson Development Company" style={{
          height: '36px', width: 'auto', borderRadius: '3px', display: 'block'
        }} />
        <div style={{ width: '1px', height: '24px', background: '#333' }} />
        <span style={{ fontSize: '12px', color: '#888888', letterSpacing: '.5px' }}>Dashboard</span>
      </div>

      {/* Property tabs */}
      <div style={{ display: 'flex', gap: '2px', flex: 1, overflow: 'hidden' }}>
        {allProps.map(p => (
          <button key={p.id} onClick={() => setCurrentProp(p.id)} style={{
            padding: '6px 12px', borderRadius: '5px', cursor: 'pointer',
            fontSize: '12px', border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap',
            background: currentProp === p.id ? '#2a2a2a' : 'transparent',
            color: currentProp === p.id ? '#ffffff' : '#888888',
            fontWeight: currentProp === p.id ? 500 : 400,
            transition: 'all .15s',
            letterSpacing: '.3px',
          }}>
            {p.id === 'all' ? 'All Properties' : p.name}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
        {/* View toggle */}
        <div style={{ display: 'flex', background: '#2a2a2a', borderRadius: '6px', padding: '3px', gap: '2px' }}>
          {(['all', 'bysite'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: '4px 10px', borderRadius: '4px', border: 'none', fontFamily: 'inherit',
              background: viewMode === m ? '#444444' : 'transparent',
              color: viewMode === m ? '#ffffff' : '#888888',
              cursor: 'pointer', fontSize: '12px', fontWeight: viewMode === m ? 500 : 400,
              transition: 'all .15s',
            }}>
              {m === 'all' ? 'All sites' : 'By site'}
            </button>
          ))}
        </div>

        <button onClick={onExport} style={{
          background: 'transparent', color: '#888888', border: '1px solid #333',
          padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px',
          transition: 'all .15s',
        }}>
          ↓ Export
        </button>

        <button onClick={onAddTask} style={{
          background: '#ffffff', color: '#111214', border: 'none', padding: '7px 14px',
          borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit',
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px',
          letterSpacing: '.3px',
        }}>
          + Add task
        </button>

        {/* User avatar */}
        <div title={`${userEmail} — click to sign out`} onClick={onSignOut} style={{
          width: '30px', height: '30px', borderRadius: '50%', background: '#2a2a2a',
          border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#ffffff',
        }}>
          {userEmail?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  )
}
