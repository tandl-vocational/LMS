import React, { useState } from "react";
import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDemo, id, type Survey } from "@/src/demo/store";
import { Page, Section, Field, Modal, Status, Empty } from "./ui";

export default function SurveysPage({ staff = false }: { staff?: boolean }) {
  const { data, setData, notify } = useDemo();
  const [selected, setSelected] = useState<Survey>();
  const [answers, setAnswers] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("2026-10-30");
  const [questions, setQuestions] = useState(
    "講義の内容は理解しやすいですか？\n教材の難易度は適切ですか？",
  );
  const surveys = data.surveys.filter((s) => staff || s.published);
  return (
    <Page
      title={staff ? "アンケート作成・集計" : "受講アンケート"}
      description={
        staff
          ? "受講中・修了時のアンケートを作成し、改善につなげます。"
          : "よりよい講座づくりのため、受講した感想をお聞かせください。"
      }
      action={
        staff && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            アンケートを作成
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {!surveys.length && (
          <Empty text="現在回答できるアンケートはありません。" />
        )}
        {surveys.map((s) => (
          <Section
            key={s.id}
            title={s.title}
            description={`回答期限：${s.deadline}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-indigo-500" />
                <Status
                  value={
                    staff
                      ? s.published
                        ? "公開中"
                        : "下書き"
                      : s.answers
                        ? "回答済み"
                        : "未回答"
                  }
                />
                <span className="text-sm text-slate-500">
                  {s.questions.length}問
                </span>
              </div>
              {staff ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setData((d) => ({
                        ...d,
                        surveys: d.surveys.map((q) =>
                          q.id === s.id ? { ...q, published: !q.published } : q,
                        ),
                      }));
                      notify(
                        s.published
                          ? "アンケートを非公開にしました。"
                          : "アンケートを公開しました。",
                      );
                    }}
                  >
                    {s.published ? "非公開にする" : "公開する"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelected(s);
                      setAnswers(s.answers || []);
                    }}
                  >
                    回答結果を確認
                  </Button>
                </div>
              ) : (
                <Button
                  disabled={!!s.answers}
                  onClick={() => {
                    setSelected(s);
                    setAnswers(s.questions.map(() => ""));
                    setComment("");
                  }}
                >
                  アンケートに回答
                </Button>
              )}
            </div>
          </Section>
        ))}
      </div>
      <Modal
        open={!!selected}
        onClose={() => setSelected(undefined)}
        title={selected?.title || "アンケート"}
      >
        {selected &&
          (staff ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                回答数：{selected.answers ? 1 : 0}件（プレビュー内の回答）
              </p>
              {selected.questions.map((q, i) => (
                <div key={i} className="border rounded-xl p-4">
                  <p className="text-sm font-semibold">{q}</p>
                  <div className="mt-3 h-2 bg-slate-100 rounded-full">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{
                        width: `${Number(selected.answers?.[i] || 0) * 20}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {selected.answers?.[i]
                      ? `${selected.answers[i]} / 5`
                      : "回答待ち"}
                  </p>
                </div>
              ))}
              {selected.answers?.[selected.questions.length] && (
                <p className="text-sm">
                  自由記述：{selected.answers[selected.questions.length]}
                </p>
              )}
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (answers.some((a) => !a)) return;
                setData((s) => ({
                  ...s,
                  surveys: s.surveys.map((q) =>
                    q.id === selected.id
                      ? { ...q, answers: [...answers, comment] }
                      : q,
                  ),
                }));
                setSelected(undefined);
                notify("アンケートの回答を受け付けました。");
              }}
            >
              {selected.questions.map((q, i) => (
                <Field key={i} label={`${i + 1}. ${q}`}>
                  <Select
                    required
                    value={answers[i] || ""}
                    onChange={(e) =>
                      setAnswers((a) =>
                        a.map((v, n) => (n === i ? e.target.value : v)),
                      )
                    }
                  >
                    <option value="">回答を選択してください</option>
                    {[
                      ["5", "とても満足"],
                      ["4", "満足"],
                      ["3", "どちらともいえない"],
                      ["2", "やや不満"],
                      ["1", "不満"],
                    ].map(([v, t]) => (
                      <option key={v} value={v}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </Field>
              ))}
              <Field label="その他のご意見（任意）">
                <Textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Field>
              <Button
                type="submit"
                className="w-full"
                disabled={answers.some((a) => !a)}
              >
                回答を送信
              </Button>
            </form>
          ))}
      </Modal>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="アンケートを作成"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const list = questions
              .split("\n")
              .map((q) => q.trim())
              .filter(Boolean);
            if (!title.trim() || !list.length) return;
            setData((s) => ({
              ...s,
              surveys: [
                ...s.surveys,
                {
                  id: id(),
                  title: title.trim(),
                  deadline,
                  questions: list,
                  published: false,
                },
              ],
            }));
            setOpen(false);
            setTitle("");
            notify("アンケートの下書きを作成しました。");
          }}
        >
          <Field label="アンケート名">
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="回答期限">
            <Input
              required
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </Field>
          <Field
            label="設問（1行に1問）"
            hint="各設問は5段階評価で回答します。"
          >
            <Textarea
              required
              rows={5}
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full">
            下書きを作成
          </Button>
        </form>
      </Modal>
    </Page>
  );
}
