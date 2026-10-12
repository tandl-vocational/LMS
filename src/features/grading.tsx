import React, { useState } from "react";
import { CheckCircle2, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDemo, type Submission } from "@/src/demo/store";
import {
  Page,
  Section,
  Field,
  Metric,
  Modal,
  DataTable,
  Status,
  SearchBox,
} from "./ui";

export default function GradingPage() {
  const { data, setData, notify } = useDemo();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("採点待ち");
  const [selected, setSelected] = useState<Submission>();
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [confirm, setConfirm] = useState(false);
  const rows = data.submissions.filter(
    (s) =>
      (filter === "すべて" || s.status === filter) &&
      `${s.student}${s.lesson}`.includes(search),
  );
  const open = (s: Submission) => {
    setSelected(s);
    setScore(s.score);
    setFeedback(s.feedback);
    setConfirm(false);
  };
  return (
    <Page
      title="課題採点・フィードバック"
      description="AIの採点案と提出内容を比較し、講師が最終評価を確定します。"
    >
      <div className="grid grid-cols-3 gap-3">
        <Metric
          label="採点待ち"
          value={`${data.submissions.filter((s) => s.status === "採点待ち").length}件`}
          tone="amber"
        />
        <Metric
          label="評価確定"
          value={`${data.submissions.filter((s) => s.status === "評価確定").length}件`}
          tone="emerald"
        />
        <Metric label="提出課題" value={`${data.submissions.length}件`} />
      </div>
      <Section title="提出課題一覧">
        <div className="flex gap-3 flex-wrap mb-4">
          <SearchBox value={search} onChange={setSearch} />
          <Select
            aria-label="採点状況"
            className="w-44"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["採点待ち", "評価確定", "すべて"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
        <DataTable
          headers={["受講生", "課題", "AI採点案", "状態", "操作"]}
          rows={rows.map((s) => [
            s.student,
            <span className="inline-block max-w-72 whitespace-normal">
              {s.lesson}
            </span>,
            `${s.aiScore}点`,
            <Status value={s.status} />,
            <Button size="sm" variant="outline" onClick={() => open(s)}>
              <FileCheck2 className="w-3 h-3 mr-1" />
              {s.status === "評価確定" ? "評価を確認" : "採点する"}
            </Button>,
          ])}
        />
      </Section>
      <Modal
        open={!!selected}
        onClose={() => setSelected(undefined)}
        title={
          selected?.status === "評価確定" ? "確定済みの評価" : "提出課題を採点"
        }
        description={selected?.student}
      >
        {selected && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (selected.status === "評価確定") return;
              setConfirm(true);
            }}
          >
            <p className="font-semibold text-sm">{selected.lesson}</p>
            <div className="rounded-xl bg-slate-50 p-4 text-sm whitespace-pre-wrap leading-relaxed">
              {selected.answer}
            </div>
            <div className="border border-indigo-200 rounded-xl bg-indigo-50 p-4 text-sm">
              <p className="font-bold text-indigo-800">
                AI採点案：{selected.aiScore}点
              </p>
              <p className="text-xs text-slate-600 mt-2">
                採点観点：認証の検証／エラー応答／RLSによるアクセス制御
              </p>
            </div>
            <Field label="講師の最終得点（0〜100点）">
              <Input
                required
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                disabled={selected.status === "評価確定"}
              />
            </Field>
            <Field label="受講生へのフィードバック">
              <Textarea
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                disabled={selected.status === "評価確定"}
              />
            </Field>
            {selected.status !== "評価確定" && (
              <>
                {confirm ? (
                  <div className="p-4 rounded-xl border border-emerald-200 space-y-3">
                    <p className="text-sm">
                      {score}点の評価とコメントを確定します。よろしいですか？
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setConfirm(false)}
                      >
                        修正する
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setData((s) => ({
                            ...s,
                            submissions: s.submissions.map((item) =>
                              item.id === selected.id
                                ? {
                                    ...item,
                                    score,
                                    feedback,
                                    status: "評価確定",
                                  }
                                : item,
                            ),
                          }));
                          setSelected(undefined);
                          notify("講師の最終評価を確定しました。");
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        評価を確定
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={!feedback.trim() || score < 0 || score > 100}
                    className="w-full"
                  >
                    評価内容を確認
                  </Button>
                )}
              </>
            )}
          </form>
        )}
      </Modal>
    </Page>
  );
}
