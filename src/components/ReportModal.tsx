'use client'
import { useState } from 'react'
import { type Property, type Task, type BudgetItem, type TeamMember, type Milestone } from '@/lib/supabase'
import { STATUS_LABELS, fmt, isOverdue } from '@/lib/constants'

interface Props {
  properties: Property[]
  tasks: Task[]
  budgetItems: BudgetItem[]
  teamMembers: TeamMember[]
  milestones: Milestone[]
  currentProp: string
  onClose: () => void
}

export default function ReportModal({ properties, tasks, budgetItems, teamMembers, milestones, currentProp, onClose }: Props) {
  const [selectedProp, setSelectedProp] = useState(currentProp || properties[0]?.id || '')
  const [exporting, setExporting] = useState(false)

  const prop = properties.find(p => p.id === selectedProp)
  const propTasks = tasks.filter(t => t.property_id === selectedProp)
  const propBudget = budgetItems.filter(b => b.property_id === selectedProp)
  const propTeam = teamMembers.filter(m => m.property_id === selectedProp)
  const propMilestones = milestones.filter(m => m.property_id === selectedProp)

  const totalB = propBudget.reduce((a, b) => a + b.budgeted, 0)
  const totalS = propBudget.reduce((a, b) => a + b.spent, 0)
  const spentPct = totalB > 0 ? Math.round(totalS / totalB * 100) : 0
  const open = propTasks.filter(t => t.status < 3).length
  const done = propTasks.filter(t => t.status === 3).length
  const blocked = propTasks.filter(t => t.status === 2).length
  const overdueCount = propTasks.filter(t => isOverdue(t.due_date, t.status)).length

  async function exportPDF() {
    setExporting(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF()
      const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

      // Header
      doc.setFillColor(15, 17, 23)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(79, 142, 247)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('PropOS', 14, 18)
      doc.setTextColor(232, 234, 242)
      doc.setFontSize(13)
      doc.text('Site Report', 14, 28)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(139, 146, 176)
      doc.text(`Generated: ${reportDate}`, 14, 36)

      // Property info
      doc.setTextColor(30, 30, 30)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(prop?.name || '', 14, 55)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(90, 98, 128)
      doc.text(prop?.address || '', 14, 63)
      doc.text(`${prop?.units || 0} residential units`, 14, 70)

      let y = 82

      // Team section
      if (propTeam.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 30, 30)
        doc.text('Team Contacts', 14, y)
        y += 6
        autoTable(doc, {
          startY: y,
          head: [['Department', 'Name', 'Email']],
          body: propTeam.map(m => [
            m.department === 'PM' ? 'Property Management' : m.department === 'DC' ? 'Dev & Construction' : 'Operations',
            m.name, m.email || '—'
          ]),
          styles: { fontSize: 10, cellPadding: 4 },
          headStyles: { fillColor: [79, 142, 247], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 14, right: 14 },
        })
        y = (doc as any).lastAutoTable.finalY + 10
      }

      // Task summary
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text('Task Summary', 14, y)
      y += 6
      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Count']],
        body: [['Open tasks', open], ['Completed', done], ['Blocked', blocked], ['Overdue', overdueCount]],
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [79, 142, 247], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14, right: 14 },
        columnStyles: { 1: { halign: 'center' } },
      })
      y = (doc as any).lastAutoTable.finalY + 10

      // Budget
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Budget Summary', 14, y)
      y += 6
      autoTable(doc, {
        startY: y,
        head: [['Line Item', 'Budgeted', 'Spent', 'Remaining', '%']],
        body: [
          ...propBudget.map(item => [
            item.name,
            fmt(item.budgeted),
            fmt(item.spent),
            fmt(item.budgeted - item.spent),
            `${item.budgeted > 0 ? Math.round(item.spent / item.budgeted * 100) : 0}%`
          ]),
          ['TOTAL', fmt(totalB), fmt(totalS), fmt(totalB - totalS), `${spentPct}%`]
        ],
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [79, 142, 247], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14, right: 14 },
      })
      y = (doc as any).lastAutoTable.finalY + 10

      // Milestones
      if (propMilestones.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Project Milestones', 14, y)
        y += 6
        autoTable(doc, {
          startY: y,
          head: [['Milestone', 'Progress', 'Due Date', 'Status']],
          body: propMilestones.map(m => [m.name, `${m.percent}%`, m.due_date, STATUS_LABELS[m.status]]),
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [79, 142, 247], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 14, right: 14 },
        })
      }

      // Open tasks detail
      if (propTasks.filter(t => t.status < 3).length > 0) {
        doc.addPage()
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 30, 30)
        doc.text('Open Tasks Detail', 14, 20)
        autoTable(doc, {
          startY: 28,
          head: [['Task', 'Dept', 'Unit/Area', 'Status', 'Due', 'Assignee']],
          body: propTasks.filter(t => t.status < 3).map(t => [
            t.name, t.department, t.unit_area || '—',
            STATUS_LABELS[t.status], t.due_date, t.assignee_initials
          ]),
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [79, 142, 247], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 14, right: 14 },
        })
      }

      doc.save(`propos-report-${prop?.name?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error(err)
      alert('PDF export failed. Please try again.')
    }
    setExporting(false)
  }

  const secStyle: React.CSSProperties = { background: 'var(--bg3)', borderRadius: '8px', padding: '14px', marginBottom: '12px' }
  const secHead: React.CSSProperties = { fontSize: '11px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }
  const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', width: '520px', maxWidth: '95vw', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Site Report</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>Select property</label>
          <select value={selectedProp} onChange={e => setSelectedProp(e.target.value)}>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={secStyle}>
          <div style={secHead}>Property Overview</div>
          <div style={rowStyle}><span style={{ color: 'var(--text3)' }}>Address</span><span style={{ color: 'var(--text)' }}>{prop?.address}</span></div>
          <div style={rowStyle}><span style={{ color: 'var(--text3)' }}>Total units</span><span style={{ color: 'var(--text)' }}>{prop?.units}</span></div>
          <div style={rowStyle}><span style={{ color: 'var(--text3)' }}>Report date</span><span style={{ color: 'var(--text)' }}>{new Date().toLocaleDateString()}</span></div>
        </div>

        {propTeam.length > 0 && (
          <div style={secStyle}>
            <div style={secHead}>Team Contacts</div>
            {propTeam.map(m => (
              <div key={m.id} style={rowStyle}>
                <span style={{ color: 'var(--text3)' }}>{m.department === 'PM' ? 'Property Mgmt' : m.department === 'DC' ? 'Dev & Construction' : 'Operations'}</span>
                <span style={{ color: 'var(--text)' }}>{m.name}</span>
              </div>
            ))}
          </div>
        )}

        <div style={secStyle}>
          <div style={secHead}>Task Summary</div>
          {[['Open tasks', open, 'var(--text)'], ['Completed', done, 'var(--green)'], ['Blocked', blocked, 'var(--red)'], ['Overdue', overdueCount, 'var(--amber)']].map(([l, v, c]) => (
            <div key={l as string} style={rowStyle}>
              <span style={{ color: 'var(--text3)' }}>{l}</span>
              <span style={{ color: c as string, fontWeight: 500 }}>{v as number}</span>
            </div>
          ))}
        </div>

        <div style={secStyle}>
          <div style={secHead}>Budget Summary</div>
          <div style={rowStyle}><span style={{ color: 'var(--text3)' }}>Total budget</span><span style={{ color: 'var(--text)' }}>{fmt(totalB)}</span></div>
          <div style={rowStyle}><span style={{ color: 'var(--text3)' }}>Amount spent</span><span style={{ color: 'var(--text)' }}>{fmt(totalS)}</span></div>
          <div style={rowStyle}><span style={{ color: 'var(--text3)' }}>Remaining</span><span style={{ color: 'var(--green)' }}>{fmt(totalB - totalS)}</span></div>
          <div style={rowStyle}><span style={{ color: 'var(--text3)' }}>Utilization</span>
            <span style={{ color: spentPct > 90 ? 'var(--red)' : spentPct > 75 ? 'var(--amber)' : 'var(--green)', fontWeight: 500 }}>{spentPct}%</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
            Close
          </button>
          <button onClick={exportPDF} disabled={exporting} style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: 500, opacity: exporting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-download" style={{ fontSize: '14px' }} />
            {exporting ? 'Generating PDF...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
