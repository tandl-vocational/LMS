import React, { useEffect, useState, lazy, Suspense } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ClipboardCheck,
  Award,
  Briefcase,
  CreditCard,
  ClipboardList,
  MessageSquare,
  Bell,
  Users,
  Package,
  FileText,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  RotateCcw,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import Link from "@/components/navigation/Link";
import { navigate, usePath, roleForPath, roleNames, type Role } from "./router";
import { DemoProvider, useDemo } from "./demo/store";
import { Modal, Field } from "./features/ui";
import { Textarea } from "@/components/ui/textarea";
const StudentDashboard = lazy(
  () => import("@/app/(dashboard)/student/dashboard/page"),
);
const InstructorDashboard = lazy(
  () => import("@/app/(dashboard)/instructor/dashboard/page"),
);
const SecretariatDashboard = lazy(
  () => import("@/app/(dashboard)/secretariat/dashboard/page"),
);
const AdminDashboard = lazy(
  () => import("@/app/(dashboard)/admin/dashboard/page"),
);
const CourseEdit = lazy(() => import("@/app/(features)/courses/edit/page"));
const LessonBuilder = lazy(
  () => import("@/app/(features)/lessons/builder/page"),
);
const LessonEdit = lazy(() => import("@/app/(features)/lessons/edit/page"));
const Learning = lazy(() => import("@/app/(features)/learn/[lessonId]/page"));
const Auth = lazy(() => import("./features/auth"));
const Attendance = lazy(() => import("./features/attendance"));
const Qualifications = lazy(() => import("./features/qualifications"));
const Career = lazy(() => import("./features/career"));
const Materials = lazy(() => import("./features/materials"));
const Grading = lazy(() => import("./features/grading"));
const Questions = lazy(() => import("./features/questions"));
const Schedule = lazy(() => import("./features/schedule"));
const Surveys = lazy(() => import("./features/surveys"));
const Payments = lazy(() => import("./features/payments"));
const Notifications = lazy(() => import("./features/notifications"));
const Progress = lazy(() => import("./features/progress"));
const Courses = lazy(() => import("./features/courses"));
const Revisions = lazy(() => import("./features/revisions"));
const Reports = lazy(() => import("./features/reports"));
import ErrorBoundary from "./ErrorBoundary";

type NavItem = { path: string; label: string; icon: typeof BookOpen };
const item = (path: string, label: string, icon: typeof BookOpen): NavItem => ({
  path,
  label,
  icon,
});
export const navigation: Record<Role, NavItem[]> = {
  student: [
    item("/student/dashboard", "ダッシュボード", LayoutDashboard),
    item("/student/learn/day14-set2", "学習する", BookOpen),
    item("/student/progress", "学習履歴・評価", ClipboardCheck),
    item("/student/schedule", "受講スケジュール", CalendarDays),
    item("/student/attendance", "出席・欠席申請", ClipboardList),
    item("/student/qualifications", "検定・資格申込", Award),
    item("/student/career", "就職活動・面談", Briefcase),
    item("/student/payments", "お支払い", CreditCard),
    item("/student/surveys", "アンケート", ClipboardList),
    item("/student/questions", "講師への質問", MessageSquare),
    item("/student/notifications", "お知らせ・LINE連携", Bell),
  ],
  instructor: [
    item("/instructor/dashboard", "ダッシュボード", LayoutDashboard),
    item("/instructor/grading", "課題採点", ClipboardCheck),
    item(
      "/instructor/courses/course-01/curriculum",
      "担当計画・Web会議",
      CalendarDays,
    ),
    item("/instructor/lessons/builder", "教材ビルダー", BookOpen),
    item("/instructor/lessons/edit", "動画・クイズ・演習", FileText),
    item("/instructor/questions", "質問対応", MessageSquare),
    item("/instructor/progress", "担当受講生の進捗", Users),
  ],
  secretariat: [
    item("/secretariat/dashboard", "ダッシュボード", LayoutDashboard),
    item("/secretariat/courses", "コース一覧・設計", BookOpen),
    item("/secretariat/courses/course-01/edit", "基本設計・シラバス", FileText),
    item("/secretariat/curriculums", "日別訓練計画", CalendarDays),
    item("/secretariat/materials", "教材登録・発注", Package),
    item("/secretariat/qualifications", "検定・資格管理", Award),
    item("/secretariat/attendance", "出席管理・承認", ClipboardCheck),
    item("/secretariat/progress", "受講生・学習進捗", Users),
    item("/secretariat/career", "就職支援・面談", Briefcase),
    item("/secretariat/notifications", "学習アラート・通知", Bell),
    item("/secretariat/reports", "公的帳票・修了証", FileText),
    item("/secretariat/surveys", "アンケート作成・集計", ClipboardList),
    item("/secretariat/payments", "決済履歴", CreditCard),
    item("/secretariat/lessons/builder", "教材ビルダー", BookOpen),
  ],
  admin: [
    item("/admin/dashboard", "ダッシュボード", LayoutDashboard),
    item("/admin/users", "ユーザー・権限管理", Users),
    item("/admin/courses", "コース管理", BookOpen),
    item("/admin/courses/course-01/edit", "コース設計", FileText),
    item("/admin/curriculums", "日別訓練計画", CalendarDays),
    item("/admin/materials", "教材管理", Package),
    item("/admin/qualifications", "資格管理", Award),
    item("/admin/revisions", "変更履歴・復元", History),
    item("/admin/payments", "売上・決済履歴", CreditCard),
    item("/admin/reports", "帳票出力", FileText),
    item("/admin/audit", "監査ログ", Shield),
    item("/admin/ai", "AI設定", Sparkles),
    item("/admin/settings", "システム設定", Settings),
  ],
};

