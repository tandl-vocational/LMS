"use client";

import React, { useState } from "react";
import Link from "@/components/navigation/Link";
import { navigate } from "@/src/router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  PlayCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Award,
  MessageSquare,
  FileText,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Briefcase,
  HelpCircle,
  Bell,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";

// ダミーデータ定義（Supabase連携準備完了・型準拠）
const MOCK_STUDENT = {
  name: "山田 太郎",
  loginId: "std2026001",
  courseTitle: "DX人材育成＆Webフルスタック開発科（公的職業訓練6ヶ月コース）",
  trainingPeriod: "2026年9月1日 〜 2027年2月28日",
  currentDayNumber: 14,
  totalDays: 60,
  attendance: {
    totalRate: 88.5, // 通算出席率
    currentMonthRate: 92.0, // 当月出席率
    requiredRate: 80.0, // 公的基準
    absentDays: 1,
    lateDays: 1,
  },
  currentSet: {
    dayNumber: 14,
    setNumber: 2,
    moduleTitle: "第14日目: サーバーサイドAPIとデータ永続化",
    setTitle: "Next.js Route HandlersとSupabase認証の統合",
    durationMinutes: 4,
    isCompleted: false,
    quizScore: null as number | null,
    quizPassed: false,
  },
  progress: {
    completedSets: 42,
    totalSets: 60,
    percentage: 70,
  },
  pendingTasks: [
    {
      id: "task-1",
      type: "quiz_retry",
      title: "【100点必須】Day 13 セット3 クイズ再挑戦",
      description: "現在 80点（合格基準: 100点）。演習解禁のため再受験が必要です。",
      deadline: "本日 23:59まで",
      urgency: "high",
      href: "/student/learn/day13-set3",
    },
    {
      id: "task-2",
      type: "survey",
      title: "第2回 訓練受講中間アンケートへの回答",
      description: "公的訓練PDCA評価のための無記名アンケート（所要時間約3分）",
      deadline: "明日 17:00まで",
      urgency: "medium",
      href: "/student/survey/mid-term",
    },
    {
      id: "task-3",
      type: "attendance_request",
      title: "遅刻届の証明書類（医師診断書）の提出",
      description: "10月3日遅刻分の公的証明書アップロードが未完了です。",
      deadline: "10月10日まで",
      urgency: "medium",
      href: "/student/attendance",
    },
  ],
  upcomingSchedules: [
    {
      id: "sch-1",
      type: "schooling",
      title: "次回スクーリング（対面集合訓練）",
      date: "2026年10月13日(火)",
      time: "09:30 〜 16:30",
      location: "東京校 3F 第2実習室（または指定オンライン）",
      badge: "出席必須",
    },
    {
      id: "sch-2",
      type: "career",
      title: "第2回 キャリアコンサルティング個別面談",
      date: "2026年10月16日(金)",
      time: "15:00 〜 16:00",
      location: "個別面談ブース B（担当: 佐藤CC）",
      badge: "予約確定",
    },
  ],
  qualifications: [
    {
      id: "qual-1",
      name: "基本情報技術者試験 (FE)",
      examDate: "2026年11月15日",
      daysLeft: 40,
      status: "申込承認済 (指定用紙提出完了)",
    },
    {
      id: "qual-2",
      name: "Python3エンジニア認定基礎試験",
      examDate: "2026年12月20日",
      daysLeft: 75,
      status: "受験料決済済・バウチャー発行待ち",
    },
  ],
  latestInstructorComment: {
    instructorName: "佐々木 講師",
    date: "昨日 18:20",
    subject: "Day 12 記述式課題: データベース正規化の設計書",
    comment:
      "山田さん、第3正規形までの分解プロセスが非常に明快で素晴らしいです！AI採点指摘の『外部キー制約のCASCADE設定』についての修正も的確でした。この調子で進めましょう！",
  },
};

