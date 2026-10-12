"use client";

import React, { useState, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  BookOpen,
  Video,
  FileText,
  CheckSquare,
  Sparkles,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  HelpCircle,
  Bot,
  Award,
  Play,
  Check,
  Download,
  FileSpreadsheet,
  Calculator,
  Scale,
  Code2,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";

// =============================================================================
// 型定義 (03_DATA_SCHEMA.md ＆ 簿記教材ビルダー仕様)
// =============================================================================

export type StepType = "video" | "text" | "journal" | "quiz" | "exercise";

export interface JournalRow {
  date?: string;
  account: string;
  amount: number | "";
}

export interface JournalQuestion {
  id: string;
  transactionText: string;
  selectableAccounts: string[];
  debits: JournalRow[];
  credits: JournalRow[];
  explanation: string;
  isTAccountMode?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface RubricCriterion {
  id: string;
  perspective: string; // 評価観点
  points: number; // 配点 (合計100点)
  standard: string; // 採点基準
  partialCreditRule: string; // 部分点・減点ルール
}

export interface TableCellData {
  type: "text" | "input" | "empty";
  value?: string;
  correct?: string;
  align?: "left" | "center" | "right";
  isAmount?: boolean;
  borderBottom?: "solid" | "double" | "dashed" | "none";
}

export interface TableExerciseData {
  title: string;
  rows: TableCellData[][];
}

export interface ExerciseBlockData {
  title: string;
  problemPrompt: string;
  modelAnswer: string;
  rubricCriteria: RubricCriterion[];
  tableExercise?: TableExerciseData;
}

export interface StepItem {
  id: string;
  type: StepType;
  title: string;
  estimatedMinutes: number;

  // 講義動画 (video)
  videoPlatform?: "youtube" | "vimeo" | "file";
  videoUrl?: string;

  // 解説テキスト (text)
  headline?: string;
  contentMarkdown?: string;
  diagramUrl?: string;
  keyPoints?: string[];

  // 仕訳問題 (journal)
  journalData?: JournalQuestion;

  // 100点必須クイズ (quiz)
  quizData?: QuizQuestion;

  // 演習・精算表 ＆ ルーブリック (exercise)
  exerciseData?: ExerciseBlockData;
}

// =============================================================================
// 簿記標準勘定科目マスタープリセット
// =============================================================================

const DEFAULT_BOOKKEEPING_ACCOUNTS = [
  // 資産
  "現金", "当座預金", "売掛金", "リース資産", "備品", "車両運搬具", "建物", "繰越商品", "前払金", "未収金",
  // 負債
  "買掛金", "短期借入金", "リース債務", "未払金", "未払法人税等", "前受金", "修繕引当金",
  // 純資産
  "資本金", "資本準備金", "繰越利益剰余金",
  // 費用
  "仕入", "減価償却費", "支払利息", "支払リース料", "給料", "旅費交通費", "消耗品費", "固定資産売却損",
  // 収益
  "売上", "受取利息", "受取手数料", "固定資産売却益", "雑収入",
];

// 補助部門費配賦表・精算表初期プリセット
function getPresetWorksheetTable(): TableExerciseData {
  return {
    title: "決算整理後残高試算表・精算表（抜粋）",
    rows: [
      [
        { type: "text", value: "勘定科目", align: "center" },
        { type: "text", value: "修正記入（借方）", align: "center" },
        { type: "text", value: "修正記入（貸方）", align: "center" },
        { type: "text", value: "損益計算書（借方）", align: "center" },
        { type: "text", value: "貸借対照表（借方）", align: "center" },
        { type: "text", value: "貸借対照表（貸方）", align: "center" },
      ],
      [
        { type: "text", value: "リース資産", align: "left" },
        { type: "input", correct: "3000000", isAmount: true },
        { type: "empty" },
        { type: "empty" },
        { type: "input", correct: "3000000", isAmount: true },
        { type: "empty" },
      ],
      [
        { type: "text", value: "リース債務", align: "left" },
        { type: "input", correct: "720000", isAmount: true },
        { type: "empty" },
        { type: "empty" },
        { type: "empty" },
        { type: "input", correct: "2280000", isAmount: true },
      ],
      [
        { type: "text", value: "減価償却費", align: "left" },
        { type: "input", correct: "600000", isAmount: true },
        { type: "empty" },
        { type: "input", correct: "600000", isAmount: true },
        { type: "empty" },
        { type: "empty" },
      ],
      [
        { type: "text", value: "減価償却累計額", align: "left", borderBottom: "double" },
        { type: "empty", borderBottom: "double" },
        { type: "input", correct: "600000", isAmount: true, borderBottom: "double" },
        { type: "empty", borderBottom: "double" },
        { type: "empty", borderBottom: "double" },
        { type: "input", correct: "600000", isAmount: true, borderBottom: "double" },
      ],
    ],
  };
}

// 初期モジュールステップデータ (単元7: リース取引とは)
const INITIAL_STEPS: StepItem[] = [
  {
    id: "step-1",
    type: "video",
    title: "1. 講義動画：ファイナンス・リース取引の仕組みと利子込み法",
    estimatedMinutes: 15,
    videoPlatform: "youtube",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "step-2",
    type: "text",
    title: "2. 要点解説：ファイナンス・リースとオペレーティング・リースの判定基準",
    estimatedMinutes: 10,
    headline: "ファイナンス・リース取引の判定基準と会計処理の要点",
    contentMarkdown:
      "リース取引は「ファイナンス・リース取引」と「オペレーティング・リース取引」に大別されます。\n\n" +
      "■ ファイナンス・リース取引の2要件：\n" +
      "① ノンキャンセラブル（解約不能）：リース期間の途中で解約できない、または多額の違約金が発生すること。\n" +
      "② フルペイアウト（経済的利益とコストの帰属）：物件からもたらされる経済的便益を実質的に享受し、使用コストを借手が全額負担すること。\n\n" +
      "■ 所有権移転外ファイナンス・リース取引：\n" +
      "借手は取得時に通常の売買取引に準じて「リース資産」「リース債務」を計上します。支払利息の処理は「利子込み法」または「利子抜き法」を採用します。",
    diagramUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    keyPoints: [
      "ノンキャンセラブル ＆ フルペイアウトでファイナンス・リースと判定",
      "所有権移転外の場合、リース資産の減価償却は「リース期間定額法（残存価額ゼロ）」",
      "利子込み法では利息を区分せず、支払額全額をリース料・債務返済として処理",
    ],
  },
  {
    id: "step-3",
    type: "journal",
    title: "3. 【簿記仕訳演習】備品リース取得時および決算整理の仕訳",
    estimatedMinutes: 15,
    journalData: {
      id: "j-01",
      transactionText:
        "【第1問】当社は業務用の高性能PCサーバー（見積現金購入価額 ¥3,000,000）について、所有権移転外ファイナンス・リース契約（リース期間5年、年間リース料 ¥720,000、後払い）を締結し、本日物件の引き渡しを受けた。利子込み法により取得時の仕訳を行いなさい。",
      selectableAccounts: DEFAULT_BOOKKEEPING_ACCOUNTS,
      debits: [{ account: "リース資産", amount: 3000000 }],
      credits: [{ account: "リース債務", amount: 3000000 }],
      explanation:
        "利子込み法により売買処理を行うため、見積現金購入価額 ¥3,000,000 をもって（借）リース資産 3,000,000 / （貸）リース債務 3,000,000 と計上します。",
      isTAccountMode: false,
    },
  },
  {
    id: "step-4",
    type: "quiz",
    title: "4. 【100点必須クイズ】リース会計基準の基本理解テスト",
    estimatedMinutes: 10,
    quizData: {
      id: "q-01",
      question:
        "所有権移転外ファイナンス・リース取引におけるリース資産の減価償却方法として、企業会計基準上正しいものはどれですか？",
      options: [
        "耐用年数を物件の経済的耐用年数とし、残存価額を10%として定額法で償却する",
        "耐用年数をリース期間とし、残存価額をゼロとして定額法で償却する",
        "減価償却は行わず、毎年のリース料支払額のみを支払費用として計上する",
        "税法上の法定耐用年数に基づき、定率法（200%定率法）により償却する",
      ],
      correctIndex: 1,
      explanation:
        "所有権移転外ファイナンス・リース取引では、リース物件が期間終了後に貸手に返還されるため、耐用年数は「リース期間」、残存価額は「ゼロ」とするリース期間定額法を原則とします。",
    },
  },
  {
    id: "step-5",
    type: "exercise",
    title: "5. 【総合演習・精算表】決算整理後残高試算表 ＆ AIルーブリック採点",
    estimatedMinutes: 25,
    exerciseData: {
      title: "決算整理仕訳および精算表の作成演習",
      problemPrompt:
        "決算日（年1回・3月31日）にあたり、当期首（4月1日）に取得した備品リース（取得価額 ¥3,000,000、リース期間5年、残存価額ゼロ、利子込み法）について、第1回リース料 ¥720,000 を当座預金から支払い、決算整理仕訳（減価償却費計上）を行った。精算表の修正記入欄およびAI採点対象の計算根拠をまとめなさい。",
      modelAnswer:
        "【第1回リース料支払】（借）リース債務 720,000 / （貸）当座預金 720,000\n" +
        "【決算整理仕訳・減価償却】（借）減価償却費 600,000 / （貸）減価償却累計額 600,000\n" +
        "※減価償却費 = 3,000,000円 ÷ 5年 = 600,000円/年\n" +
        "精算表の貸借対照表欄において、リース資産 3,000,000、減価償却累計額 △600,000、リース債務残高 2,280,000 が正しく集計される。",
      rubricCriteria: [
        {
          id: "rb-1",
          perspective: "リース取引の認識と取得時会計処理",
          points: 30,
          standard: "利子込み法に基づき、リース資産およびリース債務の計上額（3,000,000円）が正しく認識されていること。",
          partialCreditRule: "金額または勘定科目の一部誤記は15点減点。",
        },
        {
          id: "rb-2",
          perspective: "リース料支払時の債務消滅仕訳",
          points: 30,
          standard: "当座預金からの支払いに伴い、リース債務 720,000円の減額が正確に仕訳されていること。",
          partialCreditRule: "支払利息を計上してしまった場合は利子込み法の趣旨不徹底として10点減点。",
        },
        {
          id: "rb-3",
          perspective: "リース期間定額法による減価償却計算と精算表集計",
          points: 40,
          standard: "リース期間5年・残存価額ゼロに基づき年額 600,000円を正確に算出し、精算表の各欄へ整合的に転記できていること。",
          partialCreditRule: "計算ミスがある場合は20点減点。精算表の貸借不一致はさらに10点減点。",
        },
      ],
      tableExercise: getPresetWorksheetTable(),
    },
  },
];

export default function LessonContentBuilderPage() {
  // 基本メタデータ
  const [courseName, setCourseName] = usePreviewState(`builder:courseName`, "日商簿記2級 商業簿記・工業簿記 総合対策講座 (600h)");
  const [unitTitle, setUnitTitle] = usePreviewState(`builder:unitTitle`, "単元7：リース会計とファイナンス・リース取引の実務処理");
  const [unitBadge, setUnitBadge] = usePreviewState(`builder:unitBadge`, "商業簿記・決算整理");

  // ステップ一覧 ＆ 選択中ステップ
  const [steps, setSteps] = usePreviewState<StepItem[]>(`builder:steps`, INITIAL_STEPS);
  const [selectedStepId, setSelectedStepId] = useState<string>("step-3");

  // リアルタイム受講生プレビュー切替モード
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // AI自動生成ローディング状態
  const [isAiGenerating, setIsAiGenerating] = useState<"quiz" | "rubric" | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // 新規ステップ追加ダイアログ
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [newStepType, setNewStepType] = useState<StepType>("journal");
  const [newStepTitle, setNewStepTitle] = useState("");

  // JSON出力ダイアログ
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // 受講生プレビュー内の受講者回答ステート（仕訳・クイズ・採点結果）
  const [studentJournalAnswers, setStudentJournalAnswers] = useState<{
    debits: { account: string; amount: string }[];
    credits: { account: string; amount: string }[];
  }>({
    debits: [{ account: "", amount: "" }],
    credits: [{ account: "", amount: "" }],
  });
  const [studentQuizSelection, setStudentQuizSelection] = useState<number | null>(null);
  const [previewJournalChecked, setPreviewJournalChecked] = useState<boolean | null>(null);
  const [previewQuizChecked, setPreviewQuizChecked] = useState<boolean | null>(null);

  // AI Tutor 対話シミュレーション
  const [aiTutorMessages, setAiTutorMessages] = useState<
    { sender: "tutor" | "user"; text: string }[]
  >([
    {
      sender: "tutor",
      text: "こんにちは！簿記専属AIチューターです。リース取引の仕訳や利子込み法・利子抜き法の違いで疑問があれば何でも質問してくださいね。",
    },
  ]);
  const [aiTutorInput, setAiTutorInput] = useState("");

  // 現在選択されているステップ
  const currentStep = useMemo(() => {
    return steps.find((s) => s.id === selectedStepId) || steps[0];
  }, [steps, selectedStepId]);

  // モジュール全体の統計サマリー
  const stats = useMemo(() => {
    const totalMinutes = steps.reduce((sum, s) => sum + s.estimatedMinutes, 0);
    const videoCount = steps.filter((s) => s.type === "video").length;
    const textCount = steps.filter((s) => s.type === "text").length;
    const journalCount = steps.filter((s) => s.type === "journal").length;
    const quizCount = steps.filter((s) => s.type === "quiz").length;
    const exerciseCount = steps.filter((s) => s.type === "exercise").length;
    return { totalMinutes, videoCount, textCount, journalCount, quizCount, exerciseCount };
  }, [steps]);

  // ---------------------------------------------------------------------------
  // ステップ操作ハンドラー (追加・削除・並び替え)
  // ---------------------------------------------------------------------------

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;

    const newId = `step-${Date.now()}`;
    let newStepObj: StepItem = {
      id: newId,
      type: newStepType,
      title: newStepTitle.trim(),
      estimatedMinutes: 15,
    };

    if (newStepType === "video") {
      newStepObj.videoPlatform = "youtube";
      newStepObj.videoUrl = "https://www.youtube.com/watch?v=example";
    } else if (newStepType === "text") {
      newStepObj.headline = "新しい解説見出し";
      newStepObj.contentMarkdown = "ここに解説本文を記載してください。";
      newStepObj.keyPoints = ["要点1", "要点2"];
    } else if (newStepType === "journal") {
      newStepObj.journalData = {
        id: `j-${Date.now()}`,
        transactionText: "取引文を入力してください。",
        selectableAccounts: DEFAULT_BOOKKEEPING_ACCOUNTS,
        debits: [{ account: "仕入", amount: 100000 }],
        credits: [{ account: "買掛金", amount: 100000 }],
        explanation: "解説文を入力してください。",
        isTAccountMode: false,
      };
    } else if (newStepType === "quiz") {
      newStepObj.quizData = {
        id: `q-${Date.now()}`,
        question: "4択問題文を入力してください。",
        options: ["選択肢 A", "選択肢 B", "選択肢 C", "選択肢 D"],
        correctIndex: 0,
        explanation: "正解の根拠と解説を入力してください。",
      };
    } else if (newStepType === "exercise") {
      newStepObj.exerciseData = {
        title: "総合演習問題",
        problemPrompt: "演習課題の指示文を入力してください。",
        modelAnswer: "模範解答を記述してください。",
        rubricCriteria: [
          {
            id: `rb-${Date.now()}-1`,
            perspective: "基礎概念の理解と仕訳",
            points: 50,
            standard: "取引内容に応じた正確な勘定科目と金額が計上されていること。",
            partialCreditRule: "誤記がある場合は25点減点。",
          },
          {
            id: `rb-${Date.now()}-2`,
            perspective: "集計および決算手続きの正確性",
            points: 50,
            standard: "残高試算表および財務諸表へ整合的に転記されていること。",
            partialCreditRule: "転記漏れ1件につき10点減点。",
          },
        ],
        tableExercise: getPresetWorksheetTable(),
      };
    }

    setSteps((prev) => [...prev, newStepObj]);
    setSelectedStepId(newId);
    setIsAddStepModalOpen(false);
    setNewStepTitle("");
    showNotify("新しい学習ステップを追加しました。");
  };

  const handleDeleteStep = (id: string) => {
    if (steps.length <= 1) {
      alert("最後の1つのステップは削除できません。");
      return;
    }
    if (confirm("このステップを削除してもよろしいですか？")) {
      const remaining = steps.filter((s) => s.id !== id);
      setSteps(remaining);
      if (selectedStepId === id) {
        setSelectedStepId(remaining[0].id);
      }
      showNotify("ステップを削除しました。");
    }
  };

  const handleMoveStep = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    setSteps(newSteps);
  };

  const updateCurrentStepField = <K extends keyof StepItem>(field: K, value: StepItem[K]) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === selectedStepId ? { ...s, [field]: value } : s))
    );
  };

  // ---------------------------------------------------------------------------
  // 簿記仕訳ブロック用ヘルパー
  // ---------------------------------------------------------------------------

  const journalDebitSum = useMemo(() => {
    if (!currentStep?.journalData?.debits) return 0;
    return currentStep.journalData.debits.reduce(
      (sum, r) => sum + (typeof r.amount === "number" ? r.amount : 0),
      0
    );
  }, [currentStep]);

  const journalCreditSum = useMemo(() => {
    if (!currentStep?.journalData?.credits) return 0;
    return currentStep.journalData.credits.reduce(
      (sum, r) => sum + (typeof r.amount === "number" ? r.amount : 0),
      0
    );
  }, [currentStep]);

  const isJournalBalanced = journalDebitSum === journalCreditSum && journalDebitSum > 0;

  const handleAddJournalRow = (side: "debits" | "credits") => {
    if (!currentStep.journalData) return;
    const currentRows = currentStep.journalData[side] || [];
    const updated = [...currentRows, { account: "", amount: "" as const }];
    updateCurrentStepField("journalData", {
      ...currentStep.journalData,
      [side]: updated,
    });
  };

  const handleRemoveJournalRow = (side: "debits" | "credits", index: number) => {
    if (!currentStep.journalData) return;
    const currentRows = currentStep.journalData[side] || [];
    if (currentRows.length <= 1) return;
    const updated = currentRows.filter((_, i) => i !== index);
    updateCurrentStepField("journalData", {
      ...currentStep.journalData,
      [side]: updated,
    });
  };

  const handleUpdateJournalRow = (
    side: "debits" | "credits",
    index: number,
    field: keyof JournalRow,
    value: any
  ) => {
    if (!currentStep.journalData) return;
    const currentRows = [...(currentStep.journalData[side] || [])];
    currentRows[index] = {
      ...currentRows[index],
      [field]: field === "amount" ? (value === "" ? "" : Number(value) || 0) : value,
    };
    updateCurrentStepField("journalData", {
      ...currentStep.journalData,
      [side]: currentRows,
    });
  };

  // ---------------------------------------------------------------------------
  // AI Copilot 自動生成機能
  // ---------------------------------------------------------------------------

  // ① 講義解説文から仕訳問題・4択クイズを自動生成
  const handleAiGenerateQuizFromText = async () => {
    setIsAiGenerating("quiz");
    await new Promise((r) => setTimeout(r, 1200));

    // 自動生成された仕訳問題＆クイズ
    const aiJournalStep: StepItem = {
      id: `step-ai-j-${Date.now()}`,
      type: "journal",
      title: `3-B. 【AI生成仕訳】リース物件の減価償却費計上（利子込み法）`,
      estimatedMinutes: 10,
      journalData: {
        id: `j-ai-${Date.now()}`,
        transactionText:
          "【AI生成問題】決算日において、当期首に取得した所有権移転外ファイナンス・リース資産（取得価額 ¥4,800,000、リース期間6年、残存価額ゼロ）について、定額法による当期の減価償却費を計上した。利子込み法による決算整理仕訳を行いなさい。",
        selectableAccounts: DEFAULT_BOOKKEEPING_ACCOUNTS,
        debits: [{ account: "減価償却費", amount: 800000 }],
        credits: [{ account: "減価償却累計額", amount: 800000 }],
        explanation:
          "リース期間定額法により、4,800,000円 ÷ 6年 = 800,000円を減価償却費として計上します。（借）減価償却費 800,000 / （貸）減価償却累計額 800,000",
        isTAccountMode: false,
      },
    };

    const aiQuizStep: StepItem = {
      id: `step-ai-q-${Date.now()}`,
      type: "quiz",
      title: `4-B. 【AI生成4択】ファイナンス・リースの解約要件確認テスト`,
      estimatedMinutes: 5,
      quizData: {
        id: `q-ai-${Date.now()}`,
        question:
          "ファイナンス・リース取引の要件である「ノンキャンセラブル」の定義として最も適切なものはどれですか？",
        options: [
          "リース期間の途中で解約することが一切禁止されているか、または解約に際し多額の違約金を支払う義務があること",
          "リース期間終了時に無条件で物品の所有権が借手に無償譲渡されること",
          "リース契約の更新が最低3回以上義務付けられていること",
          "毎月のリース料支払いが銀行口座からの自動振替に限定されていること",
        ],
        correctIndex: 0,
        explanation:
          "ノンキャンセラブルとは、実質的に中途解約ができないこと、または中途解約時に残余リース料相当額の違約金が課される状態を指します。",
      },
    };

    setSteps((prev) => [...prev, aiJournalStep, aiQuizStep]);
    setSelectedStepId(aiJournalStep.id);
    setIsAiGenerating(null);
    showNotify("✨ AIが講義解説文から実践的な仕訳問題と4択クイズを自動生成しました！");
  };

  // ② 模範解答からAI一次採点用ルーブリックを自動生成
  const handleAiGenerateRubric = async () => {
    setIsAiGenerating("rubric");
    await new Promise((r) => setTimeout(r, 1000));

    if (currentStep.type === "exercise" && currentStep.exerciseData) {
      const generatedRubric: RubricCriterion[] = [
        {
          id: `rb-gen-1`,
          perspective: "リース取引の識別と取得原価の正確性",
          points: 30,
          standard: "利子込み法による見積現金購入価額および債務認識が正確に仕訳されていること。",
          partialCreditRule: "金額の一致で15点、勘定科目の一致で15点。",
        },
        {
          id: `rb-gen-2`,
          perspective: "リース期間定額法による減価償却計算（残存ゼロ）",
          points: 35,
          standard: "耐用年数をリース期間（5年）とし、3,000,000÷5=600,000円が正確に導出されていること。",
          partialCreditRule: "計算過程が正しく転記ミスのみの場合は15点加点。",
        },
        {
          id: `rb-gen-3`,
          perspective: "精算表・決算整理後残高試算表への転記整合性",
          points: 35,
          standard: "修正記入欄から貸借対照表欄・損益計算書欄への転記が貸借一致していること。",
          partialCreditRule: "一部欄の集計ミスは1項目につき5点減点。",
        },
      ];

      updateCurrentStepField("exerciseData", {
        ...currentStep.exerciseData,
        rubricCriteria: generatedRubric,
      });
      setIsAiGenerating(null);
      showNotify("✨ 模範解答からGemini API自動採点用の厳密なルーブリック基準を生成しました！");
    } else {
      setIsAiGenerating(null);
      alert("演習・精算表ステップを選択した状態で実行してください。");
    }
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // ---------------------------------------------------------------------------
  // 受講生プレビュー内 インタラクティブ解答ハンドラー
  // ---------------------------------------------------------------------------

  const handleStudentCheckJournal = () => {
    if (!currentStep.journalData) return;
    const modelDebits = currentStep.journalData.debits;
    const modelCredits = currentStep.journalData.credits;

    // 簡単な借方・貸方判定
    const isDebitsMatch =
      studentJournalAnswers.debits[0]?.account === modelDebits[0]?.account &&
      Number(studentJournalAnswers.debits[0]?.amount) === Number(modelDebits[0]?.amount);
    const isCreditsMatch =
      studentJournalAnswers.credits[0]?.account === modelCredits[0]?.account &&
      Number(studentJournalAnswers.credits[0]?.amount) === Number(modelCredits[0]?.amount);

    setPreviewJournalChecked(isDebitsMatch && isCreditsMatch);
  };

  const handleStudentCheckQuiz = () => {
    if (!currentStep.quizData) return;
    setPreviewQuizChecked(studentQuizSelection === currentStep.quizData.correctIndex);
  };

  const handleSendAiTutorMessage = () => {
    if (!aiTutorInput.trim()) return;
    const userMsg = aiTutorInput.trim();
    setAiTutorMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setAiTutorInput("");

    // シミュレーション返答
    setTimeout(() => {
      let reply = "ご質問ありがとうございます！";
      if (userMsg.includes("利子込み") || userMsg.includes("利子抜き")) {
        reply =
          "「利子込み法」はリース料総額をそのまま資産・債務として計上し利息を区分しない簡便法です。一方「利子抜き法」は利息相当額を期間配分して支払利息を計上する原則法です。公的簿記試験では両方の仕訳が頻出します！";
      } else if (userMsg.includes("残存") || userMsg.includes("減価償却")) {
        reply =
          "所有権移転外ファイナンス・リースの場合、物件が返還されるため「残存価額はゼロ」「耐用年数はリース期間」とするのが鉄則です！";
      } else {
        reply =
          "その論点は簿記2級の頻出テーマです。まず取引発生時の借方（資産の増加）と貸方（債務の増加）を確定させ、決算日の減価償却仕訳へと順を追って整理しましょう！";
      }
      setAiTutorMessages((prev) => [...prev, { sender: "tutor", text: reply }]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 pb-16">
      {/* ===================================================================== */}
      {/* 【ヘッダーバー】PCファースト ＆ プレビュー切替・保存バー */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/secretariat/dashboard"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="ダッシュボードへ戻る"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  簿記教材コンテンツビルダー
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  総推定時間: <strong>{stats.totalMinutes}分</strong> ({steps.length}ステップ)
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                {unitTitle}
              </h1>
            </div>
          </div>

          {/* アクションボタングループ */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* 受講生プレビュー切替トグル */}
            <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                {isPreviewMode ? (
                  <Eye className="w-4 h-4 text-emerald-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-500" />
                )}
                受講生プレビュー
              </span>
              <Switch
                checked={isPreviewMode}
                onCheckedChange={setIsPreviewMode}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>

            {/* JSONエクスポート */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              className="text-xs h-9 border-slate-300 font-semibold text-slate-700"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
              JSON出力
            </Button>

            {/* 保存ボタン */}
            <Button
              onClick={() => showNotify("✅ 簿記講座コンテンツ構成をデータベースへ保存しました！")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 shadow-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              教材を保存
            </Button>
          </div>
        </div>
      </header>

      {/* 通知トースト */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Alert className="border-emerald-300 bg-emerald-50 text-emerald-900 shadow-lg py-2.5 px-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <AlertDescription className="text-xs font-bold">{notification}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* ===================================================================== */}
      {/* メイン領域 (2ペイン構造 or 受講生プレビュー表示) */}
      {/* ===================================================================== */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 flex-1">
        {isPreviewMode ? (
          /* ================================================================= */
          /* 【受講生ライブプレビュー画面】リアルタイム学習シミュレーター */
          /* ================================================================= */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* プレビュー案内バナー */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">受講生 ライブ学習プレビュー実行中</h3>
                  <p className="text-xs text-emerald-100">
                    受講生がLMS上で実際に動画を視聴し、仕訳を入力して採点・解説を確認する挙動を忠実に再現しています。
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPreviewMode(false)}
                className="text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-50"
              >
                編集モードに戻る
              </Button>
            </div>

            {/* ステップ切替ナビゲーションバー */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
              {steps.map((st, idx) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedStepId(st.id);
                    setPreviewJournalChecked(null);
                    setPreviewQuizChecked(null);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    selectedStepId === st.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{st.title}</span>
                </button>
              ))}
            </div>

            {/* プレビュー本体コンテンツ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 学習コンテンツメインカラム */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px] font-bold">
                        {currentStep.type === "video" && "🎬 講義動画視聴"}
                        {currentStep.type === "text" && "📖 要点解説"}
                        {currentStep.type === "journal" && "📊 簿記仕訳演習"}
                        {currentStep.type === "quiz" && "🧠 理解度確認テスト"}
                        {currentStep.type === "exercise" && "📋 総合演習・精算表"}
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">
                        所要目安: {currentStep.estimatedMinutes}分
                      </span>
                    </div>
                    <CardTitle className="text-base sm:text-lg font-black text-slate-900 mt-2">
                      {currentStep.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* ① 動画プレビュー */}
                    {currentStep.type === "video" && (
                      <div className="space-y-4">
                        <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden shadow-inner">
                          <Play className="w-12 h-12 text-white/80 mb-2 hover:scale-110 transition-transform cursor-pointer" />
                          <span className="text-xs font-bold text-slate-300">
                            プラットフォーム: {currentStep.videoPlatform?.toUpperCase()}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono mt-1 px-4 text-center truncate max-w-md">
                            {currentStep.videoUrl || "動画URL未設定"}
                          </span>
                        </div>
                        <Alert className="bg-indigo-50 border-indigo-200 text-indigo-900 text-xs">
                          <AlertCircle className="w-4 h-4 text-indigo-600" />
                          <AlertDescription>
                            受講生は等倍速（1.0x）で100%視聴すると次のステップがアンロックされます。
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {/* ② テキスト解説プレビュー */}
                    {currentStep.type === "text" && (
                      <div className="space-y-5 text-sm text-slate-800 leading-relaxed">
                        {currentStep.headline && (
                          <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200">
                            {currentStep.headline}
                          </h3>
                        )}
                        <div className="whitespace-pre-wrap font-sans text-slate-700 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                          {currentStep.contentMarkdown}
                        </div>

                        {currentStep.keyPoints && currentStep.keyPoints.length > 0 && (
                          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl space-y-2">
                            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              講義の最重要ポイント
                            </h4>
                            <ul className="list-disc list-inside text-xs text-amber-950 space-y-1">
                              {currentStep.keyPoints.map((pt, i) => (
                                <li key={i}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ③ 仕訳問題プレビュー */}
                    {currentStep.type === "journal" && currentStep.journalData && (
                      <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed">
                          {currentStep.journalData.transactionText}
                        </div>

                        {/* 受講生仕訳入力欄 */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>受講生の仕訳解答記入欄:</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              借方・貸方の勘定科目と金額を入力してください
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 借方 */}
                            <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-200 space-y-2.5">
                              <div className="text-xs font-black text-blue-900 border-b border-blue-200 pb-1 flex justify-between">
                                <span>借方 (Debit)</span>
                                <span className="font-mono">
                                  ¥{Number(studentJournalAnswers.debits[0]?.amount || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={studentJournalAnswers.debits[0]?.account || ""}
                                  onChange={(e) =>
                                    setStudentJournalAnswers((prev) => ({
                                      ...prev,
                                      debits: [{ ...prev.debits[0], account: e.target.value }],
                                    }))
                                  }
                                  className="text-xs bg-white h-9"
                                >
                                  <option value="">-- 科目を選択 --</option>
                                  {currentStep.journalData.selectableAccounts.map((acc) => (
                                    <option key={acc} value={acc}>
                                      {acc}
                                    </option>
                                  ))}
                                </Select>
                                <Input
                                  type="number"
                                  placeholder="金額"
                                  value={studentJournalAnswers.debits[0]?.amount || ""}
                                  onChange={(e) =>
                                    setStudentJournalAnswers((prev) => ({
                                      ...prev,
                                      debits: [{ ...prev.debits[0], amount: e.target.value }],
                                    }))
                                  }
                                  className="w-28 text-xs font-mono font-bold text-right bg-white h-9"
                                />
                              </div>
                            </div>

                            {/* 貸方 */}
                            <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-200 space-y-2.5">
                              <div className="text-xs font-black text-indigo-900 border-b border-indigo-200 pb-1 flex justify-between">
                                <span>貸方 (Credit)</span>
                                <span className="font-mono">
                                  ¥{Number(studentJournalAnswers.credits[0]?.amount || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={studentJournalAnswers.credits[0]?.account || ""}
                                  onChange={(e) =>
                                    setStudentJournalAnswers((prev) => ({
                                      ...prev,
                                      credits: [{ ...prev.credits[0], account: e.target.value }],
                                    }))
                                  }
                                  className="text-xs bg-white h-9"
                                >
                                  <option value="">-- 科目を選択 --</option>
                                  {currentStep.journalData.selectableAccounts.map((acc) => (
                                    <option key={acc} value={acc}>
                                      {acc}
                                    </option>
                                  ))}
                                </Select>
                                <Input
                                  type="number"
                                  placeholder="金額"
                                  value={studentJournalAnswers.credits[0]?.amount || ""}
                                  onChange={(e) =>
                                    setStudentJournalAnswers((prev) => ({
                                      ...prev,
                                      credits: [{ ...prev.credits[0], amount: e.target.value }],
                                    }))
                                  }
                                  className="w-28 text-xs font-mono font-bold text-right bg-white h-9"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <Button
                              onClick={handleStudentCheckJournal}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-6"
                            >
                              仕訳を採点・判定
                            </Button>
                          </div>
                        </div>

                        {/* 採点結果表示 */}
                        {previewJournalChecked !== null && (
                          <div
                            className={`p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in ${
                              previewJournalChecked
                                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                                : "bg-rose-50 border-rose-300 text-rose-950"
                            }`}
                          >
                            <div className="font-bold flex items-center gap-2 mb-2 text-sm">
                              {previewJournalChecked ? (
                                <>
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  <span>正解です！完璧な仕訳です。</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-5 h-5 text-rose-600" />
                                  <span>不正解です。科目名や金額を見直してください。</span>
                                </>
                              )}
                            </div>
                            <p className="mt-1 font-semibold text-slate-700">
                              【解説】: {currentStep.journalData.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ④ 4択クイズプレビュー */}
                    {currentStep.type === "quiz" && currentStep.quizData && (
                      <div className="space-y-5">
                        <div className="text-sm font-bold text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          {currentStep.quizData.question}
                        </div>

                        <div className="space-y-2.5">
                          {currentStep.quizData.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => setStudentQuizSelection(optIdx)}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                                studentQuizSelection === optIdx
                                  ? "bg-indigo-50 border-indigo-400 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-300"
                                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                                  {["A", "B", "C", "D"][optIdx]}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {studentQuizSelection === optIdx && (
                                <Check className="w-4 h-4 text-indigo-600" />
                              )}
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button
                            disabled={studentQuizSelection === null}
                            onClick={handleStudentCheckQuiz}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-6"
                          >
                            回答を採点・送信
                          </Button>
                        </div>

                        {previewQuizChecked !== null && (
                          <div
                            className={`p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in ${
                              previewQuizChecked
                                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                                : "bg-rose-50 border-rose-300 text-rose-950"
                            }`}
                          >
                            <div className="font-bold flex items-center gap-2 mb-1.5 text-sm">
                              {previewQuizChecked ? (
                                <>
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  <span>100点満点合格！正解です。</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-5 h-5 text-rose-600" />
                                  <span>不正解です。再挑戦して100点を達成してください。</span>
                                </>
                              )}
                            </div>
                            <p className="text-slate-700">
                              【正解】: {["A", "B", "C", "D"][currentStep.quizData.correctIndex]}
                            </p>
                            <p className="mt-1 text-slate-600">
                              【解説】: {currentStep.quizData.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ⑤ 演習・精算表プレビュー */}
                    {currentStep.type === "exercise" && currentStep.exerciseData && (
                      <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {currentStep.exerciseData.problemPrompt}
                        </div>

                        {/* 精算表プレビュー */}
                        {currentStep.exerciseData.tableExercise && (
                          <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-2xs">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                                <tr>
                                  {currentStep.exerciseData.tableExercise.rows[0].map(
                                    (cell, cIdx) => (
                                      <th key={cIdx} className="p-2 border-r border-slate-200 text-center">
                                        {cell.value}
                                      </th>
                                    )
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {currentStep.exerciseData.tableExercise.rows.slice(1).map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    {row.map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        className={`p-2 border-r border-slate-100 text-xs ${
                                          cell.type === "input"
                                            ? "bg-blue-50/30 text-right font-mono font-bold"
                                            : cell.type === "empty"
                                            ? "bg-slate-50 text-slate-300 text-center"
                                            : "font-semibold text-slate-800"
                                        }`}
                                      >
                                        {cell.type === "input" ? (
                                          <span className="text-blue-700">
                                            ¥{Number(cell.correct || 0).toLocaleString()}
                                          </span>
                                        ) : cell.type === "empty" ? (
                                          "／"
                                        ) : (
                                          cell.value
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                          <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                            <Bot className="w-4 h-4 text-indigo-600" />
                            Gemini API による一次自動採点基準（ルーブリック）
                          </h4>
                          <div className="space-y-2">
                            {currentStep.exerciseData.rubricCriteria.map((rb) => (
                              <div
                                key={rb.id}
                                className="bg-white p-2.5 rounded-lg border border-indigo-100 text-xs flex justify-between gap-4"
                              >
                                <div>
                                  <span className="font-bold text-slate-900 block">{rb.perspective}</span>
                                  <span className="text-slate-600 text-[11px]">{rb.standard}</span>
                                </div>
                                <Badge className="bg-indigo-100 text-indigo-800 font-mono font-bold text-xs shrink-0 self-start">
                                  {rb.points}点
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 右ペイン: 簿記専属AI Tutor シミュレーター */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="border-indigo-200 bg-white shadow-sm overflow-hidden sticky top-24">
                  <CardHeader className="py-3 px-4 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white">
                    <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-2">
                      <Bot className="w-4 h-4 text-indigo-200" />
                      AI Tutor（簿記学習アシスタント）
                    </CardTitle>
                    <CardDescription className="text-[11px] text-indigo-200">
                      受講中の仕訳ルールや疑問点にリアルタイム回答
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
                    {aiTutorMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-2 text-xs leading-relaxed ${
                          msg.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.sender === "tutor" && (
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0 font-bold text-[10px]">
                            AI
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-2xl max-w-[85%] ${
                            msg.sender === "user"
                              ? "bg-indigo-600 text-white font-medium"
                              : "bg-slate-100 text-slate-800 font-normal"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
                    <Input
                      placeholder="例: 利子込み法と利子抜き法の違いは？"
                      value={aiTutorInput}
                      onChange={(e) => setAiTutorInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendAiTutorMessage()}
                      className="text-xs h-9 bg-white"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendAiTutorMessage}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-3 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* 【エディタモード】添付エディタと同等のPCファースト2ペイン構成 */
          /* ================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* --------------------------------------------------------------- */}
            {/* 左サイドバー: 目次・ステップ階層ツリー ＆ 操作 */}
            {/* --------------------------------------------------------------- */}
            <aside className="lg:col-span-4 space-y-4">
              <Card className="border-slate-200 bg-white shadow-2xs overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      単元ステップ構成ツリー
                    </CardTitle>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      全{steps.length}項目
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-2 space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {steps.map((st, index) => {
                    const isSelected = st.id === selectedStepId;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStepId(st.id)}
                        className={`group p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-indigo-50/80 border-indigo-400 text-indigo-950 font-bold shadow-2xs ring-1 ring-indigo-200"
                            : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* タイプ別アイコン */}
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              st.type === "video"
                                ? "bg-purple-100 text-purple-700"
                                : st.type === "text"
                                ? "bg-blue-100 text-blue-700"
                                : st.type === "journal"
                                ? "bg-amber-100 text-amber-800"
                                : st.type === "quiz"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {st.type === "video" && <Video className="w-3.5 h-3.5" />}
                            {st.type === "text" && <FileText className="w-3.5 h-3.5" />}
                            {st.type === "journal" && <Scale className="w-3.5 h-3.5" />}
                            {st.type === "quiz" && <CheckSquare className="w-3.5 h-3.5" />}
                            {st.type === "exercise" && <FileSpreadsheet className="w-3.5 h-3.5" />}
                          </div>

                          <div className="truncate">
                            <span className="text-slate-400 font-mono mr-1.5 text-[11px]">
                              Step {index + 1}
                            </span>
                            <span className="truncate">{st.title}</span>
                          </div>
                        </div>

                        {/* 操作ボタン (上移動・下移動・削除) */}
                        <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveStep(index, -1);
                            }}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-20"
                            title="上へ"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === steps.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveStep(index, 1);
                            }}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-20"
                            title="下へ"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStep(st.id);
                            }}
                            className="p-1 rounded hover:bg-rose-100 text-rose-500 hover:text-rose-700"
                            title="削除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>

                <CardFooter className="p-3 border-t border-slate-100 bg-slate-50 flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setNewStepTitle(`新規ステップ ${steps.length + 1}`);
                      setIsAddStepModalOpen(true);
                    }}
                    variant="outline"
                    className="w-full text-xs font-bold border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50 h-9"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    新しいステップを追加
                  </Button>
                </CardFooter>
              </Card>

              {/* AI Copilot アシストツールパネル */}
              <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 shadow-2xs">
                <CardHeader className="py-3 px-4 border-b border-indigo-100">
                  <CardTitle className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Copilot 簿記教材生成支援
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3.5 space-y-2.5">
                  <Button
                    onClick={handleAiGenerateQuizFromText}
                    disabled={isAiGenerating !== null}
                    className="w-full text-xs font-bold justify-start bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 h-9 shadow-2xs"
                  >
                    {isAiGenerating === "quiz" ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-indigo-600" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 mr-2 text-indigo-600" />
                    )}
                    講義解説から仕訳・4択クイズを自動生成
                  </Button>

                  <Button
                    onClick={handleAiGenerateRubric}
                    disabled={isAiGenerating !== null}
                    className="w-full text-xs font-bold justify-start bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 h-9 shadow-2xs"
                  >
                    {isAiGenerating === "rubric" ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-purple-600" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 mr-2 text-purple-600" />
                    )}
                    模範解答からAI一次採点ルーブリック生成
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* --------------------------------------------------------------- */}
            {/* 中央メイン領域: 選択ステップのブロック型コンテンツエディタ */}
            {/* --------------------------------------------------------------- */}
            <main className="lg:col-span-8 space-y-6">
              {/* ステップ基本メタエディタ */}
              <Card className="border-slate-200 bg-white shadow-2xs">
                <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-900 text-white text-xs font-bold">
                        {currentStep.type === "video" && "🎬 動画視聴ステップ"}
                        {currentStep.type === "text" && "📖 要点解説ステップ"}
                        {currentStep.type === "journal" && "📊 簿記仕訳問題ステップ"}
                        {currentStep.type === "quiz" && "🧠 100点必須クイズステップ"}
                        {currentStep.type === "exercise" && "📋 演習・精算表ステップ"}
                      </Badge>
                      <span className="text-xs font-mono text-slate-400">ID: {currentStep.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">標準所要時間:</span>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={currentStep.estimatedMinutes}
                        onChange={(e) =>
                          updateCurrentStepField("estimatedMinutes", Number(e.target.value) || 10)
                        }
                        className="w-20 text-xs font-mono font-bold text-center h-8"
                      />
                      <span className="text-xs text-slate-500 font-bold">分</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      ステップタイトル <span className="text-red-500">*</span>:
                    </label>
                    <Input
                      value={currentStep.title}
                      onChange={(e) => updateCurrentStepField("title", e.target.value)}
                      className="text-xs sm:text-sm font-bold h-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ------------------------------------------------------------- */}
              {/* ブロック①: 講義動画エディタ (video) */}
              {/* ------------------------------------------------------------- */}
              {currentStep.type === "video" && (
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-3 px-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-600" />
                      講義動画配信設定（MP4 / YouTube / Vimeo）
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          配信プラットフォーム:
                        </label>
                        <Select
                          value={currentStep.videoPlatform || "youtube"}
                          onChange={(e) =>
                            updateCurrentStepField("videoPlatform", e.target.value as any)
                          }
                          className="text-xs font-bold h-10"
                        >
                          <option value="youtube">YouTube (埋め込み再生)</option>
                          <option value="vimeo">Vimeo (プライベート配信)</option>
                          <option value="file">MP4直接ファイル配信 (S3/Cloud Storage)</option>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          動画URLまたは動画ID:
                        </label>
                        <Input
                          value={currentStep.videoUrl || ""}
                          onChange={(e) => updateCurrentStepField("videoUrl", e.target.value)}
                          placeholder="例: https://www.youtube.com/watch?v=..."
                          className="text-xs font-mono h-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ------------------------------------------------------------- */}
              {/* ブロック②: 解説・テキストブロック (text) */}
              {/* ------------------------------------------------------------- */}
              {currentStep.type === "text" && (
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-3 px-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      講義要点・図解テキストの編集
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        大見出し (Headline):
                      </label>
                      <Input
                        value={currentStep.headline || ""}
                        onChange={(e) => updateCurrentStepField("headline", e.target.value)}
                        placeholder="例: ファイナンス・リース取引の判定基準と会計処理の要点"
                        className="text-xs font-bold h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        講義本文 (Markdown / リッチテキスト):
                      </label>
                      <Textarea
                        rows={8}
                        value={currentStep.contentMarkdown || ""}
                        onChange={(e) => updateCurrentStepField("contentMarkdown", e.target.value)}
                        placeholder="解説本文、条文の要約、勘定科目の定義などを記入"
                        className="text-xs font-mono leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        図解イラスト/チャート画像URL (任意):
                      </label>
                      <Input
                        value={currentStep.diagramUrl || ""}
                        onChange={(e) => updateCurrentStepField("diagramUrl", e.target.value)}
                        placeholder="https://..."
                        className="text-xs font-mono h-10"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ------------------------------------------------------------- */}
              {/* ブロック③: 【簿記専用】仕訳問題ブロック (journal) */}
              {/* ------------------------------------------------------------- */}
              {currentStep.type === "journal" && currentStep.journalData && (
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Scale className="w-4 h-4 text-amber-600" />
                        【簿記専用】仕訳問題＆貸借整合性バリデータ
                      </CardTitle>

                      {/* 貸借一致インジケーター */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">貸借判定:</span>
                        {isJournalBalanced ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            貸借一致 (¥{journalDebitSum.toLocaleString()})
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="text-xs font-bold flex items-center gap-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            不一致 (借: ¥{journalDebitSum.toLocaleString()} / 貸: ¥
                            {journalCreditSum.toLocaleString()})
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* 取引文入力 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        出題取引文 <span className="text-red-500">*</span>:
                      </label>
                      <Textarea
                        rows={3}
                        value={currentStep.journalData.transactionText}
                        onChange={(e) =>
                          updateCurrentStepField("journalData", {
                            ...currentStep.journalData!,
                            transactionText: e.target.value,
                          })
                        }
                        placeholder="例: 備品（購入価額 ¥3,000,000）を所有権移転外ファイナンス・リースにより取得した。"
                        className="text-xs font-medium leading-relaxed"
                      />
                    </div>

                    {/* 借方・貸方テーブル編集フォーム */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 借方 (Debit) */}
                      <div className="border border-blue-200 bg-blue-50/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                          <span className="text-xs font-black text-blue-900 flex items-center gap-1">
                            借方 (Debits) 計: ¥{journalDebitSum.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddJournalRow("debits")}
                            className="text-[11px] h-7 border-blue-200 text-blue-700 bg-white font-bold"
                          >
                            + 行追加
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {currentStep.journalData.debits.map((row, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-2">
                              <Select
                                value={row.account}
                                onChange={(e) =>
                                  handleUpdateJournalRow("debits", rIdx, "account", e.target.value)
                                }
                                className="text-xs bg-white h-9 flex-1"
                              >
                                <option value="">-- 科目を選択 --</option>
                                {currentStep.journalData!.selectableAccounts.map((acc) => (
                                  <option key={acc} value={acc}>
                                    {acc}
                                  </option>
                                ))}
                              </Select>
                              <Input
                                type="number"
                                placeholder="金額"
                                value={row.amount}
                                onChange={(e) =>
                                  handleUpdateJournalRow("debits", rIdx, "amount", e.target.value)
                                }
                                className="w-28 text-xs font-mono font-bold text-right bg-white h-9"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveJournalRow("debits", rIdx)}
                                disabled={currentStep.journalData!.debits.length <= 1}
                                className="h-9 w-8 p-0 text-slate-400 hover:text-red-600 disabled:opacity-20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 貸方 (Credit) */}
                      <div className="border border-indigo-200 bg-indigo-50/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                          <span className="text-xs font-black text-indigo-900 flex items-center gap-1">
                            貸方 (Credits) 計: ¥{journalCreditSum.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddJournalRow("credits")}
                            className="text-[11px] h-7 border-indigo-200 text-indigo-700 bg-white font-bold"
                          >
                            + 行追加
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {currentStep.journalData.credits.map((row, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-2">
                              <Select
                                value={row.account}
                                onChange={(e) =>
                                  handleUpdateJournalRow("credits", rIdx, "account", e.target.value)
                                }
                                className="text-xs bg-white h-9 flex-1"
                              >
                                <option value="">-- 科目を選択 --</option>
                                {currentStep.journalData!.selectableAccounts.map((acc) => (
                                  <option key={acc} value={acc}>
                                    {acc}
                                  </option>
                                ))}
                              </Select>
                              <Input
                                type="number"
                                placeholder="金額"
                                value={row.amount}
                                onChange={(e) =>
                                  handleUpdateJournalRow("credits", rIdx, "amount", e.target.value)
                                }
                                className="w-28 text-xs font-mono font-bold text-right bg-white h-9"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveJournalRow("credits", rIdx)}
                                disabled={currentStep.journalData!.credits.length <= 1}
                                className="h-9 w-8 p-0 text-slate-400 hover:text-red-600 disabled:opacity-20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 解答解説 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        模範解答の解説文・着眼点:
                      </label>
                      <Textarea
                        rows={3}
                        value={currentStep.journalData.explanation}
                        onChange={(e) =>
                          updateCurrentStepField("journalData", {
                            ...currentStep.journalData!,
                            explanation: e.target.value,
                          })
                        }
                        placeholder="受講生が回答後に確認できる正解理由を記入"
                        className="text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ------------------------------------------------------------- */}
              {/* ブロック④: 100点必須クイズブロック (quiz) */}
              {/* ------------------------------------------------------------- */}
              {currentStep.type === "quiz" && currentStep.quizData && (
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                      100点必須クイズブロック (set_quizzes)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        4択問題文 <span className="text-red-500">*</span>:
                      </label>
                      <Textarea
                        rows={3}
                        value={currentStep.quizData.question}
                        onChange={(e) =>
                          updateCurrentStepField("quizData", {
                            ...currentStep.quizData!,
                            question: e.target.value,
                          })
                        }
                        className="text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700 block">
                        選択肢 A〜D (ラジオボタンで正解を指定) <span className="text-red-500">*</span>:
                      </label>

                      {currentStep.quizData.options.map((opt, oIdx) => {
                        const isCorrect = currentStep.quizData!.correctIndex === oIdx;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                              isCorrect
                                ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                              <input
                                type="radio"
                                name="quizCorrectRadio"
                                checked={isCorrect}
                                onChange={() =>
                                  updateCurrentStepField("quizData", {
                                    ...currentStep.quizData!,
                                    correctIndex: oIdx,
                                  })
                                }
                                className="w-4 h-4 text-emerald-600"
                              />
                              <span
                                className={`text-xs font-black ${
                                  isCorrect ? "text-emerald-700" : "text-slate-400"
                                }`}
                              >
                                {["A", "B", "C", "D"][oIdx]} (正解)
                              </span>
                            </label>

                            <Input
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...currentStep.quizData!.options] as [
                                  string,
                                  string,
                                  string,
                                  string
                                ];
                                newOpts[oIdx] = e.target.value;
                                updateCurrentStepField("quizData", {
                                  ...currentStep.quizData!,
                                  options: newOpts,
                                });
                              }}
                              className="text-xs font-medium h-9 flex-1"
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        正解の解説文 (正解・不正解時に学習者へ提示):
                      </label>
                      <Textarea
                        rows={3}
                        value={currentStep.quizData.explanation}
                        onChange={(e) =>
                          updateCurrentStepField("quizData", {
                            ...currentStep.quizData!,
                            explanation: e.target.value,
                          })
                        }
                        className="text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ------------------------------------------------------------- */}
              {/* ブロック⑤: 記述・精算表演習 ＆ ルーブリック (exercise) */}
              {/* ------------------------------------------------------------- */}
              {currentStep.type === "exercise" && currentStep.exerciseData && (
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                      記述・精算表演習 ＆ AI一次採点ルーブリック基準
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        演習問題指示文 <span className="text-red-500">*</span>:
                      </label>
                      <Textarea
                        rows={4}
                        value={currentStep.exerciseData.problemPrompt}
                        onChange={(e) =>
                          updateCurrentStepField("exerciseData", {
                            ...currentStep.exerciseData!,
                            problemPrompt: e.target.value,
                          })
                        }
                        className="text-xs leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        模範解答・計算根拠:
                      </label>
                      <Textarea
                        rows={4}
                        value={currentStep.exerciseData.modelAnswer}
                        onChange={(e) =>
                          updateCurrentStepField("exerciseData", {
                            ...currentStep.exerciseData!,
                            modelAnswer: e.target.value,
                          })
                        }
                        className="text-xs font-mono leading-relaxed bg-slate-50"
                      />
                    </div>

                    {/* ルーブリック基準設定テーブル */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-indigo-600" />
                          Gemini API 一次自動採点用ルーブリック評価観点 (合計100点基準)
                        </label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newRb: RubricCriterion = {
                              id: `rb-${Date.now()}`,
                              perspective: "新規評価観点",
                              points: 20,
                              standard: "基準内容を記述してください。",
                              partialCreditRule: "部分点ルールを記述。",
                            };
                            updateCurrentStepField("exerciseData", {
                              ...currentStep.exerciseData!,
                              rubricCriteria: [...currentStep.exerciseData!.rubricCriteria, newRb],
                            });
                          }}
                          className="text-[11px] h-7 border-indigo-200 text-indigo-700 font-bold"
                        >
                          + 評価観点を追加
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {currentStep.exerciseData.rubricCriteria.map((rb, rIdx) => (
                          <div
                            key={rb.id}
                            className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <Input
                                value={rb.perspective}
                                onChange={(e) => {
                                  const updated = [...currentStep.exerciseData!.rubricCriteria];
                                  updated[rIdx] = { ...updated[rIdx], perspective: e.target.value };
                                  updateCurrentStepField("exerciseData", {
                                    ...currentStep.exerciseData!,
                                    rubricCriteria: updated,
                                  });
                                }}
                                placeholder="評価観点名 (例: リース債務消滅仕訳の正確性)"
                                className="text-xs font-bold h-8 flex-1 bg-white"
                              />

                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[11px] font-bold text-slate-500">配点:</span>
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={rb.points}
                                  onChange={(e) => {
                                    const updated = [...currentStep.exerciseData!.rubricCriteria];
                                    updated[rIdx] = {
                                      ...updated[rIdx],
                                      points: Number(e.target.value) || 0,
                                    };
                                    updateCurrentStepField("exerciseData", {
                                      ...currentStep.exerciseData!,
                                      rubricCriteria: updated,
                                    });
                                  }}
                                  className="w-16 text-xs font-mono font-bold text-center h-8 bg-white"
                                />
                                <span className="text-xs font-bold text-slate-600">点</span>
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const updated = currentStep.exerciseData!.rubricCriteria.filter(
                                    (_, i) => i !== rIdx
                                  );
                                  updateCurrentStepField("exerciseData", {
                                    ...currentStep.exerciseData!,
                                    rubricCriteria: updated,
                                  });
                                }}
                                className="h-8 w-7 p-0 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input
                                value={rb.standard}
                                onChange={(e) => {
                                  const updated = [...currentStep.exerciseData!.rubricCriteria];
                                  updated[rIdx] = { ...updated[rIdx], standard: e.target.value };
                                  updateCurrentStepField("exerciseData", {
                                    ...currentStep.exerciseData!,
                                    rubricCriteria: updated,
                                  });
                                }}
                                placeholder="満点付与の合格基準"
                                className="text-[11px] h-8 bg-white"
                              />
                              <Input
                                value={rb.partialCreditRule}
                                onChange={(e) => {
                                  const updated = [...currentStep.exerciseData!.rubricCriteria];
                                  updated[rIdx] = {
                                    ...updated[rIdx],
                                    partialCreditRule: e.target.value,
                                  };
                                  updateCurrentStepField("exerciseData", {
                                    ...currentStep.exerciseData!,
                                    rubricCriteria: updated,
                                  });
                                }}
                                placeholder="部分点・減点ルール"
                                className="text-[11px] h-8 bg-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 新規ステップ追加ダイアログ */}
      {/* ===================================================================== */}
      <Dialog open={isAddStepModalOpen} onOpenChange={setIsAddStepModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              新規学習ステップの追加
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              追加するコンテンツの種別を選択し、タイトルを入力してください。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">ステップ種別:</label>
              <Select
                value={newStepType}
                onChange={(e) => setNewStepType(e.target.value as StepType)}
                className="text-xs font-semibold h-10"
              >
                <option value="journal">📊 【簿記専用】仕訳問題ブロック</option>
                <option value="quiz">🧠 100点必須クイズブロック (4択)</option>
                <option value="exercise">📋 記述・精算表演習 ＆ ルーブリック</option>
                <option value="text">📖 解説・テキスト・要点ブロック</option>
                <option value="video">🎬 講義動画視聴ブロック</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">ステップタイトル:</label>
              <Input
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                placeholder="例: 単元7-2 リース料支払時の仕訳演習"
                className="text-xs font-semibold h-10"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddStepModalOpen(false)}
              className="text-xs h-9"
            >
              キャンセル
            </Button>
            <Button
              size="sm"
              onClick={handleAddStep}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9"
            >
              追加する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================================== */}
      {/* JSON出力ダイアログ */}
      {/* ===================================================================== */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              教材構成データ JSONエクスポート
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              作成した簿記教材ステップおよびルーブリック定義の完全なJSONデータです。
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              readOnly
              rows={14}
              value={JSON.stringify({ courseName, unitTitle, unitBadge, steps }, null, 2)}
              className="text-[11px] font-mono bg-slate-50 leading-relaxed"
            />
          </div>
          <DialogFooter>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify({ courseName, unitTitle, unitBadge, steps }, null, 2)
                );
                showNotify("クリップボードにJSONをコピーしました！");
                setIsExportModalOpen(false);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9"
            >
              クリップボードにコピー
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