function Screen({ path }: { path: string }) {
  const staff = !path.startsWith("/student");
  if (path === "/student/dashboard") return <StudentDashboard />;
  if (path === "/instructor/dashboard") return <InstructorDashboard />;
  if (path === "/secretariat/dashboard") return <SecretariatDashboard />;
  if (path === "/admin/dashboard")
    return <AdminDashboard initialTab="system" />;
  if (path === "/admin/users") return <AdminDashboard initialTab="users" />;
  if (path === "/admin/audit") return <AdminDashboard initialTab="audit" />;
  if (path === "/admin/ai") return <AdminDashboard initialTab="ai" />;
  if (path === "/admin/settings") return <AdminDashboard initialTab="system" />;
  if (/^\/student\/learn\/[^/]+$/.test(path)) return <Learning />;
  if (/^\/(secretariat|admin)\/courses\/[^/]+\/edit$/.test(path))
    return <CourseEdit courseId={path.split("/")[3]} />;
  if (path.endsWith("/curriculums"))
    return (
      <CourseEdit
        initialTab="curriculum"
        courseId={
          new URLSearchParams(location.search).get("course") || "course-01"
        }
      />
    );
  if (path.endsWith("/courses")) return <Courses />;
  if (path.endsWith("/lessons/builder")) return <LessonBuilder />;
  if (path.endsWith("/lessons/edit")) return <LessonEdit />;
  if (path.endsWith("/attendance")) return <Attendance staff={staff} />;
  if (path.endsWith("/qualifications")) return <Qualifications staff={staff} />;
  if (path.endsWith("/career")) return <Career staff={staff} />;
  if (path.endsWith("/materials")) return <Materials />;
  if (path.endsWith("/grading")) return <Grading />;
  if (path.endsWith("/questions"))
    return <Questions instructor={path.startsWith("/instructor")} />;
  if (
    path.endsWith("/schedule") ||
    /^\/instructor\/courses\/[^/]+\/curriculum$/.test(path)
  )
    return <Schedule instructor={path.startsWith("/instructor")} />;
  if (path.endsWith("/surveys") || path.startsWith("/student/survey/"))
    return <Surveys staff={staff} />;
  if (path.endsWith("/payments")) return <Payments staff={staff} />;
  if (path.endsWith("/notifications"))
    return <Notifications student={!staff} />;
  if (path.endsWith("/progress")) return <Progress staff={staff} />;
  if (path.endsWith("/revisions")) return <Revisions />;
  if (path.endsWith("/reports")) return <Reports />;
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">画面が見つかりません</h1>
      <p className="text-sm text-slate-500 mt-3">
        URLをご確認いただくか、メニューから目的の画面を選んでください。
      </p>
      <Button
        onClick={() => navigate(`/${roleForPath(path)}/dashboard`)}
        className="mt-6"
      >
        ダッシュボードに戻る
      </Button>
    </div>
  );
}

function Copilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState("");
  return (
    <>
      <Button
        className="fixed bottom-24 md:bottom-5 right-4 z-40 shadow-lg rounded-full h-12 w-12 sm:w-auto px-0 sm:px-4"
        aria-label="AI入力アシスト"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">AI入力アシスト</span>
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="AI入力アシスト"
        description="文章の下書き・校正を依頼できます。UIプレビューではサンプル文章を表示します。"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim())
              setDraft(
                `【下書きサンプル】\n${input.trim()}\n\n本訓練では、基礎知識の習得と実践演習を組み合わせ、受講生が実務に必要な能力を段階的に身につけることを目指します。理解度を確認しながら個別の支援を行い、修了後の就職と職場定着につなげます。`,
              );
          }}
        >
          <Field label="生成・校正の依頼">
            <Textarea
              required
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例：訓練の必要性を、DX人材不足をテーマに説明したい"
            />
          </Field>
          <Button type="submit" disabled={!input.trim()}>
            下書きを確認
          </Button>
          {draft && (
            <div className="space-y-3">
              <Textarea
                aria-label="生成した下書き"
                rows={7}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(draft)}
              >
                文章をコピー
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}

function Workspace() {
  const raw = usePath();
  const path =
    raw.split("?")[0] === "/" ? "/student/dashboard" : raw.split("?")[0];
  const role = roleForPath(path);
  const { reset } = useDemo();
  const [drawer, setDrawer] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const auth =
    path === "/login" || path === "/admin/login" || path === "/forgot-password";
  useEffect(() => {
    setDrawer(false);
    document.title = `${navigation[role].find((n) => n.path === path)?.label || "LMS Next"} | LMS Next`;
  }, [raw, role, path]);
  useEffect(() => {
    const aliases: Record<string, string> = {
      "/courses/edit": "/secretariat/courses/course-01/edit",
      "/lessons/builder": "/instructor/lessons/builder",
      "/lessons/edit": "/instructor/lessons/edit",
    };
    if (aliases[path]) navigate(aliases[path], true);
  }, [path]);
  const nav = (mobile = false) => (
    <nav
      aria-label={mobile ? "モバイルメニュー" : "メインメニュー"}
      className="space-y-1"
    >
      {navigation[role].map((n) => (
        <Link
          key={n.path}
          href={n.path}
          aria-current={path === n.path ? "page" : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${path === n.path ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
        >
          <n.icon className="w-4 h-4 shrink-0" />
          <span>{n.label}</span>
        </Link>
      ))}
    </nav>
  );
  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest("a");
        const href = a?.getAttribute("href");
        if (
          href?.startsWith("/") &&
          !href.startsWith("//") &&
          !a?.hasAttribute("download") &&
          a?.target !== "_blank" &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey &&
          !e.altKey &&
          e.button === 0
        ) {
          e.preventDefault();
          navigate(href);
        }
      }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] bg-white p-3 text-sm"
      >
        本文へ移動
      </a>
      <header className="sticky top-0 z-[60] h-16 border-b border-slate-200 bg-white/95 backdrop-blur flex items-center justify-between px-4 sm:px-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {!auth && (
            <button
              className="md:hidden p-1"
              aria-label="メニューを開く"
              onClick={() => setDrawer(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link href={`/${role}/dashboard`} className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white p-2 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="font-bold text-base whitespace-nowrap">
              LMS Next
              <span className="lg:hidden block text-[9px] font-normal text-indigo-500 leading-tight">
                UIプレビュー
              </span>
            </span>
          </Link>
          <span className="hidden lg:inline-flex text-[10px] px-2 py-1 rounded-md text-indigo-700 bg-indigo-50 border border-indigo-100">
            UIプレビュー・デモデータ
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="表示ロール"
            className="w-28 sm:w-40"
            value={role}
            onChange={(e) => navigate(`/${e.target.value}/dashboard`)}
          >
            {Object.entries(roleNames).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button
            variant="ghost"
            size="icon"
            aria-label="デモデータをリセット"
            onClick={() => setResetOpen(true)}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </header>
      {auth ? (
        <main id="main-content">
          <ErrorBoundary key={raw}>
            <Suspense
              fallback={
                <p role="status" className="p-8 text-sm text-slate-500">
                  ログイン画面を読み込んでいます…
                </p>
              }
            >
              <Auth
                admin={path === "/admin/login"}
                reset={path === "/forgot-password"}
              />
            </Suspense>
          </ErrorBoundary>
        </main>
      ) : (
        <div className="max-w-[1680px] mx-auto flex">
          <aside className="hidden md:flex sticky top-16 h-[calc(100dvh-64px)] w-56 shrink-0 border-r border-slate-200 bg-white p-4 flex-col overflow-y-auto">
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider px-3 pt-2 pb-4">
              {roleNames[role]}ポータル
            </p>
            {nav()}
            <div className="mt-auto pt-6 border-t border-slate-100">
              <Link
                href={role === "student" ? "/login" : "/admin/login"}
                className="flex items-center gap-2 text-xs px-3 text-slate-500"
              >
                <LogOut className="w-4 h-4" />
                ログイン画面
              </Link>
              <p className="text-[10px] leading-relaxed text-slate-400 mt-4 px-3">
                操作内容はデモ内で反映されます。
                <br />
                外部サービスへの送信はありません。
              </p>
            </div>
          </aside>
          <main
            id="main-content"
            className="min-w-0 flex-1 pb-24 md:pb-12 legacy-screen"
          >
            <ErrorBoundary key={raw}>
              <Suspense
                fallback={
                  <div role="status" aria-busy="true" className="p-8 space-y-4">
                    <p className="text-sm text-slate-500">
                      画面を読み込んでいます…
                    </p>
                    <div className="h-12 rounded-xl bg-slate-200 animate-pulse" />
                    <div className="h-48 rounded-xl bg-slate-100 animate-pulse" />
                  </div>
                }
              >
                <Screen path={path} />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      )}
      {!auth && (
        <>
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-200 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
            {navigation[role].slice(0, 3).map((n) => (
              <Link
                key={n.path}
                href={n.path}
                aria-current={path === n.path ? "page" : undefined}
                className={`py-3 px-2 flex flex-col items-center gap-1 text-[10px] ${path === n.path ? "text-indigo-600" : "text-slate-500"}`}
              >
                <n.icon className="w-5 h-5" />
                {n.label}
              </Link>
            ))}
            <button
              className="py-3 px-3 flex flex-col items-center gap-1 text-[10px] text-slate-500"
              onClick={() => setDrawer(true)}
              aria-label="すべてのメニュー"
            >
              <Menu className="w-5 h-5" />
              メニュー
            </button>
          </div>
          {drawer && (
            <div
              className="md:hidden fixed inset-0 bg-slate-900/40 z-[70]"
              onClick={() => setDrawer(false)}
            >
              <aside
                aria-label="メニューパネル"
                className="w-72 max-w-[85vw] h-full bg-white p-4 overflow-y-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="font-bold text-sm">{roleNames[role]}メニュー</p>
                  <button
                    aria-label="メニューを閉じる"
                    onClick={() => setDrawer(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {nav(true)}
                <Link
                  href={role === "student" ? "/login" : "/admin/login"}
                  className="text-xs block p-3 mt-4"
                >
                  ログイン画面
                </Link>
              </aside>
            </div>
          )}
          {!path.includes("/learn/") && !path.includes("/lessons/builder") && (
            <Copilot />
          )}
        </>
      )}
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="デモデータをリセット"
      >
        <p className="text-sm text-slate-600 mb-5">
          追加した申請や回答を初期状態に戻します。
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setResetOpen(false)}>
            キャンセル
          </Button>
          <Button
            onClick={() => {
              reset();
              setResetOpen(false);
              navigate(`/${role}/dashboard`);
            }}
          >
            初期状態に戻す
          </Button>
        </div>
      </Modal>
    </div>
  );
}
export default function App() {
  return (
    <DemoProvider>
      <Workspace />
    </DemoProvider>
  );
}