export default function StudentDashboardPage() {
  const [student] = useState(MOCK_STUDENT);

  // 出席率に応じたカラー判定ロジック (80%基準)
  const getAttendanceStatus = (rate: number) => {
    if (rate >= 85) {
      return {
        label: "良好（基準達成）",
        color: "text-emerald-600",
        strokeColor: "#10b981",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        badgeVariant: "success" as const,
      };
    }
    if (rate >= 80) {
      return {
        label: "注意（基準到達寸前）",
        color: "text-amber-600",
        strokeColor: "#f59e0b",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        badgeVariant: "warning" as const,
      };
    }
    return {
      label: "警告（80%未満・給付金停止リスク）",
      color: "text-red-600",
      strokeColor: "#ef4444",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      badgeVariant: "destructive" as const,
    };
  };

  const attStatus = getAttendanceStatus(student.attendance.totalRate);

  // SVG 円形プログレスバー計算
  const circleRadius = 42;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset =
    circumference - (student.attendance.totalRate / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* 画面トップバー */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
              LMS
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {student.courseTitle}
              </h1>
              <p className="text-xs text-slate-500">
                受講生ID: <span className="font-mono">{student.loginId}</span> | {student.name} 様
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/student/attendance">
              <Button variant="outline" size="sm" className="hidden sm:flex text-xs h-9">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                欠席・遅刻届
              </Button>
            </Link>
            <div className="relative">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600">
                <Bell className="w-4 h-4" />
              </Button>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </div>
          </div>
        </div>
      </header>

      {/* メインレイアウトコンテナ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* ===================================================================== */}
        {/* 1. AI Tutor 動的励まし吹き出しバナー (01_PRD 4.4準拠) */}
        {/* ===================================================================== */}
        <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex items-start gap-3.5">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] text-white font-bold items-center justify-center">
                  AI
                </span>
              </span>
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                  AI Tutor ナビゲーション
                </span>
                <span className="text-[11px] text-slate-600">リアルタイム同期中</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                「{student.name}さん、おはようございます！本日は{" "}
                <span className="text-indigo-600 font-bold">Day {student.currentDayNumber}</span>{" "}
                の学習ですね。前回のクイズも満点で素晴らしいペースです！今日の3〜5分動画もサクッとクリアして演習へ進みましょう！」
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  onClick={() => navigate("/student/learn/day14-set2?chat=open")}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  AI Tutorに質問する
                </Button>
                <span className="text-xs text-slate-600">
                  ※講義動画の文字起こしを学習済みです
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* ===================================================================== */}
        {/* レスポンシブ グリッドレイアウト (モバイル: 1カラム, PC: 3カラム) */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ================================================================= */}
          {/* 【左・中央カラム (2カラム分)】学習の再開 ＆ メイン進行領域 */}
          {/* ================================================================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* メインCTAカード: 学習の再開 */}
            <Card className="border-indigo-200 bg-white shadow-md shadow-slate-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
              <CardHeader className="pb-3 pt-6">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="default" className="bg-indigo-600 text-white font-semibold">
                    次に受講するマイクロラーニング
                  </Badge>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    所要目安: 約 {student.currentSet.durationMinutes} 分
                  </div>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 pt-1">
                  {student.currentSet.moduleTitle}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-600">
                  セット {student.currentSet.setNumber}: {student.currentSet.setTitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 1セットの構成（講義動画 → 100点クイズ → 演習問題）のフロー表示 */}
                <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2.5">
                    マイクロラーニング 3ステップ進行フロー:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5">
                      <span className="block font-bold text-indigo-700">STEP 1</span>
                      <span className="text-[11px] text-slate-600">講義動画 (3〜5分)</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs">
                      <span className="block font-bold text-slate-800">STEP 2</span>
                      <span className="text-[11px] text-slate-600">100点必須クイズ</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 opacity-60">
                      <span className="block font-bold text-slate-500">STEP 3</span>
                      <span className="text-[11px] text-slate-500">演習問題(解説付)</span>
                    </div>
                  </div>
                </div>

                {/* 学習を再開する 大型CTAボタン */}
                <Link href={`/student/learn/day${student.currentSet.dayNumber}-set${student.currentSet.setNumber}`} className="block">
                  <Button className="w-full h-13 text-base sm:text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-[0.99] transition-all">
                    <PlayCircle className="w-6 h-6" />
                    <span>学習を再開する（講義動画を視聴）</span>
                  </Button>
                </Link>
              </CardContent>

              {/* コース全体の進捗プログレス */}
              <CardFooter className="bg-slate-50/80 border-t border-slate-100 flex flex-col space-y-2 py-3.5">
                <div className="w-full flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    コース全体の消化率
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {student.progress.percentage}%{" "}
                    <span className="text-xs font-normal text-slate-500">
                      ({student.progress.completedSets} / {student.progress.totalSets} セット完了)
                    </span>
                  </span>
                </div>
                <Progress
                  value={student.progress.percentage}
                  className="h-2.5 bg-slate-200"
                  indicatorClassName="bg-indigo-600"
                />
              </CardFooter>
            </Card>

            {/* 要対応タスク リスト (未達成クイズ・アンケート等) */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                      要対応タスク・アラート
                    </CardTitle>
                  </div>
                  <Badge variant="warning" className="text-xs">
                    {student.pendingTasks.length}件 未完了
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  公的訓練の修了・給付金要件に関わる重要アクションです
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {student.pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {task.title}
                        </span>
                        {task.urgency === "high" && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            至急
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{task.description}</p>
                      <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        期日: {task.deadline}
                      </span>
                    </div>

                    <Link href={task.href} className="self-end sm:self-center flex-shrink-0">
                      <Button size="sm" variant="outline" className="text-xs h-8 border-slate-300">
                        対応する
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 講師からの最新コメント・AI自動採点フィードバック */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                    担当講師からの最新フィードバック
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {student.latestInstructorComment.instructorName}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {student.latestInstructorComment.date}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-indigo-700">
                    課題: {student.latestInstructorComment.subject}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {student.latestInstructorComment.comment}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ================================================================= */}
          {/* 【右カラム (1カラム分)】出席率メーター・スケジュール・目標資格 */}
          {/* ================================================================= */}
          <div className="space-y-6">
            {/* 1. 出席率メーター (公的職業訓練80%要件) */}
            <Card className={`border ${attStatus.borderColor} bg-white shadow-sm overflow-hidden`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    出席率管理（基準80%）
                  </CardTitle>
                  <Badge variant={attStatus.badgeVariant} className="text-xs">
                    {attStatus.label}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  公的給付金受給・修了判定のための必須指標
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col items-center pt-2 pb-4">
                {/* 円形プログレスメーター */}
                <div className="relative w-36 h-36 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* 背景サークル */}
                    <circle
                      cx="50"
                      cy="50"
                      r={circleRadius}
                      className="text-slate-100"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* 80%基準点マーク */}
                    <circle
                      cx="50"
                      cy="50"
                      r={circleRadius}
                      stroke="#94a3b8"
                      strokeWidth="10"
                      strokeDasharray={`${circumference}`}
                      strokeDashoffset={`${circumference - (80 / 100) * circumference}`}
                      fill="transparent"
                      strokeLinecap="round"
                      className="opacity-25"
                    />
                    {/* 実測プログレスサークル */}
                    <circle
                      cx="50"
                      cy="50"
                      r={circleRadius}
                      stroke={attStatus.strokeColor}
                      strokeWidth="10"
                      strokeDasharray={`${circumference}`}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  {/* 中央の数値表示 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] text-slate-600 font-medium">通算出席率</span>
                    <span className={`text-2xl font-black ${attStatus.color}`}>
                      {student.attendance.totalRate}%
                    </span>
                    <span className="text-[10px] text-slate-600">基準: 80.0%以上</span>
                  </div>
                </div>

                {/* 詳細数値グリッド */}
                <div className="w-full grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-600 block text-[11px]">今月の出席率</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {student.attendance.currentMonthRate}%
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-600 block text-[11px]">欠席 / 遅刻</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {student.attendance.absentDays}日 / {student.attendance.lateDays}回
                    </span>
                  </div>
                </div>

                {/* 欠席届提出リンクボタン */}
                <Link href="/student/attendance" className="w-full mt-3">
                  <Button variant="outline" size="sm" className="w-full text-xs h-9 text-slate-700">
                    欠席・遅刻・早退届を提出
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 2. 直近スケジュール (スクーリング & キャリア面談) */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    直近の重要スケジュール
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {student.upcomingSchedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">
                        {sch.title}
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {sch.badge}
                      </Badge>
                    </div>
                    <div className="text-xs text-indigo-700 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {sch.date} {sch.time}
                    </div>
                    <p className="text-[11px] text-slate-500">{sch.location}</p>
                  </div>
                ))}

                <Link href="/student/career" className="block pt-1">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    <Briefcase className="w-3.5 h-3.5 mr-1" />
                    キャリア面談予約・就職活動報告へ
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 3. 目標資格・検定カウントダウン */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    取得目標資格 & 検定
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {student.qualifications.map((qual) => (
                  <div
                    key={qual.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {qual.name}
                      </span>
                      <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        あと {qual.daysLeft} 日
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>試験日: {qual.examDate}</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      ✓ {qual.status}
                    </p>
                  </div>
                ))}

                <Link href="/student/qualifications" className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8">
                    検定申込・結果確認
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
