"use client";

import React, { useState, useMemo } from "react";
import Link from "@/components/navigation/Link";
import { usePreviewState } from "@/src/demo/store";
import CsvImport, { type ImportedStudent } from "@/src/features/csv-import";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Cpu,
  History,
  Settings,
  Database,
  Search,
  Filter,
  UserPlus,
  Upload,
  Download,
  Trash2,
  RotateCcw,
  Key,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sparkles,
  ArrowRight,
  Eye,
  FileCode,
  Lock,
  Save,
  Loader2,
  MessageSquare,
  Activity,
  HardDrive,
  RefreshCw,
  ExternalLink,
  Sliders,
  Check,
  X,
  FileSpreadsheet,
} from "lucide-react";

// =============================================================================
// 型定義 (02_ARCHITECTURE.md & 03_DATA_SCHEMA.md 準拠)
// =============================================================================

// ユーザーロール
type UserRole = "student" | "instructor" | "secretariat" | "sysadmin";
type UserStatus = "active" | "inactive" | "soft_deleted";

interface ManagedUser {
  id: string;
  uniqueLoginId: string; // 受講生ID or 職員ID
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string;
  deletedAt?: string;
}

// 監査ログ
interface AuditLogEntry {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  operatorRole: UserRole;
  operationType: "INSERT" | "UPDATE" | "DELETE" | "SOFT_DELETE";
  targetTable: string;
  recordId: string;
  summary: string;
  clientIp: string;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
}

// =============================================================================
// モックデータ定義
// =============================================================================

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "u-01",
    uniqueLoginId: "admin_master",
    name: "田中 健一（統括管理者）",
    email: "sysadmin@system.local",
    role: "sysadmin",
    status: "active",
    createdAt: "2026-04-01",
    lastLoginAt: "本日 08:35",
  },
  {
    id: "u-02",
    uniqueLoginId: "sec_sato",
    name: "佐藤 恵美（事務局リーダー）",
    email: "sato.sec@system.local",
    role: "secretariat",
    status: "active",
    createdAt: "2026-04-01",
    lastLoginAt: "本日 08:20",
  },
  {
    id: "u-03",
    uniqueLoginId: "inst_sasaki",
    name: "佐々木 慎太郎（専任講師）",
    email: "sasaki.sensei@system.local",
    role: "instructor",
    status: "active",
    createdAt: "2026-04-15",
    lastLoginAt: "昨日 18:40",
  },
  {
    id: "u-04",
    uniqueLoginId: "std2026001",
    name: "山田 太郎",
    email: "std2026001@student.local.system",
    role: "student",
    status: "active",
    createdAt: "2026-09-01",
    lastLoginAt: "本日 08:15",
  },
  {
    id: "u-05",
    uniqueLoginId: "std2026002",
    name: "佐藤 美咲",
    email: "std2026002@student.local.system",
    role: "student",
    status: "active",
    createdAt: "2026-09-01",
    lastLoginAt: "本日 07:50",
  },
  {
    id: "u-06",
    uniqueLoginId: "std2026027",
    name: "渡辺 翔太",
    email: "std2026027@student.local.system",
    role: "student",
    status: "active",
    createdAt: "2026-09-01",
    lastLoginAt: "3日前",
  },
  {
    id: "u-07",
    uniqueLoginId: "inst_suzuki",
    name: "鈴木 裕太（非常勤講師）",
    email: "suzuki.inst@system.local",
    role: "instructor",
    status: "inactive",
    createdAt: "2026-05-10",
    lastLoginAt: "2026-08-30",
  },
  {
    id: "u-08",
    uniqueLoginId: "std2025099",
    name: "高橋 健司（修了生・退学）",
    email: "std2025099@student.local.system",
    role: "student",
    status: "soft_deleted",
    createdAt: "2025-10-01",
    lastLoginAt: "2026-02-14",
    deletedAt: "2026-03-01 11:20 (事務局 理由: 自己都合退校)",
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-101",
    timestamp: "2026-10-06 08:32:15",
    operatorId: "u-01",
    operatorName: "田中 健一",
    operatorRole: "sysadmin",
    operationType: "UPDATE",
    targetTable: "course_subjects",
    recordId: "sub-5",
    summary: "科目「React＆Next.jsフルスタック開発」配当時間を140hから150hへ変更",
    clientIp: "192.168.10.42",
    beforeData: { id: "sub-5", hours: 140.0, updatedAt: "2026-10-05 17:00" },
    afterData: { id: "sub-5", hours: 150.0, updatedAt: "2026-10-06 08:32" },
  },
  {
    id: "log-102",
    timestamp: "2026-10-06 08:24:50",
    operatorId: "u-02",
    operatorName: "佐藤 恵美",
    operatorRole: "secretariat",
    operationType: "UPDATE",
    targetTable: "daily_curriculums",
    recordId: "dc-04",
    summary: "日別カリキュラム 2026-09-04 を在宅訓練からスクーリングに変更",
    clientIp: "192.168.10.18",
    beforeData: { locationType: "at_home", startTime: "", endTime: "" },
    afterData: { locationType: "schooling", startTime: "09:30", endTime: "16:30" },
  },
  {
    id: "log-103",
    timestamp: "2026-10-06 08:12:00",
    operatorId: "u-02",
    operatorName: "佐藤 恵美",
    operatorRole: "secretariat",
    operationType: "INSERT",
    targetTable: "student_attendances",
    recordId: "att-20261005-01",
    summary: "渡辺 翔太の遅延届（30分遅刻・JR遅延証明書添付）を公認承認",
    clientIp: "192.168.10.18",
    beforeData: undefined,
    afterData: { status: "approved", approvedBy: "u-02", proofVerified: true },
  },
  {
    id: "log-104",
    timestamp: "2026-10-05 16:45:22",
    operatorId: "u-03",
    operatorName: "佐々木 慎太郎",
    operatorRole: "instructor",
    operationType: "UPDATE",
    targetTable: "microlearning_submissions",
    recordId: "subm-882",
    summary: "課題「Next.js Route Handler実装」AI一次採点を最終承認（95点）",
    clientIp: "192.168.10.29",
    beforeData: { aiScore: 92, status: "ai_graded", instructorFeedback: "" },
    afterData: { finalScore: 95, status: "approved", instructorFeedback: "素晴らしいエラーハンドリングです" },
  },
  {
    id: "log-105",
    timestamp: "2026-10-05 14:10:05",
    operatorId: "u-01",
    operatorName: "田中 健一",
    operatorRole: "sysadmin",
    operationType: "SOFT_DELETE",
    targetTable: "users",
    recordId: "std2025099",
    summary: "受講生アカウント「高橋 健司」を公的保管基準に基づき論理削除",
    clientIp: "192.168.10.42",
    beforeData: { isDeleted: false, status: "active" },
    afterData: { isDeleted: true, status: "soft_deleted", deletedAt: "2026-10-05 14:10:05" },
  },
];

