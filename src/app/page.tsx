'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, type Property, type Task, type BudgetItem, type TeamMember, type Announcement, type Milestone } from '@/lib/supabase'
import TopNav from '@/components/TopNav'
import SiteGrid from '@/components/SiteGrid'
import MainView from '@/components/MainView'
import AddTaskModal from '@/components/AddTaskModal'
import ReportModal from '@/components/ReportModal'

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
  const [showAddTask, setShowAddTask] = useState(false)
  const [showReport, setShowReport] = useState(false)

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

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return
    const ch = supabase.channel('realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_items' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, () => loadData())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user, loadData])

  async function handleUpdateTaskStatus(taskId: string, newStatus: number) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t))
  }

  async function handleAddTask(task: Omit<Task, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('tasks').insert([task]).select().single()
    if (!error && data) setTasks(prev => [...prev, data])
    setShowAddTask(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ color: 'var(--text3)', fontSize: '14px' }}>Loading...</div>
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
        onAddTask={() => setShowAddTask(true)}
        onExport={() => setShowReport(true)}
        onSignOut={handleSignOut}
        userEmail={user?.email}
      />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', fontSize: '14px' }}>
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
          />
        )}
      </div>

      {showAddTask && (
        <AddTaskModal
          properties={properties}
          currentProp={currentProp}
          onAdd={handleAddTask}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {showReport && (
        <ReportModal
          properties={properties}
          tasks={tasks}
          budgetItems={budgetItems}
          teamMembers={teamMembers}
          milestones={milestones}
          currentProp={currentProp === 'all' ? (properties[0]?.id || '') : currentProp}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
