-- ASSIGNMENTS / TESTS MODULE RLS

alter table public.assignments enable row level security;
alter table public.assignment_questions enable row level security;
alter table public.assignment_options enable row level security;
alter table public.assignment_answer_keys enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.assignment_answers enable row level security;

-- Assignments
create policy "assignments_select_authenticated"
  on public.assignments
  for select
  to authenticated
  using (status = 'published' or is_admin());

create policy "assignments_insert_admin"
  on public.assignments
  for insert
  to authenticated
  with check (is_admin() and created_by = auth.uid());

create policy "assignments_update_admin"
  on public.assignments
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "assignments_delete_admin"
  on public.assignments
  for delete
  to authenticated
  using (is_admin());

-- Assignment questions
create policy "assignment_questions_select_authenticated"
  on public.assignment_questions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.assignments
      where assignments.id = assignment_id
        and (assignments.status = 'published' or is_admin())
    )
  );

create policy "assignment_questions_insert_admin"
  on public.assignment_questions
  for insert
  to authenticated
  with check (
    is_admin()
    and exists (
      select 1 from public.assignments
      where assignments.id = assignment_id
    )
  );

create policy "assignment_questions_update_admin"
  on public.assignment_questions
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "assignment_questions_delete_admin"
  on public.assignment_questions
  for delete
  to authenticated
  using (is_admin());

-- Assignment options
create policy "assignment_options_select_authenticated"
  on public.assignment_options
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.assignment_questions
      join public.assignments
        on assignments.id = assignment_questions.assignment_id
      where assignment_questions.id = question_id
        and (assignments.status = 'published' or is_admin())
    )
  );

create policy "assignment_options_insert_admin"
  on public.assignment_options
  for insert
  to authenticated
  with check (
    is_admin()
    and exists (
      select 1 from public.assignment_questions
      where assignment_questions.id = question_id
    )
  );

create policy "assignment_options_update_admin"
  on public.assignment_options
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "assignment_options_delete_admin"
  on public.assignment_options
  for delete
  to authenticated
  using (is_admin());

-- Assignment answer keys
create policy "assignment_answer_keys_select_admin"
  on public.assignment_answer_keys
  for select
  to authenticated
  using (is_admin());

create policy "assignment_answer_keys_insert_admin"
  on public.assignment_answer_keys
  for insert
  to authenticated
  with check (is_admin());

create policy "assignment_answer_keys_update_admin"
  on public.assignment_answer_keys
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "assignment_answer_keys_delete_admin"
  on public.assignment_answer_keys
  for delete
  to authenticated
  using (is_admin());

-- Assignment submissions
create policy "assignment_submissions_select_own_or_admin"
  on public.assignment_submissions
  for select
  to authenticated
  using (student_id = auth.uid() or is_admin());

-- Assignment answers
create policy "assignment_answers_select_own_or_admin"
  on public.assignment_answers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.assignment_submissions
      where assignment_submissions.id = submission_id
        and (
          assignment_submissions.student_id = auth.uid()
          or is_admin()
        )
    )
  );
