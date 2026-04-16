-- RLS policies

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.announcements enable row level security;
alter table public.follows enable row level security;
alter table public.ai_chats enable row level security;
alter table public.ai_messages enable row level security;

-- Profiles
create policy "profiles_select_authenticated" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update to authenticated using (is_admin());
create policy "profiles_delete_admin" on public.profiles for delete to authenticated using (is_admin());

-- Posts
create policy "posts_select" on public.posts for select to authenticated using (
  moderation_status = 'approved' or author_id = auth.uid() or is_admin()
);
create policy "posts_insert" on public.posts for insert to authenticated with check (
  author_id = auth.uid() and is_not_banned()
);
create policy "posts_update" on public.posts for update to authenticated using (author_id = auth.uid() or is_admin());
create policy "posts_delete" on public.posts for delete to authenticated using (author_id = auth.uid() or is_admin());

-- Comments
create policy "comments_select" on public.comments for select to authenticated using (true);
create policy "comments_insert" on public.comments for insert to authenticated with check (author_id = auth.uid() and is_not_banned());
create policy "comments_delete" on public.comments for delete to authenticated using (author_id = auth.uid() or is_admin());

-- Likes
create policy "likes_select" on public.likes for select to authenticated using (true);
create policy "likes_insert" on public.likes for insert to authenticated with check (user_id = auth.uid());
create policy "likes_delete" on public.likes for delete to authenticated using (user_id = auth.uid());

-- Announcements
create policy "announcements_select" on public.announcements for select to authenticated using (true);
create policy "announcements_insert" on public.announcements for insert to authenticated with check (is_admin());
create policy "announcements_update" on public.announcements for update to authenticated using (is_admin());
create policy "announcements_delete" on public.announcements for delete to authenticated using (is_admin());

-- Follows
create policy "follows_select" on public.follows for select to authenticated using (true);
create policy "follows_insert" on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy "follows_delete" on public.follows for delete to authenticated using (follower_id = auth.uid());

-- AI Chats
create policy "ai_chats_select_own" on public.ai_chats for select to authenticated using (user_id = auth.uid());
create policy "ai_chats_insert_own" on public.ai_chats for insert to authenticated with check (user_id = auth.uid());
create policy "ai_chats_update_own" on public.ai_chats for update to authenticated using (user_id = auth.uid());
create policy "ai_chats_delete_own" on public.ai_chats for delete to authenticated using (user_id = auth.uid());

-- AI Messages
create policy "ai_messages_select" on public.ai_messages for select to authenticated using (
  exists (select 1 from public.ai_chats where id = chat_id and user_id = auth.uid())
);
create policy "ai_messages_insert" on public.ai_messages for insert to authenticated with check (
  exists (select 1 from public.ai_chats where id = chat_id and user_id = auth.uid())
);
