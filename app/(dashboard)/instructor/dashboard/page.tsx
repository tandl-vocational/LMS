"use client";

import React, { useState } from "react";
import Link from "@/components/navigation/Link";
import { navigate } from "@/src/router";
import { useDemo, students, id as makeId } from "@/src/demo/store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Video,
  VideoOff,
  Calendar,
  Users,
  BookOpen,
  MessageSquare,
  Send,
  ExternalLink,
  ChevronRight,
  Edit3,
  Check,
  UserX,
  FileCheck2,
  TrendingDown,
  Eye,
  PlusCircle,
  HelpCircle,
  Laptop,
} from "lucide-react";

// 1. 採点待ち記述式課題のモックデータ
const MOCK_PENDING_SUBMISSIONS = [
  {
    id: "sub-101",
    studentName: "山田 太郎",
    studentId: "std2026001",
    courseTitle: "DX人材育成＆Webフルスタック開発科",
    lessonTitle: "Day 14 - セット2: Next.js API RoutesとSupabase認証",
    submittedAt: "本日 10:45",
    studentAnswer:
      "1. @supabase/ssr の createServerClient を用いてクッキーを注入し、セッションを検証します。\n2. 未認証時は NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) を即時返却します。\n3. RLSにより行レベルでの安全性を担保しつつ、入力値のバリデーションをサーバー側で徹底します。",
    aiSuggestedScore: 95,
    aiFeedbackDraft:
      "Next.js Route Handlersにおける認証エラー（401）の返却方針とSupabase RLSの連携について正確に理解されています。実務水準の記述です。",
    rubricMatch: "基準3項目中 3項目適合 (A判定)",
    status: "ai_evaluated",
  },
  {
    id: "sub-102",
    studentName: "佐藤 美咲",
    studentId: "std2026014",
    courseTitle: "DX人材育成＆Webフルスタック開発科",
    lessonTitle: "Day 14 - セット2: Next.js API RoutesとSupabase認証",
    submittedAt: "本日 09:12",
    studentAnswer:
      "クッキーからアクセストークンを取り出して認証します。エラー時はエラー画面にリダイレクトさせます。RLSがあるので権限外データは見えなくなります。",
    aiSuggestedScore: 82,
    aiFeedbackDraft:
      "全体の流れは把握できていますが、APIルートでは画面リダイレクトではなく 401/403 のJSONレスポンスを返すREST設計が推奨されます。その点のみ補足を推奨します。",
    rubricMatch: "基準3項目中 2項目適合 (B判定)",
    status: "ai_evaluated",
  },
  {
    id: "sub-103",
    studentName: "鈴木 一郎",
    studentId: "std2026022",
    courseTitle: "DX人材育成＆Webフルスタック開発科",
    lessonTitle: "Day 13 - セット3: PostgreSQLインデックス設計と外部キー",
    submittedAt: "昨日 17:30",
    studentAnswer:
      "頻繁に検索条件となるカラムに B-tree インデックスを作成します。外部キーには ON DELETE CASCADE を設定して親レコード削除時の整合性を保ちます。",
    aiSuggestedScore: 90,
    aiFeedbackDraft:
      "B-treeインデックスの選定と外部キーのCASCADE挙動について正しく記述されています。",
    rubricMatch: "基準2項目中 2項目適合 (A判定)",
    status: "ai_evaluated",
  },
];

