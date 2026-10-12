"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "@/components/navigation/Link";
import { useDemo, id, currentStudent, usePreviewState } from "@/src/demo/store";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Sparkles,
  MessageSquare,
  X,
  Send,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  FileCheck,
  Check,
  Award,
  Video,
  Lightbulb,
  Loader2,
  Clock,
  ShieldAlert,
} from "lucide-react";

// クイズデータ定義 (3問)
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question:
      "Next.js (App Router) において、クライアント側から安全に認証済みリクエストを受け取る推奨設計はどれですか？",
    options: [
      { id: "A", text: "ブラウザのローカルストレージにService Role Keyを保存してAPIを実行する" },
      { id: "B", text: "Route Handlers (`/app/api/*`) または Server Actions を用いてサーバー側でセッションを検証する" },
      { id: "C", text: "全てのデータベースクエリをClient ComponentのuseEffect内で直接実行する" },
      { id: "D", text: "管理者用APIキーをNEXT_PUBLIC_接頭辞で公開環境変数として読み込む" },
    ],
    correctAnswer: "B",
    explanation:
      "機密情報（API KeyやService Role）はブラウザに露出させてはならず、サーバーサイド（Route Handlers / Server Actions）を経由してセッション検証を行うのが堅牢なベストプラクティスです。",
  },
  {
    id: 2,
    question:
      "Supabase の Row Level Security (RLS) を有効化した際、ログインユーザー本人の行のみ取得を許可する標準的なポリシー記述はどれですか？",
    options: [
      { id: "A", text: "USING (true)" },
      { id: "B", text: "USING (user_id = auth.uid())" },
      { id: "C", text: "USING (role = 'public')" },
      { id: "D", text: "USING (auth.jwt()->>'email' IS NOT NULL)" },
    ],
    correctAnswer: "B",
    explanation:
      "SupabaseのRLSでは `auth.uid()` ヘルパー関数を使用して、現在ログインしているユーザーのIDとテーブル内のユーザーIDカラム（`user_id` 等）を照合します。",
  },
  {
    id: 3,
    question:
      "公的職業訓練における「出席率80%管理」で、マイクロラーニングを正当な訓練時間として認定するために必須となる要件はどれですか？",
    options: [
      { id: "A", text: "倍速再生で最後まで再生バーを動かすことのみ" },
      { id: "B", text: "講義動画の全編視聴と、理解度チェッククイズでの100点満点達成" },
      { id: "C", text: "受講生が自己申告で受講完了ボタンを押すこと" },
      { id: "D", text: "チャット欄に『受講しました』と投稿すること" },
    ],
    correctAnswer: "B",
    explanation:
      "公的基準では単なる再生だけでなく、着実な理解を担保するため『講義動画視聴』＋『100点必須クイズ』の達成が受講認定の要件となります。",
  },
];

// AI Tutor チャットメッセージの型
interface ChatMessage {
  id: string;
  sender: "user" | "tutor";
  text: string;
  timestamp: string;
}

