-- ULGI INITIAL SCHEMA

create type user_role as enum ('student', 'teacher', 'admin');
create type media_type as enum ('none', 'image', 'video');
create type moderation_status as enum ('approved', 'pending', 'rejected');
create type announcement_category as enum ('event', 'sport', 'academic', 'general');
create type ai_role as enum ('user', 'assistant');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique not null,
  username text unique not null check (
    char_length(username) >= 3
    and char_length(username) <= 20
    and username ~ '^[a-z0-9_]+$'
  ),
  full_name text not null,
  class_name text,
  role user_role default 'student' not null,
  avatar_url text,
  bio text check (char_length(bio) <= 200),
  is_banned boolean default false not null,
  followers_count integer default 0 not null,
  following_count integer default 0 not null,
  created_at timestamptz default now() not null
);

create index profiles_username_idx on public.profiles(username);
create index profiles_role_idx on public.profiles(role);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) <= 2000),
  media_urls text[] default '{}' not null,
  media_type media_type default 'none' not null,
  media_public_id text,
  ai_caption text,
  likes_count integer default 0 not null,
  comments_count integer default 0 not null,
  moderation_status moderation_status default 'approved' not null,
  moderation_reason text,
  created_at timestamptz default now() not null
);

create index posts_created_at_idx on public.posts(created_at desc);
create index posts_author_idx on public.posts(author_id, created_at desc);
create index posts_moderation_idx on public.posts(moderation_status, created_at desc);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) <= 500),
  created_at timestamptz default now() not null
);

create index comments_post_idx on public.comments(post_id, created_at asc);
create index comments_author_idx on public.comments(author_id);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(post_id, user_id)
);

create index likes_post_idx on public.likes(post_id);
create index likes_user_idx on public.likes(user_id);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 100),
  content text not null check (char_length(content) <= 2000),
  category announcement_category default 'general' not null,
  author_id uuid references public.profiles(id) on delete set null,
  is_pinned boolean default false not null,
  media_url text,
  media_type media_type,
  media_public_id text,
  event_date date,
  event_time time,
  event_location text,
  created_at timestamptz default now() not null
);

create index announcements_pinned_idx on public.announcements(is_pinned desc, created_at desc);
create index announcements_category_idx on public.announcements(category, created_at desc);

create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

create index follows_following_idx on public.follows(following_id);

create table public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text default 'Жаңа чат' not null,
  created_at timestamptz default now() not null
);

create index ai_chats_user_idx on public.ai_chats(user_id, created_at desc);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.ai_chats(id) on delete cascade not null,
  role ai_role not null,
  content text not null,
  created_at timestamptz default now() not null
);

create index ai_messages_chat_idx on public.ai_messages(chat_id, created_at asc);

-- ТРИГГЕРЫ для счётчиков

create or replace function increment_likes_count()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  return new;
end;
$$;

create trigger likes_insert_trigger
  after insert on public.likes
  for each row execute function increment_likes_count();

create or replace function decrement_likes_count()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

create trigger likes_delete_trigger
  after delete on public.likes
  for each row execute function decrement_likes_count();

create or replace function increment_comments_count()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  return new;
end;
$$;

create trigger comments_insert_trigger
  after insert on public.comments
  for each row execute function increment_comments_count();

create or replace function decrement_comments_count()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

create trigger comments_delete_trigger
  after delete on public.comments
  for each row execute function decrement_comments_count();

create or replace function increment_follow_counts()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles set following_count = following_count + 1 where id = new.follower_id;
  update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
  return new;
end;
$$;

create trigger follows_insert_trigger
  after insert on public.follows
  for each row execute function increment_follow_counts();

create or replace function decrement_follow_counts()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
  update public.profiles set followers_count = greatest(followers_count - 1, 0) where id = old.following_id;
  return old;
end;
$$;

create trigger follows_delete_trigger
  after delete on public.follows
  for each row execute function decrement_follow_counts();

-- АВТОСОЗДАНИЕ профиля при регистрации

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, phone, username, full_name, class_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'phone', new.email),
    'user_' || substr(new.id::text, 1, 8),
    coalesce(new.raw_user_meta_data->>'full_name', 'Новый ученик'),
    new.raw_user_meta_data->>'class_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ХЕЛПЕРЫ

create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function is_not_banned()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_banned = false
  );
$$;