// 2. 担当受講生の学習停滞・離脱アラートモックデータ
const MOCK_LEARNING_ALERTS = [
  {
    id: "alert-01",
    studentName: "高橋 健太",
    studentId: "std2026008",
    alertType: "quiz_stuck",
    severity: "high",
    title: "クイズ連続不合格 (5回停滞)",
    detail: "Day 13 セット3 クイズで5回連続で80点以下。演習に進めず学習が中断しています。",
    lastActive: "1日前",
    attendanceRate: 88.0,
  },
  {
    id: "alert-02",
    studentName: "伊藤 結衣",
    studentId: "std2026019",
    alertType: "inactive_days",
    severity: "high",
    title: "3日間 未ログイン (離脱リスク)",
    detail: "10月3日以降ログインが確認されていません。公的訓練の出席率にも影響の懸念があります。",
    lastActive: "3日前",
    attendanceRate: 81.2,
  },
  {
    id: "alert-03",
    studentName: "渡辺 翔太",
    studentId: "std2026027",
    alertType: "attendance_risk",
    severity: "warning",
    title: "出席率 80.5% (基準危険域)",
    detail: "直近で遅刻が2回重なり、公的給付金受給ライン（80%）を下回るリスクがあります。",
    lastActive: "本日",
    attendanceRate: 80.5,
  },
];

// 3. 本日の講義 / Web会議スケジュールモックデータ
const MOCK_TODAY_SCHEDULE = [
  {
    id: "sch-01",
    time: "13:30 〜 15:00",
    title: "【集合講義】Next.js ＆ Supabase 実践演習 (ライブQ&A)",
    type: "lecture",
    location: "オンライン (Google Meet 第1会議室)",
    participantsCount: 24,
    status: "upcoming",
    meetUrl: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "sch-02",
    time: "15:30 〜 16:00",
    title: "【個別面談】学習進捗フォローアップ（高橋 健太さん）",
    type: "mentoring",
    location: "オンライン (Zoom 面談室 B)",
    participantsCount: 1,
    status: "upcoming",
    meetUrl: "https://zoom.us/j/123456789",
  },
  {
    id: "sch-03",
    time: "16:30 〜 17:30",
    title: "【事務局定例】公的申請書類・受講生出席率確認ミーティング",
    type: "internal",
    location: "本校 2F 第1会議室 / ハイブリッド",
    participantsCount: 5,
    status: "upcoming",
    meetUrl: "https://meet.google.com/klm-nopq-rst",
  },
];

// 4. 担当科目・教材編集ショートカットモックデータ
const MOCK_ASSIGNED_COURSES = [
  {
    id: "course-01",
    title: "DX人材育成＆Webフルスタック開発科",
    period: "2026年9月 〜 2027年2月",
    studentsCount: 28,
    activeLessonsCount: 60,
    completionAverage: "68%",
  },
  {
    id: "course-02",
    title: "求職者支援訓練 Pythonデータサイエンス実践科",
    period: "2026年10月 〜 2027年3月",
    studentsCount: 20,
    activeLessonsCount: 45,
    completionAverage: "12%",
  },
];

