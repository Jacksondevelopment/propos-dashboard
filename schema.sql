-- ============================================================
-- PropOS Database Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- PROPERTIES
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  color text not null default 'blue',
  units integer not null default 0,
  created_at timestamptz default now()
);

-- TEAM MEMBERS
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  department text not null check (department in ('PM','DC','OPS')),
  name text not null,
  initials text not null,
  email text not null default '',
  created_at timestamptz default now()
);

-- TASKS
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  name text not null,
  department text not null check (department in ('PM','DC','OPS')),
  unit_area text not null default '',
  status smallint not null default 0 check (status between 0 and 3),
  due_date date not null,
  assignee_initials text not null default '',
  created_at timestamptz default now()
);

-- BUDGET ITEMS
create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  name text not null,
  budgeted numeric not null default 0,
  spent numeric not null default 0,
  created_at timestamptz default now()
);

-- ANNOUNCEMENTS
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  title text not null,
  body text not null default '',
  icon text not null default '📢',
  created_at timestamptz default now()
);

-- MILESTONES
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  name text not null,
  percent smallint not null default 0 check (percent between 0 and 100),
  due_date date not null,
  status smallint not null default 0 check (status between 0 and 3),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (all authenticated users can read/write)
-- ============================================================
alter table properties enable row level security;
alter table team_members enable row level security;
alter table tasks enable row level security;
alter table budget_items enable row level security;
alter table announcements enable row level security;
alter table milestones enable row level security;

create policy "Authenticated users full access" on properties for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on team_members for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on tasks for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on budget_items for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on announcements for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on milestones for all using (auth.role() = 'authenticated');

-- Enable realtime for tasks and announcements
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table announcements;
alter publication supabase_realtime add table budget_items;
alter publication supabase_realtime add table milestones;

-- ============================================================
-- SEED DATA — Your 6 properties
-- ============================================================
insert into properties (id, name, address, color, units) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Oakwood Residences',  '1240 Oakwood Blvd, Atlanta, GA',    'blue',   48),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Maple Grove Apts',    '580 Maple Ave, Marietta, GA',       'green',  36),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Riverside Condos',    '900 River Rd, Smyrna, GA',          'amber',  60),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'Pinecrest Heights',   '2200 Pinecrest Dr, Kennesaw, GA',   'purple', 24),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Lakeview Terrace',    '770 Lake Shore Dr, Acworth, GA',    'teal',   42),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Elm Park Commons',    '135 Elm St, Woodstock, GA',         'red',    30);

insert into team_members (property_id, department, name, initials, email) values
  ('a1b2c3d4-0001-0001-0001-000000000001','PM','Jordan Lee','JL','jordan.lee@company.com'),
  ('a1b2c3d4-0001-0001-0001-000000000001','DC','Marcus B.','MB','marcus.b@company.com'),
  ('a1b2c3d4-0001-0001-0001-000000000001','OPS','Priya K.','PK','priya.k@company.com'),
  ('a1b2c3d4-0002-0002-0002-000000000002','PM','Sofia R.','SR','sofia.r@company.com'),
  ('a1b2c3d4-0002-0002-0002-000000000002','DC','Chris T.','CT','chris.t@company.com'),
  ('a1b2c3d4-0002-0002-0002-000000000002','OPS','Amy W.','AW','amy.w@company.com'),
  ('a1b2c3d4-0003-0003-0003-000000000003','PM','Derek N.','DN','derek.n@company.com'),
  ('a1b2c3d4-0003-0003-0003-000000000003','DC','Layla M.','LM','layla.m@company.com'),
  ('a1b2c3d4-0003-0003-0003-000000000003','OPS','Tom H.','TH','tom.h@company.com'),
  ('a1b2c3d4-0004-0004-0004-000000000004','PM','Nina C.','NC','nina.c@company.com'),
  ('a1b2c3d4-0004-0004-0004-000000000004','DC','Reed J.','RJ','reed.j@company.com'),
  ('a1b2c3d4-0004-0004-0004-000000000004','OPS','Bex O.','BO','bex.o@company.com'),
  ('a1b2c3d4-0005-0005-0005-000000000005','PM','Aiden F.','AF','aiden.f@company.com'),
  ('a1b2c3d4-0005-0005-0005-000000000005','DC','Mia S.','MS','mia.s@company.com'),
  ('a1b2c3d4-0005-0005-0005-000000000005','OPS','Leo P.','LP','leo.p@company.com'),
  ('a1b2c3d4-0006-0006-0006-000000000006','PM','Chloe R.','CR','chloe.r@company.com'),
  ('a1b2c3d4-0006-0006-0006-000000000006','DC','Sam D.','SD','sam.d@company.com'),
  ('a1b2c3d4-0006-0006-0006-000000000006','OPS','Zoe K.','ZK','zoe.k@company.com');

