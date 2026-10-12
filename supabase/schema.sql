-- ==============================================================================
-- LMS Next: Supabase / PostgreSQL データベース構築 DDL & RLS セキュリティポリシー
-- 準拠仕様: 01_PRD.md ～ 06_PROJECT_GUIDELINES.md
-- 構成: 全24テーブル定義 + インデックス + RLS有効化 + ロール判定関数 + 完全ポリシー定義 + 監査トリガー
-- ==============================================================================

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. テーブル定義 (DDL)
-- ==============================================================================

-- 1. users (ユーザー基本情報: Supabase auth.users と 1:1 連動)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  login_id TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'secretariat', 'sysadmin')),
  name TEXT NOT NULL,
  mfa_enabled BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. line_user_mappings (LINE連携データ)
CREATE TABLE IF NOT EXISTS public.line_user_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. courses (コース基本情報)
CREATE TABLE IF NOT EXISTS public.courses (
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
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. course_revisions (変更履歴・バージョン管理)
CREATE TABLE IF NOT EXISTS public.course_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  snapshot_data JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. course_evidences (エビデンス情報・※1自動注記)
CREATE TABLE IF NOT EXISTS public.course_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.daily_curriculums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.attendance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  daily_curriculum_id UUID REFERENCES public.daily_curriculums(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('absence', 'late', 'early_leave')),
  reason TEXT NOT NULL,
  proof_document_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. attendance_rates (出席率80%リアルタイム判定)
CREATE TABLE IF NOT EXISTS public.attendance_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  current_month_rate NUMERIC(5, 2) NOT NULL,
  total_rate NUMERIC(5, 2) NOT NULL,
  alert_level TEXT DEFAULT 'normal' CHECK (alert_level IN ('normal', 'warning_85', 'risk_80')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id, course_id)
);

-- 9. learning_alerts (学習停滞・離脱防止アラート)
CREATE TABLE IF NOT EXISTS public.learning_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('inactive_days', 'quiz_stuck', 'behind_schedule', 'attendance_risk')),
  details TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. job_applications (就職活動状況トラッキング)
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT,
  selection_stage TEXT NOT NULL CHECK (selection_stage IN ('document', 'interview_1', 'interview_final', 'offered', 'rejected', 'declined')),
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. payments (Stripeオンライン決済履歴)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT NOT NULL,
  amount_incl_tax INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. course_surveys & survey_responses (アンケート機能)
CREATE TABLE IF NOT EXISTS public.course_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.course_surveys(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 13. course_career_support_details (就職支援体制)
CREATE TABLE IF NOT EXISTS public.course_career_support_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID UNIQUE NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  manager_name TEXT NOT NULL,
  career_consultant_name TEXT NOT NULL,
  other_staff_names TEXT,
  support_during_training TEXT NOT NULL,
  support_after_training TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 14. course_subjects & 15. course_materials & 16. material_orders (科目・教材・発注)
CREATE TABLE IF NOT EXISTS public.course_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('lecture', 'practical')),
  description TEXT,
  hours NUMERIC(5, 1) NOT NULL,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.course_subjects(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  price_incl_tax INTEGER NOT NULL,
  vendor_name TEXT NOT NULL,
  vendor_contact_method TEXT NOT NULL,
  vendor_contact_person TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.material_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.course_materials(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_amount_incl_tax INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'delivered', 'canceled')),
  ordered_at TIMESTAMP WITH TIME ZONE,
  ordered_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 17. target_qualifications & 18. qualification_applications (目標資格・検定申込・結果)
CREATE TABLE IF NOT EXISTS public.target_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.qualification_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_id UUID NOT NULL REFERENCES public.target_qualifications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  application_status TEXT DEFAULT 'applied' CHECK (application_status IN ('applied', 'approved', 'canceled')),
  submitted_file_url TEXT,
  result_status TEXT DEFAULT 'pending' CHECK (result_status IN ('pending', 'passed', 'failed', 'absent')),
  score INTEGER,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 19. day_modules & 20. learning_sets & 21. set_quizzes & 22. set_exercises & 23. set_progress & 24. submission_ai_evaluations
CREATE TABLE IF NOT EXISTS public.day_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  daily_curriculum_id UUID REFERENCES public.daily_curriculums(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.learning_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_module_id UUID NOT NULL REFERENCES public.day_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  transcript_text TEXT
);

