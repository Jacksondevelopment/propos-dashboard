import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Property = {
  id: string
  name: string
  address: string
  color: string
  units: number
  created_at: string
}

export type Task = {
  id: string
  name: string
  property_id: string
  department: 'PM' | 'DC' | 'OPS' | 'SLS'
  unit_area: string
  status: 0 | 1 | 2 | 3
  due_date: string
  assignee_initials: string
  created_at: string
}

export type BudgetItem = {
  id: string
  property_id: string
  name: string
  budgeted: number
  spent: number
  created_at: string
}

export type TeamMember = {
  id: string
  property_id: string
  department: 'PM' | 'DC' | 'OPS' | 'SLS'
  name: string
  initials: string
  email: string
  created_at: string
}

export type Announcement = {
  id: string
  property_id: string
  title: string
  body: string
  icon: string
  created_at: string
}

export type Milestone = {
  id: string
  property_id: string
  name: string
  percent: number
  due_date: string
  status: 0 | 1 | 2 | 3
  created_at: string
}
