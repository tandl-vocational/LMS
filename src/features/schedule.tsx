import React, { useState } from "react";
import { Plus, CalendarDays, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDemo, id } from "@/src/demo/store";
import { Page, Section, Field, Modal, DataTable, Status } from "./ui";

export default function SchedulePage({
  instructor = false,
}: {
  instructor?: boolean;
}) {
  const { data, setData, notify } = useDemo();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2026-10-16");
  const [start, setStart] = useState("13:30");
  const [end, setEnd] = useState("15:00");
  const [method, setMethod] = useState("オンライン");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [meetingPreview, setMeetingPreview] = useState<string>();
  const days = [
    [
      "10/13（火）",
      "Reactコンポーネント設計",
      "スクーリング",
      "09:30–16:30",
      "第2実習室",
    ],
    ["10/14（水）", "TypeScript・API設計", "在宅", "09:30–16:30", "オンライン"],
    ["10/15（木）", "PostgreSQLとRLS", "在宅", "09:30–16:30", "オンライン"],
    [
      "10/16（金）",
      "総合演習・面談",
      "スクーリング",
      "09:30–16:30",
      "第2実習室",
    ],
  ];
  return (
    <Page
      title={instructor ? "担当カリキュラム・Web会議" : "受講スケジュール"}
      description={
        instructor
          ? "担当科目の日別計画を閲覧し、コメントとWeb会議の予定を登録できます。"
          : "スクーリング・オンライン講義・面談の予定を確認できます。"
      }
      action={
        instructor && (
          <Button
            onClick={() => {
              setOpen(true);
              setError("");
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Web会議を登録
          </Button>
        )
      }
    >
      {instructor && (
        <Section
          title="担当科目のシラバス"
          description="科目の到達目標と配当時間を閲覧できます。"
        >
          <DataTable
            headers={["担当科目", "配当時間", "到達目標"]}
            rows={[
              [
                "JavaScript・TypeScript実践",
                "120時間",
                "型安全なプログラムと非同期処理を設計する。",
              ],
              [
                "React・Next.js総合演習",
                "150時間",
                "コンポーネント設計とAPIの実装を理解する。",
              ],
              [
                "データベース・SQL演習",
                "75時間",
                "正規化、SQL、RLSの基本設計を理解する。",
              ],
            ]}
          />
        </Section>
      )}
      <Section title="今週の訓練計画" description="2026年10月12日〜10月18日">
        <DataTable
          headers={["日付", "科目", "区分", "時間", "場所"]}
          rows={days}
        />
      </Section>
      <Section title="オンライン講義・Web会議">
        <div className="grid sm:grid-cols-2 gap-3">
          {data.meetings.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200 p-4 space-y-3"
            >
              <Video className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm">{m.title}</h3>
              <p className="text-sm text-slate-600">
                {m.date} ／ {m.time}
              </p>
              <Status value={m.method} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMeetingPreview(m.title)}
              >
                参加画面を確認
              </Button>
            </div>
          ))}
        </div>
      </Section>
      {instructor && (
        <Section title="担当計画へのコメント">
          <div className="space-y-3">
            {comments.map((c, i) => (
              <p key={i} className="text-sm bg-slate-50 p-3 rounded-lg">
                佐々木 講師：{c}
              </p>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!comment.trim()) return;
                setComments((s) => [...s, comment.trim()]);
                setComment("");
                notify("カリキュラムへのコメントを追加しました。");
              }}
              className="space-y-3"
            >
              <Field label="事務局へのコメント">
                <Textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="日別計画に関する連絡・相談を入力してください"
                />
              </Field>
              <Button type="submit" disabled={!comment.trim()}>
                コメントを投稿
              </Button>
            </form>
          </div>
        </Section>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Web会議の予定を登録"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (start >= end) {
              setError("終了時刻は開始時刻より後にしてください。");
              return;
            }
            setData((s) => ({
              ...s,
              meetings: [
                ...s.meetings,
                { id: id(), title, date, time: `${start}–${end}`, method },
              ],
            }));
            setOpen(false);
            setTitle("");
            notify("Web会議の予定を登録しました。");
          }}
        >
          <Field label="講義・会議名">
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="開催日">
            <Input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="開始時刻">
              <Input
                required
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Field>
            <Field label="終了時刻">
              <Input
                required
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Field>
          </div>
          <Field label="開催方法">
            <Select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>オンライン</option>
              <option>ハイブリッド</option>
              <option>対面</option>
            </Select>
          </Field>
          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full">
            会議予定を登録
          </Button>
        </form>
      </Modal>
      <Modal
        open={!!meetingPreview}
        onClose={() => setMeetingPreview(undefined)}
        title="Web会議の参加確認"
      >
        <div className="space-y-4">
          <div className="h-44 rounded-xl bg-slate-900 flex flex-col items-center justify-center gap-3 text-white">
            <Video className="w-10 h-10 text-slate-400" />
            <p className="text-sm">{meetingPreview}</p>
          </div>
          <p className="text-sm text-slate-500">
            講義名と参加予定を確認するための画面です。UIプレビューでは実際の会議には接続しません。
          </p>
          <Button
            className="w-full"
            onClick={() => {
              setMeetingPreview(undefined);
              notify("会議の参加予定を確認しました。");
            }}
          >
            参加予定を確認
          </Button>
        </div>
      </Modal>
    </Page>
  );
}
