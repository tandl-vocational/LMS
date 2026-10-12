"use client";

import React, { useState } from "react";
import Link from "@/components/navigation/Link";
import { usePreviewState } from "@/src/demo/store";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
  Video,
  FileText,
  CheckSquare,
  Code2,
  Sparkles,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  BookOpen,
  Laptop,
  Check,
  RotateCcw,
} from "lucide-react";

// =============================================================================
// 型定義 (03_DATA_SCHEMA.md 準拠)
// =============================================================================

// 4択クイズの型
interface QuizItem {
  id: string;
  questionNumber: number;
  questionText: string;
  options: [string, string, string, string]; // [A, B, C, D]
  correctAnswerIndex: number; // 0: A, 1: B, 2: C, 3: D
  explanation: string;
}

// 記述式演習問題 ＆ AI採点ルーブリックの型
interface ExerciseData {
  id: string;
  title: string;
  promptText: string;
  hintText: string;
  modelAnswer: string;
  rubricCriteria: string; // Gemini API 一次採点用基準
}

// モックコース＆モジュールリスト
const MOCK_COURSES = [
  { id: "c-01", name: "DX人材育成＆Webフルスタック開発科 (600h)" },
  { id: "c-02", name: "Pythonデータサイエンス＆AI活用科 (450h)" },
];

const MOCK_DAYS = [
  { id: "day-01", title: "Day 1: オリエンテーション・Webシステム基礎" },
  { id: "day-02", title: "Day 2: HTML5/CSS3 モダンデザインコーディング" },
  { id: "day-03", title: "Day 3: Next.js App Router 基礎アーキテクチャ" },
  { id: "day-04", title: "Day 4: TypeScript 型安全プログラミング演習" },
  { id: "day-05", title: "Day 5: PostgreSQL ＆ Supabase バックエンド統合" },
];

// 初期クイズデータ（3問）
const INITIAL_QUIZZES: QuizItem[] = [
  {
    id: "q-1",
    questionNumber: 1,
    questionText: "Next.js App Routerにおいて、サーバーコンポーネント (RSC) の特徴として正しいものはどれですか？",
    options: [
      "クライアント側にJavaScriptバンドルが送信されず、サーバー上でHTMLが生成される",
      "ブラウザの localStorage や window オブジェクトに直接アクセスできる",
      "useState や useEffect などのクライアントフックを無制限に利用できる",
      "すべてのレンダリング処理がブラウザのJavaScriptエンジン上で行われる",
    ],
    correctAnswerIndex: 0,
    explanation: "サーバーコンポーネントはサーバー側でのみ実行され、クライアント側へ余計なJavaScriptコードを送信しないため、初期読み込みパフォーマンスとSEOが大幅に向上します。",
  },
  {
    id: "q-2",
    questionNumber: 2,
    questionText: "Next.js App RouterでAPIエンドポイント（Route Handler）を作成する際、配置すべき正しいファイル名はどれですか？",
    options: [
      "app/api/[endpoint]/handler.ts",
      "app/api/[endpoint]/route.ts",
      "app/api/[endpoint]/index.js",
      "pages/api/[endpoint]/server.ts",
    ],
    correctAnswerIndex: 1,
    explanation: "App Routerでは、APIルートを定義するファイル名は必ず『route.ts』または『route.js』とする規約があります（page.tsxと同一フォルダに同居させることはできません）。",
  },
  {
    id: "q-3",
    questionNumber: 3,
    questionText: "クライアントコンポーネントとして動作させるために、ファイルの最上部に記述する必須ディレクティブはどれですか？",
    options: [
      "'use server';",
      "'use strict';",
      "'use client';",
      "'client only';",
    ],
    correctAnswerIndex: 2,
    explanation: "ファイルの1行目に『'use client';』と宣言することで、そのコンポーネントおよびその子コンポーネントがクライアントバンドルに含まれ、useStateやイベントリスナーが使用可能になります。",
  },
];

