-- ============================================================
-- MapDocs — Supabase / PostgreSQL schema
-- Chay file nay trong Supabase SQL Editor truoc khi seed du lieu.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- DROP (chay lai duoc nhieu lan) ----------
drop view  if exists category_stats cascade;
drop table if exists downloads     cascade;
drop table if exists favorites     cascade;
drop table if exists reports       cascade;
drop table if exists notifications cascade;
drop table if exists blogs         cascade;
drop table if exists transactions  cascade;
drop table if exists reviews       cascade;
drop table if exists orders        cascade;
drop table if exists documents     cascade;
drop table if exists categories    cascade;
drop table if exists users         cascade;
drop table if exists settings      cascade;

-- ============================================================
-- 1. USERS
-- ============================================================
create table users (
  id            text primary key,
  email         text not null unique,
  password      text,
  name          text not null,
  avatar        text,
  role          text not null default 'user' check (role in ('user','seller','admin')),
  balance       bigint not null default 0 check (balance >= 0),
  total_earning bigint not null default 0,
  phone         text,
  bio           text,
  school        text,
  provider      text default 'local' check (provider in ('local','google')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_users_email  on users(email);
create index idx_users_role   on users(role);
create index idx_users_active on users(is_active);

-- ============================================================
-- 2. CATEGORIES (mon hoc)
-- ============================================================
create table categories (
  id          text primary key,
  name        text not null,
  slug        text not null unique,
  icon        text,
  color       text,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index idx_categories_slug on categories(slug);
create index idx_categories_sort on categories(sort_order);

-- ============================================================
-- 3. DOCUMENTS (tai lieu)
-- ============================================================
create table documents (
  id             text primary key,
  title          text not null,
  slug           text not null unique,
  description    text,
  content        text,
  category_id    text references categories(id) on delete set null,
  category_name  text,
  grade          int check (grade between 1 and 12),
  price          bigint not null default 0 check (price >= 0),
  is_free        boolean not null default false,
  thumbnail      text,
  file_url       text,
  file_type      text,
  file_size      bigint default 0,
  pages          int default 0,
  seller_id      text references users(id) on delete set null,
  seller_name    text,
  status         text not null default 'pending' check (status in ('pending','approved','rejected')),
  reject_reason  text,
  views          int not null default 0,
  downloads      int not null default 0,
  sold           int not null default 0,
  rating         numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  rating_count   int not null default 0,
  tags           text[] default '{}',
  is_featured    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_documents_slug     on documents(slug);
create index idx_documents_category on documents(category_id);
create index idx_documents_seller   on documents(seller_id);
create index idx_documents_status   on documents(status);
create index idx_documents_grade    on documents(grade);
create index idx_documents_free     on documents(is_free);
create index idx_documents_featured on documents(is_featured);
create index idx_documents_created  on documents(created_at desc);
create index idx_documents_sold     on documents(sold desc);
create index idx_documents_rating   on documents(rating desc);
create index idx_documents_tags     on documents using gin(tags);

-- ============================================================
-- 4. ORDERS (don hang)
-- ============================================================
create table orders (
  id             text primary key,
  code           text not null unique,
  buyer_id       text references users(id) on delete set null,
  buyer_name     text,
  document_id    text references documents(id) on delete set null,
  document_title text,
  document_slug  text,
  seller_id      text references users(id) on delete set null,
  amount         bigint not null default 0 check (amount >= 0),
  commission     bigint not null default 0,
  seller_amount  bigint not null default 0,
  payment_method text not null default 'wallet' check (payment_method in ('wallet','vnpay','momo','stripe')),
  status         text not null default 'pending' check (status in ('pending','paid','cancelled','refunded')),
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);
create index idx_orders_code     on orders(code);
create index idx_orders_buyer    on orders(buyer_id);
create index idx_orders_seller   on orders(seller_id);
create index idx_orders_document on orders(document_id);
create index idx_orders_status   on orders(status);
create index idx_orders_created  on orders(created_at desc);

-- ============================================================
-- 5. REVIEWS (danh gia)
-- ============================================================
create table reviews (
  id          text primary key,
  document_id text references documents(id) on delete cascade,
  user_id     text references users(id) on delete cascade,
  user_name   text,
  user_avatar text,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);
create index idx_reviews_document on reviews(document_id);
create index idx_reviews_user     on reviews(user_id);
create index idx_reviews_created  on reviews(created_at desc);

-- ============================================================
-- 6. TRANSACTIONS (vi dien tu)
-- ============================================================
create table transactions (
  id          text primary key,
  user_id     text references users(id) on delete cascade,
  type        text not null check (type in ('topup','withdraw','purchase','earning','refund')),
  amount      bigint not null,
  balance_after bigint default 0,
  method      text,
  description text,
  ref_code    text,
  status      text not null default 'pending' check (status in ('pending','completed','rejected','cancelled')),
  admin_note  text,
  created_at  timestamptz not null default now()
);
create index idx_transactions_user    on transactions(user_id);
create index idx_transactions_type    on transactions(type);
create index idx_transactions_status  on transactions(status);
create index idx_transactions_created on transactions(created_at desc);

-- ============================================================
-- 7. BLOGS (tin tuc)
-- ============================================================
create table blogs (
  id           text primary key,
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text,
  thumbnail    text,
  author_id    text references users(id) on delete set null,
  author_name  text,
  tags         text[] default '{}',
  views        int not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_blogs_slug      on blogs(slug);
create index idx_blogs_published on blogs(published);
create index idx_blogs_created   on blogs(created_at desc);
create index idx_blogs_tags      on blogs using gin(tags);

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
create table notifications (
  id         text primary key,
  user_id    text references users(id) on delete cascade,
  title      text not null,
  message    text,
  type       text default 'info' check (type in ('info','success','warning','error')),
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user    on notifications(user_id);
create index idx_notifications_read    on notifications(is_read);
create index idx_notifications_created on notifications(created_at desc);

-- ============================================================
-- 9. REPORTS (khieu nai)
-- ============================================================
create table reports (
  id             text primary key,
  document_id    text references documents(id) on delete cascade,
  document_title text,
  user_id        text references users(id) on delete set null,
  user_name      text,
  reason         text not null,
  detail         text,
  status         text not null default 'open' check (status in ('open','resolved','rejected','dismissed')),
  admin_note     text,
  resolved_at    timestamptz,
  created_at     timestamptz not null default now()
);
create index idx_reports_document on reports(document_id);
create index idx_reports_status   on reports(status);
create index idx_reports_created  on reports(created_at desc);

-- ============================================================
-- 10. FAVORITES
-- ============================================================
create table favorites (
  id          text primary key,
  user_id     text references users(id) on delete cascade,
  document_id text references documents(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, document_id)
);
create index idx_favorites_user     on favorites(user_id);
create index idx_favorites_document on favorites(document_id);

-- ============================================================
-- 11. DOWNLOADS
-- ============================================================
create table downloads (
  id          text primary key,
  user_id     text references users(id) on delete cascade,
  document_id text references documents(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index idx_downloads_user     on downloads(user_id);
create index idx_downloads_document on downloads(document_id);
create index idx_downloads_created  on downloads(created_at desc);

-- ============================================================
-- 12. SETTINGS (1 dong jsonb duy nhat)
-- ============================================================
create table settings (
  id         int primary key default 1 check (id = 1),
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into settings (id, value) values (1, jsonb_build_object(
  'commission_rate', 0.15,
  'min_withdraw',    200000,
  'min_price',       10000,
  'max_file_mb',     50,
  'hotline',         '1900 6789',
  'email',           'hotro@mapdocs.vn',
  'address',         'Tầng 5, Toà nhà Sông Đà, Phạm Hùng, Nam Từ Liêm, Hà Nội',
  'facebook',        'https://facebook.com/mapdocs'
)) on conflict (id) do nothing;

-- ============================================================
-- TRIGGER: tu dong cap nhat updated_at
-- ============================================================
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_documents_touch before update on documents
  for each row execute function touch_updated_at();
create trigger trg_blogs_touch before update on blogs
  for each row execute function touch_updated_at();
create trigger trg_users_touch before update on users
  for each row execute function touch_updated_at();

-- ============================================================
-- VIEW: thong ke theo mon hoc
-- ============================================================
create or replace view category_stats as
select
  c.id,
  c.name,
  c.slug,
  c.icon,
  c.color,
  count(d.id)                                        as doc_count,
  coalesce(sum(d.sold), 0)                           as total_sold,
  coalesce(round(avg(nullif(d.rating, 0)), 2), 0)    as avg_rating
from categories c
left join documents d on d.category_id = c.id and d.status = 'approved'
group by c.id, c.name, c.slug, c.icon, c.color
order by c.sort_order;

-- ============================================================
-- ROW LEVEL SECURITY
-- Backend dung SERVICE_ROLE_KEY nen bo qua RLS.
-- Cac policy duoi danh cho truy cap tu client (anon key).
-- ============================================================
alter table users         enable row level security;
alter table categories    enable row level security;
alter table documents     enable row level security;
alter table orders        enable row level security;
alter table reviews       enable row level security;
alter table transactions  enable row level security;
alter table blogs         enable row level security;
alter table notifications enable row level security;
alter table reports       enable row level security;
alter table favorites     enable row level security;
alter table downloads     enable row level security;
alter table settings      enable row level security;

-- Public read
create policy p_categories_read on categories for select using (true);
create policy p_documents_read  on documents  for select using (status = 'approved');
create policy p_blogs_read      on blogs      for select using (published = true);
create policy p_reviews_read    on reviews    for select using (true);
create policy p_settings_read   on settings   for select using (true);
create policy p_cat_stats_read  on users      for select using (true);

-- Owner-only
create policy p_orders_own        on orders        for select using (auth.uid()::text = buyer_id);
create policy p_transactions_own  on transactions  for select using (auth.uid()::text = user_id);
create policy p_notifications_own on notifications for select using (auth.uid()::text = user_id);
create policy p_favorites_own     on favorites     for all    using (auth.uid()::text = user_id);
create policy p_downloads_own     on downloads     for select using (auth.uid()::text = user_id);
create policy p_reports_own       on reports       for select using (auth.uid()::text = user_id);