export default function InstructorDashboardPage() {
  const { data, setData, notify } = useDemo();
  const pendingSubmissions = data.submissions.filter(s => s.status === '採点待ち').map(s => ({
    id: s.id, studentName: s.student, studentId: students.find(u => u.name === s.student)?.id || 'std2026001',
    courseTitle: 'DX人材育成＆Webフルスタック開発科', lessonTitle: s.lesson,
    submittedAt: 'デモ提出', studentAnswer: s.answer, aiSuggestedScore: s.aiScore,
    aiFeedbackDraft: s.feedback, rubricMatch: '講師による最終確認待ち', status: s.status,
  }));
  // 採点承認モーダル用の状態
  const [selectedSubmission, setSelectedSubmission] = useState<typeof pendingSubmissions[0] | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(95);
  const [gradingFeedback, setGradingFeedback] = useState<string>("");
  const [isApproving, setIsApproving] = useState<boolean>(false);


  // 個別メッセージ送信モーダル用の状態
  const [selectedAlertStudent, setSelectedAlertStudent] = useState<typeof MOCK_LEARNING_ALERTS[0] | null>(null);
  const [messageChannel, setMessageChannel] = useState<"system" | "line">("line");
  const [messageContent, setMessageContent] = useState<string>("");
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [sentMessageStudents, setSentMessageStudents] = useState<string[]>([]);

  // 採点モーダルを開く
  const handleOpenGradingModal = (sub: typeof pendingSubmissions[0]) => {
    setSelectedSubmission(sub);
    setGradingScore(sub.aiSuggestedScore);
    setGradingFeedback(sub.aiFeedbackDraft);
  };

  // 採点確定・送信処理
  const handleConfirmGrading = () => {
    if (!selectedSubmission) return;
    setIsApproving(true);
    setTimeout(() => {
      setData(state => ({...state, submissions: state.submissions.map(s => s.id === selectedSubmission.id ? {...s, score: gradingScore, feedback: gradingFeedback, status: '評価確定'} : s)}));
      notify('講師の最終評価を確定しました。');
      setIsApproving(false);
      setSelectedSubmission(null);
    }, 600);
  };

  // 個別メッセージモーダルを開く
  const handleOpenMessageModal = (alertItem: typeof MOCK_LEARNING_ALERTS[0]) => {
    setSelectedAlertStudent(alertItem);
    if (alertItem.alertType === "quiz_stuck") {
      setMessageContent(
        `${alertItem.studentName}さん、講師の佐々木です。\nDay 13のクイズで少し苦戦されているようですが大丈夫ですか？\nインデックスの適用ルールについて、本日の個別フォロー（または質問掲示板）でわかりやすく解説できますので、気軽に声をかけてくださいね！`
      );
    } else if (alertItem.alertType === "inactive_days") {
      setMessageContent(
        `${alertItem.studentName}さん、講師の佐々木です。\n体調など崩されていませんか？\n公的職業訓練の出席率基準（80%）を維持するためにも、動画3分だけでも受講を進めてみてください。サポートが必要ならいつでも連絡してください！`
      );
    } else {
      setMessageContent(
        `${alertItem.studentName}さん、現在の出席率が80.5%となっております。\n公的訓練の修了要件（80%以上）に関わるため、今後の欠席・遅刻には十分ご注意ください。何か事情があれば事務局または私までご相談ください。`
      );
    }
  };

  // 個別メッセージ送信処理
  const handleSendMessage = () => {
    if (!selectedAlertStudent) return;
    setIsSendingMessage(true);
    setTimeout(() => {
      setSentMessageStudents((prev) => [...prev, selectedAlertStudent.id]);
      setData(state => ({...state, notifications: [{id: makeId(), recipients: selectedAlertStudent.studentName, channel: messageChannel === 'line' ? 'LINE' : 'アプリ内通知', message: messageContent, status: '送信プレビュー'}, ...state.notifications]}));
      notify('個別フォローの送信プレビューを記録しました。');
      setIsSendingMessage(false);
      setSelectedAlertStudent(null);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* 画面トップバー */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  講師ポータル
                </span>
                <span className="text-xs text-slate-500">
                  担当講師: 佐々木 慎太郎 先生
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                講師業務ダッシュボード（課題採点 ＆ 離脱フォロー）
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="hidden sm:inline-flex text-xs px-2.5 py-1 text-slate-700 bg-slate-50">
              担当受講生: 48名
            </Badge>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              onClick={() => navigate("/instructor/lessons/builder")}
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              教材・クイズ作成
            </Button>
          </div>
        </div>
      </header>

      {/* メインレイアウト (PCファースト: 3カラム) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* KPI サマリーカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>採点待ち課題</span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {pendingSubmissions.length}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">
                AI一次採点済
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>要フォロー受講生</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">
                {MOCK_LEARNING_ALERTS.length - sentMessageStudents.length}
              </span>
              <span className="text-xs text-slate-500">名 アラート中</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>本日の講義 / 面談</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {MOCK_TODAY_SCHEDULE.length}
              </span>
              <span className="text-xs text-slate-500">件</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>平均受講進捗率</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">68.4%</span>
              <span className="text-xs text-emerald-600 font-semibold">順調</span>
            </div>
          </div>
        </div>

        {/* 2カラム構成 (左: 2カラム分 / 右: 1カラム分) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ================================================================= */}
          {/* 【左側 2カラム】優先タスク（AI一次採点済み課題 ＆ 停滞アラート） */}
          {/* ================================================================= */}
          <div className="xl:col-span-2 space-y-6">
            {/* ① 優先対応タスク: 採点待ちの記述式課題 */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50/70 via-purple-50/30 to-white pb-3.5 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileCheck2 className="w-5 h-5 text-indigo-600" />
                        優先採点キュー (記述式課題)
                      </CardTitle>
                      <Badge variant="default" className="bg-indigo-600 text-white font-semibold text-xs">
                        {pendingSubmissions.length}件 未処理
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-slate-500">
                      Gemini APIがルーブリックに基づき一次採点（得点案・講評案）を生成済みです。確認・修正してワンクリックで送信できます。
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">受講生</TableHead>
                      <TableHead>課題名・科目</TableHead>
                      <TableHead className="w-[180px]">AI一次採点ステータス</TableHead>
                      <TableHead className="w-[120px] text-right">アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSubmissions.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell className="font-medium">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {sub.studentName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {sub.studentId}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {sub.lessonTitle}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            提出: {sub.submittedAt}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant="success" className="text-[11px] font-semibold flex items-center gap-1 bg-emerald-50 text-emerald-800 border-emerald-200">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>AI案: {sub.aiSuggestedScore}点</span>
                            </Badge>
                            <span className="text-[10px] text-slate-500">
                              {sub.rubricMatch}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 font-semibold shadow-2xs"
                            onClick={() => handleOpenGradingModal(sub)}
                          >
                            採点・承認
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {pendingSubmissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="font-semibold text-sm text-slate-700">
                            すべての提出課題の採点・承認が完了しています！
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            新しい提出物があると自動的にここに表示されます。
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* ② 担当受講生の「学習停滞・離脱アラート」 */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      学習停滞・公的離脱防止アラート
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      「クイズ連続不合格」「未ログイン」「出席率80%未満危機」を自動検知。早期介入で受講継続を促します。
                    </CardDescription>
                  </div>
                  <Badge variant="warning" className="text-xs">
                    要フォロー {MOCK_LEARNING_ALERTS.length - sentMessageStudents.length}名
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-3">
                {MOCK_LEARNING_ALERTS.map((alertItem) => {
                  const isHandled = sentMessageStudents.includes(alertItem.id);
                  return (
                    <div
                      key={alertItem.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isHandled
                          ? "bg-slate-50/60 border-slate-200 opacity-60"
                          : alertItem.severity === "high"
                          ? "bg-red-50/50 border-red-200/90"
                          : "bg-amber-50/50 border-amber-200/90"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">
                            {alertItem.studentName}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            ({alertItem.studentId})
                          </span>
                          <Badge
                            variant={alertItem.severity === "high" ? "destructive" : "warning"}
                            className="text-[10px] px-2"
                          >
                            {alertItem.title}
                          </Badge>
                          <span className="text-[11px] text-slate-500">
                            通算出席率: <strong className={alertItem.attendanceRate < 82 ? "text-red-600" : "text-slate-700"}>{alertItem.attendanceRate}%</strong>
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">
                          {alertItem.detail}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        {isHandled ? (
                          <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50">
                            ✓ メッセージ送信済
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 bg-white border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold"
                            onClick={() => handleOpenMessageModal(alertItem)}
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                            個別フォロー送信
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* ================================================================= */}
          {/* 【右側 1カラム】本日の講義スケジュール ＆ 教材編集ショートカット */}
          {/* ================================================================= */}
          <div className="space-y-6">
            {/* ③ 本日の講義 / Web会議スケジュール */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    本日の授業・面談スケジュール
                  </CardTitle>
                  <span className="text-xs text-slate-400 font-mono">
                    2026/10/06(火)
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5">
                {MOCK_TODAY_SCHEDULE.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {sch.time}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        参加 {sch.participantsCount}名
                      </Badge>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {sch.title}
                    </h4>

                    <p className="text-[11px] text-slate-500">
                      {sch.location}
                    </p>

                    <Button
                      size="sm"
                      className="w-full text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
                      onClick={() => navigate("/instructor/courses/course-01/curriculum")}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Web会議を開始する</span>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ④ 担当科目・教材編集ショートカット */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  担当コース・教材管理
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  アサイン科目の動画・クイズ・課題のメンテナンス
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {MOCK_ASSIGNED_COURSES.map((course) => (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {course.title}
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="block text-slate-400">受講生</span>
                        <strong className="text-slate-800 text-xs">{course.studentsCount}名</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400">教材数</span>
                        <strong className="text-slate-800 text-xs">{course.activeLessonsCount}回</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400">進捗平均</span>
                        <strong className="text-indigo-600 text-xs">{course.completionAverage}</strong>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-7 text-slate-700"
                        onClick={() => navigate("/instructor/lessons/edit")}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        教材・クイズ編集
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 mt-1"
                  onClick={() => navigate("/instructor/courses/course-01/curriculum")}
                >
                  シラバス・日別計画一覧を見る
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* ===================================================================== */}
      {/* 5. 採点・承認モーダル (AI採点下準備の確認・調整・送信) */}
      {/* ===================================================================== */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  記述式課題 採点・承認
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedSubmission.studentId}
                </span>
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 pt-1">
                {selectedSubmission.studentName} さんの提出課題
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {selectedSubmission.lessonTitle}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* 受講生の提出本文 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  受講生からの提出内容:
                </label>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-mono">
                  {selectedSubmission.studentAnswer}
                </div>
              </div>

              {/* Gemini AIによる一次採点案 */}
              <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/60 p-4 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI一次自動採点アシスト (Gemini 2.5 Flash)
                  </span>
                  <Badge variant="success" className="font-bold text-xs">
                    AI推奨得点: {selectedSubmission.aiSuggestedScore} 点
                  </Badge>
                </div>
                <p className="text-xs text-slate-700">
                  ルーブリック判定: {selectedSubmission.rubricMatch}
                </p>
              </div>

              {/* 講師による得点調整 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    確定得点 (点):
                  </label>
                  <span className="text-xs text-slate-500">満点: 100点</span>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={gradingScore}
                  onChange={(e) => setGradingScore(Number(e.target.value))}
                  className="w-32 text-base font-bold font-mono"
                />
              </div>

              {/* 講師によるフィードバックコメント */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  受講生へ送信するフィードバックコメント (AI案から編集可能):
                </label>
                <Textarea
                  rows={4}
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  className="text-xs sm:text-sm leading-relaxed"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedSubmission(null)}
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                disabled={isApproving}
                onClick={handleConfirmGrading}
              >
                {isApproving ? "承認処理中..." : "採点を確定し、受講生へ通知"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ===================================================================== */}
      {/* 6. 個別メッセージ送信モーダル (LINE / システム通知) */}
      {/* ===================================================================== */}
      {selectedAlertStudent && (
        <Dialog open={!!selectedAlertStudent} onOpenChange={(open) => !open && setSelectedAlertStudent(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <Badge variant="warning" className="text-xs">
                  {selectedAlertStudent.title}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedAlertStudent.studentId}
                </span>
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 pt-1">
                {selectedAlertStudent.studentName} さんへの個別フォロー
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                公的職業訓練の離脱を防ぐための声かけメッセージを送信します
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* 送信先チャネル選択 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  送信チャネル:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMessageChannel("line")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      messageChannel === "line"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>💬 LINE公式アカウント通知</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageChannel("system")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      messageChannel === "system"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-800 ring-1 ring-indigo-500"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>🔔 システム内通知のみ</span>
                  </button>
                </div>
              </div>

              {/* メッセージ本文 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  メッセージ本文:
                </label>
                <Textarea
                  rows={5}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="text-xs sm:text-sm leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  ※ LINE連携済みの受講生にはプッシュ通知が直接届きます。
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedAlertStudent(null)}
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                disabled={isSendingMessage || !messageContent.trim()}
                onClick={handleSendMessage}
              >
                {isSendingMessage ? "送信中..." : "フォローメッセージを送信"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
