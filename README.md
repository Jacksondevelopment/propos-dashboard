# PropOS — Property Management Dashboard

A real-time, multi-user property management dashboard for residential properties.
Built with Next.js 14, Supabase, and Vercel.

---

## What's included

- **Multi-property dashboard** — all 6 properties with unified or per-site views
- **Live task management** — status pipeline (Not started → In progress → Blocked → Done)
- **Budget tracking** — line items with spend vs. budget bars
- **Project milestones** — progress bars per property
- **Team directory** — PM, DC, and OPS contacts per site
- **Unit-level tracking** — tag tasks to specific units or areas
- **Announcements** — cross-team communication feed
- **PDF export** — stakeholder-ready site reports
- **Real-time sync** — changes appear instantly for all logged-in users
- **Auth** — email/password login via Supabase Auth

---

## Setup (6 steps, ~30 minutes)

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New project**
3. Name it `propos` and set a database password (save it)
4. Wait ~2 minutes for the project to provision

### Step 2 — Run the database schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `schema.sql` from this project
4. Paste the entire contents into the editor
5. Click **Run**

This creates all tables, security policies, and seeds your 6 properties with sample data.

### Step 3 — Get your API keys

1. In Supabase, go to **Project Settings → API**
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy the **anon public** key (long string starting with `eyJ...`)

### Step 4 — Configure environment variables

1. In the project folder, duplicate `.env.local.example` and rename it `.env.local`
2. Fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5 — Run locally

Make sure you have [Node.js 18+](https://nodejs.org) installed, then:

```bash
cd propos-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the login page.
Create an account, sign in, and the dashboard loads with your seeded data.

### Step 6 — Deploy to Vercel (free, live URL)

1. Push this folder to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create propos-dashboard --public --push
   ```
   *(Install [GitHub CLI](https://cli.github.com) if you don't have it, or push via GitHub Desktop)*

2. Go to [vercel.com](https://vercel.com), sign up with GitHub, click **Add New Project**

3. Import your `propos-dashboard` repo

4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your anon key

5. Click **Deploy** — Vercel builds and gives you a live URL like `propos-dashboard.vercel.app`

Share that URL with your team. Anyone can sign up and access the dashboard.

---

## Adding your team

Once deployed, share the URL and have each team member:
1. Go to the URL
2. Click **Sign up**
3. Enter their work email and a password
4. Check email for confirmation link
5. Log in — they'll see the full dashboard

---

## Customizing your data

### Update team member emails
In Supabase → **Table Editor → team_members**, click any row to edit names, initials, and emails to match your real team.

### Update property details
In **Table Editor → properties**, update addresses, unit counts, and colors (`blue`, `green`, `amber`, `purple`, `teal`, `red`).

### Add budget line items
In **Table Editor → budget_items**, add rows with your actual project budgets.

---

## Folder structure

```
propos-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, fonts
│   │   ├── page.tsx            # Main dashboard page
│   │   ├── globals.css         # Global styles + CSS variables
│   │   └── login/
│   │       └── page.tsx        # Login / signup page
│   ├── components/
│   │   ├── TopNav.tsx          # Navigation bar
│   │   ├── SiteGrid.tsx        # By-site card grid view
│   │   ├── MainView.tsx        # Main dashboard (metrics, tasks, budget)
│   │   ├── AddTaskModal.tsx    # Add task form
│   │   └── ReportModal.tsx     # PDF export modal
│   └── lib/
│       ├── supabase.ts         # Supabase client + TypeScript types
│       └── constants.ts        # Colors, status labels, helpers
├── schema.sql                  # Database schema + seed data
├── .env.local.example          # Environment variable template
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Tech stack

| Layer | Tool | Cost |
|---|---|---|
| Framework | Next.js 14 (App Router) | Free |
| Database | Supabase (Postgres) | Free tier |
| Auth | Supabase Auth | Free tier |
| Hosting | Vercel | Free tier |
| PDF export | jsPDF + jsPDF-AutoTable | Free |
| Styling | Tailwind CSS + CSS variables | Free |

**Total monthly cost for a team of 6–20 users: $0**

---

## Troubleshooting

**"relation does not exist" error** → The schema wasn't run. Go to Supabase SQL Editor and run `schema.sql` again.

**Blank dashboard after login** → Check your `.env.local` — the URL and key must match exactly what's in Supabase Project Settings → API.

**Real-time not working** → In Supabase → Database → Replication, make sure the `tasks`, `announcements`, `budget_items`, and `milestones` tables are enabled under `supabase_realtime`.

**PDF export fails** → This is a browser-side operation. Make sure you're using a modern browser (Chrome, Firefox, Edge, Safari 16+).
