export const COLORS: Record<string, string> = {
  blue: '#4f8ef7', green: '#3ecf8e', amber: '#f5a623',
  purple: '#9b72f5', teal: '#2dd4bf', red: '#f25c5c',
}
export const COLOR_BGS: Record<string, string> = {
  blue: '#0d2050', green: '#0d3d2a', amber: '#3d2a0a',
  purple: '#2a1a5a', teal: '#0a2e2c', red: '#3d1010',
}
export const DEPT_COLORS: Record<string, string> = {
  PM: '#4f8ef7', DC: '#9b72f5', OPS: '#3ecf8e',
}
export const STATUS_LABELS = ['Not started', 'In progress', 'Blocked', 'Done']
export const STATUS_CLASSES = ['sp-todo', 'sp-inprog', 'sp-blocked', 'sp-done']
export const STATUS_STYLES: Record<number, { bg: string; color: string }> = {
  0: { bg: 'var(--bg4)', color: 'var(--text2)' },
  1: { bg: 'var(--blue3)', color: 'var(--blue)' },
  2: { bg: 'var(--red2)', color: 'var(--red)' },
  3: { bg: 'var(--green2)', color: 'var(--green)' },
}

export function propColor(color: string) { return COLORS[color] || COLORS.blue }
export function propColorBg(color: string) { return COLOR_BGS[color] || COLOR_BGS.blue }

export function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`
  return `$${n}`
}

export function isOverdue(due: string, status: number) {
  return status < 3 && due < new Date().toISOString().slice(0, 10)
}