export default function MicroLearningLessonPage() {
  const { setData } = useDemo();
  const lessonKey = location.pathname.split("/").at(-1) || "day14-set2";
  const dayMatch = lessonKey.match(/day(\d+)-set(\d+)/);
  // ステップ状態: 'step1_video' | 'step2_quiz' | 'step3_exercise'
  const [activeTab, setActiveTab] = useState<string>("step1_video");

  // Step 1: 動画プレイヤー状態
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(35); // 35% 再生済
  const [videoCompleted, setVideoCompleted] = useState<boolean>(true);

  // Step 2: クイズ状態
  const [selectedAnswers, setSelectedAnswers] = usePreviewState<Record<number, string>>(`learn:${lessonKey}:selectedAnswers`, {});
  const [quizSubmitted, setQuizSubmitted] = usePreviewState<boolean>(`learn:${lessonKey}:quizSubmitted`, false);
  const [quizScore, setQuizScore] = usePreviewState<number>(`learn:${lessonKey}:quizScore`, 0);
  const [isQuizPassed, setIsQuizPassed] = usePreviewState<boolean>(`learn:${lessonKey}:isQuizPassed`, false); // 100点満点判定

  // Step 3: 演習状態
  const [exerciseAnswer, setExerciseAnswer] = usePreviewState<string>(`learn:${lessonKey}:exerciseAnswer`, "");
  const [isSubmittingExercise, setIsSubmittingExercise] = useState<boolean>(false);
  const [exerciseSubmitted, setExerciseSubmitted] = usePreviewState<boolean>(`learn:${lessonKey}:exerciseSubmitted`, false);
  const [aiEvaluation, setAiEvaluation] = useState<{
    score: number;
    feedback: string;
  } | null>(null);

  // AI Tutor 常駐チャット状態
  const [isChatOpen, setIsChatOpen] = useState<boolean>(new URLSearchParams(location.search).get("chat") === "open");
  const [chatInput, setChatInput] = useState<string>("");
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "tutor",
      text: "こんにちは！AI学習サポートキャラの『ナビちゃん』です🤖\n講義動画の文字起こしやクイズのヒントをいつでも質問してくださいね！答えそのものは教えられませんが、自力で解けるヒントを一緒に考えます✨",
      timestamp: "10:00",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  // クイズ回答選択
  const handleSelectAnswer = (questionId: number, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // クイズ採点実行
  const handleGradeQuiz = () => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
    setQuizScore(calculatedScore);
    setQuizSubmitted(true);

    if (calculatedScore === 100) {
      setIsQuizPassed(true);
    } else {
      setIsQuizPassed(false);
    }
  };

  // クイズリセット (100点満点再挑戦)
  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  // 演習課題提出 (Gemini API 一次自動採点シミュレーション)
  const handleSubmitExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseAnswer.trim()) return;

    setIsSubmittingExercise(true);

    // AI自動採点シミュレーション
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setAiEvaluation({
      score: 95,
      feedback:
        "【AI一次採点結果: 95点 / A判定】\n" +
        "・優れている点: Next.js Route Handlersにおけるエラーハンドリング（401/500）の分岐設計が極めて具体的で、Supabase RLSのポリシー前提（`auth.uid()`）と正確に連動しています。\n" +
        "・さらなる改善点: トランザクション処理を要する複数テーブル更新時のロールバック戦略についても一文言及があると実務上完璧です。\n" +
        "※本採点案は担当講師に送信され、講師の最終承認後に正式成績として登録されます。",
    });

    setIsSubmittingExercise(false);
    setExerciseSubmitted(true);
    setData(state => ({ ...state, submissions: [{ id: id(), student: currentStudent, lesson: `Day ${dayMatch?.[1] || 14}：認証ガード付きAPIの設計`, answer: exerciseAnswer.trim(), aiScore: 95, score: 95, feedback: '認証・エラー応答・RLSの観点で確認してください。', status: '採点待ち' }, ...state.submissions] }));
  };

  // AI Tutor メッセージ送信 (ソクラテス型ヒントシミュレーション)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiTyping) return;

    const userMsgText = chatInput.trim();
    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setChatInput("");
    setIsAiTyping(true);

    // AI応答モック（ソクラテス型ヒント）
    setTimeout(() => {
      let reply = "";
      if (userMsgText.includes("クイズ") || userMsgText.includes("ヒント") || userMsgText.includes("問2") || userMsgText.includes("RLS")) {
        reply =
          "クイズのヒントですね！💡\n" +
          "第2問のRLS（Row Level Security）では、「誰がログインしているか」をPostgreSQL内で知る必要がありますよね。\n" +
          "Supabaseの関数で、現在サインインしているユーザーのUUIDを返す関数は何だったか思い出してみましょう！『auth.◯◯◯()』という関数がありましたね？動画の02:15あたりでも触れられていますよ！";
      } else if (userMsgText.includes("要約") || userMsgText.includes("まとめ")) {
        reply =
          "今回の講義（Day 14 - セット2）の重要ポイントは以下の3点です！📝\n" +
          "1. クライアントからSupabaseに直接接続する際は公開鍵（anon key）とRLSを活用する\n" +
          "2. サーバーサイド（Route Handlers）で処理する場合はクッキー経由で安全にユーザーを特定する\n" +
          "3. 秘密鍵（Service Role Key）はブラウザに絶対露出させない！";
      } else {
        reply =
          `ご質問ありがとうございます！「${userMsgText}」についてですね😊\n` +
          "講義動画の内容を踏まえると、サーバーサイドとクライアントサイドでのセキュリティ境界（秘密情報の管理）が最も重要な観点になります。どのようなケースで迷われていますか？具体的に教えていただければ、一緒に段階を踏んで考えていきましょう！";
      }

      const newTutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: "tutor",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, newTutorMsg]);
      setIsAiTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pb-20">
      {/* ===================================================================== */}
      {/* 上部ヘッダー（ナビゲーション ＆ 進捗ステータス） */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/student/dashboard">
              <Button variant="ghost" size="sm" className="h-9 px-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">ポータルへ戻る</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  Day {dayMatch?.[1] || 14} - セット {dayMatch?.[2] || 2}
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  所要目安: 約 4 分
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[260px] sm:max-w-md">
                Next.js Route HandlersとSupabase認証の統合
              </h1>
            </div>
          </div>

          {/* 右上: 100点必須ステータスバッジ */}
          <div className="flex items-center gap-2">
            {isQuizPassed ? (
              <Badge variant="success" className="text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>100点達成・演習解禁</span>
              </Badge>
            ) : (
              <Badge variant="warning" className="text-xs flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>クイズ100点必須</span>
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* メインコンテンツ */}
      {/* ===================================================================== */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6">
        {/* マイクロラーニング ステップナビゲーション (Tabs) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full h-13 p-1.5 bg-slate-200/70 rounded-2xl">
            <TabsTrigger
              value="step1_video"
              className="flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl"
            >
              <Video className="w-4 h-4" />
              <span>Step 1: 講義動画</span>
            </TabsTrigger>

            <TabsTrigger
              value="step2_quiz"
              className="flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl relative"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Step 2: 100点クイズ</span>
              {isQuizPassed && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-white" />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="step3_exercise"
              disabled={!isQuizPassed}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                !isQuizPassed ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isQuizPassed ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
              <span>Step 3: 演習課題</span>
            </TabsTrigger>
          </TabsList>

          {/* ================================================================= */}
          {/* STEP 1: 講義動画 (3〜5分) */}
          {/* ================================================================= */}
          <TabsContent value="step1_video" className="mt-6 space-y-6">
            <Card className="border-slate-200 overflow-hidden shadow-md bg-white">
              {/* 動画プレイヤーシミュレーター (16:9 レスポンシブ) */}
              <div className="relative aspect-video w-full bg-slate-950 flex flex-col justify-between overflow-hidden group">
                {/* 講義動画 背景モック / サムネイル */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
                  <div className="text-center p-6 space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600/90 text-white shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-400/20">
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-bold text-base sm:text-lg">
                        Day 14: Next.js API Routes & Supabase Auth 実践講座
                      </p>
                      <p className="text-xs text-indigo-300">
                        講師: 佐々木シニアエンジニア | 再生時間: 03:45
                      </p>
                    </div>
                  </div>
                </div>

                {/* 動画コントロールバー（下部） */}
                <div className="relative z-10 mt-auto bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 space-y-2">
                  {/* プログレスバー */}
                  <div className="w-full bg-slate-700/80 h-1.5 rounded-full overflow-hidden cursor-pointer">
                    <div className="bg-indigo-500 h-full w-[65%]" />
                  </div>

                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="hover:text-indigo-400 transition-colors p-1"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button className="hover:text-indigo-400 transition-colors p-1">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[11px] text-slate-300">
                        02:26 / 03:45
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-bold">
                        1.25x
                      </span>
                      <Volume2 className="w-4 h-4 cursor-pointer hover:text-indigo-400" />
                      <Maximize2 className="w-4 h-4 cursor-pointer hover:text-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 動画下の講義要点テキスト */}
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">
                    講義の要点・サマリー
                  </h3>
                  <Badge variant="outline" className="text-xs text-slate-600">
                    マイクロラーニング 3〜5分
                  </Badge>
                </div>

                <div className="space-y-3 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p>
                    本講義では、Next.js App Routerの <strong>Route Handlers (`/app/api/*`)</strong> から安全にSupabaseへアクセスする認証基盤を構築します。
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-1 text-slate-800">
                    <li>
                      <strong>Cookie連携:</strong> <code>@supabase/ssr</code> を利用し、クライアントのリクエストヘッダーからクッキーセッションを安全に復元します。
                    </li>
                    <li>
                      <strong>RLS連携:</strong> データベース側で設定した <code>auth.uid() = id</code> のポリシーがサーバーサイドでも透過的に適用されます。
                    </li>
                    <li>
                      <strong>エラーハンドリング:</strong> 未認証時は <code>401 Unauthorized</code>、権限外リクエストは <code>403 Forbidden</code> を即座に返却します。
                    </li>
                  </ul>
                </div>

                {/* 次のステップへ進むCTAボタン */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>動画の視聴が完了しました。理解度クイズへ進んでください。</span>
                  </div>
                  <Button
                    onClick={() => setActiveTab("step2_quiz")}
                    className="w-full sm:w-auto h-11 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
                  >
                    <span>Step 2: 100点必須クイズへ進む</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================================================================= */}
          {/* STEP 2: 100点必須クイズ (3問) */}
          {/* ================================================================= */}
          <TabsContent value="step2_quiz" className="mt-6 space-y-6">
            {/* 100点必須ルール告知アラート */}
            <Alert className="border-indigo-200 bg-indigo-50/70 text-indigo-900">
              <Lightbulb className="h-4 w-4 text-indigo-600" />
              <AlertTitle className="font-bold text-sm">
                公的職業訓練 マイクロラーニング基準
              </AlertTitle>
              <AlertDescription className="text-xs leading-relaxed">
                着実な知識定着を図るため、<strong>全問正解（100点満点）</strong>を達成するまで次の「Step 3: 演習課題」は解禁されません。何度でも挑戦可能です。迷った時は右下の「AI Tutor ナビちゃん」にヒントを求めてみましょう！
              </AlertDescription>
            </Alert>

            {/* 採点結果アラート (採点後に表示) */}
            {quizSubmitted && (
              <div className="animate-in fade-in duration-300">
                {isQuizPassed ? (
                  <Alert className="border-emerald-300 bg-emerald-50 text-emerald-900">
                    <Award className="h-5 w-5 text-emerald-600" />
                    <AlertTitle className="text-base font-bold">
                      🎉 満点合格（100点）！演習課題が解禁されました！
                    </AlertTitle>
                    <AlertDescription className="text-xs pt-1">
                      全問正解お見事です！マイクロラーニング規定をクリアしました。「Step 3: 演習課題」へ進み、記述式の実践課題に取り組んでください。
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <AlertTitle className="text-base font-bold">
                      採点結果: {quizScore}点（全問正解ではありません）
                    </AlertTitle>
                    <AlertDescription className="text-xs pt-1 space-y-1">
                      <p>
                        マイクロラーニング規定により、Step 3へ進むには <strong>100点満点</strong> が必要です。
                      </p>
                      <p>
                        間違えた問題の解説と動画を確認し、再挑戦ボタンを押して再解答してください。
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* クイズ問題一覧 */}
            <div className="space-y-6">
              {QUIZ_QUESTIONS.map((q, qIndex) => {
                const isSelected = selectedAnswers[q.id];
                const isCorrect = isSelected === q.correctAnswer;

                return (
                  <Card key={q.id} className="border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          第 {qIndex + 1} 問（配点: 約33点）
                        </span>
                        {quizSubmitted && (
                          <Badge variant={isCorrect ? "success" : "destructive"} className="text-xs">
                            {isCorrect ? "正解" : "不正解"}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-sm sm:text-base font-bold text-slate-900 pt-1 leading-snug">
                        {q.question}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5 space-y-2.5">
                      {q.options.map((opt) => {
                        const isThisOptionSelected = selectedAnswers[q.id] === opt.id;
                        let optionStyle =
                          "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";

                        if (isThisOptionSelected) {
                          optionStyle =
                            "border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold ring-1 ring-indigo-600";
                        }

                        if (quizSubmitted) {
                          if (opt.id === q.correctAnswer) {
                            optionStyle =
                              "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold";
                          } else if (isThisOptionSelected && !isCorrect) {
                            optionStyle =
                              "border-red-500 bg-red-50 text-red-950 line-through opacity-80";
                          }
                        }

                        return (
                          <div
                            key={opt.id}
                            onClick={() => !quizSubmitted && handleSelectAnswer(q.id, opt.id)}
                            className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${optionStyle} ${
                              quizSubmitted ? "cursor-default" : ""
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                                isThisOptionSelected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 text-slate-700 border border-slate-300"
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="text-xs sm:text-sm leading-relaxed flex-1">
                              {opt.text}
                            </span>
                          </div>
                        );
                      })}

                      {/* 採点後の解説表示 */}
                      {quizSubmitted && (
                        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            正解解説:
                          </span>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* クイズ送信 / 再挑戦 ボタン */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab("step1_video")}
                className="w-full sm:w-auto h-11 text-xs sm:text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Step 1: 動画を復習する
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {quizSubmitted && !isQuizPassed && (
                  <Button
                    variant="outline"
                    onClick={handleResetQuiz}
                    className="w-full sm:w-auto h-11 border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold"
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    再挑戦する（100点目標）
                  </Button>
                )}

                {!quizSubmitted ? (
                  <Button
                    onClick={handleGradeQuiz}
                    disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
                    className="w-full sm:w-auto h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
                  >
                    回答を採点する
                  </Button>
                ) : isQuizPassed ? (
                  <Button
                    onClick={() => setActiveTab("step3_exercise")}
                    className="w-full sm:w-auto h-11 px-8 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100"
                  >
                    <span>Step 3: 演習課題へ進む</span>
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : null}
              </div>
            </div>
          </TabsContent>

          {/* ================================================================= */}
          {/* STEP 3: 演習課題 (記述式 ＆ AI自動採点) */}
          {/* ================================================================= */}
          <TabsContent value="step3_exercise" className="mt-6 space-y-6">
            {!isQuizPassed ? (
              /* 100点未達成時のロック画面 */
              <Card className="border-amber-200 bg-amber-50/50 p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-slate-900">
                    Step 3 演習課題はロックされています
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                    公的職業訓練のマイクロラーニング規定により、Step 2 のクイズで
                    <strong>100点満点を獲得</strong> すると演習課題が解禁されます。
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab("step2_quiz")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Step 2 のクイズに挑戦する
                </Button>
              </Card>
            ) : (
              /* 100点達成時の演習課題画面 */
              <div className="space-y-6">
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="bg-emerald-50/60 pb-3 border-b border-emerald-100">
                    <div className="flex items-center justify-between">
                      <Badge variant="success" className="text-xs">
                        ロック解除済
                      </Badge>
                      <span className="text-xs text-slate-500">公的訓練 記述式課題</span>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 pt-1">
                      演習課題: 認証ガード付きAPIルートの設計とエラー処理
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600">
                      動画で学んだベストプラクティスに基づき、要件を満たす設計・実装方針を記述してください。
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* 課題要件 ＆ ルーブリック基準 */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs sm:text-sm space-y-2">
                      <p className="font-bold text-slate-900">【出題要件】</p>
                      <p className="text-slate-700 leading-relaxed">
                        受講生のみがアクセス可能な Next.js Route Handler <code>GET /api/student/progress</code> を設計します。以下の3点を文章または疑似コードを用いて記述してください：
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-800 pl-1">
                        <li>Supabaseクライアントの生成方法とセッション確認手順</li>
                        <li>未認証ユーザー（401）および権限不足（403）時のレスポンス方針</li>
                        <li>RLSの恩恵と、サーバーサイドで二重チェックすべきセキュリティ項目</li>
                      </ol>
                    </div>

                    {/* 解答入力フォーム */}
                    <form onSubmit={handleSubmitExercise} className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          あなたの解答記述（文章・コード例・考察）:
                        </label>
                        <Textarea
                          placeholder="例: &#10;1. @supabase/ssr の createServerClient を用いてクッキーを注入し、const { data: { user } } = await supabase.auth.getUser() によりセッションを厳密に検証します。&#10;2. user が null の場合は NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) を即時返却します。&#10;..."
                          rows={8}
                          value={exerciseAnswer}
                          onChange={(e) => setExerciseAnswer(e.target.value)}
                          disabled={isSubmittingExercise || exerciseSubmitted}
                          className="text-sm font-sans"
                          required
                        />
                      </div>

                      {!exerciseSubmitted ? (
                        <Button
                          type="submit"
                          disabled={isSubmittingExercise || !exerciseAnswer.trim()}
                          className="w-full sm:w-auto h-11 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                        >
                          {isSubmittingExercise ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              AIが一次採点中（ルーブリック判定）...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              課題を提出してAI自動採点を受ける
                            </>
                          )}
                        </Button>
                      ) : null}
                    </form>

                    {/* AI一次自動採点結果プレビュー */}
                    {aiEvaluation && (
                      <div className="mt-6 p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-3 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            Gemini API による一次自動採点レポート
                          </span>
                          <Badge variant="success" className="font-bold">
                            得点案: {aiEvaluation.score} 点
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-white p-3.5 rounded-lg border border-emerald-100 shadow-2xs">
                          {aiEvaluation.feedback}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          ※ この採点結果は担当講師のダッシュボードへ連携されました。講師による最終確認完了後に正式評価となります。
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* ===================================================================== */}
      {/* 2. AI Tutor 常駐チャットUI (画面右下 FAB ＆ ポップアップ) */}
      {/* ===================================================================== */}

      {/* フローティングボタン (FAB) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="AI Tutor ナビちゃんを開く"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] text-white font-bold items-center justify-center">
              AI
            </span>
          </span>

          {/* ホバーツールチップ (デスクトップ) */}
          <span className="hidden md:group-hover:inline-block absolute right-16 bg-slate-900 text-white text-xs font-medium py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md">
            AI Tutor ナビちゃんに質問する
          </span>
        </button>
      </div>

      {/* チャットポップアップウィンドウ */}
      {isChatOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] max-h-[560px] h-[78vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* チャットヘッダー */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3.5 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-bold">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  AI Tutor ナビちゃん
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-[10px] text-indigo-100">
                  動画文字起こし・ソクラテス型ヒント対応
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* クイック質問チップス */}
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => {
                setChatInput("クイズ第2問のヒントを教えてください");
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-indigo-700 hover:bg-indigo-50 font-medium"
            >
              💡 クイズ第2問のヒント
            </button>
            <button
              onClick={() => {
                setChatInput("この動画の重要ポイントを3行で要約して");
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-indigo-700 hover:bg-indigo-50 font-medium"
            >
              📝 講義の要約
            </button>
          </div>

          {/* メッセージ履歴領域 */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
                  }`}
                >
                  {msg.text}
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === "user" ? "text-indigo-200" : "text-slate-600"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 rounded-2xl px-3.5 py-2 border border-slate-200 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span className="text-[11px]">ナビちゃんが考え中...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* チャット入力バー */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="疑問点やヒントを質問..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Button
              type="submit"
              disabled={!chatInput.trim() || isAiTyping}
              size="icon"
              className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
