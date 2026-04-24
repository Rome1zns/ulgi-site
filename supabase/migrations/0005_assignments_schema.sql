-- ASSIGNMENTS / TESTS MODULE SCHEMA

create type assignment_category as enum (
  'testing',
  'ubt_preparation',
  'homework',
  'olympiad',
  'control_work',
  'quarter_tasks'
);

create type assignment_status as enum ('draft', 'published', 'archived');

create type assignment_submission_status as enum (
  'submitted',
  'auto_checked',
  'reviewed'
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (
    char_length(trim(title)) > 0
    and char_length(title) <= 150
  ),
  description text check (
    description is null
    or char_length(description) <= 5000
  ),
  category assignment_category not null,
  target_class_name text not null check (
    target_class_name in (
      '1A', '1Б', '1В',
      '2A', '2Б', '2В',
      '3A', '3Б', '3В',
      '4A', '4Б', '4В',
      '5A', '5Б', '5В',
      '6A', '6Б', '6В',
      '7A', '7Б', '7В',
      '8A', '8Б', '8В',
      '9A', '9Б', '9В',
      '10A', '10Б', '10В',
      '11A', '11Б', '11В'
    )
  ),
  status assignment_status default 'draft' not null,
  created_by uuid references public.profiles(id) on delete restrict not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index assignments_status_idx
  on public.assignments(status, created_at desc);

create index assignments_target_class_status_idx
  on public.assignments(target_class_name, status, created_at desc);

create trigger assignments_set_updated_at_trigger
  before update on public.assignments
  for each row execute function public.set_updated_at();

create table public.assignment_questions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  question_text text not null check (
    char_length(trim(question_text)) > 0
    and char_length(question_text) <= 2000
  ),
  order_index integer default 0 not null check (order_index >= 0),
  created_at timestamptz default now() not null,
  unique (assignment_id, order_index)
);

create index assignment_questions_assignment_idx
  on public.assignment_questions(assignment_id, order_index asc);

create table public.assignment_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.assignment_questions(id) on delete cascade not null,
  label text not null check (label in ('A', 'B', 'C', 'D')),
  option_text text not null check (
    char_length(trim(option_text)) > 0
    and char_length(option_text) <= 1000
  ),
  order_index integer default 0 not null check (order_index >= 0),
  created_at timestamptz default now() not null,
  unique (question_id, label),
  unique (question_id, order_index),
  unique (id, question_id)
);

create index assignment_options_question_idx
  on public.assignment_options(question_id, order_index asc);

create table public.assignment_answer_keys (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.assignment_questions(id) on delete cascade not null,
  correct_option_id uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (question_id),
  constraint assignment_answer_keys_correct_option_fk
    foreign key (correct_option_id, question_id)
    references public.assignment_options(id, question_id)
    on delete cascade
);

create trigger assignment_answer_keys_set_updated_at_trigger
  before update on public.assignment_answer_keys
  for each row execute function public.set_updated_at();

create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  status assignment_submission_status default 'submitted' not null,
  total_questions integer default 0 not null check (total_questions >= 0),
  auto_score integer default 0 not null check (auto_score >= 0),
  final_score integer check (
    final_score is null or final_score >= 0
  ),
  admin_feedback text check (
    admin_feedback is null
    or char_length(admin_feedback) <= 1000
  ),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (assignment_id, student_id),
  check (auto_score <= total_questions),
  check (final_score is null or final_score <= total_questions)
);

create index assignment_submissions_assignment_idx
  on public.assignment_submissions(assignment_id, created_at desc);

create index assignment_submissions_student_idx
  on public.assignment_submissions(student_id, created_at desc);

create trigger assignment_submissions_set_updated_at_trigger
  before update on public.assignment_submissions
  for each row execute function public.set_updated_at();

create table public.assignment_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.assignment_submissions(id) on delete cascade not null,
  question_id uuid references public.assignment_questions(id) on delete cascade not null,
  selected_option_id uuid not null,
  is_correct boolean default false not null,
  created_at timestamptz default now() not null,
  unique (submission_id, question_id),
  constraint assignment_answers_selected_option_fk
    foreign key (selected_option_id, question_id)
    references public.assignment_options(id, question_id)
    on delete restrict
);

create index assignment_answers_submission_idx
  on public.assignment_answers(submission_id);

create index assignment_answers_question_idx
  on public.assignment_answers(question_id);
