'use client'
import { type Property, type Task, type BudgetItem, type TeamMember, type Announcement, type Milestone } from '@/lib/supabase'
import { DEPT_COLORS, DEPT_LABELS, DEPARTMENTS, STATUS_LABELS, STATUS_STYLES, propColor, propColorBg, isOverdue, fmt } from '@/lib/constants'

interface Props {
  properties: Property[]
  tasks: Task[]
  budgetItems: BudgetItem[]
  teamMembers: TeamMember[]
  announcements: Announcement[]
  milestones: Milestone[]
  currentProp: string
  filterDept: string
  setFilterDept: (d: string) => void
  filterStatus: string
  setFilterStatus: (s: string) => void
  onUpdateTaskStatus: (id: string, status: number) => void
  onDeleteTask: (id: string) => void
  onSetCurrentProp: (id: string) => void
}

export default function MainView({
  properties, tasks, budgetItems, teamMembers, announcements, milestones,
  currentProp, filterDept, setFilterDept, filterStatus, setFilterStatus,
  onUpdateTaskStatus, onDeleteTask, onSetCurrentProp
}: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const isAll = currentProp === 'all'

  const propData = isAll ? null : properties.find(p => p.id === currentProp)
  const propTasks = isAll ? tasks : tasks.filter(t => t.property_id === currentProp)
  const propBudget = isAll ? budgetItems : budgetItems.filter(b => b.property_id === currentProp)
  const propTeam = isAll ? [] : teamMembers.filter(m => m.property_id === currentProp)
  const propAnnouncements = isAll ? announcements : announcements.filter(a => a.property_id === currentProp)
  const propMilestones = isAll ? milestones : milestones.filter(m => m.property_id === currentProp)

  const open = propTasks.filter(t => t.status < 3).length
  const overdueCount = propTasks.filter(t => isOverdue(t.due_date, t.status)).length
  const done = propTasks.filter(t => t.status === 3).length
  const blocked = propTasks.filter(t => t.status === 2).length
  const totalB = propBudget.reduce((a, b) => a + b.budgeted, 0)
  const totalS = propBudget.reduce((a, b) => a + b.spent, 0)
  const spentPct = totalB > 0 ? Math.round(totalS / totalB * 100) : 0
  const totalUnits = isAll ? properties.reduce((a, p) => a + p.units, 0) : propData?.units || 0

  let filtered = propTasks
  if (filterDept !== 'All') filtered = filtered.filter(t => t.department === filterDept)
  if (filterStatus !== 'All') {
    const si = STATUS_LABELS.indexOf(filterStatus)
    filtered = filtered.filter(t => t.status === si)
  }

  function getPropForTask(propId: string) { return properties.find(p => p.id === propId) }
  function getAssignee(task: Task) {
    const team = teamMembers.filter(m => m.property_id === task.property_id)
    return team.find(m => m.initials === task.assignee_initials) || { initials: task.assignee_initials, name: task.assignee_initials }
  }

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)',
    borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', width: 'auto',
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: '16px 10px', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text3)', letterSpacing: '.8px', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>Properties</div>
        {[{ id: 'all', name: 'All Properties', color: 'blue' }, ...properties].map(p => {
          const pTasks = p.id === 'all' ? tasks : tasks.filter(t => t.property_id === p.id)
          const pOverdue = pTasks.filter(t => isOverdue(t.due_date, t.status)).length
          const pOpen = pTasks.filter(t => t.status < 3).length
          return (
            <div key={p.id} onClick={() => onSetCurrentProp(p.id)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 8px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px',
              color: currentProp === p.id ? 'var(--text)' : 'var(--text2)',
              background: currentProp === p.id ? 'var(--bg3)' : 'transparent',
              transition: 'all .15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: propColor(p.color || 'blue'), flexShrink: 0 }} />
                <span style={{ fontSize: '12px' }}>{p.id === 'all' ? 'All' : p.name}</span>
              </div>
              <span style={{
                fontSize: '10px', borderRadius: '10px', padding: '1px 5px',
                background: pOverdue > 0 ? 'var(--red2)' : 'var(--bg4)',
                color: pOverdue > 0 ? 'var(--red)' : 'var(--text3)',
              }}>{pOpen}</span>
            </div>
          )
        })}
        <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text3)', letterSpacing: '.8px', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>Departments</div>
        {['All', ...DEPARTMENTS].map(d => (
          <div key={d} onClick={() => setFilterDept(d)} style={{
            padding: '7px 8px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px',
            color: filterDept === d ? 'var(--text)' : 'var(--text2)',
            background: filterDept === d ? 'var(--bg3)' : 'transparent',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            {d !== 'All' && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: DEPT_COLORS[d] }} />}
            {d === 'All' ? 'All Depts' : DEPT_LABELS[d]}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>{isAll ? 'All Properties' : propData?.name}</span>
          {propData && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{propData.address} · {propData.units} units</span>}
          {propTeam.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginLeft: '8px', paddingLeft: '10px', borderLeft: '1px solid var(--border)', flexWrap: 'wrap' }}>
              {propTeam.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text3)' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: DEPT_COLORS[m.department] || '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 600, color: '#fff' }}>{m.initials}</div>
                  {m.department}: <span style={{ color: 'var(--text2)' }}>{m.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Open Tasks', val: open, badge: overdueCount > 0 ? `${overdueCount} overdue` : 'none overdue', badgeType: overdueCount > 0 ? 'bad' : 'ok', sub: `${blocked} blocked` },
            { label: 'Completed', val: done, badge: null, sub: 'tasks done' },
            { label: 'Budget Spent', val: fmt(totalS), badge: `${spentPct}%`, badgeType: spentPct > 90 ? 'bad' : spentPct > 75 ? 'warn' : 'ok', sub: `of ${fmt(totalB)} total` },
            { label: isAll ? 'Properties' : 'Units', val: isAll ? properties.length : totalUnits, badge: null, sub: isAll ? `${totalUnits} total units` : `${propData?.address?.split(',')[1]?.trim() || ''}` },
          ].map((m, i) => (
            <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-1px' }}>{m.val}</span>
                {m.badge && (
                  <span style={{
                    fontSize: '11px', padding: '2px 7px', borderRadius: '10px', fontWeight: 500,
                    background: m.badgeType === 'bad' ? 'var(--red2)' : m.badgeType === 'warn' ? 'var(--amber2)' : 'var(--green2)',
                    color: m.badgeType === 'bad' ? 'var(--red)' : m.badgeType === 'warn' ? 'var(--amber)' : 'var(--green)',
                  }}>{m.badge}</span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              <i className="ti ti-checklist" style={{ fontSize: '16px', color: 'var(--blue)' }} />
              Tasks
              <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 400 }}>{filtered.length} shown</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                {['All', ...STATUS_LABELS].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>No tasks match current filters</div>
          ) : filtered.map(task => {
            const taskProp = getPropForTask(task.property_id)
            const assignee = getAssignee(task)
            const overdue = isOverdue(task.due_date, task.status)
            const isDone = task.status === 3
            const ss = STATUS_STYLES[task.status]
            return (
              <div key={task.id} style={{
                display: 'grid', gridTemplateColumns: '18px 1fr auto auto auto auto',
                alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderBottom: '1px solid var(--border)', transition: 'background .1s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg3)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
              >
                <div onClick={() => onUpdateTaskStatus(task.id, isDone ? 0 : 3)} style={{
                  width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                  border: isDone ? 'none' : '1.5px solid var(--border2)',
                  background: isDone ? 'var(--green)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  {isDone && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><polyline points="1,4 4,7 9,1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: isDone ? 'var(--text3)' : 'var(--text)', textDecoration: isDone ? 'line-through' : 'none', marginBottom: '3px' }}>{task.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                    {isAll && taskProp && (
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 500, background: propColorBg(taskProp.color), color: propColor(taskProp.color) }}>{taskProp.name}</span>
                    )}
                    <span style={{ fontSize: '11px', color: DEPT_COLORS[task.department] || 'var(--text3)' }}>{task.department}</span>
                    {task.unit_area && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--purple2)', color: 'var(--purple)', fontFamily: 'monospace' }}>{task.unit_area}</span>}
                  </div>
                </div>
                <button onClick={() => onUpdateTaskStatus(task.id, (task.status + 1) % 4)} style={{
                  fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 500,
                  cursor: 'pointer', border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  background: ss.bg, color: ss.color, transition: 'all .15s',
                }}>{STATUS_LABELS[task.status]}</button>
                <div style={{ fontSize: '11px', color: overdue ? 'var(--red)' : 'var(--text3)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{task.due_date}</div>
                <div title={assignee.name} style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, background: DEPT_COLORS[task.department] || '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: '#fff' }}>{task.assignee_initials}</div>
                <button onClick={() => onDeleteTask(task.id)} title="Delete task" style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '16px', padding: '2px 4px', borderRadius: '4px', lineHeight: 1 }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)'}
                >×</button>
              </div>
            )
          })}
        </div>

        {/* Bottom two-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              <i className="ti ti-chart-bar" style={{ fontSize: '16px', color: 'var(--amber)' }} /> Budget Tracking
            </div>
            {propBudget.slice(0, 7).map(item => {
              const pct = item.budgeted > 0 ? Math.round(item.spent / item.budgeted * 100) : 0
              const barColor = pct > 90 ? 'var(--red)' : pct > 75 ? 'var(--amber)' : 'var(--green)'
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)', gap: '12px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text)', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ flex: 1, maxWidth: '100px' }}>
                    <div style={{ background: 'var(--bg3)', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: '3px' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmt(item.spent)} / {fmt(item.budgeted)}</div>
                </div>
              )
            })}
            {propBudget.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>No budget items — click Edit → 💰 Budget to add some</div>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                <i className="ti ti-flag" style={{ fontSize: '16px', color: 'var(--green)' }} /> Project Milestones
              </div>
              {propMilestones.slice(0, 4).map(m => {
                const p = properties.find(p => p.id === m.property_id)
                const col = propColor(p?.color || 'blue')
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: col, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '5px' }}>{m.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, background: 'var(--bg3)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${m.percent}%`, background: col, borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', minWidth: '30px' }}>{m.percent}%</span>
                        <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{m.due_date}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {propMilestones.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>No milestones — click Edit → 🚩 Milestones to add some</div>}
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                <i className="ti ti-speakerphone" style={{ fontSize: '16px', color: 'var(--purple)' }} /> Announcements
              </div>
              {propAnnouncements.slice(0, 3).map(a => {
                const p = properties.find(p => p.id === a.property_id)
                return (
                  <div key={a.id} style={{ display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{a.icon || '📢'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{a.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: 1.5 }}>{a.body}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                        {isAll && p && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: propColorBg(p.color), color: propColor(p.color) }}>{p.name}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
              {propAnnouncements.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>No announcements — click Edit → 📢 Announcements to post one</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