insert into tasks (property_id, name, department, unit_area, status, due_date, assignee_initials) values
  ('a1b2c3d4-0001-0001-0001-000000000001','Finalize roofing contract','DC','Bldg A',1,'2025-06-10','MB'),
  ('a1b2c3d4-0001-0001-0001-000000000001','HVAC quarterly inspection','OPS','All',0,'2025-06-20','PK'),
  ('a1b2c3d4-0001-0001-0001-000000000001','Tenant move-in orientation','PM','4B',2,'2025-05-28','JL'),
  ('a1b2c3d4-0002-0002-0002-000000000002','Pool deck waterproofing','DC','Pool',3,'2025-05-15','CT'),
  ('a1b2c3d4-0002-0002-0002-000000000002','Lease renewal follow-ups','PM','Units 10-18',1,'2025-06-01','SR'),
  ('a1b2c3d4-0003-0003-0003-000000000003','Foundation inspection Phase 2','DC','Bldg B',1,'2025-07-05','LM'),
  ('a1b2c3d4-0003-0003-0003-000000000003','Balcony safety audit','OPS','3rd Floor',2,'2025-05-25','TH'),
  ('a1b2c3d4-0004-0004-0004-000000000004','Gym equipment install','DC','Amenity',0,'2025-06-30','RJ'),
  ('a1b2c3d4-0004-0004-0004-000000000004','Security system go-live','OPS','All',0,'2025-07-15','BO'),
  ('a1b2c3d4-0005-0005-0005-000000000005','Dock structural review','DC','Dock A',3,'2025-05-01','MS'),
  ('a1b2c3d4-0005-0005-0005-000000000005','Fire alarm testing','OPS','All',1,'2025-06-12','LP'),
  ('a1b2c3d4-0006-0006-0006-000000000006','Window replacement – Unit 7','DC','7A',3,'2025-05-10','SD'),
  ('a1b2c3d4-0006-0006-0006-000000000006','Hallway repaint – Level 2','DC','Level 2',1,'2025-06-18','SD'),
  ('a1b2c3d4-0006-0006-0006-000000000006','Lobby signage update','PM','Lobby',0,'2025-07-01','CR');

insert into budget_items (property_id, name, budgeted, spent) values
  ('a1b2c3d4-0001-0001-0001-000000000001','Roof Replacement',90000,87000),
  ('a1b2c3d4-0001-0001-0001-000000000001','HVAC Upgrade',60000,48000),
  ('a1b2c3d4-0001-0001-0001-000000000001','Lobby Renovation',80000,32000),
  ('a1b2c3d4-0001-0001-0001-000000000001','Parking Reseal',50000,28000),
  ('a1b2c3d4-0002-0002-0002-000000000002','Pool Deck',45000,45000),
  ('a1b2c3d4-0002-0002-0002-000000000002','Exterior Paint',60000,55000),
  ('a1b2c3d4-0002-0002-0002-000000000002','Plumbing Fix',40000,30000),
  ('a1b2c3d4-0002-0002-0002-000000000002','Landscaping',35000,10000),
  ('a1b2c3d4-0003-0003-0003-000000000003','Foundation Repair',120000,85000),
  ('a1b2c3d4-0003-0003-0003-000000000003','Balcony Rebuild',80000,72000),
  ('a1b2c3d4-0003-0003-0003-000000000003','Elevator Mod',70000,22000),
  ('a1b2c3d4-0003-0003-0003-000000000003','Common Area',50000,11000),
  ('a1b2c3d4-0004-0004-0004-000000000004','Unit Remodel',60000,40000),
  ('a1b2c3d4-0004-0004-0004-000000000004','Gym Equipment',30000,20000),
  ('a1b2c3d4-0004-0004-0004-000000000004','Security System',30000,0),
  ('a1b2c3d4-0004-0004-0004-000000000004','Lighting',20000,0),
  ('a1b2c3d4-0005-0005-0005-000000000005','Dock Repair',55000,55000),
  ('a1b2c3d4-0005-0005-0005-000000000005','HVAC Replace',70000,68000),
  ('a1b2c3d4-0005-0005-0005-000000000005','Paint & Seal',50000,42000),
  ('a1b2c3d4-0005-0005-0005-000000000005','Fire Safety',35000,10000),
  ('a1b2c3d4-0006-0006-0006-000000000006','Roof Patch',40000,40000),
  ('a1b2c3d4-0006-0006-0006-000000000006','Window Replace',60000,57000),
  ('a1b2c3d4-0006-0006-0006-000000000006','Hallway Reno',40000,35000),
  ('a1b2c3d4-0006-0006-0006-000000000006','Signage',20000,13000);

insert into announcements (property_id, title, body, icon) values
  ('a1b2c3d4-0001-0001-0001-000000000001','Roofing crew starts Monday','Bauer & Sons will begin work on Building A. Expect noise 7am–5pm weekdays. Tenant notice sent.','🏗️'),
  ('a1b2c3d4-0003-0003-0003-000000000003','Balcony use restricted – 3rd Floor','OPS has flagged structural concerns on the east balconies pending contractor review. Residents notified.','⚠️'),
  ('a1b2c3d4-0005-0005-0005-000000000005','Dock A repairs complete','All work passed final inspection. Dock reopened to residents as of May 1st.','✅'),
  ('a1b2c3d4-0002-0002-0002-000000000002','Lease renewal campaign underway','PM team sending renewal offers to 8 expiring leases. Target: 90% retention by June 15.','💬');

insert into milestones (property_id, name, percent, due_date, status) values
  ('a1b2c3d4-0001-0001-0001-000000000001','Roof Replacement Project',72,'2025-08-01',1),
  ('a1b2c3d4-0003-0003-0003-000000000003','Foundation Repair Phase 1',68,'2025-09-01',1),
  ('a1b2c3d4-0005-0005-0005-000000000005','Full HVAC Replacement',94,'2025-05-31',3),
  ('a1b2c3d4-0004-0004-0004-000000000004','Unit Remodel Phase 1',38,'2025-10-01',0),
  ('a1b2c3d4-0002-0002-0002-000000000002','Pool & Exterior Refresh',85,'2025-06-15',3),
  ('a1b2c3d4-0006-0006-0006-000000000006','Window & Hallway Reno',88,'2025-07-01',3);
