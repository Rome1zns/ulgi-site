-- Idempotent. Все поля уже созданы в 0001_initial_schema.sql,
-- этот файл — формальный noop для случаев восстановления из частичной БД.

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='announcements' and column_name='media_url') then
    alter table public.announcements add column media_url text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='announcements' and column_name='media_type') then
    alter table public.announcements add column media_type media_type;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='announcements' and column_name='media_public_id') then
    alter table public.announcements add column media_public_id text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='announcements' and column_name='event_date') then
    alter table public.announcements add column event_date date;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='announcements' and column_name='event_time') then
    alter table public.announcements add column event_time time;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='announcements' and column_name='event_location') then
    alter table public.announcements add column event_location text;
  end if;
end $$;
