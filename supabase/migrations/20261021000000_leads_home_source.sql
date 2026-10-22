-- The homepage "book a call" form saves leads with source 'home'.
-- leads.sql only allowed 'contact' and 'book', so widen the check.
alter table public.leads drop constraint if exists leads_source_check;
alter table public.leads add constraint leads_source_check
  check (source in ('contact', 'book', 'home')) not valid;
