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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldAlert,
  AlertTriangle,
  Send,
  FileSpreadsheet,
  PackageCheck,
  CheckCircle2,
  Clock,
  FileText,
  Award,
  Users,
  Calendar,
  Layers,
  ArrowUpRight,
  ChevronRight,
  Download,
  Building2,
  Check,
  X,
  FileCheck2,
  ExternalLink,
  Loader2,
  Bell,
  RefreshCw,
  Eye,
} from "lucide-react";

// 1. 出席率アラート受講生モックデータ (85%未満・80%未満)
const MOCK_ATTENDANCE_RISK_STUDENTS = [
  {
    id: "att-01",
    studentId: "std2026027",
    studentName: "渡辺 翔太",
    courseTitle: "DX人材育成＆Webフルスタック開発科",
    currentMonthRate: 78.5,
    totalRate: 79.2,
    absentDays: 3,
    lateDays: 2,
    status: "risk_80", // レッド判定（80%未満・給付金停止リスク）
    lineLinked: true,
  },
  {
    id: "att-02",
    studentName: "伊藤 結衣",
    studentId: "std2026019",
    courseTitle: "DX人材育成＆Webフルスタック開発科",
    currentMonthRate: 82.0,
    totalRate: 81.5,
    absentDays: 2,
    lateDays: 1,
    status: "warning_85", // イエロー判定（85%未満・注意域）
    lineLinked: true,
  },
  {
    id: "att-03",
    studentName: "中村 大樹",
    studentId: "std2026033",
    courseTitle: "Pythonデータサイエンス実践科",
    currentMonthRate: 83.5,
    totalRate: 84.0,
    absentDays: 1,
    lateDays: 3,
    status: "warning_85",
    lineLinked: false,
  },
];

// 2. 欠席・遅刻届 承認待ちモックデータ
const MOCK_PENDING_ATTENDANCE_REQUESTS = [
  {
    id: "req-01",
    studentName: "渡辺 翔太",
    studentId: "std2026027",
    date: "2026年10月05日(月)",
    type: "遅刻届 (30分)",
    reason: "JR中央線 電車遅延（遅延証明書添付あり）",
    proofDocName: "delay_certificate_jr_1005.jpg",
    hasProof: true,
    status: "pending",
  },
  {
    id: "req-02",
    studentName: "加藤 浩二",
    studentId: "std2026011",
    date: "2026年10月06日(火)",
    type: "欠席届 (終日)",
    reason: "発熱のため通院（医師診断領収書添付）",
    proofDocName: "medical_clinic_receipt_1006.pdf",
    hasProof: true,
    status: "pending",
  },
];

// 3. 検定申込 確認待ちモックデータ
const MOCK_PENDING_QUALIFICATIONS = [
  {
    id: "qual-app-01",
    studentName: "山田 太郎",
    studentId: "std2026001",
    examName: "基本情報技術者試験 (FE)",
    examDate: "2026年11月15日",
    formSubmitted: true,
    status: "pending",
  },
  {
    id: "qual-app-02",
    studentName: "佐藤 美咲",
    studentId: "std2026014",
    examName: "Webクリエイター能力認定試験",
    examDate: "2026年11月28日",
    formSubmitted: true,
    status: "pending",
  },
];

