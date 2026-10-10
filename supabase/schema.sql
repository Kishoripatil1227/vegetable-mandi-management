-- Roles
create type user_role as enum ('admin', 'staff', 'customer');

-- Profiles (linked to Supabase auth users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'staff',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Farmers
create table farmers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  village text,
  bank_account text,
  status text not null default 'active',
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Buyers
create table buyers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vegetables
create table vegetables (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unit text not null default 'kg'
);

-- Produce lots
create table produce_lots (
  id uuid primary key default gen_random_uuid(),
  lot_no text unique not null,
  farmer_id uuid not null references farmers(id),
  vegetable_id uuid not null references vegetables(id),
  quantity numeric(10,2) not null check (quantity > 0),
  lot_date date not null default current_date,
  status text not null default 'received'
    check (status in ('received','weighed','auctioned','settled','cancelled')),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Weighments
create table weighments (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null unique references produce_lots(id),
  gross_weight numeric(10,2) not null check (gross_weight > 0),
  tare_weight numeric(10,2) not null default 0 check (tare_weight >= 0),
  net_weight numeric(10,2) generated always as (gross_weight - tare_weight) stored,
  weighed_by uuid references profiles(id),
  created_at timestamptz default now(),
  check (gross_weight > tare_weight)
);

-- Auctions
create table auctions (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null unique references produce_lots(id),
  buyer_id uuid not null references buyers(id),
  rate_per_kg numeric(10,2) not null check (rate_per_kg > 0),
  total_amount numeric(12,2) not null,
  auction_date date not null default current_date,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Commissions
create table commissions (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null unique references auctions(id),
  percent numeric(5,2) not null check (percent >= 0 and percent <= 100),
  commission_amount numeric(12,2) not null,
  created_at timestamptz default now()
);

-- Settlements
create table settlements (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null unique references produce_lots(id),
  farmer_id uuid not null references farmers(id),
  gross_amount numeric(12,2) not null,
  commission_amount numeric(12,2) not null,
  net_payable numeric(12,2) not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','cancelled')),
  paid_date date,
  finalized_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Audit logs
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,
  table_name text,
  record_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

-- Indexes for search
create index idx_farmers_name on farmers(name);
create index idx_lots_farmer on produce_lots(farmer_id);
create index idx_lots_date on produce_lots(lot_date);
create index idx_lots_status on produce_lots(status);
create index idx_settlements_status on settlements(payment_status);
create index idx_auctions_date on auctions(auction_date);

-- Auto-create profile when a user signs up
create function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'staff');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Sample vegetables
insert into vegetables (name) values
  ('Tomato'), ('Potato'), ('Onion'), ('Brinjal'), ('Cabbage'), ('Cauliflower');