'use client'
import { type Property, type Task, type BudgetItem, type TeamMember } from '@/lib/supabase'
import { COLORS, DEPT_COLORS, propColor, propColorBg, isOverdue } from '@/lib/constants'

interface Props {
  properties: Property[]
  tasks: Task[]
  budgetItems: BudgetItem[]
  teamMembers: TeamMember[]
  onSelectProp: (id: string) => void
}

export default function SiteGrid({ properties, tasks, budgetItems, teamMembers, onSelectProp }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '16px', padding: '20px', overflowY: 'auto', height: '100%'
    }}>
      {properties.map(prop => {
        const propTasks = tasks.filter(t => t.property_id === prop.id)
        const open = propTasks.filter(t => t.status < 3).length
        const overdueCount = propTasks.filter(t => isOverdue(t.due_date, t.status)).length
        const done = propTasks.filter(t => t.status === 3).length
        const propBudget = budgetItems.filter(b => b.property_id === prop.id)
        const totalB = propBudget.reduce((a, b) => a + b.budgeted, 0)
        const totalS = propBudget.reduce((a, b) => a + b.spent, 0)
        const pct = totalB > 0 ? Math.round(totalS / totalB * 100) : 0
        const propTeam = teamMembers.filter(m => m.property_id === prop.id)
        const color = propColor(prop.color)

        return (
          <div key={prop.id} onClick={() => onSelectProp(prop.id)} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '16px', cursor: 'pointer', transition: 'all .2s', position: 'relative',
            overflow: 'hidden',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
          >
            {/* Color strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', marginTop: '6px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{prop.name}</div>
              <span style={{
                fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: 500,
                background: overdueCount > 0 ? 'var(--red2)' : 'var(--green2)',
                color: overdueCount > 0 ? 'var(--red)' : 'var(--green)',
              }}>
                {overdueCount > 0 ? `${overdueCount} overdue` : 'On track'}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '14px' }}>
              {prop.address} · {prop.units} units
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {[
                { val: open, label: 'Open', color: 'var(--text)' },
                { val: overdueCount, label: 'Overdue', color: 'var(--red)' },
                { val: done, label: 'Done', color: 'var(--green)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: '7px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Budget bar */}
            <div style={{ background: 'var(--bg3)', borderRadius: '4px', height: '6px', overflow: 'hidden', marginBottom: '6px' }}>
              <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct > 90 ? 'var(--red)' : pct > 75 ? 'var(--amber)' : color, borderRadius: '4px', transition: 'width .4s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)', marginBottom: '14px' }}>
              <span>Budget used</span><span>{pct}%</span>
            </div>

            {/* Team chips */}
            {propTeam.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {propTeam.map(member => (
                  <div key={member.id} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'var(--bg4)', borderRadius: '20px', padding: '3px 8px 3px 5px',
                    fontSize: '11px', color: 'var(--text2)'
                  }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                      background: DEPT_COLORS[member.department] || '#888',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '8px', fontWeight: 600, color: '#fff'
                    }}>{member.initials}</div>
                    {member.department}: {member.name.split(' ')[0]}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
