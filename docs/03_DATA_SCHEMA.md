# 03_DATA_SCHEMA.md - データベース定義書 (PostgreSQL DDL)

## 1. DDL スクリプト (全テーブル定義)

```sql
-- 1. users (ユーザー基本情報)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  login_id TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'secretariat', 'sysadmin')),
  name TEXT NOT NULL,
  mfa_enabled BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. line_user_mappings (LINE連携データ)
CREATE TABLE line_user_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. courses (コース基本情報)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  min_capacity INTEGER NOT NULL,
  training_period TEXT NOT NULL,
  start_month TEXT NOT NULL,
  training_start_date DATE NOT NULL,
  training_end_date DATE NOT NULL,
  price_incl_tax INTEGER DEFAULT 0,
  target_job_types TEXT,
  student_requirements TEXT,
  training_goals TEXT,
  necessity_and_reason TEXT,
  expected_effects_and_results TEXT,
  total_periods INTEGER,
  period_duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. course_revisions (変更履歴・バージョン管理)
CREATE TABLE course_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  changed_by UUID REFERENCES users(id),
  snapshot_data JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. course_evidences (エビデンス情報・※1自動注記)
CREATE TABLE course_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  target_field TEXT NOT NULL,
  number_index INTEGER NOT NULL,
  claim_text TEXT NOT NULL,
  source_name TEXT NOT NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('file', 'url')),
  file_url TEXT,
  reference_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. daily_curriculums (日別訓練カリキュラム)
CREATE TABLE daily_curriculums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('at_home', 'schooling')),
  subject_name TEXT NOT NULL,
  training_hours NUMERIC(4, 1) NOT NULL,
  method TEXT CHECK (method IN ('face_to_face', 'online')),
  class_type TEXT CHECK (class_type IN ('group', 'individual')),
  start_time TIME,
  end_time TIME,
  is_test_day BOOLEAN DEFAULT false,
  is_career_consulting BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. attendance_requests (公的出席・遅刻欠席承認ワークフロー)
CREATE TABLE attendance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  daily_curriculum_id UUID REFERENCES daily_curriculums(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('absence', 'late', 'early_leave')),
  reason TEXT NOT NULL,
  proof_document_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. attendance_rates (出席率80%リアルタイム判定)
CREATE TABLE attendance_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  current_month_rate NUMERIC(5, 2) NOT NULL,
  total_rate NUMERIC(5, 2) NOT NULL,
  alert_level TEXT DEFAULT 'normal' CHECK (alert_level IN ('normal', 'warning_85', 'risk_80')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. learning_alerts (学習停滞・離脱防止アラート)
CREATE TABLE learning_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('inactive_days', 'quiz_stuck', 'behind_schedule', 'attendance_risk')),
  details TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. job_applications (就職活動状況トラッキング)
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT,
  selection_stage TEXT NOT NULL CHECK (selection_stage IN ('document', 'interview_1', 'interview_final', 'offered', 'rejected', 'declined')),
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. payments (Stripeオンライン決済履歴)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  stripe_payment_intent_id TEXT NOT NULL,
  amount_incl_tax INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. course_surveys & survey_responses (アンケート機能)
CREATE TABLE course_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES course_surveys(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 13. course_career_support_details (就職支援体制)
CREATE TABLE course_career_support_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
  manager_name TEXT NOT NULL,
  career_consultant_name TEXT NOT NULL,
  other_staff_names TEXT,
  support_during_training TEXT NOT NULL,
  support_after_training TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 14. course_subjects & 15. course_materials & 16. material_orders (科目・教材・発注)
CREATE TABLE course_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('lecture', 'practical')),
  description TEXT,
  hours NUMERIC(5, 1) NOT NULL,
  order_index INTEGER NOT NULL
);

CREATE TABLE course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES course_subjects(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  price_incl_tax INTEGER NOT NULL,
  vendor_name TEXT NOT NULL,
  vendor_contact_method TEXT NOT NULL,
  vendor_contact_person TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE material_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  material_id UUID REFERENCES course_materials(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_amount_incl_tax INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'delivered', 'canceled')),
  ordered_at TIMESTAMP WITH TIME ZONE,
  ordered_by UUID REFERENCES users(id)
);

-- 17. target_qualifications & 18. qualification_applications (目標資格・検定申込・結果)
CREATE TABLE target_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  qualification_name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  exam_fee_incl_tax INTEGER NOT NULL,
  application_destination TEXT NOT NULL,
  application_method TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  is_cbt_anytime BOOLEAN DEFAULT false,
  exam_date DATE,
  application_form_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE qualification_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_id UUID REFERENCES target_qualifications(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  application_status TEXT DEFAULT 'applied' CHECK (application_status IN ('applied', 'approved', 'canceled')),
  submitted_file_url TEXT,
  result_status TEXT DEFAULT 'pending' CHECK (result_status IN ('pending', 'passed', 'failed', 'absent')),
  score INTEGER,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 19. day_modules & 20. learning_sets & 21. set_quizzes & 22. set_exercises & 23. set_progress & 24. submission_ai_evaluations
CREATE TABLE day_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  daily_curriculum_id UUID REFERENCES daily_curriculums(id),
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL
);

CREATE TABLE learning_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_module_id UUID REFERENCES day_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  transcript_text TEXT
);

CREATE TABLE set_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_set_id UUID REFERENCES learning_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL
);

CREATE TABLE set_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_set_id UUID REFERENCES learning_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  rubric_criteria TEXT,
  hint_text TEXT,
  solution_video_url TEXT,
  sample_answer TEXT
);

CREATE TABLE set_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  learning_set_id UUID REFERENCES learning_sets(id) ON DELETE CASCADE,
  video_watched BOOLEAN DEFAULT false,
  quiz_score INTEGER DEFAULT 0,
  quiz_passed BOOLEAN DEFAULT false,
  exercise_completed BOOLEAN DEFAULT false,
  submitted_answer TEXT,
  total_time_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE submission_ai_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID REFERENCES set_progress(id) ON DELETE CASCADE,
  ai_suggested_score INTEGER NOT NULL,
  ai_suggested_feedback TEXT NOT NULL,
  final_score INTEGER,
  final_feedback TEXT,
  status TEXT DEFAULT 'ai_evaluated' CHECK (status IN ('ai_evaluated', 'instructor_approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
