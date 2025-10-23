-- Add admin policies for petitions table
-- Allow admins and managers to view all petitions regardless of status

do $$ begin
  -- Add policy for admins to view all petitions
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petitions' and policyname = 'Select all petitions for admins'
  ) then
    create policy "Select all petitions for admins" on public.petitions
      for select
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;

  -- Add policy for admins to update all petitions
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petitions' and policyname = 'Update all petitions for admins'
  ) then
    create policy "Update all petitions for admins" on public.petitions
      for update
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      )
      with check (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;

  -- Add policy for admins to delete all petitions
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petitions' and policyname = 'Delete all petitions for admins'
  ) then
    create policy "Delete all petitions for admins" on public.petitions
      for delete
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;
end $$;

-- Add admin policies for petition_sections table
do $$ begin
  -- Add policy for admins to view all petition sections
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petition_sections' and policyname = 'Select all petition sections for admins'
  ) then
    create policy "Select all petition sections for admins" on public.petition_sections
      for select
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;

  -- Add policy for admins to update all petition sections
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petition_sections' and policyname = 'Update all petition sections for admins'
  ) then
    create policy "Update all petition sections for admins" on public.petition_sections
      for update
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      )
      with check (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;

  -- Add policy for admins to delete all petition sections
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petition_sections' and policyname = 'Delete all petition sections for admins'
  ) then
    create policy "Delete all petition sections for admins" on public.petition_sections
      for delete
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;
end $$;

-- Add admin policies for petition_edits table
do $$ begin
  -- Add policy for admins to view all petition edits
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petition_edits' and policyname = 'Select all petition edits for admins'
  ) then
    create policy "Select all petition edits for admins" on public.petition_edits
      for select
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;

  -- Add policy for admins to update all petition edits
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petition_edits' and policyname = 'Update all petition edits for admins'
  ) then
    create policy "Update all petition edits for admins" on public.petition_edits
      for update
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      )
      with check (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;

  -- Add policy for admins to delete all petition edits
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petition_edits' and policyname = 'Delete all petition edits for admins'
  ) then
    create policy "Delete all petition edits for admins" on public.petition_edits
      for delete
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;
end $$;

-- Add admin policies for petition_edit_sections table
do $$ begin
  -- Add policy for admins to view all petition edit sections
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petition_edit_sections' and policyname = 'Select all petition edit sections for admins'
  ) then
    create policy "Select all petition edit sections for admins" on public.petition_edit_sections
      for select
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;

  -- Add policy for admins to update all petition edit sections
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petition_edit_sections' and policyname = 'Update all petition edit sections for admins'
  ) then
    create policy "Update all petition edit sections for admins" on public.petition_edit_sections
      for update
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      )
      with check (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;

  -- Add policy for admins to delete all petition edit sections
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'petition_edit_sections' and policyname = 'Delete all petition edit sections for admins'
  ) then
    create policy "Delete all petition edit sections for admins" on public.petition_edit_sections
      for delete
      to authenticated
      using (
        exists (
          select 1 from public.roles r
          where r.user_id = auth.uid() 
          and r.role in ('admin', 'manager')
        )
      );
  end if;
end $$;
