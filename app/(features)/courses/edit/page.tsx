"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "@/components/navigation/Link";
import { useDemo, id, usePreviewState } from "@/src/demo/store";
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
  Sparkles,
  Save,
  ArrowLeft,
  FileText,
  Link2,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle2,
  Users,
  Layers,
  HelpCircle,
  Bookmark,
  Calendar,
  AlertCircle,
  FileCheck,
  Loader2,
  Clock,
  BookOpen,
  Briefcase,
  GraduationCap,
  Hammer,
  ShieldAlert,
  ArrowRight,
  Info,
  CalendarDays,
  Home,
  School,
  Copy,
  RotateCcw,
} from "lucide-react";

// =============================================================================
// データ型定義
// =============================================================================

// エビデンスデータ (course_evidences)
interface EvidenceItem {
  id: string;
  targetField: "necessityAndReason" | "expectedEffects";
  numberIndex: number; // ※1, ※2 ...
  claimText: string;
  sourceName: string;
  evidenceType: "url" | "file";
  referenceUrl?: string;
  fileName?: string;
  createdAt: string;
}

// 科目データ (course_subjects)
export interface CourseSubject {
  id: string;
  courseId: string;
  name: string;
  category: "lecture" | "practical"; // 学科 (lecture) / 実技 (practical)
  description: string;
  hours: number;
  orderIndex: number;
}

// 日別カリキュラム行データ (daily_curriculums)
export interface DailyCurriculumRow {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // 月, 火, 水, 木, 金, 土, 日
  locationType: "at_home" | "schooling"; // 在宅 or スクーリング
  subjectId: string; // course_subjects.id との動的外部キー連動
  subjectName: string; // 科目名
  trainingHours: number; // 訓練時間 (h)
  method: "face_to_face" | "online"; // 対面 / 通信
  classType: "group" | "individual"; // 集合 / 個別
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isTestDay: boolean; // 効果測定・検定日
  isCareerConsulting: boolean; // キャリア面談日
}

// 共同編集アバター
const COLLABORATORS = [
  { id: "u-1", name: "佐藤 恵美", role: "事務局", color: "bg-blue-600", initial: "佐" },
  { id: "u-2", name: "田中 健一", role: "システム管理者", color: "bg-emerald-600", initial: "田" },
  { id: "u-3", name: "佐々木 慎太郎", role: "担当講師", color: "bg-purple-600", initial: "木" },
];

// 初期科目マスターデータ（公的職業訓練600h基準）
const INITIAL_SUBJECTS: CourseSubject[] = [
  {
    id: "sub-1",
    courseId: "course-01",
    name: "Webシステム基礎・インターネット概論",
    category: "lecture",
    description: "HTTPプロトコル、DNS、クライアント・サーバーモデル、Webセキュリティ基礎および著作権・倫理規定を習得する。",
    hours: 30.0,
    orderIndex: 1,
  },
  {
    id: "sub-2",
    courseId: "course-01",
    name: "プログラミング基礎・アルゴリズム特論",
    category: "lecture",
    description: "変数、制御構文、関数、配列、オブジェクト指向の基本概念、計算量とデータ構造の基礎を理解する。",
    hours: 45.0,
    orderIndex: 2,
  },
  {
    id: "sub-3",
    courseId: "course-01",
    name: "HTML5/CSS3 レスポンシブWebデザイン実習",
    category: "practical",
    description: "セマンティックWeb、Flexbox、CSS Grid、Tailwind CSSを用いたスマートフォン・PC対応のモダンUIコーディング演習。",
    hours: 90.0,
    orderIndex: 3,
  },
  {
    id: "sub-4",
    courseId: "course-01",
    name: "JavaScript/TypeScript 実践プログラミング",
    category: "practical",
    description: "モダンJavaScript（ESNext）、DOM操作、イベント駆動、非同期処理（Promise/Async/Await）およびTypeScriptの静的型付け実習。",
    hours: 120.0,
    orderIndex: 4,
  },
  {
    id: "sub-5",
    courseId: "course-01",
    name: "React ＆ Next.js フルスタックアプリケーション構築演習",
    category: "practical",
    description: "Reactコンポーネント設計、状態管理、Next.js App Router、Route HandlersおよびServer Actionsを用いた実務Webアプリ開発。",
    hours: 150.0,
    orderIndex: 5,
  },
  {
    id: "sub-6",
    courseId: "course-01",
    name: "リレーショナルデータベース設計 ＆ Supabase/SQL演習",
    category: "practical",
    description: "ER図作成、第3正規化、PostgreSQLのクエリ最適化、Supabase AuthおよびRow Level Security (RLS) による権限制御。",
    hours: 75.0,
    orderIndex: 6,
  },
  {
    id: "sub-7",
    courseId: "course-01",
    name: "ソフトウェアテスト ＆ チーム開発総合制作実習",
    category: "practical",
    description: "Git/GitHubフロー、アジャイルスクラム開発、ユニットテスト、Vercel/Cloud RunへのCI/CDデプロイ、成果発表会。",
    hours: 90.0,
    orderIndex: 7,
  },
];

// 初期日別カリキュラムデータ（初期10日分）
const INITIAL_CURRICULUM_DATA: DailyCurriculumRow[] = [
  {
    id: "dc-01",
    date: "2026-09-01",
    dayOfWeek: "火",
    locationType: "schooling",
    subjectId: "sub-1",
    subjectName: "Webシステム基礎・インターネット概論",
    trainingHours: 6.0,
    method: "face_to_face",
    classType: "group",
    startTime: "09:30",
    endTime: "16:30",
    isTestDay: false,
    isCareerConsulting: false,
  },
  {
    id: "dc-02",
    date: "2026-09-02",
    dayOfWeek: "水",
    locationType: "at_home",
    subjectId: "sub-1",
    subjectName: "Webシステム基礎・インターネット概論",
    trainingHours: 6.0,
    method: "online",
    classType: "group",
    startTime: "",
    endTime: "",
    isTestDay: false,
    isCareerConsulting: false,
  },
  {
    id: "dc-03",
    date: "2026-09-03",
    dayOfWeek: "木",
    locationType: "at_home",
    subjectId: "sub-2",
    subjectName: "プログラミング基礎・アルゴリズム特論",
    trainingHours: 6.0,
    method: "online",
    classType: "group",
    startTime: "",
    endTime: "",
    isTestDay: false,
    isCareerConsulting: false,
  },
  {
    id: "dc-04",
    date: "2026-09-04",
    dayOfWeek: "金",
    locationType: "schooling",
    subjectId: "sub-2",
    subjectName: "プログラミング基礎・アルゴリズム特論",
    trainingHours: 6.0,
    method: "face_to_face",
    classType: "group",
    startTime: "09:30",
    endTime: "16:30",
    isTestDay: false,
    isCareerConsulting: false,
  },
  {
    id: "dc-05",
    date: "2026-09-07",
    dayOfWeek: "月",
    locationType: "at_home",
    subjectId: "sub-3",
    subjectName: "HTML5/CSS3 レスポンシブWebデザイン実習",
    trainingHours: 6.0,
    method: "online",
    classType: "group",
    startTime: "",
    endTime: "",
    isTestDay: false,
    isCareerConsulting: false,
  },
  {
    id: "dc-06",
    date: "2026-09-08",
    dayOfWeek: "火",
    locationType: "at_home",
    subjectId: "sub-3",
    subjectName: "HTML5/CSS3 レスポンシブWebデザイン実習",
    trainingHours: 6.0,
    method: "online",
    classType: "group",
    startTime: "",
    endTime: "",
    isTestDay: false,
    isCareerConsulting: false,
  },
  {
    id: "dc-07",
    date: "2026-09-09",
    dayOfWeek: "水",
    locationType: "schooling",
    subjectId: "sub-3",
    subjectName: "HTML5/CSS3 レスポンシブWebデザイン実習",
    trainingHours: 6.0,
    method: "face_to_face",
    classType: "group",
    startTime: "09:30",
    endTime: "16:30",
    isTestDay: false,
    isCareerConsulting: false,
  },
  {
    id: "dc-08",
    date: "2026-09-10",
    dayOfWeek: "木",
    locationType: "at_home",
    subjectId: "sub-4",
    subjectName: "JavaScript/TypeScript 実践プログラミング",
    trainingHours: 6.0,
    method: "online",
    classType: "group",
    startTime: "",
    endTime: "",
    isTestDay: false,
    isCareerConsulting: false,
  },
  {
    id: "dc-09",
    date: "2026-09-11",
    dayOfWeek: "金",
    locationType: "at_home",
    subjectId: "sub-4",
    subjectName: "JavaScript/TypeScript 実践プログラミング",
    trainingHours: 6.0,
    method: "online",
    classType: "group",
    startTime: "",
    endTime: "",
    isTestDay: false,
    isCareerConsulting: true,
  },
  {
    id: "dc-10",
    date: "2026-09-14",
    dayOfWeek: "月",
    locationType: "schooling",
    subjectId: "sub-5",
    subjectName: "React ＆ Next.js フルスタックアプリケーション構築演習",
    trainingHours: 6.0,
    method: "face_to_face",
    classType: "group",
    startTime: "09:30",
    endTime: "16:30",
    isTestDay: true,
    isCareerConsulting: false,
  },
];

