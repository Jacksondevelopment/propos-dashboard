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
      background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
      padding: '0 16px', height: '52px', flexShrink: 0, overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px', flexShrink: 0 }}>
        <div style={{ width: '26px', height: '26px', background: 'var(--blue)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-building" style={{ color: '#fff', fontSize: '14px' }} />
        </div>
        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' }}>PropOS</span>
      </div>

      {/* Property tabs */}
      <div style={{ display: 'flex', gap: '2px', flex: 1, overflow: 'hidden' }}>
        {allProps.map(p => (
          <button key={p.id} onClick={() => setCurrentProp(p.id)} style={{
            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
            fontSize: '13px', border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap',
            background: currentProp === p.id ? 'var(--blue3)' : 'transparent',
            color: currentProp === p.id ? 'var(--blue)' : 'var(--text2)',
            fontWeight: currentProp === p.id ? 500 : 400,
            transition: 'all .15s',
          }}>
            {p.id === 'all' ? 'All Properties' : p.name.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
          {(['all', 'bysite'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: '5px 10px', borderRadius: '6px', border: 'none', fontFamily: 'inherit',
              background: viewMode === m ? 'var(--bg4)' : 'transparent',
              color: viewMode === m ? 'var(--text)' : 'var(--text2)',
              cursor: 'pointer', fontSize: '12px', fontWeight: viewMode === m ? 500 : 400,
              transition: 'all .15s',
            }}>
              {m === 'all' ? 'All sites' : 'By site'}
            </button>
          ))}
        </div>

        <button onClick={onExport} style={{
          background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)',
          padding: '6px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px',
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <i className="ti ti-download" style={{ fontSize: '14px' }} /> Export
        </button>

        <button onClick={onAddTask} style={{
          background: 'var(--blue)', color: '#fff', border: 'none', padding: '7px 14px',
          borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <i className="ti ti-plus" style={{ fontSize: '14px' }} /> Add task
        </button>

        {/* User menu */}
        <div title={userEmail} onClick={onSignOut} style={{
          width: '30px', height: '30px', borderRadius: '50%', background: 'var(--blue3)',
          border: '1px solid var(--blue2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: 'var(--blue)',
        }}>
          {userEmail?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  )
}