export default function SecretariatDashboardPage() {
  const { data, setData, notify } = useDemo();
  // アラート受講生一覧
  const [attendanceAlerts, setAttendanceAlerts] = useState(
    MOCK_ATTENDANCE_RISK_STUDENTS
  );
  // 承認待ち欠席届
  const pendingRequests = data.attendance.filter(r => r.status === '確認待ち').map(r => ({
    id: r.id, studentName: r.student, studentId: students.find(s => s.name === r.student)?.id || '',
    date: r.date, type: r.type, reason: r.reason, proofDocName: r.attachment?.name || '',
    hasProof: !!r.attachment, status: r.status,
  }));
  // 承認待ち検定
  const pendingQuals = data.applications.filter(a => a.status === '確認待ち').map(a => ({
    id: a.id, studentName: a.student, studentId: students.find(s => s.name === a.student)?.id || '',
    examName: data.qualifications.find(q => q.id === a.qualificationId)?.name || '',
    examDate: data.qualifications.find(q => q.id === a.qualificationId)?.date || '',
    formSubmitted: !!a.attachment, status: a.status,
  }));

  // LINE一括リマインドモーダル状態
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [lineMessageText, setLineMessageText] = useState(
    "【重要：出席率ご確認のお願い】\n事務局よりご連絡です。当月の出席率が公的基準（80%）に近づいております。体調不良等による欠席時は必ず指定の届出と証明書を提出してください。何かお困りのことがあればいつでも事務局へご相談ください。"
  );
  const [isSendingLine, setIsSendingLine] = useState(false);
  const [lineSendSuccess, setLineSendSuccess] = useState(false);

  // 一括Excel帳票出力状態
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // 一括教材発注状態
  const [isOrderingMaterials, setIsOrderingMaterials] = useState(false);
  const [materialsOrdered, setMaterialsOrdered] = useState(false);

  // 届出承認アクション
  const handleApproveRequest = (id: string) => {
    setData(state => ({...state, attendance: state.attendance.map(r => r.id === id ? {...r, status: '承認済み'} : r)}));
    notify('出欠申請を承認しました。');
  };

  const handleRejectRequest = (id: string) => {
    navigate('/secretariat/attendance');
  };

  // LINE一括送信実行
  const handleSendBatchLine = () => {
    setIsSendingLine(true);
    setTimeout(() => {
      setIsSendingLine(false);
      setIsLineModalOpen(false);
      setLineSendSuccess(true);
      setData(state => ({...state, notifications: [{id: makeId(), recipients: '出席率の要フォロー受講生', channel: 'LINE', message: lineMessageText, status: '送信プレビュー'}, ...state.notifications]}));
      notify('通知のプレビューを記録しました。実際の送信は行っていません。');
      setTimeout(() => setLineSendSuccess(false), 5000);
    }, 1200);
  };

  // 公的Excel報告書一括出力
  const handleExportReportExcel = () => { navigate("/secretariat/reports");
  };

  // 未発注教材の一括発注処理
  const handleBatchOrderMaterials = () => { navigate("/secretariat/materials");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* 画面トップバー */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md shadow-slate-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  事務局総合ポータル
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  公的事業運用・監査対応
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                事務局業務ダッシュボード（出席率判定・承認・帳票一括出力）
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="hidden sm:inline-flex text-xs px-2.5 py-1 text-slate-700 bg-slate-50">
              在籍受講生: 48名 (2クラス開講中)
            </Badge>
            <Link href="/courses/edit">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs">
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                コース設計へ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 通知バナー */}
      {lineSendSuccess && (
        <div className="max-w-7xl mx-auto px-6 pt-4 animate-in fade-in duration-200">
          <Alert className="border-emerald-300 bg-emerald-50 text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="font-bold text-sm">LINE通知完了</AlertTitle>
            <AlertDescription className="text-xs">
              出席率注意・警告対象の受講生（LINE連携済み）へ一括プッシュ通知を正常に送信しました。
            </AlertDescription>
          </Alert>
        </div>
      )}

      {exportNotice && (
        <div className="max-w-7xl mx-auto px-6 pt-4 animate-in fade-in duration-200">
          <Alert className="border-indigo-300 bg-indigo-50 text-indigo-900">
            <Download className="h-4 w-4 text-indigo-600" />
            <AlertTitle className="font-bold text-sm">帳票出力完了</AlertTitle>
            <AlertDescription className="text-xs">{exportNotice}</AlertDescription>
          </Alert>
        </div>
      )}

      {materialsOrdered && (
        <div className="max-w-7xl mx-auto px-6 pt-4 animate-in fade-in duration-200">
          <Alert className="border-emerald-300 bg-emerald-50 text-emerald-900">
            <PackageCheck className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="font-bold text-sm">発注処理完了</AlertTitle>
            <AlertDescription className="text-xs">
              未発注教材（全4件・合計48冊）の発注データを各教材取扱会社へ一括送信しました。
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* メインレイアウト (PCファースト 3カラム) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ===================================================================== */}
        {/* 1. 最上部アラート: 公的要件管理（出席率80%未満・85%未満） */}
        {/* ===================================================================== */}
        <Card className="border-amber-300/80 bg-gradient-to-r from-amber-50/70 via-red-50/40 to-white shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-amber-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-200">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                      出席率アラート管理（公的80%基準）
                    </CardTitle>
                    <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                      要対応 {attendanceAlerts.length}名
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-600">
                    通算または当月出席率が80%未満（給付金不支給・退校リスク）及び85%未満（注意域）の受講生です
                  </CardDescription>
                </div>
              </div>

              {/* LINE一括リマインド送信ボタン */}
              <Button
                onClick={() => setIsLineModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>📱 LINE一括リマインド送信</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">受講生</TableHead>
                  <TableHead>所属コース</TableHead>
                  <TableHead className="w-[120px]">当月出席率</TableHead>
                  <TableHead className="w-[140px]">通算出席率</TableHead>
                  <TableHead className="w-[130px]">欠席 / 遅刻</TableHead>
                  <TableHead className="w-[110px]">LINE連携</TableHead>
                  <TableHead className="w-[120px] text-right">個別対応</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceAlerts.map((student) => {
                  const isRedRisk = student.status === "risk_80";
                  return (
                    <TableRow key={student.id} className="hover:bg-amber-50/40 transition-colors">
                      <TableCell className="font-semibold text-slate-900">
                        <div className="text-sm">{student.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {student.studentId}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        {student.courseTitle}
                      </TableCell>

                      <TableCell>
                        <span className="font-bold text-xs font-mono">
                          {student.currentMonthRate}%
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black text-sm font-mono ${
                              isRedRisk ? "text-red-600" : "text-amber-600"
                            }`}
                          >
                            {student.totalRate}%
                          </span>
                          <Badge
                            variant={isRedRisk ? "destructive" : "warning"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {isRedRisk ? "80%未満危険" : "85%未満注意"}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        欠席 {student.absentDays}日 / 遅刻 {student.lateDays}回
                      </TableCell>

                      <TableCell>
                        {student.lineLinked ? (
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                            ✓ 連携済
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            未連携
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2.5 border-slate-300"
                          onClick={() => navigate("/secretariat/attendance")}
                        >
                          詳細確認
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ===================================================================== */}
        {/* 2カラム構成 (左: 承認ワークフロー / 右: 業務自動化＆ナビゲーション) */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ================================================================= */}
          {/* 【左側 8カラム】承認ワークフロー（公的出席証明書 ＆ 検定申込） */}
          {/* ================================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* 欠席・遅刻届 承認待ちワークフロー */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/70 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <CardTitle className="text-base font-bold text-slate-900">
                      公的欠席・遅刻届 承認待ちワークフロー
                    </CardTitle>
                  </div>
                  <Badge variant="default" className="bg-indigo-600 text-xs">
                    {pendingRequests.length}件 承認待ち
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  公的職業訓練の出席率認定基準に基づき、添付証明書（遅延証・診断書等）を確認して承認・却下します
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {req.studentName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({req.studentId})
                        </span>
                        <Badge variant="outline" className="text-xs text-indigo-700 bg-indigo-50 border-indigo-200">
                          {req.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        対象日: {req.date}
                      </span>
                    </div>

                    {/* 理由および証明書類 */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
                      <div className="text-slate-800">
                        <strong className="text-slate-700">理由:</strong> {req.reason}
                      </div>
                      {req.hasProof && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-600 flex items-center gap-1 font-mono text-[11px]">
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                            添付証明書: {req.proofDocName}
                          </span>
                          <button
                            onClick={() => navigate("/secretariat/attendance")}
                            className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            確認
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 承認 / 却下ボタン */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 text-slate-600 border-slate-300"
                        onClick={() => handleRejectRequest(req.id)}
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        却下・再提出依頼
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-4"
                        onClick={() => handleApproveRequest(req.id)}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        公認出席として承認
                      </Button>
                    </div>
                  </div>
                ))}

                {pendingRequests.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                    現在、確認待ちの届出書類はありません。
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 検定・目標資格 申込確認待ち */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/70 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <CardTitle className="text-base font-bold text-slate-900">
                      目標資格・検定申込 確認待ち
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {pendingQuals.length}件 確認待ち
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-3">
                {pendingQuals.map((qual) => (
                  <div
                    key={qual.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {qual.studentName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({qual.studentId})
                        </span>
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {qual.examName}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        試験実施予定日: {qual.examDate} | 指定申込用紙アップロード済
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 font-semibold"
                        onClick={() => {
                          setData(state => ({...state, applications: state.applications.map(a => a.id === qual.id ? {...a, status: "受理済み"} : a)}));
                          navigate("/secretariat/qualifications");
                        }}
                      >
                        名簿承認
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ================================================================= */}
          {/* 【右側 4カラム】業務自動化クイックアクション ＆ メニュー導線 */}
          {/* ================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* クイックアクション（業務自動化） */}
            <Card className="border-indigo-100 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-purple-50/60 pb-3 border-b border-indigo-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  公的業務・一括自動化
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Excel公的申請様式の一括出力や教材発注処理
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5">
                {/* 1. 月次訓練実施状況報告書 一括Excel出力 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      公的指定様式 (Excel)
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-white text-slate-600">
                      月次提出用
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    全受講生の日別出席実績・欠席時間・カリキュラム消化状況を集計し、都道府県労働局指定Excelを出力します。
                  </p>
                  <Button
                    onClick={handleExportReportExcel}
                    disabled={isExportingExcel}
                    className="w-full text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    {isExportingExcel ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Excel集計・生成中...
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>月次実施状況報告書(Excel) 一括出力</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* 2. 未発注教材の一括発注処理 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      教材発注マネージャー
                    </span>
                    <Badge variant="warning" className="text-[10px]">
                      未発注 48冊
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    次月開講コースで使用する公式テキストを各出版取次店へ一括FAX/EDI発注データ生成します。
                  </p>
                  <Button
                    onClick={handleBatchOrderMaterials}
                    disabled={isOrderingMaterials}
                    className="w-full text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    {isOrderingMaterials ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        発注データ送信中...
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>未発注教材の一括発注処理を実行</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ナビゲーション導線（管理メニュー一覧） */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  管理メニュー・業務導線
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 space-y-1 text-xs">
                <Link
                  href="/courses/edit"
                  className="p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>コース統合設計（基本情報・科目シラバス・日別計画・就職支援）</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/courses/edit"
                  className="w-full p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>日別訓練カリキュラム計画 (【タブ3】同時編集・科目連動)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <button
                  onClick={() => navigate("/secretariat/materials")}
                  className="w-full p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <PackageCheck className="w-4 h-4 text-indigo-600" />
                    <span>使用教材・発注先仕入先管理</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigate("/secretariat/qualifications")}
                  className="w-full p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>目標資格・検定申込＆合否管理</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigate("/secretariat/career")}
                  className="w-full p-2.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>就職支援体制・キャリア相談管理</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* ===================================================================== */}
      {/* LINE一括リマインド送信モーダル */}
      {/* ===================================================================== */}
      {isLineModalOpen && (
        <Dialog open={isLineModalOpen} onOpenChange={setIsLineModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="warning" className="text-xs">
                  対象: 出席率85%未満の受講生 (2名)
                </Badge>
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 pt-1">
                LINE公式アカウント一括プッシュ通知
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                出席率が公的基準（80%）を下回るリスクのある受講生へ、LINE公式アカウントから注意喚起メッセージを直接配信します。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  送信対象受講生:
                </label>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-800">
                  <div className="flex justify-between">
                    <span>・渡辺 翔太 (出席率: 79.2% / レッド)</span>
                    <span className="text-emerald-700 font-semibold">LINE連携済</span>
                  </div>
                  <div className="flex justify-between">
                    <span>・伊藤 結衣 (出席率: 81.5% / イエロー)</span>
                    <span className="text-emerald-700 font-semibold">LINE連携済</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  配信メッセージ本文 (編集可能):
                </label>
                <Textarea
                  rows={5}
                  value={lineMessageText}
                  onChange={(e) => setLineMessageText(e.target.value)}
                  className="text-xs sm:text-sm leading-relaxed"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setIsLineModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                disabled={isSendingLine}
                onClick={handleSendBatchLine}
              >
                {isSendingLine ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    LINE一括送信中...
                  </>
                ) : (
                  "LINEプッシュ通知を一括送信"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