export default function CourseEditPage({
  initialTab = "basic",
  courseId = "course-01",
}: {
  initialTab?: "basic" | "syllabus" | "curriculum" | "career";
  courseId?: string;
} = {}) {
  const { data, setData } = useDemo();
  const selectedCourse = data.courses.find(course => course.id === courseId);
  // 4タブ管理: "basic" | "syllabus" | "curriculum" | "career"
  const [activeTab, setActiveTab] = useState<"basic" | "syllabus" | "curriculum" | "career">(initialTab);

  // ===========================================================================
  // 【タブ1】コース基本情報 ＆ エビデンス注記
  // ===========================================================================
  const [courseTitle, setCourseTitle] = usePreviewState(`course:${courseId}:courseTitle`, selectedCourse?.title || "DX人材育成＆Webフルスタック開発科");
  const [capacity, setCapacity] = usePreviewState(`course:${courseId}:capacity`, selectedCourse?.capacity || 30);
  const [trainingStartDate, setTrainingStartDate] = usePreviewState(`course:${courseId}:trainingStartDate`, selectedCourse?.period.split('–')[0]?.replaceAll('/','-') || "2026-09-01");
  const [trainingEndDate, setTrainingEndDate] = usePreviewState(`course:${courseId}:trainingEndDate`, selectedCourse?.period.split('–')[1]?.replaceAll('/','-') || "2027-02-28");
  const [startMonth, setStartMonth] = usePreviewState(`course:${courseId}:startMonth`, "2026年9月開講");
  const [targetHours, setTargetHours] = usePreviewState<number>(`course:${courseId}:targetHours`, 600); // ① 設定総訓練時間
  const [targetJobTypes, setTargetJobTypes] = usePreviewState(`course:${courseId}:targetJobTypes`, "Webエンジニア、フロントエンド開発者、バックエンド開発者");

  const [trainingGoals, setTrainingGoals] = usePreviewState(`course:${courseId}:trainingGoals`,
    "Webアプリケーション開発の実務に必要なフロントエンド（Next.js/React）、サーバーサイドAPI設計、データベース（PostgreSQL/Supabase）の構築技術を習得し、IT業界への早期正社員就職を目指す。"
  );

  const [necessityAndReason, setNecessityAndReason] = usePreviewState(`course:${courseId}:necessityAndReason`,
    "近年の経済産業省DXレポートによると、IT人材の需要過多による需給ギャップは約43万人に達すると推計されている※1。当地域におけるWebエンジニアの有効求人倍率も高水準※2 を維持しており、本訓練を通じて未経験者から即戦力となる実務エンジニアを育成する緊急性が極めて高い。"
  );

  const [expectedEffects, setExpectedEffects] = usePreviewState(`course:${courseId}:expectedEffects`,
    "求職者が現代的なWeb開発スキルを段階的に習得し、受講生の就職率90%以上※3 を目指す。また、基本情報技術者試験等の公的資格合格率75%以上※4 を見込み、早期のキャリア自立と正社員定着を実現する。"
  );

  // 登録済みエビデンス一覧
  const [evidences, setEvidences] = usePreviewState<EvidenceItem[]>(`course:${courseId}:evidences`, [
    {
      id: "ev-1",
      targetField: "necessityAndReason",
      numberIndex: 1,
      claimText: "IT人材の需要過多による需給ギャップは約43万人に達すると推計されている",
      sourceName: "経済産業省『IT人材需給に関する調査報告書』",
      evidenceType: "url",
      referenceUrl: "https://www.meti.go.jp/policy/it_policy/jinzai/houkokusho.pdf",
      createdAt: "2026/10/05 14:20",
    },
    {
      id: "ev-2",
      targetField: "necessityAndReason",
      numberIndex: 2,
      claimText: "当地域におけるWebエンジニアの有効求人倍率も高水準",
      sourceName: "東京労働局『一般職業紹介状況（職種別求人倍率表）』",
      evidenceType: "file",
      fileName: "tokyo_job_ratio_2026q2.pdf",
      createdAt: "2026/10/05 15:10",
    },
    {
      id: "ev-3",
      targetField: "expectedEffects",
      numberIndex: 3,
      claimText: "受講生の就職率90%以上",
      sourceName: "当校 過去3年間公的職業訓練修了生就職実績報告書",
      evidenceType: "file",
      fileName: "employment_outcome_3years_report.pdf",
      createdAt: "2026/10/05 16:00",
    },
    {
      id: "ev-4",
      targetField: "expectedEffects",
      numberIndex: 4,
      claimText: "公的資格合格率75%以上",
      sourceName: "IPA 独立行政法人情報処理推進機構 統計データ分析",
      evidenceType: "url",
      referenceUrl: "https://www.ipa.go.jp/shiken/reports/stat.html",
      createdAt: "2026/10/05 16:30",
    },
  ]);

  const [selectionData, setSelectionData] = useState<{
    targetField: "necessityAndReason" | "expectedEffects";
    selectedText: string;
    startIndex: number;
    endIndex: number;
    popupPosition: { x: number; y: number } | null;
  } | null>(null);

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [modalClaimText, setModalClaimText] = useState("");
  const [modalSourceName, setModalSourceName] = useState("");
  const [modalEvidenceType, setModalEvidenceType] = useState<"url" | "file">("url");
  const [modalUrlOrFile, setModalUrlOrFile] = useState("");

  // ===========================================================================
  // 【タブ2】科目・シラバス設定
  // ===========================================================================
  const [subjects, setSubjects] = usePreviewState<CourseSubject[]>(`course:${courseId}:subjects`, INITIAL_SUBJECTS);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<CourseSubject | null>(null);
  const [formSubjectName, setFormSubjectName] = useState("");
  const [formCategory, setFormCategory] = useState<"lecture" | "practical">("practical");
  const [formHours, setFormHours] = useState<number>(30);
  const [formDescription, setFormDescription] = useState("");

  // ===========================================================================
  // 【タブ3】日別カリキュラム計画 (★新規統合)
  // ===========================================================================
  const [curriculums, setCurriculums] = usePreviewState<DailyCurriculumRow[]>(`course:${courseId}:curriculums`, INITIAL_CURRICULUM_DATA);

  // ===========================================================================
  // 【タブ4】就職支援・体制
  // ===========================================================================
  const [supportManagerName, setSupportManagerName] = usePreviewState(`course:${courseId}:supportManagerName`, "高橋 慎一郎（訓練統括責任者）");
  const [careerConsultantName, setCareerConsultantName] = usePreviewState(`course:${courseId}:careerConsultantName`, "鈴木 麻美（登録番号: CC-2024-98765 / 1級キャリアコンサルティング技能士）");
  const [inTrainingSupportPlan, setInTrainingSupportPlan] = usePreviewState(`course:${courseId}:inTrainingSupportPlan`,
    "受講開始後1ヶ月目および3ヶ月目に国家資格キャリアコンサルタントによる個別定期面談（各60分）を実施。ジョブ・カードを活用した職業経験の棚卸し、IT業界特有の技術ポートフォリオ添削、履歴書・職務経歴書の作成指導をマンツーマンで実施する。"
  );
  const [companyPartnershipPlan, setCompanyPartnershipPlan] = usePreviewState(`course:${courseId}:companyPartnershipPlan`,
    "当校提携の地域IT関連企業45社へ求人開拓を実施。開講4ヶ月目より学内合同企業説明会および現場エンジニア同席の模擬技術面談会を開催し、求職者と採用担当者とのマッチングを促進する。"
  );
  const [postTrainingSupportPlan, setPostTrainingSupportPlan] = usePreviewState(`course:${courseId}:postTrainingSupportPlan`,
    "訓練修了後3ヶ月間、週1回の推薦求人配信および月1回のオンライン就職状況確認面談を実施。内定獲得時の雇用条件確認支援や、就業開始後の初期職場定着フォロー面談を行う。"
  );

  // ローディング・トースト通知
  const [isGeneratingAi, setIsGeneratingAi] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // ===========================================================================
  // 【要件3】最上部「全体サマリー・整合性ステータス」の3重連動計算 (useMemo)
  // ① 設定総訓練時間 (targetHours)
  // ② 科目配当合計時間 (syllabusTotal)
  // ③ 日別計画割り当て合計時間 (curriculumTotal)
  // ===========================================================================
  const reconciliation = useMemo(() => {
    // 1. 科目配当時間の集計
    let syllabusLectureTotal = 0;
    let syllabusPracticalTotal = 0;
    subjects.forEach((s) => {
      const h = Number(s.hours) || 0;
      if (s.category === "lecture") syllabusLectureTotal += h;
      else syllabusPracticalTotal += h;
    });
    const syllabusTotal = Number((syllabusLectureTotal + syllabusPracticalTotal).toFixed(1));

    // 2. 日別計画時間の集計（在宅・スクーリング・科目別配分）
    let curriculumAtHomeTotal = 0;
    let curriculumSchoolingTotal = 0;
    const subjectAssignedMap: Record<string, number> = {};
    subjects.forEach((s) => {
      subjectAssignedMap[s.id] = 0;
    });

    curriculums.forEach((row) => {
      const h = Number(row.trainingHours) || 0;
      if (row.locationType === "at_home") {
        curriculumAtHomeTotal += h;
      } else {
        curriculumSchoolingTotal += h;
      }

      if (subjectAssignedMap[row.subjectId] !== undefined) {
        subjectAssignedMap[row.subjectId] += h;
      } else {
        subjectAssignedMap[row.subjectId] = h;
      }
    });

    const curriculumTotal = Number((curriculumAtHomeTotal + curriculumSchoolingTotal).toFixed(1));
    const schoolingRate = curriculumTotal > 0 ? Number(((curriculumSchoolingTotal / curriculumTotal) * 100).toFixed(1)) : 0;
    const isSchoolingValid = schoolingRate >= 20.0; // 公的基準: スクーリング20%以上

    // 3. 各科目ごとの「日別割り当て vs 科目規定時間」チェック
    const subjectProgressList = subjects.map((sub) => {
      const assignedInCurriculum = Number((subjectAssignedMap[sub.id] || 0).toFixed(1));
      const targetQuota = sub.hours;
      const diff = Number((assignedInCurriculum - targetQuota).toFixed(1));
      const remaining = Number((targetQuota - assignedInCurriculum).toFixed(1));
      const isOver = assignedInCurriculum > targetQuota;
      const isCompleted = Math.abs(diff) < 0.01;
      const percent = targetQuota > 0 ? Math.min(Math.round((assignedInCurriculum / targetQuota) * 100), 100) : 0;

      return {
        ...sub,
        assignedInCurriculum,
        targetQuota,
        remaining: remaining > 0 ? remaining : 0,
        overHours: diff > 0 ? diff : 0,
        isOver,
        isCompleted,
        percent,
      };
    });

    const overSubjects = subjectProgressList.filter((s) => s.isOver);
    const hasSubjectOverError = overSubjects.length > 0;
    const overSubjectIds = new Set(overSubjects.map((s) => s.id));

    // 4. 3重連動ステータス判定
    const target = Number(targetHours) || 0;
    const isSyllabusMatched = Math.abs(syllabusTotal - target) < 0.01;
    const isCurriculumMatched = Math.abs(curriculumTotal - target) < 0.01;
    const isThreeWayMatched = isSyllabusMatched && isCurriculumMatched && !hasSubjectOverError;

    // 不足・超過の差分
    const syllabusDiff = Number((syllabusTotal - target).toFixed(1));
    const curriculumDiff = Number((curriculumTotal - target).toFixed(1));

    return {
      target, // ① 設定総訓練時間
      syllabusTotal, // ② 科目配当合計時間
      syllabusLectureTotal: Number(syllabusLectureTotal.toFixed(1)),
      syllabusPracticalTotal: Number(syllabusPracticalTotal.toFixed(1)),
      curriculumTotal, // ③ 日別計画割り当て合計時間
      curriculumAtHomeTotal: Number(curriculumAtHomeTotal.toFixed(1)),
      curriculumSchoolingTotal: Number(curriculumSchoolingTotal.toFixed(1)),
      schoolingRate,
      isSchoolingValid,
      daysCount: curriculums.length,
      subjectProgressList,
      overSubjects,
      hasSubjectOverError,
      overSubjectIds,
      isSyllabusMatched,
      isCurriculumMatched,
      isThreeWayMatched,
      syllabusDiff,
      curriculumDiff,
    };
  }, [subjects, curriculums, targetHours]);

  // ===========================================================================
  // 【タブ1】エビデンス注記ハンドラー
  // ===========================================================================
  const handleTextSelect = (
    e: React.SyntheticEvent<HTMLTextAreaElement>,
    field: "necessityAndReason" | "expectedEffects"
  ) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end && end - start > 1) {
      const selected = textarea.value.substring(start, end).trim();
      if (selected.length > 0) {
        const rect = textarea.getBoundingClientRect();
        setSelectionData({
          targetField: field,
          selectedText: selected,
          startIndex: start,
          endIndex: end,
          popupPosition: { x: rect.left + 20, y: rect.top - 10 },
        });
        return;
      }
    }
    setSelectionData(null);
  };

  const handleOpenAddEvidenceModal = () => {
    if (!selectionData) return;
    setModalClaimText(selectionData.selectedText);
    setModalSourceName("");
    setModalEvidenceType("url");
    setModalUrlOrFile("");
    setIsEvidenceModalOpen(true);
  };

  const handleSaveEvidence = () => {
    if (!selectionData || !modalSourceName.trim()) return;

    const nextIndex = evidences.length + 1;
    const tag = `※${nextIndex}`;

    if (selectionData.targetField === "necessityAndReason") {
      const before = necessityAndReason.substring(0, selectionData.endIndex);
      const after = necessityAndReason.substring(selectionData.endIndex);
      setNecessityAndReason(`${before}${tag}${after}`);
    } else {
      const before = expectedEffects.substring(0, selectionData.endIndex);
      const after = expectedEffects.substring(selectionData.endIndex);
      setExpectedEffects(`${before}${tag}${after}`);
    }

    const newEvidence: EvidenceItem = {
      id: `ev-${Date.now()}`,
      targetField: selectionData.targetField,
      numberIndex: nextIndex,
      claimText: modalClaimText,
      sourceName: modalSourceName.trim(),
      evidenceType: modalEvidenceType,
      referenceUrl: modalEvidenceType === "url" ? modalUrlOrFile.trim() : undefined,
      fileName: modalEvidenceType === "file" ? modalUrlOrFile.trim() || "evidence_document.pdf" : undefined,
      createdAt: "本日 " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setEvidences((prev) => [...prev, newEvidence]);
    setIsEvidenceModalOpen(false);
    setSelectionData(null);
  };

  const handleDeleteEvidence = (id: string) => {
    const targetEv = evidences.find((e) => e.id === id);
    if (!targetEv) return;

    const tag = `※${targetEv.numberIndex}`;
    const newNec = necessityAndReason.replace(tag, "");
    const newEff = expectedEffects.replace(tag, "");
    const remaining = evidences.filter((e) => e.id !== id);

    let counter = 1;
    let renumberedNec = newNec;
    let renumberedEff = newEff;

    const renumberedEvs = remaining.map((ev) => {
      const newNum = counter++;
      const oldTag = `※${ev.numberIndex}`;
      const newTag = `※${newNum}`;
      if (ev.targetField === "necessityAndReason") {
        renumberedNec = renumberedNec.replace(oldTag, newTag);
      } else {
        renumberedEff = renumberedEff.replace(oldTag, newTag);
      }
      return { ...ev, numberIndex: newNum };
    });

    setEvidences(renumberedEvs);
    setNecessityAndReason(renumberedNec);
    setExpectedEffects(renumberedEff);
  };

  // ===========================================================================
  // 【タブ2】科目・シラバス設定ハンドラー
  // ===========================================================================
  const handleOpenAddSubjectModal = () => {
    setEditingSubject(null);
    setFormSubjectName("");
    setFormCategory("practical");
    setFormHours(30);
    setFormDescription("");
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubjectModal = (sub: CourseSubject) => {
    setEditingSubject(sub);
    setFormSubjectName(sub.name);
    setFormCategory(sub.category);
    setFormHours(sub.hours);
    setFormDescription(sub.description);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubjectModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubjectName.trim()) return;

    if (editingSubject) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === editingSubject.id
            ? {
                ...s,
                name: formSubjectName.trim(),
                category: formCategory,
                hours: Number(formHours) || 0,
                description: formDescription.trim(),
              }
            : s
        )
      );
      // 日別カリキュラム側の科目名も連動更新
      setCurriculums((prev) =>
        prev.map((r) =>
          r.subjectId === editingSubject.id ? { ...r, subjectName: formSubjectName.trim() } : r
        )
      );
    } else {
      const nextIndex = subjects.length + 1;
      const newSubject: CourseSubject = {
        id: `sub-${Date.now()}`,
        courseId: "course-01",
        name: formSubjectName.trim(),
        category: formCategory,
        hours: Number(formHours) || 0,
        description: formDescription.trim(),
        orderIndex: nextIndex,
      };
      setSubjects((prev) => [...prev, newSubject]);
    }
    setIsSubjectModalOpen(false);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm("この科目を削除してもよろしいですか？")) {
      setSubjects((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        return filtered.map((s, idx) => ({ ...s, orderIndex: idx + 1 }));
      });
    }
  };

  const handleMoveUpSubject = (index: number) => {
    if (index === 0) return;
    setSubjects((prev) => {
      const list = [...prev];
      const temp = list[index - 1];
      list[index - 1] = list[index];
      list[index] = temp;
      return list.map((s, idx) => ({ ...s, orderIndex: idx + 1 }));
    });
  };

  const handleMoveDownSubject = (index: number) => {
    if (index === subjects.length - 1) return;
    setSubjects((prev) => {
      const list = [...prev];
      const temp = list[index + 1];
      list[index + 1] = list[index];
      list[index] = temp;
      return list.map((s, idx) => ({ ...s, orderIndex: idx + 1 }));
    });
  };

  // ===========================================================================
  // 【タブ3】日別カリキュラム計画ハンドラー
  // ===========================================================================
  const handleUpdateCurriculumRow = (
    id: string,
    field: keyof DailyCurriculumRow,
    value: any
  ) => {
    setCurriculums((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updated = { ...row, [field]: value };

        // 科目プルダウン変更時: 【タブ2】の subjects から自動で名前を同期
        if (field === "subjectId") {
          const matchedSubject = subjects.find((s) => s.id === value);
          if (matchedSubject) {
            updated.subjectId = matchedSubject.id;
            updated.subjectName = matchedSubject.name;
          }
        }

        // 在宅/スクーリング変更時: スクーリング時のみ開始終了時刻を有効化
        if (field === "locationType") {
          if (value === "at_home") {
            updated.startTime = "";
            updated.endTime = "";
            updated.method = "online";
          } else {
            if (!updated.startTime) updated.startTime = "09:30";
            if (!updated.endTime) updated.endTime = "16:30";
            updated.method = "face_to_face";
          }
        }

        return updated;
      })
    );
  };

  const handleAddCurriculumRow = () => {
    const lastRow = curriculums[curriculums.length - 1];
    let nextDate = "2026-09-15";
    let nextDayOfWeek = "火";

    if (lastRow) {
      const d = new Date(lastRow.date);
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 6) d.setDate(d.getDate() + 2); // 土曜スキップ
      if (d.getDay() === 0) d.setDate(d.getDate() + 1); // 日曜スキップ
      nextDate = d.toISOString().split("T")[0];
      const days = ["日", "月", "火", "水", "木", "金", "土"];
      nextDayOfWeek = days[d.getDay()];
    }

    const defaultSub = subjects[0] || { id: "sub-1", name: "未選択" };
    const newRow: DailyCurriculumRow = {
      id: `dc-${Date.now()}`,
      date: nextDate,
      dayOfWeek: nextDayOfWeek,
      locationType: "at_home",
      subjectId: defaultSub.id,
      subjectName: defaultSub.name,
      trainingHours: 6.0,
      method: "online",
      classType: "group",
      startTime: "",
      endTime: "",
      isTestDay: false,
      isCareerConsulting: false,
    };
    setCurriculums((prev) => [...prev, newRow]);
  };

  const handleDuplicateCurriculumRow = (index: number) => {
    const target = curriculums[index];
    const duplicated: DailyCurriculumRow = {
      ...target,
      id: `dc-${Date.now()}`,
    };
    const nextList = [...curriculums];
    nextList.splice(index + 1, 0, duplicated);
    setCurriculums(nextList);
  };

  const handleDeleteCurriculumRow = (id: string) => {
    if (curriculums.length <= 1) {
      alert("これ以上行を削除できません。最低1行は必要です。");
      return;
    }
    setCurriculums((prev) => prev.filter((r) => r.id !== id));
  };

  // ===========================================================================
  // AI Copilot 自動生成 (シラバス & 日別カリキュラム)
  // ===========================================================================

  // 1. 科目構成の自動生成（目標総時間 targetHours に合わせてシラバス作成）
  const handleAiGenerateSubjects = async () => {
    setIsGeneratingAi("subjects");
    await new Promise((r) => setTimeout(r, 1400));

    const target = Number(targetHours) || 600;
    const l1 = Math.round(target * 0.05); // 30h
    const l2 = Math.round(target * 0.05); // 30h
    const l3 = Math.round(target * 0.05); // 30h
    const p1 = Math.round(target * 0.15); // 90h
    const p2 = Math.round(target * 0.20); // 120h
    const p3 = Math.round(target * 0.25); // 150h
    const p4 = Math.round(target * 0.10); // 60h
    const p5 = target - (l1 + l2 + l3 + p1 + p2 + p3 + p4); // 残り90h

    const aiSubjects: CourseSubject[] = [
      {
        id: "ai-sub-1",
        courseId: "course-01",
        name: "【学科】コンピュータシステム ＆ Web概論",
        category: "lecture",
        description: "ネットワーク通信、HTTPプロトコル、OSの仕組みおよび情報倫理規程。",
        hours: l1,
        orderIndex: 1,
      },
      {
        id: "ai-sub-2",
        courseId: "course-01",
        name: "【学科】プログラミング言語論 ＆ アルゴリズム",
        category: "lecture",
        description: "基本制御構造、データ構造、オブジェクト指向および計算量理論の基礎。",
        hours: l2,
        orderIndex: 2,
      },
      {
        id: "ai-sub-3",
        courseId: "course-01",
        name: "【学科】情報セキュリティ ＆ コンプライアンス",
        category: "lecture",
        description: "暗号化技術、認証認可仕様、個人情報保護法および知的財産権の基礎。",
        hours: l3,
        orderIndex: 3,
      },
      {
        id: "ai-sub-4",
        courseId: "course-01",
        name: "【実技】HTML5/CSS3/Tailwind UIコーディング演習",
        category: "practical",
        description: "マルチデバイス対応UI、アクセシビリティ、Tailwind CSS実務演習。",
        hours: p1,
        orderIndex: 4,
      },
      {
        id: "ai-sub-5",
        courseId: "course-01",
        name: "【実技】TypeScript ＆ 非同期APIプログラミング",
        category: "practical",
        description: "静的型付け、ジェネリクス、DOM操作、非同期Fetch/Async-Await実装演習。",
        hours: p2,
        orderIndex: 5,
      },
      {
        id: "ai-sub-6",
        courseId: "course-01",
        name: "【実技】React ＆ Next.js 15 フルスタック開発",
        category: "practical",
        description: "App Router、Server Components、Server Actions、認証・決済統合開発。",
        hours: p3,
        orderIndex: 6,
      },
      {
        id: "ai-sub-7",
        courseId: "course-01",
        name: "【実技】PostgreSQL ＆ Supabase DB構築演習",
        category: "practical",
        description: "リレーショナルDB設計、クエリ最適化、Supabase AuthおよびRLS実装。",
        hours: p4,
        orderIndex: 7,
      },
      {
        id: "ai-sub-8",
        courseId: "course-01",
        name: "【実技】総合制作実習 ＆ 模擬就職面談ロールプレイ",
        category: "practical",
        description: "チームアジャイル開発、CI/CDデプロイ、成果発表および就職面談実習。",
        hours: p5,
        orderIndex: 8,
      },
    ];

    setSubjects(aiSubjects);
    setIsGeneratingAi(null);
    setNotification(`訓練目標に基づき、総訓練時間 ${target}時間のシラバス科目構成を自動策定しました！`);
    setTimeout(() => setNotification(null), 5000);
  };

  // 2. 日別カリキュラムの自動生成（【タブ2】の科目の時間を遵守し、スクーリング要件を満たす模範案を生成）
  const handleAiGenerateCurriculum = async () => {
    setIsGeneratingAi("curriculum");
    await new Promise((r) => setTimeout(r, 1400));

    // subjects[0] 〜 subjects[4] を活用した日別スケジュールを生成
    const baseSub1 = subjects[0] || { id: "sub-1", name: "Webシステム基礎" };
    const baseSub2 = subjects[1] || { id: "sub-2", name: "プログラミング基礎" };
    const baseSub3 = subjects[2] || { id: "sub-3", name: "デザイン実習" };
    const baseSub4 = subjects[3] || { id: "sub-4", name: "TypeScript実習" };
    const baseSub5 = subjects[4] || { id: "sub-5", name: "Next.js実習" };

    const aiRows: DailyCurriculumRow[] = [
      {
        id: "ai-01",
        date: "2026-09-01",
        dayOfWeek: "火",
        locationType: "schooling",
        subjectId: baseSub1.id,
        subjectName: baseSub1.name,
        trainingHours: 6.0,
        method: "face_to_face",
        classType: "group",
        startTime: "09:30",
        endTime: "16:30",
        isTestDay: false,
        isCareerConsulting: false,
      },
      {
        id: "ai-02",
        date: "2026-09-02",
        dayOfWeek: "水",
        locationType: "at_home",
        subjectId: baseSub1.id,
        subjectName: baseSub1.name,
        trainingHours: 6.0,
        method: "online",
        classType: "group",
        startTime: "",
        endTime: "",
        isTestDay: false,
        isCareerConsulting: false,
      },
      {
        id: "ai-03",
        date: "2026-09-03",
        dayOfWeek: "木",
        locationType: "at_home",
        subjectId: baseSub2.id,
        subjectName: baseSub2.name,
        trainingHours: 6.0,
        method: "online",
        classType: "group",
        startTime: "",
        endTime: "",
        isTestDay: false,
        isCareerConsulting: false,
      },
      {
        id: "ai-04",
        date: "2026-09-04",
        dayOfWeek: "金",
        locationType: "schooling",
        subjectId: baseSub2.id,
        subjectName: baseSub2.name,
        trainingHours: 6.0,
        method: "face_to_face",
        classType: "group",
        startTime: "09:30",
        endTime: "16:30",
        isTestDay: false,
        isCareerConsulting: false,
      },
      {
        id: "ai-05",
        date: "2026-09-07",
        dayOfWeek: "月",
        locationType: "at_home",
        subjectId: baseSub3.id,
        subjectName: baseSub3.name,
        trainingHours: 6.0,
        method: "online",
        classType: "group",
        startTime: "",
        endTime: "",
        isTestDay: false,
        isCareerConsulting: false,
      },
      {
        id: "ai-06",
        date: "2026-09-08",
        dayOfWeek: "火",
        locationType: "at_home",
        subjectId: baseSub3.id,
        subjectName: baseSub3.name,
        trainingHours: 6.0,
        method: "online",
        classType: "group",
        startTime: "",
        endTime: "",
        isTestDay: false,
        isCareerConsulting: false,
      },
      {
        id: "ai-07",
        date: "2026-09-09",
        dayOfWeek: "水",
        locationType: "schooling",
        subjectId: baseSub3.id,
        subjectName: baseSub3.name,
        trainingHours: 6.0,
        method: "face_to_face",
        classType: "group",
        startTime: "09:30",
        endTime: "16:30",
        isTestDay: false,
        isCareerConsulting: false,
      },
      {
        id: "ai-08",
        date: "2026-09-10",
        dayOfWeek: "木",
        locationType: "at_home",
        subjectId: baseSub4.id,
        subjectName: baseSub4.name,
        trainingHours: 6.0,
        method: "online",
        classType: "group",
        startTime: "",
        endTime: "",
        isTestDay: false,
        isCareerConsulting: false,
      },
      {
        id: "ai-09",
        date: "2026-09-11",
        dayOfWeek: "金",
        locationType: "at_home",
        subjectId: baseSub4.id,
        subjectName: baseSub4.name,
        trainingHours: 6.0,
        method: "online",
        classType: "group",
        startTime: "",
        endTime: "",
        isTestDay: false,
        isCareerConsulting: true,
      },
      {
        id: "ai-10",
        date: "2026-09-14",
        dayOfWeek: "月",
        locationType: "schooling",
        subjectId: baseSub5.id,
        subjectName: baseSub5.name,
        trainingHours: 6.0,
        method: "face_to_face",
        classType: "group",
        startTime: "09:30",
        endTime: "16:30",
        isTestDay: true,
        isCareerConsulting: false,
      },
    ];

    setCurriculums(aiRows);
    setIsGeneratingAi(null);
    setNotification("公的要件（対面スクーリング比率25%以上・祝日除外）を満たす日別カリキュラム案を自動編成しました！");
    setTimeout(() => setNotification(null), 5000);
  };

  // 3. エビデンス文章のAI生成
  const handleAiGenerateEvidenceText = async (field: "necessity" | "effects") => {
    setIsGeneratingAi(field);
    await new Promise((r) => setTimeout(r, 1200));

    if (field === "necessity") {
      setNecessityAndReason(
        "厚生労働省の労働市場分析によると、DX推進に伴うデジタル系職種の求人倍率は2.8倍を超過している※1。特に中小企業におけるエンジニア不足は深刻であり、当地域においても即戦力エンジニアの採用ニーズは急増している※2。これに応える実践的訓練の実施が強く求められている。"
      );
    } else {
      setExpectedEffects(
        "訓練修了後3ヶ月以内の就職率92%以上※3 の達成を目指す。受講生全員が実務レベルのポートフォリオを完成させ、基本情報技術者試験の合格率70%超※4 を達成することで、地域IT産業への優良人材供給に寄与する。"
      );
    }
    setIsGeneratingAi(null);
    setNotification("AIが公的訓練申請用エビデンス文章の下書きを生成しました。");
    setTimeout(() => setNotification(null), 4000);
  };

  // 全体保存処理（時間超過エラーがある場合は保存制御）
  const handleSaveAll = () => {
    if (!courseTitle.trim() || capacity < 1 || trainingEndDate < trainingStartDate) {
      setNotification("コース名・定員・訓練期間を確認してください。");
      return;
    }
    if (reconciliation.hasSubjectOverError) {
      alert("科目の規定時間（配当quota）を超過している日別計画があるため保存できません。エラーを解消してください。");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setData(state => ({ ...state,
        courses: state.courses.map(course => course.id === courseId ? { ...course, title: courseTitle, capacity, period: `${trainingStartDate.replaceAll('-','/')}–${trainingEndDate.replaceAll('-','/')}` } : course),
        revisions: [{ id: id(), title: courseTitle, date: '2026/10/12（デモ保存）', author: '事務局', summary: 'コース設計の入力内容を確認', restored: false }, ...state.revisions],
      }));
      setNotification("コース設計のデモ入力を保存しました。実際のDB保存は次の工程で接続します。");
      setTimeout(() => setNotification(null), 4000);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-36">
      {/* ===================================================================== */}
      {/* 画面トップバー */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/secretariat/dashboard">
              <Button variant="ghost" size="sm" className="h-9 px-2.5 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>事務局へ</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  公的職業訓練 コース設計・日別計画統合スタジオ
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  認定申請様式第1号・第2号・第3号（日別計画）完全統合
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {courseTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 共同編集アバター */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/60">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-600 mr-1">同時編集 (3名):</span>
              <div className="flex -space-x-1.5">
                {COLLABORATORS.map((user) => (
                  <Avatar key={user.id} className={`h-7 w-7 text-white font-bold text-[10px] ${user.color}`}>
                    {user.initial}
                  </Avatar>
                ))}
              </div>
            </div>

            {/* 保存ボタン (エラー時は非活性 disabled) */}
            <Button
              onClick={handleSaveAll}
              disabled={isSaving || reconciliation.hasSubjectOverError}
              className={`font-bold text-xs h-9 px-4 shadow-sm text-white transition-all ${
                reconciliation.hasSubjectOverError
                  ? "bg-slate-400 cursor-not-allowed opacity-75"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              title={
                reconciliation.hasSubjectOverError
                  ? "科目超過エラーがあるため保存できません"
                  : "全設定を保存する"
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  保存中...
                </>
              ) : reconciliation.hasSubjectOverError ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-rose-200" />
                  エラー解消後に保存可能
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  コース・日別計画を保存
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 【要件3】最上部「全体サマリー・整合性ステータス」の3重連動ヘッダー (常時表示) */}
      {/* ===================================================================== */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 border-b border-indigo-900 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* 左側: 3重時間サマリーバッジ */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
            {/* ① 設定総訓練時間 */}
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-4 h-4 text-indigo-300" />
              <div>
                <span className="text-[10px] text-slate-300 block leading-none">① 設定総訓練時間</span>
                <span className="font-black font-mono text-base sm:text-lg text-white">
                  {reconciliation.target.toFixed(1)}
                  <span className="text-xs text-slate-300 font-normal ml-0.5">h</span>
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/15 hidden sm:block" />

            {/* ② 科目配当合計時間 */}
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <div>
                <span className="text-[10px] text-slate-300 block leading-none">
                  ② 科目配当合計 ({subjects.length}科目)
                </span>
                <span className="font-black font-mono text-base sm:text-lg text-emerald-300">
                  {reconciliation.syllabusTotal.toFixed(1)}
                  <span className="text-xs text-slate-300 font-normal ml-0.5">h</span>
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/15 hidden sm:block" />

            {/* ③ 日別計画割り当て合計時間 */}
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <CalendarDays className="w-4 h-4 text-purple-300" />
              <div>
                <span className="text-[10px] text-slate-300 block leading-none">
                  ③ 日別計画合計 ({reconciliation.daysCount}日間)
                </span>
                <span className="font-black font-mono text-base sm:text-lg text-purple-300">
                  {reconciliation.curriculumTotal.toFixed(1)}
                  <span className="text-xs text-slate-300 font-normal ml-0.5">h</span>
                </span>
              </div>
            </div>
          </div>

          {/* 右側: 3重整合性ステータスバッジ */}
          <div className="flex items-center space-x-2 self-start md:self-auto">
            {reconciliation.hasSubjectOverError ? (
              <Badge
                variant="destructive"
                className="bg-rose-600 text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 shadow-sm flex items-center gap-1.5 animate-pulse"
              >
                <ShieldAlert className="w-4 h-4 text-white" />
                <span>
                  🔴 「{reconciliation.overSubjects[0]?.name}」が科目規定を {reconciliation.overSubjects[0]?.overHours}h 超過しています
                </span>
              </Badge>
            ) : reconciliation.isThreeWayMatched ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold text-xs sm:text-sm px-3.5 py-1.5 shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  🟢 計画完了（{reconciliation.target}h / {reconciliation.syllabusTotal}h / {reconciliation.curriculumTotal}h 完全整合）
                </span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-500/20 text-amber-300 border-amber-400 font-bold text-xs sm:text-sm px-3.5 py-1.5 shadow-sm flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>
                  🟡 未割り当てあり（科目残: {Math.abs(reconciliation.syllabusDiff)}h / 日別残: {Math.abs(reconciliation.curriculumDiff)}h）
                </span>
              </Badge>
            )}
          </div>
        </div>
      </section>

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

      {/* 科目超過エラー時の全体アラート */}
      {reconciliation.hasSubjectOverError && (
        <div className="max-w-7xl mx-auto px-6 pt-4 animate-in fade-in duration-200">
          <Alert variant="destructive" className="border-rose-400 bg-rose-50 text-rose-900 shadow-xs">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <AlertTitle className="font-bold text-sm">
              公的訓練基準違反: 日別計画が科目の配当時間上限を超過しています（保存不可）
            </AlertTitle>
            <AlertDescription className="text-xs text-rose-800 mt-1 space-y-1">
              {reconciliation.overSubjects.map((err) => (
                <div key={err.id}>
                  ・「<strong>{err.name}</strong>」: 科目規定上限（{err.targetQuota}h）に対し、日別計画で合計 {err.assignedInCurriculum}h 設定されています（{err.overHours}h 超過）。
                </div>
              ))}
              <p className="text-[11px] text-rose-700 pt-1">
                ※【タブ3: 日別カリキュラム計画】にて該当科目の訓練時間を調整してください。超過が解消されると保存可能になります。
              </p>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 【要件1】4タブ構成 (shadcn/ui Tabs) */}
      {/* ===================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          {/* タブナビゲーション */}
          <TabsList className="bg-slate-200/90 p-1 w-full max-w-4xl grid grid-cols-4 h-11 mb-6 rounded-xl shadow-xs">
            <TabsTrigger
              value="basic"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>① コース基本情報・エビデンス</span>
            </TabsTrigger>
            <TabsTrigger
              value="syllabus"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>② 科目・シラバス設定</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-1 bg-emerald-100 text-emerald-800">
                {reconciliation.syllabusTotal}h
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <CalendarDays className="w-4 h-4" />
              <span>③ 日別訓練計画 (★統合)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                reconciliation.hasSubjectOverError
                  ? "bg-rose-100 text-rose-800"
                  : reconciliation.isCurriculumMatched
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-purple-100 text-purple-800"
              }`}>
                {reconciliation.curriculumTotal}h
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="career"
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            >
              <Briefcase className="w-4 h-4" />
              <span>④ 就職支援・体制</span>
            </TabsTrigger>
          </TabsList>

          {/* ================================================================= */}
          {/* 【タブ1】コース基本情報 ＆ エビデンス注記 */}
          {/* ================================================================= */}
          <TabsContent value="basic" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
                <Card className="border-slate-200 bg-white shadow-2xs">
                  <CardHeader className="py-4 px-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      コース概要 ＆ 訓練基本設定（申請様式第1号）
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        訓練コース名 <span className="text-red-500">*</span>:
                      </label>
                      <Input
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="text-xs sm:text-sm font-semibold h-10"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          定員 (名) <span className="text-red-500">*</span>:
                        </label>
                        <Input
                          type="number"
                          value={capacity}
                          onChange={(e) => setCapacity(Number(e.target.value))}
                          className="h-10 text-xs font-mono font-bold"
                          min="1"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          開講月表示:
                        </label>
                        <Input
                          value={startMonth}
                          onChange={(e) => setStartMonth(e.target.value)}
                          className="h-10 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          ① 設定総訓練時間 (h) <span className="text-red-500">*</span>:
                        </label>
                        <Input
                          type="number"
                          step="0.5"
                          value={targetHours}
                          onChange={(e) => setTargetHours(Number(e.target.value))}
                          className="h-10 text-xs font-mono font-bold text-indigo-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">訓練開始日:</label>
                        <Input
                          type="date"
                          value={trainingStartDate}
                          onChange={(e) => setTrainingStartDate(e.target.value)}
                          className="h-10 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">訓練終了日:</label>
                        <Input
                          type="date"
                          value={trainingEndDate}
                          onChange={(e) => setTrainingEndDate(e.target.value)}
                          className="h-10 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        想定対象職種:
                      </label>
                      <Input
                        value={targetJobTypes}
                        onChange={(e) => setTargetJobTypes(e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">訓練目標:</label>
                      <Textarea
                        rows={3}
                        value={trainingGoals}
                        onChange={(e) => setTrainingGoals(e.target.value)}
                        className="text-xs sm:text-sm leading-relaxed"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* エビデンス注記領域: 訓練の必要性 */}
                <Card className="border-slate-200 bg-white shadow-2xs relative">
                  <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-indigo-600" />
                        訓練の必要性・設置理由
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        文章中の語句を選択すると、エビデンス（※1）を付与できます
                      </CardDescription>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAiGenerateEvidenceText("necessity")}
                      disabled={isGeneratingAi === "necessity"}
                      className="text-xs h-8 text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold"
                    >
                      {isGeneratingAi === "necessity" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                          ✨ AIで下書き生成
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="relative">
                      <Textarea
                        rows={5}
                        value={necessityAndReason}
                        onChange={(e) => setNecessityAndReason(e.target.value)}
                        onSelect={(e) => handleTextSelect(e, "necessityAndReason")}
                        className="text-xs sm:text-sm leading-relaxed"
                      />

                      {selectionData && selectionData.targetField === "necessityAndReason" && (
                        <div className="absolute z-20 top-2 right-2 animate-in fade-in duration-150">
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleOpenAddEvidenceModal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md h-8 px-3"
                          >
                            <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                            選択箇所にエビデンス追加 (※{evidences.length + 1})
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 見込める効果 */}
                <Card className="border-slate-200 bg-white shadow-2xs relative">
                  <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      修了後に見込める効果
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAiGenerateEvidenceText("effects")}
                      disabled={isGeneratingAi === "effects"}
                      className="text-xs h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold"
                    >
                      {isGeneratingAi === "effects" ? "生成中..." : "✨ AIで下書き生成"}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="relative">
                      <Textarea
                        rows={4}
                        value={expectedEffects}
                        onChange={(e) => setExpectedEffects(e.target.value)}
                        onSelect={(e) => handleTextSelect(e, "expectedEffects")}
                        className="text-xs sm:text-sm leading-relaxed"
                      />
                      {selectionData && selectionData.targetField === "expectedEffects" && (
                        <div className="absolute z-20 top-2 right-2 animate-in fade-in duration-150">
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleOpenAddEvidenceModal}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md h-8 px-3"
                          >
                            選択箇所にエビデンス追加 (※{evidences.length + 1})
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 右ペイン: エビデンスカード一覧 */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="border-slate-200 bg-white shadow-2xs sticky top-20">
                  <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-indigo-600" />
                      登録エビデンス ({evidences.length}件)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2.5 max-h-[calc(100vh-260px)] overflow-y-auto">
                    {evidences.map((ev) => (
                      <div key={ev.id} className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/40 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-indigo-600 text-white font-bold text-[10px] px-1.5 py-0">
                            ※{ev.numberIndex}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvidence(ev.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-700 bg-white p-2 rounded border italic">
                          「{ev.claimText}」
                        </div>
                        <div className="font-bold text-[11px] text-slate-900">{ev.sourceName}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ================================================================= */}
          {/* 【タブ2】科目・シラバス設定 */}
          {/* ================================================================= */}
          <TabsContent value="syllabus" className="space-y-4 focus-visible:outline-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  カリキュラム科目・シラバス一覧（全{subjects.length}科目・配当合計 {reconciliation.syllabusTotal}h）
                </h3>
                <p className="text-xs text-slate-500">
                  ここで登録された科目が【タブ3: 日別計画】の選択肢として動的に連動します
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={handleAiGenerateSubjects}
                  disabled={isGeneratingAi === "subjects"}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold h-9 shadow-sm"
                >
                  {isGeneratingAi === "subjects" ? "AIが編成中..." : "✨ 訓練目標から科目構成をAI自動生成"}
                </Button>
                <Button
                  type="button"
                  onClick={handleOpenAddSubjectModal}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 font-semibold border-slate-300"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  科目を追加
                </Button>
              </div>
            </div>

            {/* 科目テーブル */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3 w-16 text-center border-r border-slate-200">順序</th>
                      <th className="p-3 w-28 text-center border-r border-slate-200">区分</th>
                      <th className="p-3 min-w-[240px] border-r border-slate-200">科目名</th>
                      <th className="p-3 min-w-[320px] border-r border-slate-200">科目の詳細・到達目標</th>
                      <th className="p-3 w-28 text-center border-r border-slate-200">配当時間</th>
                      <th className="p-3 w-32 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map((sub, index) => (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-mono font-bold text-slate-500 w-4">{sub.orderIndex}</span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => handleMoveUpSubject(index)}
                                disabled={index === 0}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-20 p-0.5"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDownSubject(index)}
                                disabled={index === subjects.length - 1}
                                className="text-slate-400 hover:text-indigo-600 disabled:opacity-20 p-0.5"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold px-2 py-0.5 ${
                              sub.category === "lecture"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}
                          >
                            {sub.category === "lecture" ? "📖 学科" : "🛠 実技"}
                          </Badge>
                        </td>
                        <td className="p-2.5 border-r border-slate-100 font-bold text-slate-900">{sub.name}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-600">{sub.description}</td>
                        <td className="p-2.5 text-center border-r border-slate-100 font-mono font-bold text-slate-900">
                          {sub.hours.toFixed(1)}h
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditSubjectModal(sub)}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubject(sub.id)}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ================================================================= */}
          {/* 【タブ3】日別訓練カリキュラム計画（★新規統合・科目動的プルダウン連動） */}
          {/* ================================================================= */}
          <TabsContent value="curriculum" className="space-y-4 focus-visible:outline-none">
            {/* 科目別進捗 ＆ 残り時間カード一覧 */}
            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <CardTitle className="text-xs sm:text-sm font-bold text-slate-800">
                      科目別 日別計画割り当て進捗 ＆ 残り時間（【タブ2】の科目と動的連動）
                    </CardTitle>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    日別計画総計: <strong className="text-purple-700 font-bold">{reconciliation.curriculumTotal}h</strong>
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                  {reconciliation.subjectProgressList.map((sub) => (
                    <div
                      key={sub.id}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                        sub.isOver
                          ? "border-rose-400 bg-rose-50/80 ring-1 ring-rose-200 shadow-xs"
                          : sub.isCompleted
                          ? "border-emerald-200 bg-emerald-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1 py-0 font-bold ${
                              sub.category === "lecture" ? "bg-blue-50 text-blue-700" : "bg-indigo-50 text-indigo-700"
                            }`}
                          >
                            {sub.category === "lecture" ? "学科" : "実技"}
                          </Badge>
                          <span className="text-[10px] font-mono text-slate-400">
                            {sub.assignedInCurriculum} / {sub.targetQuota}h
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1.5" title={sub.name}>
                          {sub.name}
                        </h4>
                        <Progress
                          value={sub.isOver ? 100 : sub.percent}
                          className="h-1.5"
                          indicatorClassName={
                            sub.isOver ? "bg-rose-600" : sub.isCompleted ? "bg-emerald-500" : "bg-indigo-600"
                          }
                        />
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                        {sub.isOver ? (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 font-bold">
                            ⚠️ +{sub.overHours}h 超過
                          </Badge>
                        ) : sub.isCompleted ? (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-bold bg-emerald-100 text-emerald-800 border-emerald-300">
                            ✓ 割当完了
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            あと {sub.remaining}h 必要
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* スプレッドシート操作ツールバー */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={handleAiGenerateCurriculum}
                  disabled={isGeneratingAi === "curriculum"}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold h-9 shadow-sm"
                >
                  {isGeneratingAi === "curriculum" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      AIが日別計画を自動編成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      ✨ AIでカリキュラム案を自動生成
                    </>
                  )}
                </Button>
                <span className="text-xs text-slate-500 hidden lg:inline">
                  ※【タブ2】の科目時間を反映し、対面20%以上要件・祝日除外を自動補完
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  onClick={handleAddCurriculumRow}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 border-slate-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  1行追加
                </Button>
              </div>
            </div>

            {/* スプレッドシートテーブル */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto max-h-[calc(100vh-380px)] overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-2.5 w-12 text-center border-r border-slate-200">#</th>
                      <th className="p-2.5 w-28 border-r border-slate-200">日付</th>
                      <th className="p-2.5 w-14 text-center border-r border-slate-200">曜</th>
                      <th className="p-2.5 w-36 border-r border-slate-200">在宅 / スクーリング</th>
                      <th className="p-2.5 min-w-[280px] border-r border-slate-200">
                        科目選択（【タブ2】動的連動）
                      </th>
                      <th className="p-2.5 w-24 border-r border-slate-200">方法</th>
                      <th className="p-2.5 w-24 border-r border-slate-200">区分</th>
                      <th className="p-2.5 w-20 text-center border-r border-slate-200">時間(h)</th>
                      <th className="p-2.5 w-28 border-r border-slate-200">開始時刻</th>
                      <th className="p-2.5 w-28 border-r border-slate-200">終了時刻</th>
                      <th className="p-2.5 w-20 text-center border-r border-slate-200">フラグ</th>
                      <th className="p-2.5 w-20 text-center">操作</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {curriculums.map((row, index) => {
                      const isSchooling = row.locationType === "schooling";
                      const isRowOver = reconciliation.overSubjectIds.has(row.subjectId);

                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-indigo-50/30 transition-colors ${
                            isRowOver
                              ? "bg-rose-50/70 border-l-4 border-l-rose-500"
                              : row.isTestDay
                              ? "bg-amber-50/40"
                              : isSchooling
                              ? "bg-indigo-50/20"
                              : "bg-white"
                          }`}
                        >
                          <td className="p-2 text-center text-slate-400 font-mono border-r border-slate-100">
                            {index + 1}
                          </td>

                          <td className="p-1.5 border-r border-slate-100">
                            <Input
                              type="date"
                              value={row.date}
                              onChange={(e) => handleUpdateCurriculumRow(row.id, "date", e.target.value)}
                              className="h-8 text-xs font-mono px-2"
                            />
                          </td>

                          <td className={`p-2 text-center font-bold border-r border-slate-100 ${
                            row.dayOfWeek === "土" || row.dayOfWeek === "日" ? "text-red-500" : "text-slate-700"
                          }`}>
                            {row.dayOfWeek}
                          </td>

                          <td className="p-1.5 border-r border-slate-100">
                            <Select
                              value={row.locationType}
                              onChange={(e) => handleUpdateCurriculumRow(row.id, "locationType", e.target.value)}
                              className={`h-8 font-semibold text-xs ${
                                isSchooling ? "text-indigo-700 bg-indigo-50/80 border-indigo-200" : "text-slate-700"
                              }`}
                            >
                              <option value="schooling">🏫 スクーリング</option>
                              <option value="at_home">🏠 在宅訓練</option>
                            </Select>
                          </td>

                          {/* 科目プルダウン: 【タブ2】の subjects から動的に生成 */}
                          <td className="p-1.5 border-r border-slate-100">
                            <Select
                              value={row.subjectId}
                              onChange={(e) => handleUpdateCurriculumRow(row.id, "subjectId", e.target.value)}
                              className={`h-8 text-xs font-semibold ${
                                isRowOver ? "border-rose-400 bg-rose-50 text-rose-900" : "text-slate-800"
                              }`}
                            >
                              {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.category === "lecture" ? "📖 [学科]" : "🛠 [実技]"} {s.name} ({s.hours}h)
                                </option>
                              ))}
                            </Select>
                          </td>

                          <td className="p-1.5 border-r border-slate-100">
                            <Select
                              value={row.method}
                              onChange={(e) => handleUpdateCurriculumRow(row.id, "method", e.target.value)}
                              className="h-8 text-xs"
                            >
                              <option value="face_to_face">対面</option>
                              <option value="online">通信</option>
                            </Select>
                          </td>

                          <td className="p-1.5 border-r border-slate-100">
                            <Select
                              value={row.classType}
                              onChange={(e) => handleUpdateCurriculumRow(row.id, "classType", e.target.value)}
                              className="h-8 text-xs"
                            >
                              <option value="group">集合</option>
                              <option value="individual">個別</option>
                            </Select>
                          </td>

                          {/* 訓練時間 (超過時は赤枠強調) */}
                          <td className="p-1.5 border-r border-slate-100">
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              max="12"
                              value={row.trainingHours}
                              onChange={(e) =>
                                handleUpdateCurriculumRow(row.id, "trainingHours", Number(e.target.value))
                              }
                              className={`h-8 text-xs font-mono font-bold text-center px-1 ${
                                isRowOver ? "border-rose-500 bg-rose-100 text-rose-900 ring-2 ring-rose-400/50" : ""
                              }`}
                            />
                          </td>

                          {/* 開始・終了時刻: スクーリング時のみ活性化 */}
                          <td className="p-1.5 border-r border-slate-100">
                            <Input
                              type="time"
                              value={row.startTime}
                              disabled={!isSchooling}
                              onChange={(e) => handleUpdateCurriculumRow(row.id, "startTime", e.target.value)}
                              placeholder={!isSchooling ? "--:--" : ""}
                              className={`h-8 text-xs font-mono ${
                                !isSchooling ? "bg-slate-100 text-slate-300 cursor-not-allowed border-dashed" : "bg-white text-indigo-900 font-semibold"
                              }`}
                            />
                          </td>

                          <td className="p-1.5 border-r border-slate-100">
                            <Input
                              type="time"
                              value={row.endTime}
                              disabled={!isSchooling}
                              onChange={(e) => handleUpdateCurriculumRow(row.id, "endTime", e.target.value)}
                              placeholder={!isSchooling ? "--:--" : ""}
                              className={`h-8 text-xs font-mono ${
                                !isSchooling ? "bg-slate-100 text-slate-300 cursor-not-allowed border-dashed" : "bg-white text-indigo-900 font-semibold"
                              }`}
                            />
                          </td>

                          <td className="p-1.5 text-center border-r border-slate-100">
                            {row.isTestDay && <Badge variant="destructive" className="text-[9px] px-1 py-0">検定</Badge>}
                            {row.isCareerConsulting && <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-purple-100 text-purple-800">面談</Badge>}
                            {!row.isTestDay && !row.isCareerConsulting && <span className="text-slate-300">-</span>}
                          </td>

                          <td className="p-1.5 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleDuplicateCurriculumRow(index)}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                title="行を複製"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCurriculumRow(row.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                                title="行を削除"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
          {/* 【タブ4】就職支援・体制 */}
          {/* ================================================================= */}
          <TabsContent value="career" className="space-y-6 focus-visible:outline-none">
            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardHeader className="py-4 px-6 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  就職支援計画 ＆ 指導体制（認定申請様式第2号）
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">訓練実施責任者名:</label>
                    <Input
                      value={supportManagerName}
                      onChange={(e) => setSupportManagerName(e.target.value)}
                      className="h-10 text-xs sm:text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">専任キャリアコンサルタント名:</label>
                    <Input
                      value={careerConsultantName}
                      onChange={(e) => setCareerConsultantName(e.target.value)}
                      className="h-10 text-xs sm:text-sm font-semibold text-indigo-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">受講中支援計画:</label>
                  <Textarea
                    rows={3}
                    value={inTrainingSupportPlan}
                    onChange={(e) => setInTrainingSupportPlan(e.target.value)}
                    className="text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">企業連携・求人開拓:</label>
                  <Textarea
                    rows={3}
                    value={companyPartnershipPlan}
                    onChange={(e) => setCompanyPartnershipPlan(e.target.value)}
                    className="text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">修了後フォロー体制:</label>
                  <Textarea
                    rows={3}
                    value={postTrainingSupportPlan}
                    onChange={(e) => setPostTrainingSupportPlan(e.target.value)}
                    className="text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ===================================================================== */}
      {/* 固定フッターバー (日別計画タブ表示中および全体共通の公的基準表示) */}
      {/* ===================================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-white border-t border-slate-800 shadow-2xl px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">総訓練日数:</span>
              <span className="font-bold font-mono text-base text-white">{reconciliation.daysCount}</span>
              <span className="text-slate-400 text-[11px]">日間</span>
            </div>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <span className="flex items-center gap-1 text-slate-300">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                在宅計:
              </span>
              <span className="font-bold font-mono text-base text-indigo-300">
                {reconciliation.curriculumAtHomeTotal}h
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="flex items-center gap-1 text-slate-300">
                <School className="w-3.5 h-3.5 text-indigo-400" />
                スクーリング計:
              </span>
              <span className="font-bold font-mono text-base text-emerald-300">
                {reconciliation.curriculumSchoolingTotal}h
              </span>
            </div>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-200">日別計画総計:</span>
              <span className="font-black font-mono text-lg text-white">
                {reconciliation.curriculumTotal}h
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-auto">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">スクーリング比率:</span>
              <span className="font-mono font-bold text-sm text-emerald-400">
                {reconciliation.schoolingRate}%
              </span>
              {reconciliation.isSchoolingValid ? (
                <Badge variant="outline" className="bg-emerald-950/80 text-emerald-300 border-emerald-600 text-[10px] font-bold">
                  ✓ 公的基準適合 (20%以上)
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[10px] font-bold">
                  ⚠ スクーリング不足 (要20%以上)
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* モーダル: エビデンス登録 */}
      {/* ===================================================================== */}
      {isEvidenceModalOpen && (
        <Dialog open={isEvidenceModalOpen} onOpenChange={setIsEvidenceModalOpen}>
          <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-600" />
                エビデンス（客観的根拠）の登録
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                選択した記述に対して、公的機関の調査報告書や統計データを根拠として付与します
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">引用箇所（選択テキスト）:</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {modalClaimText}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  出典元名 <span className="text-red-500">*</span>:
                </label>
                <Input
                  required
                  placeholder="例: 厚生労働省『一般職業紹介状況』"
                  value={modalSourceName}
                  onChange={(e) => setModalSourceName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">証明種別:</label>
                <Select
                  value={modalEvidenceType}
                  onChange={(e) => setModalEvidenceType(e.target.value as "url" | "file")}
                  className="h-9 text-xs"
                >
                  <option value="url">🔗 Web公開URL</option>
                  <option value="file">📄 添付ファイル提出</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {modalEvidenceType === "url" ? "公開参照URL:" : "添付ファイル名:"}
                </label>
                <Input
                  placeholder={modalEvidenceType === "url" ? "https://www.mhlw.go.jp/..." : "evidence_report.pdf"}
                  value={modalUrlOrFile}
                  onChange={(e) => setModalUrlOrFile(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEvidenceModalOpen(false)}>
                キャンセル
              </Button>
              <Button type="button" size="sm" onClick={handleSaveEvidence} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                エビデンスを付与 (※{evidences.length + 1})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ===================================================================== */}
      {/* モーダル: 科目追加・編集 */}
      {/* ===================================================================== */}
      {isSubjectModalOpen && (
        <Dialog open={isSubjectModalOpen} onOpenChange={setIsSubjectModalOpen}>
          <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl">
            <form onSubmit={handleSaveSubjectModal}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  {editingSubject ? `科目「${editingSubject.name}」の編集` : "新規科目の追加"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  シラバスに記載する正式科目名称・区分・配当時間を設定します
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    科目名 <span className="text-red-500">*</span>:
                  </label>
                  <Input
                    required
                    placeholder="例: React ＆ Next.js フルスタックアプリケーション構築演習"
                    value={formSubjectName}
                    onChange={(e) => setFormSubjectName(e.target.value)}
                    className="text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">科目区分:</label>
                    <Select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as "lecture" | "practical")}
                      className="h-9 text-xs font-semibold"
                    >
                      <option value="practical">🛠 実技 (practical)</option>
                      <option value="lecture">📖 学科 (lecture)</option>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      配当時間数 (h) <span className="text-red-500">*</span>:
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      min="1"
                      max="300"
                      required
                      value={formHours}
                      onChange={(e) => setFormHours(Number(e.target.value))}
                      className="h-9 text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">科目の詳細・到達目標:</label>
                  <Textarea
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSubjectModalOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                  {editingSubject ? "更新を反映" : "科目を追加"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
