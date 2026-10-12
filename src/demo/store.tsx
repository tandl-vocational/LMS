import React, { createContext, useContext, useState } from "react";

export type Attachment = { name: string; url: string };
export type AttendanceRequest = {
  id: string;
  student: string;
  date: string;
  type: string;
  reason: string;
  attachment?: Attachment;
  status: "確認待ち" | "承認済み" | "差し戻し";
  reviewNote?: string;
};
export type Qualification = {
  id: string;
  name: string;
  organizer: string;
  fee: number;
  date: string;
  deadline: string;
};
export type QualificationApplication = {
  id: string;
  qualificationId: string;
  student: string;
  status: string;
  attachment?: Attachment;
  score?: number;
};
export type Job = {
  id: string;
  student: string;
  company: string;
  title: string;
  stage: string;
  date: string;
  notes: string;
};
export type Appointment = {
  id: string;
  date: string;
  time: string;
  consultant: string;
  student?: string;
  notes?: string;
};
export type Material = {
  id: string;
  title: string;
  publisher: string;
  price: number;
  quantity: number;
  vendor: string;
  status: string;
};
export type Submission = {
  id: string;
  student: string;
  lesson: string;
  answer: string;
  aiScore: number;
  score: number;
  feedback: string;
  status: string;
};
export type Survey = {
  id: string;
  title: string;
  deadline: string;
  questions: string[];
  published: boolean;
  answers?: string[];
};
export type Notification = {
  id: string;
  recipients: string;
  channel: string;
  message: string;
  status: string;
};
export type Question = {
  id: string;
  title: string;
  body: string;
  student: string;
  reply: string;
  status: string;
};
export type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  method: string;
};
export type Course = {
  id: string;
  title: string;
  period: string;
  capacity: number;
  count: number;
  status: string;
};
export type Payment = {
  id: string;
  title: string;
  amount: number;
  status: string;
  method: string;
  date: string;
};
export type DemoState = {
  attendance: AttendanceRequest[];
  qualifications: Qualification[];
  applications: QualificationApplication[];
  jobs: Job[];
  appointments: Appointment[];
  materials: Material[];
  submissions: Submission[];
  surveys: Survey[];
  notifications: Notification[];
  questions: Question[];
  meetings: Meeting[];
  courses: Course[];
  payments: Payment[];
  revisions: {
    id: string;
    title: string;
    date: string;
    author: string;
    summary: string;
    restored: boolean;
  }[];
  lineLinked: boolean;
  uiSnapshots: Record<string, unknown>;
};
export const currentStudent = "山田 太郎";
export const students = [
  { name: currentStudent, id: "std2026001", attendance: 88.5, progress: 70 },
  { name: "佐藤 美咲", id: "std2026014", attendance: 96, progress: 82 },
  { name: "伊藤 結衣", id: "std2026019", attendance: 81.5, progress: 48 },
  { name: "渡辺 翔太", id: "std2026027", attendance: 79.2, progress: 35 },
];
export const createDemoState = (): DemoState => ({
  attendance: [
    {
      id: "req-1",
      student: currentStudent,
      date: "2026-10-03",
      type: "遅刻",
      reason: "通院のため30分遅刻しました。",
      status: "確認待ち",
    },
    {
      id: "req-2",
      student: "渡辺 翔太",
      date: "2026-10-05",
      type: "欠席",
      reason: "発熱のため通院しました。",
      status: "確認待ち",
    },
    {
      id: "req-3",
      student: currentStudent,
      date: "2026-09-25",
      type: "欠席",
      reason: "体調不良のため",
      status: "承認済み",
      reviewNote: "提出内容を確認しました。",
    },
  ],
  qualifications: [
    {
      id: "fe",
      name: "基本情報技術者試験（FE）",
      organizer: "IPA",
      fee: 7500,
      date: "2026-11-15",
      deadline: "2026-10-30",
    },
    {
      id: "python",
      name: "Python3エンジニア認定基礎試験",
      organizer: "Pythonエンジニア育成推進協会",
      fee: 11000,
      date: "2026-12-20",
      deadline: "2026-12-01",
    },
    {
      id: "bookkeeping",
      name: "日商簿記検定2級",
      organizer: "日本商工会議所",
      fee: 5500,
      date: "2026-11-15",
      deadline: "2026-10-25",
    },
  ],
  applications: [
    {
      id: "app-1",
      qualificationId: "fe",
      student: currentStudent,
      status: "受理済み",
    },
    {
      id: "app-2",
      qualificationId: "python",
      student: "佐藤 美咲",
      status: "確認待ち",
    },
  ],
  jobs: [
    {
      id: "job-1",
      student: currentStudent,
      company: "株式会社フューチャーコード",
      title: "フロントエンドエンジニア",
      stage: "一次面接",
      date: "2026-10-15",
      notes: "ポートフォリオの説明を準備する。",
    },
    {
      id: "job-2",
      student: "佐藤 美咲",
      company: "株式会社データリンク",
      title: "データアナリスト",
      stage: "内定",
      date: "2026-10-09",
      notes: "条件面談を予定しています。",
    },
  ],
  appointments: [
    {
      id: "slot-1",
      date: "2026-10-16",
      time: "15:00–16:00",
      consultant: "佐藤キャリアコンサルタント",
      student: currentStudent,
    },
    {
      id: "slot-2",
      date: "2026-10-19",
      time: "10:00–11:00",
      consultant: "佐藤キャリアコンサルタント",
    },
    {
      id: "slot-3",
      date: "2026-10-20",
      time: "14:00–15:00",
      consultant: "田中キャリアコンサルタント",
    },
  ],
  materials: [
    {
      id: "mat-1",
      title: "Webフルスタック開発実践テキスト",
      publisher: "技術評論社",
      price: 3080,
      quantity: 30,
      vendor: "学習教材センター",
      status: "未発注",
    },
    {
      id: "mat-2",
      title: "SQL・データベース演習ノート",
      publisher: "翔泳社",
      price: 2420,
      quantity: 30,
      vendor: "学習教材センター",
      status: "発注済み",
    },
  ],
  submissions: [
    {
      id: "sub-1",
      student: currentStudent,
      lesson: "Day 14：認証ガード付きAPIの設計",
      answer:
        "サーバー側でセッションを検証し、未認証には401を返します。RLSで本人の行だけを許可します。",
      aiScore: 95,
      score: 95,
      feedback: "認証とRLSの役割を正確に説明できています。",
      status: "採点待ち",
    },
    {
      id: "sub-2",
      student: "佐藤 美咲",
      lesson: "Day 14：認証ガード付きAPIの設計",
      answer: "クッキーで認証し、エラー時はログイン画面へ遷移します。",
      aiScore: 82,
      score: 82,
      feedback: "APIではJSON形式のエラー応答も検討しましょう。",
      status: "採点待ち",
    },
  ],
  surveys: [
    {
      id: "mid-term",
      title: "第2回 訓練受講中間アンケート",
      deadline: "2026-10-20",
      questions: [
        "講義の内容は理解しやすいですか？",
        "教材の量・難易度は適切ですか？",
        "講師や事務局のサポートに満足していますか？",
      ],
      published: true,
    },
  ],
  notifications: [
    {
      id: "notice-1",
      recipients: "受講生全員",
      channel: "LINE",
      message:
        "10月13日はスクーリングです。9:30までに第2実習室へお越しください。",
      status: "確認済み",
    },
  ],
  questions: [
    {
      id: "question-1",
      title: "RLSとAPIの認証の違いについて",
      body: "RLSを設定していれば、API側の認証確認は不要になりますか？",
      student: currentStudent,
      reply: "",
      status: "回答待ち",
    },
  ],
  meetings: [
    {
      id: "meeting-1",
      title: "React・Next.js実践講義",
      date: "2026-10-13",
      time: "13:30–15:00",
      method: "オンライン",
    },
  ],
  courses: [
    {
      id: "course-01",
      title: "DX人材育成＆Webフルスタック開発科",
      period: "2026/09/01–2027/02/28",
      capacity: 30,
      count: 28,
      status: "開講中",
    },
    {
      id: "course-02",
      title: "日商簿記2級 総合対策講座",
      period: "2026/11/01–2027/04/30",
      capacity: 24,
      count: 18,
      status: "募集中",
    },
    {
      id: "course-03",
      title: "Pythonデータサイエンス実践科",
      period: "2027/01/05–2027/06/30",
      capacity: 20,
      count: 0,
      status: "下書き",
    },
  ],
  payments: [
    {
      id: "pay-1",
      title: "Webフルスタック開発実践テキスト",
      amount: 3080,
      status: "未払い",
      method: "",
      date: "2026-10-20",
    },
    {
      id: "pay-2",
      title: "基本情報技術者試験 受験料",
      amount: 7500,
      status: "支払い済み",
      method: "クレジットカード",
      date: "2026-10-05",
    },
  ],
  revisions: [
    {
      id: "rev-3",
      title: "DX人材育成＆Webフルスタック開発科",
      date: "2026/10/09 16:40",
      author: "田中 事務局",
      summary: "日別計画のスクーリング時間を調整",
      restored: false,
    },
    {
      id: "rev-2",
      title: "DX人材育成＆Webフルスタック開発科",
      date: "2026/10/08 10:15",
      author: "佐々木 講師",
      summary: "データベース科目のシラバスを更新",
      restored: false,
    },
    {
      id: "rev-1",
      title: "DX人材育成＆Webフルスタック開発科",
      date: "2026/10/05 09:00",
      author: "田中 事務局",
      summary: "コースの初期設計",
      restored: false,
    },
  ],
  lineLinked: false,
  uiSnapshots: {},
});
type Context = {
  data: DemoState;
  setData: React.Dispatch<React.SetStateAction<DemoState>>;
  notify: (message: string) => void;
  reset: () => void;
};
const DemoContext = createContext<Context | null>(null);
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(createDemoState);
  const [message, setMessage] = useState("");
  const notify = (text: string) => {
    setMessage(text);
  };
  return (
    <DemoContext.Provider
      value={{
        data,
        setData,
        notify,
        reset: () => {
          setData(createDemoState());
          setMessage("デモデータを初期状態に戻しました。");
        },
      }}
    >
      {children}
      {message && (
        <div
          role="status"
          className="fixed bottom-24 md:bottom-6 right-4 left-4 md:left-auto z-[80] rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 shadow-xl p-4 text-sm flex items-start gap-4 max-w-xl"
        >
          <span>{message}</span>
          <button
            type="button"
            aria-label="通知を閉じる"
            onClick={() => setMessage("")}
            className="ml-auto font-bold"
          >
            ×
          </button>
        </div>
      )}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required");
  return context;
}
export function usePreviewState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const { data, setData } = useDemo();
  const value = (data.uiSnapshots[key] ?? initial) as T;
  const setValue: React.Dispatch<React.SetStateAction<T>> = (action) =>
    setData((state) => ({
      ...state,
      uiSnapshots: {
        ...state.uiSnapshots,
        [key]:
          typeof action === "function"
            ? (action as (previous: T) => T)(
                (state.uiSnapshots[key] ?? initial) as T,
              )
            : action,
      },
    }));
  return [value, setValue];
}
export function id() {
  return crypto.randomUUID();
}
export function yen(amount: number) {
  return `¥${amount.toLocaleString("ja-JP")}`;
}
