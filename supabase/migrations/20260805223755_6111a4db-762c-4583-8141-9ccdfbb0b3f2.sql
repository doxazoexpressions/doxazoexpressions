create table if not exists public.journal_audio_entries (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references public.journal_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  duration_seconds integer not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

grant select, insert, delete on public.journal_audio_entries to authenticated;
grant all on public.journal_audio_entries to service_role;

create index if not exists journal_audio_entries_user_idx
  on public.journal_audio_entries (user_id);
create index if not exists journal_audio_entries_entry_idx
  on public.journal_audio_entries (journal_entry_id);

alter table public.journal_audio_entries enable row level security;

create policy "Users select own audio" on public.journal_audio_entries
  for select to authenticated using (auth.uid() = user_id);

create policy "Users insert own audio" on public.journal_audio_entries
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users delete own audio" on public.journal_audio_entries
  for delete to authenticated using (auth.uid() = user_id);

create policy "Users read own audio objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'audio-journal' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users write own audio objects" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'audio-journal' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete own audio objects" on storage.objects
  for delete to authenticated
  using (bucket_id = 'audio-journal' and (storage.foldername(name))[1] = auth.uid()::text);