export default function SysAdminDashboardPage({ initialTab = "users" }: { initialTab?: "users" | "audit" | "ai" | "system" } = {}) {
  const [activeTab, setActiveTab] = useState<"users" | "audit" | "ai" | "system">(initialTab);

  // ===========================================================================
  // 【タブ1】ユーザー管理状態
  // ===========================================================================
  const [users, setUsers] = usePreviewState<ManagedUser[]>("managedUsers", INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // モーダル状態
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  // 新規ユーザー入力
  const [newUserName, setNewUserName] = useState("");
  const [newUserLoginId, setNewUserLoginId] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("student");
  const [newTargetRole, setNewTargetRole] = useState<UserRole>("student");

  // ===========================================================================
  // 【タブ2】監査ログ状態
  // ===========================================================================
  const [auditLogs, setAuditLogs] = usePreviewState<AuditLogEntry[]>("auditLogs", INITIAL_AUDIT_LOGS);
  const [onlyDeletedFilter, setOnlyDeletedFilter] = useState(false);
  const [selectedDiffLog, setSelectedDiffLog] = useState<AuditLogEntry | null>(null);

  // ===========================================================================
  // 【タブ3】AI Tutor / LLM 設定状態
  // ===========================================================================
  const [aiSystemPrompt, setAiSystemPrompt] = useState(
    `あなたは公的職業訓練LMSの専任AIチューター「ナビちゃん」です。
受講生がプログラミングやIT技術でつまずいた際、直接の答えを教えるのではなく「ソクラテス式問答法」を用いて、受講生自らが思考し解法に辿り着けるよう段階的なヒントと励ましを提供してください。

【厳格ルール】
1. クイズの正解選択肢やソースコードの模範解答を直接出力してはならない。
2. 受講生のコード内の構文エラーや思考の誤り箇所を、質問形式で問いかけること。
3. 受講生が自信をなくした際は、親身で前向きなフィードバックを与えること。
4. 公的職業訓練の学習時間・日次進捗を尊重し、学習再開を後押しすること。`
  );
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [dailyTokenLimit, setDailyTokenLimit] = useState(50000);
  const [isAiSaved, setIsAiSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // ===========================================================================
  // 【タブ4】システム共通設定状態
  // ===========================================================================
  const [logRetentionDays, setLogRetentionDays] = useState(1825); // 5年間 (公的保存義務基準)
  const [lineNotificationEnabled, setLineNotificationEnabled] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // ===========================================================================
  // ユーザーフィルタリング
  // ===========================================================================
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.uniqueLoginId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // 監査ログフィルタリング (論理削除抽出トグル)
  const filteredAuditLogs = useMemo(() => {
    if (onlyDeletedFilter) {
      return auditLogs.filter(
        (l) => l.operationType === "DELETE" || l.operationType === "SOFT_DELETE"
      );
    }
    return auditLogs;
  }, [auditLogs, onlyDeletedFilter]);

  // ===========================================================================
  // ユーザー管理ハンドラー
  // ===========================================================================
  const handleOpenRoleModal = (user: ManagedUser) => {
    setSelectedUser(user);
    setNewTargetRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleSaveRoleChange = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, role: newTargetRole } : u
      )
    );
    // 監査ログに追記
    const newAuditLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      operatorId: "u-01",
      operatorName: "田中 健一",
      operatorRole: "sysadmin",
      operationType: "UPDATE",
      targetTable: "users",
      recordId: selectedUser.id,
      summary: `ユーザー「${selectedUser.name}」のロールを ${selectedUser.role} から ${newTargetRole} に変更`,
      clientIp: "192.168.10.42",
      beforeData: { role: selectedUser.role },
      afterData: { role: newTargetRole },
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);

    setIsRoleModalOpen(false);
    setNotification(`ユーザー「${selectedUser.name}」の権限を変更しました。`);
    setTimeout(() => setNotification(null), 4000);
  };

  // アカウント無効化 / 有効化トグル
  const handleToggleUserStatus = (user: ManagedUser) => {
    const nextStatus: UserStatus = user.status === "active" ? "inactive" : "active";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
    setNotification(
      `ユーザー「${user.name}」を${nextStatus === "active" ? "有効化" : "停止"}しました。`
    );
    setTimeout(() => setNotification(null), 3000);
  };

  // 論理削除（Soft Delete）
  const handleSoftDeleteUser = (user: ManagedUser) => {
    if (
      !confirm(
        `ユーザー「${user.name}」を論理削除しますか？\n（物理データは消去されず、監査・受講実績データとして保持されます）`
      )
    ) {
      return;
    }

    const nowStr = new Date().toLocaleString() + " (SysAdmin操作)";
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: "soft_deleted", deletedAt: nowStr }
          : u
      )
    );

    // 監査ログ記録
    const newAuditLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      operatorId: "u-01",
      operatorName: "田中 健一",
      operatorRole: "sysadmin",
      operationType: "SOFT_DELETE",
      targetTable: "users",
      recordId: user.id,
      summary: `受講生・アカウント「${user.name} (${user.uniqueLoginId})」を論理削除`,
      clientIp: "192.168.10.42",
      beforeData: { status: user.status, isDeleted: false },
      afterData: { status: "soft_deleted", isDeleted: true, deletedAt: nowStr },
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);

    setNotification(`ユーザー「${user.name}」を論理削除しました。`);
    setTimeout(() => setNotification(null), 4000);
  };

  // 論理削除からの復元 (Restore)
  const handleRestoreUser = (user: ManagedUser) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: "active", deletedAt: undefined }
          : u
      )
    );
    setNotification(`ユーザー「${user.name}」のアカウントを復元しました。`);
    setTimeout(() => setNotification(null), 3000);
  };

  // 新規ユーザー追加
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserLoginId.trim()) return;
    if (users.some(user => user.uniqueLoginId.toLowerCase() === newUserLoginId.trim().toLowerCase())) {
      setNotification('このログインIDは既に登録されています。別のIDを指定してください。');
      return;
    }

    const email =
      newUserRole === "student"
        ? `${newUserLoginId.trim().toLowerCase()}@student.local.system`
        : `${newUserLoginId.trim().toLowerCase()}@system.local`;

    const newUser: ManagedUser = {
      id: `u-${Date.now()}`,
      uniqueLoginId: newUserLoginId.trim(),
      name: newUserName.trim(),
      email,
      role: newUserRole,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastLoginAt: "未ログイン",
    };

    setUsers((prev) => [newUser, ...prev]);

    // 監査ログ
    const newAuditLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      operatorId: "u-01",
      operatorName: "田中 健一",
      operatorRole: "sysadmin",
      operationType: "INSERT",
      targetTable: "users",
      recordId: newUser.id,
      summary: `新規アカウント「${newUser.name}（${newUser.uniqueLoginId} / ${newUser.role}）」を発行`,
      clientIp: "192.168.10.42",
      afterData: { ...newUser },
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);

    setNewUserName("");
    setNewUserLoginId("");
    setIsNewUserModalOpen(false);
    setNotification(`新規アカウント「${newUser.name}」を発行しました。`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleImportCsv = (rows: ImportedStudent[]) => {
    const importedUsers: ManagedUser[] = rows.map(row => ({
      id: crypto.randomUUID(), uniqueLoginId: row.loginId, name: row.name,
      email: `${row.loginId.toLowerCase()}@student.local.system`, role: 'student',
      status: 'active', createdAt: '2026-10-12', lastLoginAt: '未ログイン',
    }));
    setUsers(previous => [...importedUsers, ...previous]);
    setIsCsvImportModalOpen(false);
    setNotification(`${rows.length}名のデモアカウントを一覧に追加しました。`);
  };

  // 監査ログCSVエクスポートシミュレーション
  const handleExportAuditLogs = () => {
    const csvContent =
      "日時,操作者,権限,操作種別,対象テーブル,変更内容,アクセスIP\n" +
      filteredAuditLogs
        .map(
          (l) =>
            `"${l.timestamp}","${l.operatorName}","${l.operatorRole}","${l.operationType}","${l.targetTable}","${l.summary}","${l.clientIp}"`
        )
        .join("\n");

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `audit_logs_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification("公的監査提出用ログCSV（UTF-8 BOM付き）を出力しました。");
    setTimeout(() => setNotification(null), 4000);
  };

  // 手動バックアップ作成シミュレーション
  const handleTriggerManualBackup = async () => {
    setIsCreatingBackup(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsCreatingBackup(false);
    setNotification("バックアップ実行後のデモ表示を確認しました。実際のDB操作は行っていません。");
    setTimeout(() => setNotification(null), 4000);
  };

  // AI設定保存
  const handleSaveAiSettings = () => {
    setIsAiSaved(true);
    setTimeout(() => {
      setIsAiSaved(false);
      setNotification("AI Tutor / LLM設定を安全に更新しました。");
      setTimeout(() => setNotification(null), 3000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28">
      {/* ===================================================================== */}
      {/* 画面トップバー */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white px-6 py-3.5 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/secretariat/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2.5 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                <span>事務局ダッシュボードへ</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  SysAdmin 最高権限コンソール
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  公的セキュリティ・監査基準準拠
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                システム総合管理 ＆ セキュリティ監査ダッシュボード
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden md:flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono">田中 健一 (SysAdmin)</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 text-[11px]">IP: 192.168.10.42</span>
            </div>
          </div>
        </div>
      </header>

      {/* 通知トースト */}
      {notification && (
        <div className="max-w-7xl mx-auto px-6 pt-4 animate-in fade-in duration-200">
          <Alert className="border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="font-bold text-sm">システム更新完了</AlertTitle>
            <AlertDescription className="text-xs">{notification}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 【要件1】システム全体ステータスサマリー（4枚のカード） */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* カード1: アクティブユーザー数 */}
          <Card className="border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-shadow">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-600">
                アクティブユーザー数
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-black text-slate-900 font-mono">
                142<span className="text-xs font-normal text-slate-500 ml-1">名</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  オンライン 28名
                </span>
                <span>受講生120 / 職員22</span>
              </div>
            </CardContent>
          </Card>

          {/* カード2: AI利用トークン量 */}
          <Card className="border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-shadow">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-600">
                AI利用トークン消化状況
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Cpu className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-black text-slate-900 font-mono">
                1.48M<span className="text-xs font-normal text-slate-500 ml-1">/ 3.0M</span>
              </div>
              <div className="space-y-1 mt-1 pt-1 border-t border-slate-100">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>月間枠の49.4%消費</span>
                  <span className="font-semibold text-purple-700">API正常 3,420call</span>
                </div>
                <Progress value={49.4} className="h-1.5" indicatorClassName="bg-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* カード3: 監査ログアラート */}
          <Card className="border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-shadow">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-600">
                監査ログアラート (24h)
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <History className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-black text-emerald-600 font-mono">
                0<span className="text-xs font-normal text-slate-500 ml-1">件の重大検知</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-2 border-t border-slate-100">
                <span className="text-slate-700 font-medium">更新・削除 24件記録</span>
                <span className="text-emerald-600 font-bold">全ログ改竄なし ✓</span>
              </div>
            </CardContent>
          </Card>

          {/* カード4: システム稼働状態 */}
          <Card className="border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-shadow">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-600">
                システム稼働状態 ＆ RLS
              </CardTitle>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Activity className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-black text-indigo-900 font-mono">
                99.98%<span className="text-xs font-normal text-slate-500 ml-1">稼働率</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-2 border-t border-slate-100">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-bold">
                  RLS 14テーブル有効
                </Badge>
                <span className="text-[10px] text-slate-400">PITR 12分前同期</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 【要件2】4つの主要管理タブ */}
      {/* ===================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-slate-200/90 p-1 w-full max-w-3xl grid grid-cols-4 h-11 mb-6 rounded-xl shadow-xs">
            <TabsTrigger
              value="users"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>① ユーザー・権限管理</span>
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <History className="w-4 h-4" />
              <span>② 監査ログ・履歴</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <Bot className="w-4 h-4" />
              <span>③ AI Tutor / LLM設定</span>
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span>④ システム設定＆RLS</span>
            </TabsTrigger>
          </TabsList>

          {/* ================================================================= */}
          {/* 【タブ1】ユーザー・アカウント権限管理 */}
          {/* ================================================================= */}
          <TabsContent value="users" className="space-y-4 focus-visible:outline-none">
            {/* 操作ツールバー (検索・絞り込み・新規発行・CSVインポート) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* 検索入力 */}
                <div className="relative min-w-[240px] flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    placeholder="氏名、ユーザーID、メールアドレスで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                {/* ロール絞り込み */}
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 w-36 text-xs font-semibold"
                >
                  <option value="all">全ロール</option>
                  <option value="student">🎓 受講生 (student)</option>
                  <option value="instructor">👨‍🏫 講師 (instructor)</option>
                  <option value="secretariat">🏢 事務局 (secretariat)</option>
                  <option value="sysadmin">🛡 SysAdmin</option>
                </Select>

                {/* ステータス絞り込み */}
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 w-36 text-xs font-semibold"
                >
                  <option value="all">全ステータス</option>
                  <option value="active">🟢 有効</option>
                  <option value="inactive">⚪ 停止中</option>
                  <option value="soft_deleted">🔴 論理削除済</option>
                </Select>
              </div>

              {/* 右側アクション */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setIsCsvImportModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 border-slate-300 font-semibold"
                >
                  <Upload className="w-3.5 h-3.5 mr-1 text-slate-600" />
                  一括CSVインポート
                </Button>
                <Button
                  onClick={() => setIsNewUserModalOpen(true)}
                  size="sm"
                  className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  アカウント新規発行
                </Button>
              </div>
            </div>

            {/* ユーザー一覧テーブル */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3 w-12 text-center border-r border-slate-200">#</th>
                      <th className="p-3 min-w-[180px] border-r border-slate-200">氏名</th>
                      <th className="p-3 w-36 border-r border-slate-200">独自ユーザーID</th>
                      <th className="p-3 min-w-[200px] border-r border-slate-200">認証メールアドレス</th>
                      <th className="p-3 w-28 text-center border-r border-slate-200">付与ロール</th>
                      <th className="p-3 w-24 text-center border-r border-slate-200">状態</th>
                      <th className="p-3 w-28 border-r border-slate-200">最終ログイン</th>
                      <th className="p-3 w-40 text-center">権限・アカウント操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user, idx) => {
                      const isDeleted = user.status === "soft_deleted";

                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isDeleted ? "bg-rose-50/30 text-slate-400" : ""
                          }`}
                        >
                          <td className="p-3 text-center text-slate-400 font-mono border-r border-slate-100">
                            {idx + 1}
                          </td>

                          {/* 氏名 */}
                          <td className="p-3 border-r border-slate-100">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`font-bold ${
                                  isDeleted ? "line-through text-slate-400" : "text-slate-900"
                                }`}
                              >
                                {user.name}
                              </span>
                              {user.role === "sysadmin" && (
                                <Badge className="bg-amber-100 text-amber-800 text-[9px] px-1 py-0 font-bold">
                                  最高権限
                                </Badge>
                              )}
                            </div>
                            {user.deletedAt && (
                              <p className="text-[10px] text-rose-600 mt-0.5">
                                削除記録: {user.deletedAt}
                              </p>
                            )}
                          </td>

                          {/* 独自ID */}
                          <td className="p-3 border-r border-slate-100 font-mono font-semibold text-slate-800">
                            {user.uniqueLoginId}
                          </td>

                          {/* メール */}
                          <td className="p-3 border-r border-slate-100 font-mono text-slate-600">
                            {user.email}
                          </td>

                          {/* ロール */}
                          <td className="p-3 text-center border-r border-slate-100">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 font-bold ${
                                user.role === "sysadmin"
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : user.role === "secretariat"
                                  ? "bg-blue-50 text-blue-700 border-blue-300"
                                  : user.role === "instructor"
                                  ? "bg-purple-50 text-purple-700 border-purple-300"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-300"
                              }`}
                            >
                              {user.role === "sysadmin"
                                ? "SysAdmin"
                                : user.role === "secretariat"
                                ? "事務局"
                                : user.role === "instructor"
                                ? "講師"
                                : "受講生"}
                            </Badge>
                          </td>

                          {/* 状態 */}
                          <td className="p-3 text-center border-r border-slate-100">
                            {user.status === "active" ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                🟢 有効
                              </Badge>
                            ) : user.status === "inactive" ? (
                              <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-[10px]">
                                ⚪ 停止
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">
                                🔴 論理削除
                              </Badge>
                            )}
                          </td>

                          {/* 最終ログイン */}
                          <td className="p-3 border-r border-slate-100 text-slate-500 font-mono text-[11px]">
                            {user.lastLoginAt}
                          </td>

                          {/* 操作ボタン */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              {/* ロール変更 */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenRoleModal(user)}
                                disabled={isDeleted}
                                className="h-7 px-2 text-[10px] font-semibold"
                                title="権限ロールを変更"
                              >
                                ロール変更
                              </Button>

                              {/* 有効/停止トグル */}
                              {!isDeleted && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(user)}
                                  className="h-7 px-1.5 text-[10px] text-slate-600 hover:text-slate-900"
                                  title={user.status === "active" ? "利用を一時停止" : "利用を再開"}
                                >
                                  {user.status === "active" ? "停止" : "再開"}
                                </Button>
                              )}

                              {/* 論理削除 / 復元 */}
                              {isDeleted ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestoreUser(user)}
                                  className="h-7 px-2 text-[10px] text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-bold"
                                  title="論理削除されたアカウントを復元"
                                >
                                  <RotateCcw className="w-3 h-3 mr-0.5" />
                                  復元
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSoftDeleteUser(user)}
                                  disabled={user.role === "sysadmin"}
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                                  title="論理削除 (Soft Delete)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ================================================================= */}
          {/* 【タブ2】公的監査ログ・変更履歴（Audit Logs） */}
          {/* ================================================================= */}
          <TabsContent value="audit" className="space-y-4 focus-visible:outline-none">
            {/* 監査ログツールバー */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-600" />
                    公的認定・データ操作監査ログ（改竄防止・全件追跡）
                  </h3>
                  <p className="text-xs text-slate-500">
                    労働局実地調査および個人情報保護規定に基づき、すべての操作履歴を5年間保存します
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* 論理削除データの抽出トグル */}
                <div className="flex items-center space-x-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Switch
                    checked={onlyDeletedFilter}
                    onCheckedChange={setOnlyDeletedFilter}
                  />
                  <label className="text-xs font-bold text-slate-700 cursor-pointer">
                    削除・変更レコードのみ抽出
                  </label>
                </div>

                {/* CSVエクスポート */}
                <Button
                  onClick={handleExportAuditLogs}
                  size="sm"
                  className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>監査提出用データ (CSV) 出力</span>
                </Button>
              </div>
            </div>

            {/* 監査ログテーブル */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3 w-36 border-r border-slate-200">日時</th>
                      <th className="p-3 w-40 border-r border-slate-200">操作者</th>
                      <th className="p-3 w-24 text-center border-r border-slate-200">操作種別</th>
                      <th className="p-3 w-36 border-r border-slate-200">対象テーブル</th>
                      <th className="p-3 min-w-[280px] border-r border-slate-200">操作サマリー・変更内容</th>
                      <th className="p-3 w-28 border-r border-slate-200">クライアントIP</th>
                      <th className="p-3 w-24 text-center">JSON差分</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 border-r border-slate-100 font-mono text-slate-600 text-[11px]">
                          {log.timestamp}
                        </td>

                        {/* 操作者 */}
                        <td className="p-3 border-r border-slate-100">
                          <div className="font-bold text-slate-900">{log.operatorName}</div>
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 text-slate-500 border-slate-200"
                          >
                            {log.operatorRole}
                          </Badge>
                        </td>

                        {/* 種別 */}
                        <td className="p-3 text-center border-r border-slate-100">
                          <Badge
                            className={`text-[10px] font-bold px-2 py-0.5 ${
                              log.operationType === "INSERT"
                                ? "bg-emerald-600 text-white"
                                : log.operationType === "UPDATE"
                                ? "bg-blue-600 text-white"
                                : log.operationType === "SOFT_DELETE"
                                ? "bg-rose-600 text-white"
                                : "bg-red-700 text-white"
                            }`}
                          >
                            {log.operationType}
                          </Badge>
                        </td>

                        {/* 対象テーブル */}
                        <td className="p-3 border-r border-slate-100 font-mono font-bold text-slate-800">
                          {log.targetTable}
                        </td>

                        {/* サマリー */}
                        <td className="p-3 border-r border-slate-100 text-slate-800 font-medium leading-relaxed">
                          {log.summary}
                        </td>

                        {/* IP */}
                        <td className="p-3 border-r border-slate-100 font-mono text-slate-500 text-[11px]">
                          {log.clientIp}
                        </td>

                        {/* 差分表示ボタン */}
                        <td className="p-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDiffLog(log)}
                            className="h-7 px-2 text-[10px] font-semibold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                          >
                            <FileCode className="w-3 h-3 mr-1" />
                            差分確認
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ================================================================= */}
          {/* 【タブ3】AI Tutor / LLM 設定 */}
          {/* ================================================================= */}
          <TabsContent value="ai" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 左ペイン: システムプロンプト設定 (8カラム) */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      AI Tutor「ナビちゃん」基本システムプロンプト設定
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      マイクロラーニング受講時に受講生を導くソクラテス式AIチューターの思考方針を定義します
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          システム命令 (System Instruction):
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {aiSystemPrompt.length} 文字
                        </span>
                      </div>
                      <Textarea
                        rows={12}
                        value={aiSystemPrompt}
                        onChange={(e) => setAiSystemPrompt(e.target.value)}
                        className="text-xs sm:text-sm font-mono leading-relaxed"
                      />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        公的職業訓練におけるAI回答制限ポリシー:
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        「100点必須クイズ」および修了考査においては、直接の正解の漏洩を防ぐため、プロンプトインジェクション対策およびソクラテス式ヒント提供が強制されます。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 右ペイン: LLMモデル & トークンレート制限 (4カラム) */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      LLMモデル ＆ 利用制限設定
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 text-xs">
                    {/* モデル選択 */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">稼働LLMモデル:</label>
                      <Select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="h-10 text-xs font-semibold"
                      >
                        <option value="gemini-2.5-flash">⚡ Gemini 2.5 Flash (推奨・超高速)</option>
                        <option value="gemini-2.5-pro">🧠 Gemini 2.5 Pro (高精度・課題採点向)</option>
                        <option value="gemini-1.5-pro">💎 Gemini 1.5 Pro</option>
                      </Select>
                      <p className="text-[10px] text-slate-500">
                        ※AI Studio環境では server-side route 経由で最適モデルが安全に呼び出されます。
                      </p>
                    </div>

                    {/* APIキー管理 */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label className="font-bold text-slate-700 block flex items-center justify-between">
                        <span>Gemini API Key ステータス:</span>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[9px] font-bold">
                          接続正常 🟢
                        </Badge>
                      </label>
                      <div className="relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          readOnly
                          value="AIzaSyB_STUDIO_MANAGED_KEY_SECRET"
                          className="font-mono text-xs h-9 bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-[10px]"
                        >
                          {showApiKey ? "伏字" : "表示"}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        ※環境変数 GEMINI_API_KEY より自動インジェクト中
                      </p>
                    </div>

                    {/* 1日あたりトークン制限 */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label className="font-bold text-slate-700 block">
                        受講生1人あたりの1日利用上限 (Tokens):
                      </label>
                      <Input
                        type="number"
                        step="5000"
                        value={dailyTokenLimit}
                        onChange={(e) => setDailyTokenLimit(Number(e.target.value))}
                        className="font-mono font-bold text-xs h-9"
                      />
                      <p className="text-[10px] text-slate-500">
                        上限到達時は丁寧な学習リフレッシュ促進メッセージを返却します。
                      </p>
                    </div>

                    {/* 設定保存ボタン */}
                    <div className="pt-3">
                      <Button
                        onClick={handleSaveAiSettings}
                        disabled={isAiSaved}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 shadow-sm"
                      >
                        {isAiSaved ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            設定を適用中...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5 mr-1.5" />
                            AI設定を保存・即時反映
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ================================================================= */}
          {/* 【タブ4】システム共通設定 & ヘルスチェック */}
          {/* ================================================================= */}
          <TabsContent value="system" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. RLS (Row Level Security) ポリシー監査状態 */}
              <Card className="border-slate-200 bg-white shadow-2xs">
                <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      PostgreSQL / RLS ポリシー同期状況
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      マルチテナント・4権限マトリクスに基づく行単位アクセス制御
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-bold text-xs">
                    全14テーブル適合
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 space-y-3 text-xs">
                  <div className="space-y-2">
                    {[
                      { name: "users (ユーザー・アカウント)", rls: true, roleCheck: "sysadmin / self" },
                      { name: "courses (訓練コースマスター)", rls: true, roleCheck: "secretariat / sysadmin" },
                      { name: "course_subjects (科目・シラバス)", rls: true, roleCheck: "secretariat / sysadmin" },
                      { name: "daily_curriculums (日別訓練計画)", rls: true, roleCheck: "secretariat / instructor" },
                      { name: "student_attendances (出席・遅刻届)", rls: true, roleCheck: "student_own / secretariat" },
                      { name: "microlearning_progress (受講進捗)", rls: true, roleCheck: "student_own / instructor" },
                      { name: "audit_logs (公的監査ログ)", rls: true, roleCheck: "sysadmin_read_only" },
                    ].map((tbl, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-mono font-bold text-slate-800">{tbl.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">
                            ポリシー: {tbl.roleCheck}
                          </span>
                          <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-300">
                            RLS ON
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 2. バックアップ ＆ 外部連携設定 */}
              <div className="space-y-6">
                {/* バックアップ管理 */}
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-600" />
                      データベース自動バックアップ (PITR)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      ポイントインタイムリカバリ（過去30日間の秒単位復元可能）
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-[11px] text-slate-500 block">最終自動スナップショット</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          本日 08:30:00 (12分前)
                        </span>
                      </div>
                      <Button
                        onClick={handleTriggerManualBackup}
                        disabled={isCreatingBackup}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 font-semibold"
                      >
                        {isCreatingBackup ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                            作成中...
                          </>
                        ) : (
                          <>
                            <HardDrive className="w-3.5 h-3.5 mr-1" />
                            手動バックアップ作成
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        公的監査ログ保持期間 (日数):
                      </label>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="number"
                          value={logRetentionDays}
                          onChange={(e) => setLogRetentionDays(Number(e.target.value))}
                          className="font-mono font-bold text-xs h-9 w-32"
                        />
                        <span className="text-slate-500 text-xs">
                          日間（公的労働局基準: 5年間 = 1,825日推奨）
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* LINE通知連携設定 */}
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      LINE公式アカウント連携設定（出席アラート自動通知）
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 block">
                          出席率80%未満リスク自動配信
                        </span>
                        <span className="text-[11px] text-slate-500">
                          毎月25日および月末締切前に受講生LINEへ警告プッシュ
                        </span>
                      </div>
                      <Switch
                        checked={lineNotificationEnabled}
                        onCheckedChange={setLineNotificationEnabled}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ===================================================================== */}
      {/* モーダル1: ロール変更ダイアログ */}
      {/* ===================================================================== */}
      {isRoleModalOpen && selectedUser && (
        <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
          <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                アカウント権限（ロール）の変更
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                公的セキュリティポリシーに基づき、付与する操作権限を選択してください
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">対象氏名:</span>
                  <span className="font-bold text-slate-900">{selectedUser.name}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">ユーザーID:</span>
                  <span className="font-bold text-slate-900">{selectedUser.uniqueLoginId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">現在のロール:</span>
                  <Badge variant="outline" className="font-bold text-[10px]">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">変更後のロール:</label>
                <Select
                  value={newTargetRole}
                  onChange={(e) => setNewTargetRole(e.target.value as UserRole)}
                  className="h-10 text-xs font-semibold"
                >
                  <option value="student">🎓 受講生 (student) - マイクロラーニング受講・自習のみ</option>
                  <option value="instructor">👨‍🏫 担当講師 (instructor) - 記述式課題採点・出席確認</option>
                  <option value="secretariat">🏢 事務局 (secretariat) - コース設計・カリキュラム編成・出席報告</option>
                  <option value="sysadmin">🛡 システム管理者 (sysadmin) - 全機能およびアカウント・監査管理</option>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRoleModalOpen(false)}
                className="text-xs"
              >
                キャンセル
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveRoleChange}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                権限を変更する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ===================================================================== */}
      {/* モーダル2: アカウント新規発行ダイアログ */}
      {/* ===================================================================== */}
      {isNewUserModalOpen && (
        <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
          <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
            <form onSubmit={handleCreateUser}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  アカウント個別発行
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  独自ログインIDと権限ロールを指定してアカウントを登録します
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    氏名 <span className="text-red-500">*</span>:
                  </label>
                  <Input
                    required
                    placeholder="例: 高橋 涼介"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    独自ログインID <span className="text-red-500">*</span>:
                  </label>
                  <Input
                    required
                    placeholder="例: std2026040 (受講生) / inst_yamada (講師)"
                    value={newUserLoginId}
                    onChange={(e) => setNewUserLoginId(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">権限ロール:</label>
                  <Select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="h-9 text-xs font-semibold"
                  >
                    <option value="student">🎓 受講生 (student)</option>
                    <option value="instructor">👨‍🏫 担当講師 (instructor)</option>
                    <option value="secretariat">🏢 事務局 (secretariat)</option>
                    <option value="sysadmin">🛡 システム管理者 (sysadmin)</option>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="text-xs"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  アカウントを発行
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ===================================================================== */}
      {/* モーダル3: 一括CSVインポートダイアログ */}
      {/* ===================================================================== */}
      {isCsvImportModalOpen && <CsvImport onClose={() => setIsCsvImportModalOpen(false)} onImport={handleImportCsv} existing={users.map(user => user.uniqueLoginId)}/>}

      {/* ===================================================================== */}
      {/* モーダル4: 監査ログ差分表示ダイアログ */}
      {/* ===================================================================== */}
      {selectedDiffLog && (
        <Dialog open={!!selectedDiffLog} onOpenChange={() => setSelectedDiffLog(null)}>
          <DialogContent className="max-w-xl bg-white p-6 rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-600" />
                変更前後のJSON差分レコード
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-mono">
                {selectedDiffLog.timestamp} | {selectedDiffLog.targetTable} ({selectedDiffLog.operationType})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-100 text-slate-800 font-medium">
                操作者: <strong className="font-bold">{selectedDiffLog.operatorName}</strong> ({selectedDiffLog.operatorRole}) | IP: {selectedDiffLog.clientIp}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 変更前 */}
                <div className="space-y-1.5">
                  <span className="font-bold text-rose-700 block flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    変更前 (Before):
                  </span>
                  <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                    <pre>
                      {selectedDiffLog.beforeData
                        ? JSON.stringify(selectedDiffLog.beforeData, null, 2)
                        : "null (新規作成)"}
                    </pre>
                  </div>
                </div>

                {/* 変更後 */}
                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-700 block flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    変更後 (After):
                  </span>
                  <div className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                    <pre>
                      {selectedDiffLog.afterData
                        ? JSON.stringify(selectedDiffLog.afterData, null, 2)
                        : "null (削除)"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedDiffLog(null)}
                className="text-xs"
              >
                閉じる
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