CREATE TABLE IF NOT EXISTS public.set_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_set_id UUID NOT NULL REFERENCES public.learning_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.set_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_set_id UUID NOT NULL REFERENCES public.learning_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  rubric_criteria TEXT,
  hint_text TEXT,
  solution_video_url TEXT,
  sample_answer TEXT
);

CREATE TABLE IF NOT EXISTS public.set_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  learning_set_id UUID NOT NULL REFERENCES public.learning_sets(id) ON DELETE CASCADE,
  video_watched BOOLEAN DEFAULT false,
  quiz_score INTEGER DEFAULT 0,
  quiz_passed BOOLEAN DEFAULT false,
  exercise_completed BOOLEAN DEFAULT false,
  submitted_answer TEXT,
  total_time_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, learning_set_id)
);

CREATE TABLE IF NOT EXISTS public.submission_ai_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID NOT NULL REFERENCES public.set_progress(id) ON DELETE CASCADE,
  ai_suggested_score INTEGER NOT NULL,
  ai_suggested_feedback TEXT NOT NULL,
  final_score INTEGER,
  final_feedback TEXT,
  status TEXT DEFAULT 'ai_evaluated' CHECK (status IN ('ai_evaluated', 'instructor_approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. パフォーマンス最適化インデックス (Indexes)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_daily_curriculums_course_id ON public.daily_curriculums(course_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_requests_student ON public.attendance_requests(student_id, status);
CREATE INDEX IF NOT EXISTS idx_attendance_rates_lookup ON public.attendance_rates(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_learning_alerts_unresolved ON public.learning_alerts(student_id, is_resolved);
CREATE INDEX IF NOT EXISTS idx_day_modules_course ON public.day_modules(course_id, day_number);
CREATE INDEX IF NOT EXISTS idx_learning_sets_module ON public.learning_sets(day_module_id);
CREATE INDEX IF NOT EXISTS idx_set_progress_user ON public.set_progress(user_id, learning_set_id);
CREATE INDEX IF NOT EXISTS idx_submission_ai_evaluations_progress ON public.submission_ai_evaluations(progress_id);
CREATE INDEX IF NOT EXISTS idx_course_evidences_course ON public.course_evidences(course_id);

-- ==============================================================================
-- 3. Supabase Auth 連動関数 ＆ 権限ヘルパー関数
-- ==============================================================================

-- ログイン中ユーザーのロール判定ヘルパー関数 (SECURITY DEFINER で安全に実行)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_sysadmin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'sysadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_secretariat()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'secretariat'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'instructor'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'student'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_secretariat()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('sysadmin', 'secretariat')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('sysadmin', 'secretariat', 'instructor')
  );
$$;

-- auth.users 作成時に自動的に public.users をプロビジョニングするトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assigned_role TEXT;
  user_name TEXT;
  user_login_id TEXT;
BEGIN
  assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  user_login_id := NEW.raw_user_meta_data->>'login_id';

  INSERT INTO public.users (id, email, login_id, role, name)
  VALUES (NEW.id, NEW.email, user_login_id, assigned_role, user_name)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. 全テーブル Row Level Security (RLS) 有効化
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_career_support_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_ai_evaluations ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. RLS ポリシー定義 (権限マトリックス完全準拠)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 5.1 users テーブルのポリシー
-- ------------------------------------------------------------------------------
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR public.is_staff()
  );

CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT WITH CHECK (
    public.is_admin_or_secretariat() OR auth.uid() = id
  );

CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin_or_secretariat()
  );

CREATE POLICY "users_delete_policy" ON public.users
  FOR DELETE USING (
    public.is_sysadmin()
  );

-- ------------------------------------------------------------------------------
-- 5.2 line_user_mappings テーブルのポリシー
-- ------------------------------------------------------------------------------
CREATE POLICY "line_mappings_select_policy" ON public.line_user_mappings
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin_or_secretariat()
  );

CREATE POLICY "line_mappings_insert_policy" ON public.line_user_mappings
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR public.is_admin_or_secretariat()
  );

CREATE POLICY "line_mappings_update_policy" ON public.line_user_mappings
  FOR UPDATE USING (
    user_id = auth.uid() OR public.is_admin_or_secretariat()
  );