export default function LessonEditPage() {
  const [selectedCourseId, setSelectedCourseId] = useState("c-01");
  const [selectedDayId, setSelectedDayId] = useState("day-03");
  const [activeTab, setActiveTab] = useState<"video" | "quiz" | "exercise">("video");

  // ===========================================================================
  // 【タブ1】講義動画 ＆ 文字起こし状態
  // ===========================================================================
  const [videoTitle, setVideoTitle] = usePreviewState(`lesson-editor:videoTitle`, "Next.js 15 App Router アーキテクチャとRoute Handlers実践");
  const [videoUrl, setVideoUrl] = usePreviewState(`lesson-editor:videoUrl`, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [durationMinutes, setDurationMinutes] = usePreviewState(`lesson-editor:durationMinutes`, 18);
  const [transcriptText, setTranscriptText] = usePreviewState(`lesson-editor:transcriptText`,
    `本講義では、Next.js 15の核心機能である「App Router」の基本概念と、APIエンドポイントを構築する「Route Handlers」の実装方法を学びます。

1. サーバーコンポーネント（Server Components）とクライアントコンポーネント
・デフォルトではすべてのコンポーネントがサーバー側でレンダリングされます。
・ブラウザの操作（onClick、useState、useEffectなど）が必要な場合のみ、ファイルの最上部に 'use client'; を宣言します。
・不要なJavaScriptがブラウザに送られないため、ページの表示速度が極めて高速になります。

2. Route Handlers の基礎
・APIエンドポイントを作成する場合、フォルダ内に「route.ts」という名前でファイルを配置します。
・GET、POST、PUT、DELETE などのHTTPメソッドに対応した関数を export します。
・NextResponse.json({ message: "Hello" }) を使用して、型安全なJSONレスポンスを返却します。

3. 認証とセキュリティの注意点
・APIルート内での認証チェックは、リクエストヘッダー（Authorization: Bearer <token>）やクッキーを検証します。
・未認証のリクエストに対しては、401 Unauthorized ステータスを即座に返却することが公的Webセキュリティの鉄則です。`
  );

  // ===========================================================================
  // 【タブ2】100点必須クイズ状態
  // ===========================================================================
  const [quizzes, setQuizzes] = usePreviewState<QuizItem[]>(`lesson-editor:quizzes`, INITIAL_QUIZZES);

  // ===========================================================================
  // 【タブ3】記述式演習問題 ＆ ルーブリック状態
  // ===========================================================================
  const [exercise, setExercise] = usePreviewState<ExerciseData>(`lesson-editor:exercise`, {
    id: "ex-01",
    title: "Next.js Route Handler による受講生検索APIの実装",
    promptText: `Next.js App RouterのRoute Handlerを使用して、以下の要件を満たす受講生データ検索API（GET /api/students）を実装してください。

【要件】
1. リクエストURLのクエリパラメータ 'status' (例: ?status=active) を取得してください。
2. もし status パラメータが指定されていない場合は、400 Bad Request とエラーメッセージのJSONを返してください。
3. status パラメータが 'active' の場合、ステータスが200 OKで受講生一覧配列（id, name, statusを含むモックデータ）をJSON形式で返してください。
4. 適切なTypeScriptの型定義（NextRequest, NextResponse）を用いてコードを記述してください。`,
    hintText: `NextRequest から searchParams を取得するには、以下のように記述します:
const searchParams = req.nextUrl.searchParams;
const status = searchParams.get('status');
エラー時は NextResponse.json({ error: "status parameter required" }, { status: 400 }); を返します。`,
    modelAnswer: `import { NextRequest, NextResponse } from "next/server";

interface Student {
  id: string;
  name: string;
  status: string;
}

const MOCK_STUDENTS: Student[] = [
  { id: "std-01", name: "山田 太郎", status: "active" },
  { id: "std-02", name: "佐藤 美咲", status: "active" },
  { id: "std-03", name: "田中 健一", status: "graduated" },
];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status");

  // 要件2: statusパラメータ必須チェック
  if (!status) {
    return NextResponse.json(
      { error: "クエリパラメータ 'status' は必須です。" },
      { status: 400 }
    );
  }

  // 要件3: フィルタリングして返却
  const filtered = MOCK_STUDENTS.filter((s) => s.status === status);

  return NextResponse.json(
    {
      success: true,
      data: filtered,
      totalCount: filtered.length,
    },
    { status: 200 }
  );
}`,
    rubricCriteria: `【Gemini API 自動一次採点ルーブリック基準】（100点満点）

■ 必須項目1: NextRequest および searchParams の適切な取得 (配点: 30点)
- req.nextUrl.searchParams または new URL(req.url) からクエリパラメータを取得しているか。
- パラメータキー 'status' を正確に参照しているか。

■ 必須項目2: パラメータ未指定時のバリデーションと400エラー返却 (配点: 30点)
- if (!status) などのガード節（早期リターン）が実装されているか。
- NextResponse.json() でステータスコード 400 を明示的に指定して返しているか。

■ 必須項目3: 成功時のデータ返却とHTTP 200ステータス (配点: 25点)
- 正常系レスポンスとしてJSON形式で受講生データを返却しているか。
- 配列のフィルタリング処理（filter関数等）が論理的に正しいか。

■ 記述品質・TypeScript型定義 (配点: 15点)
- NextRequest, NextResponse のインポートと型注釈が適切か。
- 不必要な any 型の乱用がなく、可読性の高いコード規約に沿っているか。

※ 合計80点以上で「合格」、100点で「満点クリア」と判定し、受講生のコードの良い点と改善点を200字程度で出力すること。`,
  });

  // UI・ローディング状態
  const [isGeneratingAi, setIsGeneratingAi] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ===========================================================================
  // AI生成ハンドラー
  // ===========================================================================

  // 1. 文字起こし下書きAI生成
  const handleAiGenerateTranscript = async () => {
    setIsGeneratingAi("transcript");
    await new Promise((r) => setTimeout(r, 1200));

    setTranscriptText(
      `【AI自動生成文字起こし要約】
本セクションでは、Next.js 15 App RouterにおけるサーバーコンポーネントとRoute Handlersの連携について詳しく解説しています。

■ 主なトピック
1. Server vs Client: コンポーネントツリーの末端でのみ 'use client' を使用するベストプラクティス。
2. Route Handlers: app/api ディレクトリ配下での route.ts 規約と、GET/POST関数の実装パターン。
3. エラーハンドリング: NextResponse.json() を用いたステータスコード（200, 400, 401, 500）の明示的制御。
4. 公的訓練基準: 実務現場で必須となる型安全性とセキュアコーディング規約の徹底。`
    );
    setIsGeneratingAi(null);
    setNotification("講義タイトルに基づき、詳細な文字起こしテキストの下書きを生成しました。");
    setTimeout(() => setNotification(null), 4000);
  };

  // 2. 文字起こしから100点必須クイズ3問をAI自動生成
  const handleAiGenerateQuizzes = async () => {
    setIsGeneratingAi("quizzes");
    await new Promise((r) => setTimeout(r, 1400));

    const generatedQuizzes: QuizItem[] = [
      {
        id: `q-ai-1`,
        questionNumber: 1,
        questionText: "Next.js App Routerにおいて、サーバーコンポーネント (Server Components) の最大の利点はどれですか？",
        options: [
          "サーバー側でHTMLが事前生成され、ブラウザに余計なJavaScriptが送信されないため高速である",
          "クライアント側のブラウザストレージ（localStorage）に安全に直接書き込める",
          "Reactのすべてのフック（useState, useEffect）を何も宣言せずに使用できる",
          "CSSスタイルシートが一切不要になり、自動でレイアウトが最適化される",
        ],
        correctAnswerIndex: 0,
        explanation: "サーバーコンポーネントはサーバー上でのみレンダリングされるため、クライアントバンドルサイズを大幅に削減し、初期表示パフォーマンスを高めます。",
      },
      {
        id: `q-ai-2`,
        questionNumber: 2,
        questionText: "Next.js App RouterでAPIエンドポイント（Route Handler）を定義するファイル名の規約として正しいものはどれですか？",
        options: [
          "handler.ts",
          "route.ts",
          "api.tsx",
          "server.js",
        ],
        correctAnswerIndex: 1,
        explanation: "App Router規約では、APIルートを定義するファイル名は必ず『route.ts』または『route.js』とする必要があります。",
      },
      {
        id: `q-ai-3`,
        questionNumber: 3,
        questionText: "APIエンドポイントで必須パラメータが欠落していた場合、公的Web標準として返却すべき最も適切なHTTPステータスコードはどれですか？",
        options: [
          "200 OK",
          "301 Moved Permanently",
          "400 Bad Request",
          "500 Internal Server Error",
        ],
        correctAnswerIndex: 2,
        explanation: "クライアントからのリクエストに必須パラメータが欠けているなどの不正がある場合は、400 Bad Request を返却するのがHTTP標準です。",
      },
    ];

    setQuizzes(generatedQuizzes);
    setIsGeneratingAi(null);
    setNotification("文字起こしテキストを解析し、理解度チェック用の4択クイズ3問を自動生成しました！");
    setTimeout(() => setNotification(null), 4000);
  };

  // 3. 模範解答から採点ルーブリック基準をAI自動生成
  const handleAiGenerateRubric = async () => {
    setIsGeneratingAi("rubric");
    await new Promise((r) => setTimeout(r, 1200));

    setExercise((prev) => ({
      ...prev,
      rubricCriteria: `【Gemini API 自動一次採点ルーブリック基準（自動最適化版）】

■ 1. リクエスト解析とクエリパラメータ取得 (30点)
- req.nextUrl.searchParams から正確に対象パラメータを取得できているか。
- nullチェックが適切に行われているか。

■ 2. エラー制御とHTTPステータス (30点)
- 不正なリクエストに対して 400 Bad Request を返却しているか。
- NextResponse.json() を適切に使用しているか。

■ 3. 業務要件とフィルタリング処理 (25点)
- 条件に合致するデータのみを抽出してレスポンスに含めているか。
- 成功時に 200 OK ステータスが返却されているか。

■ 4. 型安全性とコード品質 (15点)
- TypeScriptのインターフェースやNext.jsの型定義が正しく適用されているか。

※ 合計80点以上で合格判定とし、受講生向けの励ましと具体的な改善アドバイスを併記して返却すること。`,
    }));

    setIsGeneratingAi(null);
    setNotification("演習の模範解答から、Gemini API用の一次採点ルーブリック基準を自動策定しました！");
    setTimeout(() => setNotification(null), 4000);
  };

  // クイズ追加・削除・編集ハンドラー
  const handleAddQuiz = () => {
    const nextNum = quizzes.length + 1;
    const newQ: QuizItem = {
      id: `q-${Date.now()}`,
      questionNumber: nextNum,
      questionText: "",
      options: ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      correctAnswerIndex: 0,
      explanation: "",
    };
    setQuizzes((prev) => [...prev, newQ]);
  };

  const handleDeleteQuiz = (id: string) => {
    if (quizzes.length <= 1) {
      alert("クイズは最低1問必要です。");
      return;
    }
    setQuizzes((prev) => {
      const filtered = prev.filter((q) => q.id !== id);
      return filtered.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    });
  };

  const handleUpdateQuiz = (id: string, field: keyof QuizItem, val: any) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: val } : q))
    );
  };

  const handleUpdateQuizOption = (quizId: string, optIndex: number, val: string) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const newOpts = [...q.options] as [string, string, string, string];
        newOpts[optIndex] = val;
        return { ...q, options: newOpts };
      })
    );
  };

  // 全体保存処理
  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setNotification("学習セット（講義動画・100点クイズ・記述式演習）を正常に保存・公開しました！");
      setTimeout(() => setNotification(null), 4000);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28">
      {/* ===================================================================== */}
      {/* 画面トップバー */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/instructor/dashboard">
              <Button variant="ghost" size="sm" className="h-9 px-2.5 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>講師ダッシュボードへ</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  マイクロラーニング教材エディタ
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  公的100点必須クイズ ＆ AI採点ルーブリック対応
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                教材セット・クイズ・演習課題管理
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* プレビューボタン */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="h-9 text-xs font-semibold border-slate-300 text-slate-700"
            >
              <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
              受講生画面プレビュー
            </Button>

            {/* 保存ボタン */}
            <Button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  教材セットを保存
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* 通知トースト */}
      {notification && (
        <div className="max-w-7xl mx-auto px-6 pt-4 animate-in fade-in duration-200">
          <Alert className="border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="font-bold text-sm">更新完了</AlertTitle>
            <AlertDescription className="text-xs">{notification}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 画面上部: コース ＆ Day モジュール選択セレクター */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <Card className="border-slate-200 bg-white shadow-2xs">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  対象コース:
                </label>
                <Select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="h-10 text-xs font-semibold"
                >
                  {MOCK_COURSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  対象Day（日別カリキュラムモジュール）:
                </label>
                <Select
                  value={selectedDayId}
                  onChange={(e) => setSelectedDayId(e.target.value)}
                  className="h-10 text-xs font-semibold text-indigo-700"
                >
                  {MOCK_DAYS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ===================================================================== */}
      {/* 3つの主要編集タブ */}
      {/* ===================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-slate-200/80 p-1 w-full max-w-2xl grid grid-cols-3 h-11 mb-6 rounded-xl shadow-xs">
            <TabsTrigger
              value="video"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <Video className="w-4 h-4" />
              <span>① 講義動画・文字起こし</span>
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <CheckSquare className="w-4 h-4" />
              <span>② 100点必須クイズ ({quizzes.length}問)</span>
            </TabsTrigger>
            <TabsTrigger
              value="exercise"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <Code2 className="w-4 h-4" />
              <span>③ 記述式演習・AI採点</span>
            </TabsTrigger>
          </TabsList>

          {/* ================================================================= */}
          {/* 【タブ1】講義動画 ＆ 文字起こし設定 */}
          {/* ================================================================= */}
          <TabsContent value="video" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 左ペイン: 入力フォーム (7カラム) */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-600" />
                      講義動画の基本情報設定
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      YouTube, Vimeo, Cloud Storage等の動画ストリーミングURLを登録します
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        講義タイトル <span className="text-red-500">*</span>:
                      </label>
                      <Input
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="text-xs sm:text-sm font-semibold h-10"
                        placeholder="例: Next.js 15 App Router アーキテクチャ"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="font-bold text-slate-700 block">
                          講義動画URL <span className="text-red-500">*</span>:
                        </label>
                        <Input
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="font-mono text-xs h-10"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">
                          所要時間 (分):
                        </label>
                        <Input
                          type="number"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(Number(e.target.value))}
                          className="font-mono font-bold text-xs h-10"
                          min="1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 文字起こしテキスト設定 */}
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        講義の文字起こし ＆ AI Tutor用コンテキスト
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        AI Tutorが受講生からの質問に答える際の基礎知識（RAGコンテキスト）となります
                      </CardDescription>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAiGenerateTranscript}
                      disabled={isGeneratingAi === "transcript"}
                      className="text-xs h-8 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold"
                    >
                      {isGeneratingAi === "transcript" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                          ✨ AI文字起こしを下書き生成
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Textarea
                      rows={12}
                      value={transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                      className="text-xs sm:text-sm font-mono leading-relaxed"
                      placeholder="動画内の講義内容、重要な技術概念、コード解説のテキストを入力してください..."
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 右ペイン: プレイヤープレビュー (5カラム) */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="border-slate-200 bg-white shadow-2xs sticky top-20">
                  <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-indigo-600" />
                      講義動画プレイヤー表示プレビュー
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-video w-full rounded-xl bg-slate-900 overflow-hidden relative shadow-md flex items-center justify-center">
                      <div className="text-center text-white space-y-2 p-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-600/90 flex items-center justify-center mx-auto shadow-lg">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-bold text-xs">{videoTitle}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          所要時間: 約{durationMinutes}分 | ストリーミング準備完了
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-800 block">受講生側の機能:</span>
                      <p className="text-[11px] text-slate-600">
                        ・動画シークバーによる倍速再生（0.75x 〜 2.0x）
                      </p>
                      <p className="text-[11px] text-slate-600">
                        ・視聴完了時に自動で【Step 2: 100点必須クイズ】がロック解除
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ================================================================= */}
          {/* 【タブ2】100点必須クイズ編集 (set_quizzes) */}
          {/* ================================================================= */}
          <TabsContent value="quiz" className="space-y-4 focus-visible:outline-none">
            {/* ツールバー */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  100点必須クイズ設定（全{quizzes.length}問）
                </h3>
                <p className="text-xs text-slate-500">
                  公的職業訓練の要件として、受講生は全問正解（100点）するまで次のステップに進めません
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={handleAiGenerateQuizzes}
                  disabled={isGeneratingAi === "quizzes"}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold h-9 shadow-sm"
                >
                  {isGeneratingAi === "quizzes" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      AIが文字起こしからクイズ生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      ✨ 文字起こしから100点必須クイズ3問をAI自動生成
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddQuiz}
                  className="text-xs h-9 border-slate-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  1問追加
                </Button>
              </div>
            </div>

            {/* クイズ問題カード一覧 */}
            <div className="space-y-4">
              {quizzes.map((q, qIdx) => (
                <Card key={q.id} className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-3 px-6 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-indigo-600 text-white font-bold text-xs px-2 py-0.5">
                        第 {q.questionNumber} 問
                      </Badge>
                      <span className="text-xs text-slate-500">4択・単一選択式</span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuiz(q.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                      title="この問題を削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4 text-xs">
                    {/* 問題文 */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        問題文 <span className="text-red-500">*</span>:
                      </label>
                      <Textarea
                        rows={2}
                        value={q.questionText}
                        onChange={(e) => handleUpdateQuiz(q.id, "questionText", e.target.value)}
                        placeholder="受講生へ出題する設問文を入力..."
                        className="text-xs sm:text-sm font-medium"
                      />
                    </div>

                    {/* 選択肢 A〜D */}
                    <div className="space-y-2.5">
                      <label className="font-bold text-slate-700 block">
                        4択の選択肢 ＆ 正解指定（ラジオボタンで正解を選択）:
                      </label>
                      {(["A", "B", "C", "D"] as const).map((label, optIdx) => (
                        <div
                          key={label}
                          className={`flex items-center space-x-3 p-2 rounded-xl border transition-colors ${
                            q.correctAnswerIndex === optIdx
                              ? "border-emerald-300 bg-emerald-50/50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswerIndex === optIdx}
                            onChange={() => handleUpdateQuiz(q.id, "correctAnswerIndex", optIdx)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span
                            className={`font-mono font-bold text-xs w-6 ${
                              q.correctAnswerIndex === optIdx
                                ? "text-emerald-700"
                                : "text-slate-500"
                            }`}
                          >
                            [{label}]
                          </span>
                          <Input
                            value={q.options[optIdx]}
                            onChange={(e) => handleUpdateQuizOption(q.id, optIdx, e.target.value)}
                            className="flex-1 text-xs h-8"
                            placeholder={`選択肢${label}の文言を入力...`}
                          />
                          {q.correctAnswerIndex === optIdx && (
                            <Badge className="bg-emerald-600 text-white font-bold text-[10px] shrink-0">
                              ✓ 正解
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 正解解説 */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label className="font-bold text-slate-700 block">
                        正解後の解説文（全問正解時およびAIヒントに活用）:
                      </label>
                      <Textarea
                        rows={2}
                        value={q.explanation}
                        onChange={(e) => handleUpdateQuiz(q.id, "explanation", e.target.value)}
                        placeholder="なぜこの選択肢が正解なのか、技術的な理由とポイントを記述してください..."
                        className="text-xs text-slate-700"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ================================================================= */}
          {/* 【タブ3】記述式演習問題 ＆ ルーブリック編集 (set_exercises) */}
          {/* ================================================================= */}
          <TabsContent value="exercise" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 左ペイン: 演習課題 ＆ 模範解答 (7カラム) */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-600" />
                      記述式演習問題の定義
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      受講生が実際にコードやテキストを入力して提出する実技課題です
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        課題タイトル <span className="text-red-500">*</span>:
                      </label>
                      <Input
                        value={exercise.title}
                        onChange={(e) =>
                          setExercise((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="text-xs sm:text-sm font-semibold h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        演習問題文・仕様要件 <span className="text-red-500">*</span>:
                      </label>
                      <Textarea
                        rows={7}
                        value={exercise.promptText}
                        onChange={(e) =>
                          setExercise((prev) => ({ ...prev, promptText: e.target.value }))
                        }
                        className="text-xs sm:text-sm font-mono leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        ヒント（受講生画面でトグル表示可能）:
                      </label>
                      <Textarea
                        rows={3}
                        value={exercise.hintText}
                        onChange={(e) =>
                          setExercise((prev) => ({ ...prev, hintText: e.target.value }))
                        }
                        className="text-xs font-mono text-slate-600"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 模範解答 */}
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      模範解答（サンプルコード・完全実装例）
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      講師の最終採点およびAI一次採点のベンチマークとして使用されます
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Textarea
                      rows={12}
                      value={exercise.modelAnswer}
                      onChange={(e) =>
                        setExercise((prev) => ({ ...prev, modelAnswer: e.target.value }))
                      }
                      className="text-xs font-mono leading-relaxed bg-slate-900 text-emerald-300 rounded-xl p-4"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 右ペイン: AI採点ルーブリック基準設定 (5カラム) */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="border-slate-200 bg-white shadow-2xs sticky top-20">
                  <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        AI一次採点用ルーブリック評価基準
                      </CardTitle>
                      <CardDescription className="text-[11px] text-slate-500">
                        Gemini APIが受講生提出課題を採点する際の基準です
                      </CardDescription>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAiGenerateRubric}
                      disabled={isGeneratingAi === "rubric"}
                      className="text-[11px] h-8 text-purple-700 border-purple-200 hover:bg-purple-50 font-semibold"
                    >
                      {isGeneratingAi === "rubric" ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
                          ✨ AI自動生成
                        </>
                      )}
                    </Button>
                  </CardHeader>

                  <CardContent className="p-6 space-y-3">
                    <Textarea
                      rows={16}
                      value={exercise.rubricCriteria}
                      onChange={(e) =>
                        setExercise((prev) => ({ ...prev, rubricCriteria: e.target.value }))
                      }
                      className="text-xs font-mono leading-relaxed bg-slate-50 border-slate-200"
                      placeholder="採点の配点項目、エラーハンドリング要件、減点基準を記述..."
                    />

                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                      <span className="font-bold block flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-purple-600" />
                        講師とAIの協調採点フロー:
                      </span>
                      <p className="text-[11px] leading-relaxed text-purple-800">
                        受講生提出後、Geminiがこのルーブリックに基づき数秒で一次採点と講評ドラフトを作成。講師ダッシュボードで講師が最終承認する2段階方式です。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ===================================================================== */}
      {/* 受講生画面プレビューモーダル */}
      {/* ===================================================================== */}
      {isPreviewOpen && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-3xl bg-white p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 text-xs font-bold">
                  受講生プレビュー画面
                </Badge>
                <span className="text-xs text-slate-500">Day 3 マイクロラーニング</span>
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 pt-1">
                {videoTitle}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-3 text-xs">
              {/* 動画プレイヤー */}
              <div className="aspect-video w-full rounded-xl bg-slate-900 flex items-center justify-center text-white text-center p-4">
                <div>
                  <Video className="w-10 h-10 mx-auto text-indigo-400 mb-2" />
                  <p className="font-bold text-sm">【講義動画】{videoTitle}</p>
                  <p className="text-slate-400 text-xs mt-1">所要時間: 約{durationMinutes}分</p>
                </div>
              </div>

              {/* クイズプレビュー */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    100点必須クイズ (全{quizzes.length}問)
                  </span>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                    全問正解で合格
                  </Badge>
                </div>
                {quizzes.slice(0, 1).map((q) => (
                  <div key={q.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <p className="font-bold text-slate-900">Q1. {q.questionText}</p>
                    <div className="space-y-1.5 pl-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700">
                          <input type="radio" disabled checked={i === q.correctAnswerIndex} />
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 演習プレビュー */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  記述式演習課題: {exercise.title}
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px] bg-white p-3 rounded-lg border border-slate-200">
                  {exercise.promptText}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
                className="text-xs"
              >
                プレビューを閉じる
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
