'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, type Property, type Task, type BudgetItem, type TeamMember, type Announcement, type Milestone } from '@/lib/supabase'
import TopNav from '@/components/TopNav'
import SiteGrid from '@/components/SiteGrid'
import MainView from '@/components/MainView'
import AddTaskModal from '@/components/AddTaskModal'
import ReportModal from '@/components/ReportModal'
import EditPropertyModal from '@/components/EditPropertyModal'
import EditBudgetModal from '@/components/EditBudgetModal'
import EditTeamModal from '@/components/EditTeamModal'
import EditAnnouncementsModal from '@/components/EditAnnouncementsModal'
import EditMilestonesModal from '@/components/EditMilestonesModal'

type ModalType = 'addTask' | 'report' | 'editProperty' | 'editBudget' | 'editTeam' | 'editAnnouncements' | 'editMilestones' | null

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [properties, setProperties] = useState<Property[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  const [currentProp, setCurrentProp] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'all' | 'bysite'>('all')
  const [filterDept, setFilterDept] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.href = '/login'
      else { setUser(session.user); setAuthLoading(false) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) window.location.href = '/login'
      else setUser(session.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    const [p, t, b, tm, a, m] = await Promise.all([
      supabase.from('properties').select('*').order('name'),
      supabase.from('tasks').select('*').order('due_date'),
      supabase.from('budget_items').select('*').order('name'),
      supabase.from('team_members').select('*').order('department'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('milestones').select('*').order('due_date'),
    ])
    if (p.data) setProperties(p.data)
    if (t.data) setTasks(t.data)
    if (b.data) setBudgetItems(b.data)
    if (tm.data) setTeamMembers(tm.data)
    if (a.data) setAnnouncements(a.data)
    if (m.data) setMilestones(m.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authLoading && user) loadData()
  }, [authLoading, user, loadData])

  useEffect(() => {
    if (!user) return
    const ch = supabase.channel('realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_items' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => loadData())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user, loadData])

  async function handleUpdateTaskStatus(taskId: string, newStatus: number) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t))
  }

  async function handleDeleteTask(taskId: string) {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  async function handleAddTask(task: Omit<Task, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('tasks').insert([task]).select().single()
    if (!error && data) setTasks(prev => [...prev, data])
    setActiveModal(null)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const currentPropData = properties.find(p => p.id === currentProp)

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7' }}>
      <div style={{ color: '#8a8d96', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopNav
        properties={properties}
        currentProp={currentProp}
        setCurrentProp={(id) => { setCurrentProp(id); setViewMode('all') }}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddTask={() => setActiveModal('addTask')}
        onExport={() => setActiveModal('report')}
        onSignOut={handleSignOut}
        userEmail={user?.email}
      />

      {/* Edit toolbar - light theme */}
      <div style={{
        display: 'flex', gap: '6px', padding: '8px 16px',
        background: '#ffffff', borderBottom: '1px solid #e0e1e5', flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '11px', color: '#8a8d96', letterSpacing: '.5px', textTransform: 'uppercase', marginRight: '4px' }}>Edit:</span>
        {[
          { label: '🏢 Property', modal: 'editProperty' as ModalType, disabled: currentProp === 'all' },
          { label: '💰 Budget', modal: 'editBudget' as ModalType, disabled: false },
          { label: '👥 Team', modal: 'editTeam' as ModalType, disabled: false },
          { label: '📢 Announcements', modal: 'editAnnouncements' as ModalType, disabled: false },
          { label: '🚩 Milestones', modal: 'editMilestones' as ModalType, disabled: false },
        ].map(btn => (
          <button key={btn.label} onClick={() => !btn.disabled && setActiveModal(btn.modal)} disabled={btn.disabled} style={{
            background: '#f4f5f7', border: '1px solid #e0e1e5',
            color: btn.disabled ? '#c8c9ce' : '#4a4d56',
            padding: '5px 12px', borderRadius: '6px', cursor: btn.disabled ? 'not-allowed' : 'pointer',
            fontSize: '12px', fontFamily: 'inherit', transition: 'all .15s', opacity: btn.disabled ? 0.5 : 1,
          }}
            onMouseEnter={e => { if (!btn.disabled) { (e.currentTarget as HTMLButtonElement).style.background = '#e4e5e8'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8c9ce' } }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f4f5f7'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e0e1e5' }}
          >{btn.label}</button>
        ))}
        {currentProp === 'all' && <span style={{ fontSize: '11px', color: '#8a8d96', marginLeft: '4px' }}>— Select a property to edit its details</span>}
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8a8d96', fontSize: '14px' }}>
            Loading data...
          </div>
        ) : viewMode === 'bysite' ? (
          <SiteGrid
            properties={properties}
            tasks={tasks}
            budgetItems={budgetItems}
            teamMembers={teamMembers}
            onSelectProp={(id) => { setCurrentProp(id); setViewMode('all') }}
          />
        ) : (
          <MainView
            properties={properties}
            tasks={tasks}
            budgetItems={budgetItems}
            teamMembers={teamMembers}
            announcements={announcements}
            milestones={milestones}
            currentProp={currentProp}
            filterDept={filterDept}
            setFilterDept={setFilterDept}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onSetCurrentProp={(id) => { setCurrentProp(id); setViewMode('all') }}
          />
        )}
      </div>

      {activeModal === 'addTask' && <AddTaskModal properties={properties} currentProp={currentProp} onAdd={handleAddTask} onClose={() => setActiveModal(null)} />}
      {activeModal === 'report' && <ReportModal properties={properties} tasks={tasks} budgetItems={budgetItems} teamMembers={teamMembers} milestones={milestones} currentProp={currentProp === 'all' ? (properties[0]?.id || '') : currentProp} onClose={() => setActiveModal(null)} />}
      {activeModal === 'editProperty' && currentPropData && <EditPropertyModal property={currentPropData} onClose={() => setActiveModal(null)} onSaved={loadData} />}
      {activeModal === 'editBudget' && <EditBudgetModal properties={properties} currentProp={currentProp} budgetItems={budgetItems} onClose={() => setActiveModal(null)} onSaved={loadData} />}
      {activeModal === 'editTeam' && <EditTeamModal properties={properties} currentProp={currentProp} teamMembers={teamMembers} onClose={() => setActiveModal(null)} onSaved={loadData} />}
      {activeModal === 'editAnnouncements' && <EditAnnouncementsModal properties={properties} currentProp={currentProp} announcements={announcements} onClose={() => setActiveModal(null)} onSaved={loadData} />}
      {activeModal === 'editMilestones' && <EditMilestonesModal properties={properties} currentProp={currentProp} milestones={milestones} teamMembers={teamMembers} onClose={() => setActiveModal(null)} onSaved={loadData} />}
    </div>
  )
}
