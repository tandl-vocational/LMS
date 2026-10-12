import React, { useState } from "react";
import { Plus, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDemo, currentStudent, id, type Question } from "@/src/demo/store";
import { Page, Section, Field, Modal, Status, Empty } from "./ui";

export default function QuestionsPage({
  instructor = false,
}: {
  instructor?: boolean;
}) {
  const { data, setData, notify } = useDemo();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selected, setSelected] = useState<Question>();
  const [reply, setReply] = useState("");
  const questions = data.questions.filter(
    (q) => instructor || q.student === currentStudent,
  );
  return (
    <Page
      title={instructor ? "質問対応" : "講師への質問"}
      description={
        instructor
          ? "受講生の質問を確認し、学習を支える回答を作成します。"
          : "講義や課題でわからないことを、担当講師に相談できます。"
      }
      action={
        !instructor && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            質問を作成
          </Button>
        )
      }
    >
      <Section title="質問一覧">
        <div className="space-y-3">
          {!questions.length && <Empty text="まだ質問はありません。" />}
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setSelected(q);
                setReply(q.reply);
              }}
              className="w-full text-left border border-slate-200 hover:border-indigo-300 rounded-xl p-4 flex items-start gap-3 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-semibold text-sm">{q.title}</h3>
                  <Status value={q.status} />
                </div>
                <p className="text-xs text-slate-500 mt-2">{q.student}</p>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                  {q.body}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Section>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="講師への質問を作成"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !body.trim()) return;
            setData((s) => ({
              ...s,
              questions: [
                {
                  id: id(),
                  title: title.trim(),
                  body: body.trim(),
                  student: currentStudent,
                  reply: "",
                  status: "回答待ち",
                },
                ...s.questions,
              ],
            }));
            setOpen(false);
            setTitle("");
            setBody("");
            notify("質問を追加しました。");
          }}
        >
          <Field label="質問のタイトル">
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="質問内容">
            <Textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full">
            質問を提出
          </Button>
        </form>
      </Modal>
      <Modal
        open={!!selected}
        onClose={() => setSelected(undefined)}
        title={selected?.title || "質問"}
      >
        {selected && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-500 mb-2">
                {selected.student}からの質問
              </p>
              <p className="text-sm whitespace-pre-wrap">{selected.body}</p>
            </div>
            {instructor ? (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!reply.trim()) return;
                  setData((s) => ({
                    ...s,
                    questions: s.questions.map((q) =>
                      q.id === selected.id
                        ? { ...q, reply: reply.trim(), status: "回答済み" }
                        : q,
                    ),
                  }));
                  setSelected(undefined);
                  notify("回答を追加しました。");
                }}
              >
                <Field label="講師の回答">
                  <Textarea
                    required
                    rows={5}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                </Field>
                <Button type="submit">
                  <Send className="w-4 h-4 mr-2" />
                  回答を確定
                </Button>
              </form>
            ) : selected.reply ? (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="font-bold text-xs text-indigo-700 mb-2">
                  担当講師からの回答
                </p>
                <p className="text-sm whitespace-pre-wrap">{selected.reply}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                担当講師が回答を確認しています。
              </p>
            )}
          </div>
        )}
      </Modal>
    </Page>
  );
}
