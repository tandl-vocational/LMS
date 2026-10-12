import React, { useState } from "react";
import { Plus, FileCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useDemo,
  currentStudent,
  students,
  id,
  type AttendanceRequest,
  type Attachment,
} from "@/src/demo/store";
import {
  Page,
  Section,
  Metric,
  Field,
  Modal,
  DataTable,
  Status,
  SearchBox,
  FileField,
  download,
  csv,
} from "./ui";

export default function AttendancePage({ staff = false }: { staff?: boolean }) {
  const { data, setData, notify } = useDemo();
  const [formOpen, setFormOpen] = useState(false);
  const [date, setDate] = useState("2026-10-12");
  const [type, setType] = useState("欠席");
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState<Attachment>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("すべて");
  const [review, setReview] = useState<AttendanceRequest>();
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<"承認済み" | "差し戻し">("承認済み");
  const [detail, setDetail] = useState<AttendanceRequest>();
  const requests = data.attendance.filter(
    (r) =>
      (staff || r.student === currentStudent) &&
      (status === "すべて" || r.status === status) &&
      `${r.student}${r.reason}`.includes(search),
  );
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setData((s) => ({
      ...s,
      attendance: [
        {
          id: id(),
          student: currentStudent,
          date,
          type,
          reason: reason.trim(),
          attachment,
          status: "確認待ち",
        },
        ...s.attendance,
      ],
    }));
    setFormOpen(false);
    setReason("");
    setAttachment(undefined);
    notify("出欠申請を追加しました。事務局の確認をお待ちください。");
  };
  const reviewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!review || (decision === "差し戻し" && !note.trim())) return;
    setData((s) => ({
      ...s,
      attendance: s.attendance.map((r) =>
        r.id === review.id ? { ...r, status: decision, reviewNote: note } : r,
      ),
    }));
    setReview(undefined);
    notify(`申請を${decision === "承認済み" ? "承認" : "差し戻し"}しました。`);
  };
  return (
    <Page
      title={staff ? "出席管理・申請承認" : "出席・欠席申請"}
      description={
        staff
          ? "受講生の出席状況と、欠席・遅刻・早退の申請を確認します。"
          : "当月・通算の出席状況を確認し、必要な届出を提出できます。"
      }
      action={
        !staff && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            出欠申請を作成
          </Button>
        )
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {staff ? (
          <>
            <Metric label="受講生" value={`${students.length}名`} />
            <Metric
              label="確認待ち申請"
              value={
                data.attendance.filter((r) => r.status === "確認待ち").length
              }
            />
            <Metric label="85%未満" value="2名" tone="amber" />
            <Metric label="80%未満" value="1名" tone="red" />
          </>
        ) : (
          <>
            <Metric label="当月出席率" value="92.0%" tone="emerald" />
            <Metric label="通算出席率" value="88.5%" tone="emerald" />
            <Metric label="出席基準" value="80%以上" />
            <Metric
              label="確認待ち"
              value={
                data.attendance.filter(
                  (r) =>
                    r.student === currentStudent && r.status === "確認待ち",
                ).length
              }
            />
          </>
        )}
      </div>
      {staff && (
        <Section title="受講生の出席状況">
          <DataTable
            headers={["受講生", "受講生番号", "通算出席率", "判定"]}
            rows={students.map((s) => [
              s.name,
              s.id,
              `${s.attendance}%`,
              <Status
                value={
                  s.attendance < 80
                    ? "80%未満"
                    : s.attendance < 85
                      ? "注意：85%未満"
                      : "基準達成"
                }
              />,
            ])}
          />
          <p className="text-xs text-slate-500 mt-3">
            85%未満は注意、80%未満は要確認として表示します。
          </p>
        </Section>
      )}
      <Section title={staff ? "出欠申請の一覧" : "申請履歴"}>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchBox value={search} onChange={setSearch} />
          <Select
            aria-label="申請状態"
            className="sm:w-44"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["すべて", "確認待ち", "承認済み", "差し戻し"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          {staff && (
            <Button
              variant="outline"
              onClick={() =>
                download(
                  "出欠申請.csv",
                  csv([
                    ["受講生", "日付", "種別", "理由", "状態"],
                    ...requests.map((r) => [
                      r.student,
                      r.date,
                      r.type,
                      r.reason,
                      r.status,
                    ]),
                  ]),
                )
              }
            >
              <Download className="w-4 h-4 mr-2" />
              CSV出力
            </Button>
          )}
        </div>
        <DataTable
          headers={[
            ...(staff ? ["受講生"] : []),
            "訓練日",
            "種別",
            "申請理由",
            "状態",
            "操作",
          ]}
          rows={requests.map((r) => [
            ...(staff ? [r.student] : []),
            r.date,
            r.type,
            <span className="inline-block max-w-52 truncate">{r.reason}</span>,
            <Status value={r.status} />,
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setDetail(r)}>
                詳細
              </Button>
              {staff && r.status === "確認待ち" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setReview(r);
                    setNote("");
                    setDecision("承認済み");
                  }}
                >
                  <FileCheck className="w-3 h-3 mr-1" />
                  確認・承認
                </Button>
              )}
            </div>,
          ])}
        />
      </Section>
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="出欠申請を作成"
        description="訓練日・申請理由を入力してください。"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="訓練日">
              <Input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="申請種別">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {["欠席", "遅刻", "早退"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="申請理由">
            <Textarea
              required
              maxLength={2000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="欠席・遅刻・早退の理由を入力してください"
              rows={4}
            />
          </Field>
          <FileField value={attachment} onChange={setAttachment} />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={!reason.trim()}>
              申請を提出
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!detail}
        onClose={() => setDetail(undefined)}
        title="申請の詳細"
      >
        {detail && (
          <div className="space-y-4">
            <p className="text-sm">
              {detail.student} ／ {detail.date} ／ {detail.type}
            </p>
            <Status value={detail.status} />
            <p className="text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">
              {detail.reason}
            </p>
            {detail.attachment ? (
              <a
                className="text-sm underline text-indigo-600"
                target="_blank"
                rel="noreferrer"
                href={detail.attachment.url}
              >
                {detail.attachment.name}
              </a>
            ) : (
              <p className="text-xs text-slate-500">添付書類はありません。</p>
            )}
            {detail.reviewNote && (
              <p className="text-sm">事務局コメント：{detail.reviewNote}</p>
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={!!review}
        onClose={() => setReview(undefined)}
        title="申請内容の確認・承認"
      >
        {review && (
          <form onSubmit={reviewRequest} className="space-y-4">
            <p className="text-sm">
              {review.student} ／ {review.date} ／ {review.type}
            </p>
            <p className="p-4 bg-slate-50 rounded-xl text-sm">
              {review.reason}
            </p>
            {review.attachment && (
              <a
                href={review.attachment.url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline text-sm"
              >
                添付書類を確認
              </a>
            )}
            <Field label="審査結果">
              <Select
                value={decision}
                onChange={(e) => setDecision(e.target.value as typeof decision)}
              >
                <option>承認済み</option>
                <option>差し戻し</option>
              </Select>
            </Field>
            <Field
              label={
                decision === "差し戻し"
                  ? "差し戻し理由（必須）"
                  : "事務局コメント"
              }
            >
              <Textarea
                required={decision === "差し戻し"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
            <Button type="submit" className="w-full">
              審査結果を確定
            </Button>
          </form>
        )}
      </Modal>
    </Page>
  );
}
