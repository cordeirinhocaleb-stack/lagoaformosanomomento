-- Add updated_at to audit_logs if it doesn't exist to fix trigger error
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'audit_logs' and column_name = 'updated_at') then
    alter table public.audit_logs add column updated_at timestamptz default now();
  end if;
end $$;
