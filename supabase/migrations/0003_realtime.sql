-- Enable Realtime on tables that need live subscriptions.
-- Clients subscribe via supabase.channel(...).on("postgres_changes", ...)
-- RLS is still enforced — users only receive events they're allowed to SELECT.

alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.ai_messages;

-- Verify with:
--   select schemaname, tablename from pg_publication_tables where pubname = 'supabase_realtime';