CREATE POLICY "line_mappings_delete_policy" ON public.line_user_mappings
  FOR DELETE USING (
    user_id = auth.uid() OR public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.3 courses テーブルのポリシー
-- ------------------------------------------------------------------------------
CREATE POLICY "courses_select_policy" ON public.courses
  FOR SELECT USING (
    is_deleted = false AND (is_published = true OR public.is_staff())
  );

CREATE POLICY "courses_insert_policy" ON public.courses
  FOR INSERT WITH CHECK (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "courses_update_policy" ON public.courses
  FOR UPDATE USING (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "courses_delete_policy" ON public.courses
  FOR DELETE USING (
    public.is_sysadmin()
  );

-- ------------------------------------------------------------------------------
-- 5.4 course_revisions テーブルのポリシー
-- ------------------------------------------------------------------------------
CREATE POLICY "revisions_select_policy" ON public.course_revisions
  FOR SELECT USING (
    public.is_staff()
  );

CREATE POLICY "revisions_insert_policy" ON public.course_revisions
  FOR INSERT WITH CHECK (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "revisions_delete_policy" ON public.course_revisions
  FOR DELETE USING (
    public.is_sysadmin()
  );

-- ------------------------------------------------------------------------------
-- 5.5 course_evidences テーブルのポリシー (※1自動注記)
-- ------------------------------------------------------------------------------
CREATE POLICY "evidences_select_policy" ON public.course_evidences
  FOR SELECT USING (
    public.is_staff()
  );

CREATE POLICY "evidences_insert_policy" ON public.course_evidences
  FOR INSERT WITH CHECK (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "evidences_update_policy" ON public.course_evidences
  FOR UPDATE USING (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "evidences_delete_policy" ON public.course_evidences
  FOR DELETE USING (
    public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.6 daily_curriculums テーブルのポリシー
-- ------------------------------------------------------------------------------
CREATE POLICY "curriculums_select_policy" ON public.daily_curriculums
  FOR SELECT USING (
    true
  );

CREATE POLICY "curriculums_insert_policy" ON public.daily_curriculums
  FOR INSERT WITH CHECK (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "curriculums_update_policy" ON public.daily_curriculums
  FOR UPDATE USING (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "curriculums_delete_policy" ON public.daily_curriculums
  FOR DELETE USING (
    public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.7 attendance_requests テーブルのポリシー
-- ------------------------------------------------------------------------------
CREATE POLICY "att_req_select_policy" ON public.attendance_requests
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

CREATE POLICY "att_req_insert_policy" ON public.attendance_requests
  FOR INSERT WITH CHECK (
    student_id = auth.uid() OR public.is_admin_or_secretariat()
  );

CREATE POLICY "att_req_update_policy" ON public.attendance_requests
  FOR UPDATE USING (
    public.is_admin_or_secretariat() OR (student_id = auth.uid() AND status = 'pending')
  );

CREATE POLICY "att_req_delete_policy" ON public.attendance_requests
  FOR DELETE USING (
    (student_id = auth.uid() AND status = 'pending') OR public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.8 attendance_rates テーブルのポリシー (出席率80%判定)
-- ------------------------------------------------------------------------------
CREATE POLICY "att_rates_select_policy" ON public.attendance_rates
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

CREATE POLICY "att_rates_modify_policy" ON public.attendance_rates
  FOR ALL USING (
    public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.9 learning_alerts テーブルのポリシー (学習停滞アラート)
-- ------------------------------------------------------------------------------
CREATE POLICY "alerts_select_policy" ON public.learning_alerts
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

CREATE POLICY "alerts_modify_policy" ON public.learning_alerts
  FOR ALL USING (
    public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.10 job_applications テーブルのポリシー (就職活動トラッキング)
-- ------------------------------------------------------------------------------
CREATE POLICY "job_app_select_policy" ON public.job_applications
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

CREATE POLICY "job_app_modify_policy" ON public.job_applications
  FOR ALL USING (
    student_id = auth.uid() OR public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.11 payments テーブルのポリシー (Stripe決済)
-- ------------------------------------------------------------------------------
CREATE POLICY "payments_select_policy" ON public.payments
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_admin_or_secretariat()
  );

CREATE POLICY "payments_modify_policy" ON public.payments
  FOR ALL USING (
    public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.12 course_surveys & survey_responses テーブルのポリシー
-- ------------------------------------------------------------------------------
CREATE POLICY "surveys_select_policy" ON public.course_surveys
  FOR SELECT USING (
    is_active = true OR public.is_staff()
  );

CREATE POLICY "surveys_modify_policy" ON public.course_surveys
  FOR ALL USING (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "survey_responses_select_policy" ON public.survey_responses
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

CREATE POLICY "survey_responses_insert_policy" ON public.survey_responses
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
  );

-- ------------------------------------------------------------------------------
-- 5.13 course_career_support_details テーブルのポリシー
-- ------------------------------------------------------------------------------
CREATE POLICY "career_support_select_policy" ON public.course_career_support_details
  FOR SELECT USING (
    true
  );

CREATE POLICY "career_support_modify_policy" ON public.course_career_support_details
  FOR ALL USING (
    public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.14 course_subjects, course_materials, material_orders
-- ------------------------------------------------------------------------------
CREATE POLICY "subjects_select_policy" ON public.course_subjects
  FOR SELECT USING (
    true
  );

CREATE POLICY "subjects_modify_policy" ON public.course_subjects
  FOR ALL USING (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "materials_select_policy" ON public.course_materials
  FOR SELECT USING (
    public.is_staff()
  );

CREATE POLICY "materials_modify_policy" ON public.course_materials
  FOR ALL USING (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "mat_orders_select_policy" ON public.material_orders
  FOR SELECT USING (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "mat_orders_modify_policy" ON public.material_orders
  FOR ALL USING (
    public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.15 target_qualifications & qualification_applications
-- ------------------------------------------------------------------------------
CREATE POLICY "target_qual_select_policy" ON public.target_qualifications
  FOR SELECT USING (
    true
  );

CREATE POLICY "target_qual_modify_policy" ON public.target_qualifications
  FOR ALL USING (
    public.is_admin_or_secretariat()
  );

CREATE POLICY "qual_app_select_policy" ON public.qualification_applications
  FOR SELECT USING (
    student_id = auth.uid() OR public.is_staff()
  );

CREATE POLICY "qual_app_insert_policy" ON public.qualification_applications
  FOR INSERT WITH CHECK (
    student_id = auth.uid() OR public.is_admin_or_secretariat()
  );

CREATE POLICY "qual_app_update_policy" ON public.qualification_applications
  FOR UPDATE USING (
    student_id = auth.uid() OR public.is_admin_or_secretariat()
  );

-- ------------------------------------------------------------------------------
-- 5.16 day_modules, learning_sets, set_quizzes, set_exercises (教材コンテンツ)
-- ------------------------------------------------------------------------------
CREATE POLICY "day_modules_select_policy" ON public.day_modules
  FOR SELECT USING (
    true
  );

CREATE POLICY "day_modules_modify_policy" ON public.day_modules
  FOR ALL USING (
    public.is_staff()
  );

CREATE POLICY "learning_sets_select_policy" ON public.learning_sets
  FOR SELECT USING (
    true
  );

CREATE POLICY "learning_sets_modify_policy" ON public.learning_sets
  FOR ALL USING (
    public.is_staff()
  );

CREATE POLICY "quizzes_select_policy" ON public.set_quizzes
  FOR SELECT USING (
    true
  );

CREATE POLICY "quizzes_modify_policy" ON public.set_quizzes
  FOR ALL USING (
    public.is_staff()
  );

CREATE POLICY "exercises_select_policy" ON public.set_exercises
  FOR SELECT USING (
    true
  );

CREATE POLICY "exercises_modify_policy" ON public.set_exercises
  FOR ALL USING (
    public.is_staff()
  );

-- ------------------------------------------------------------------------------
-- 5.17 set_progress & submission_ai_evaluations (学習進捗 ＆ AI自動採点)
-- ------------------------------------------------------------------------------
CREATE POLICY "progress_select_policy" ON public.set_progress
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_staff()
  );

CREATE POLICY "progress_insert_policy" ON public.set_progress
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR public.is_staff()
  );

CREATE POLICY "progress_update_policy" ON public.set_progress
  FOR UPDATE USING (
    user_id = auth.uid() OR public.is_staff()
  );

CREATE POLICY "ai_eval_select_policy" ON public.submission_ai_evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.set_progress sp
      WHERE sp.id = progress_id AND (sp.user_id = auth.uid() OR public.is_staff())
    )
  );

CREATE POLICY "ai_eval_modify_policy" ON public.submission_ai_evaluations
  FOR ALL USING (
    public.is_staff()
  );
