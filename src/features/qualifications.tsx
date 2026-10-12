import React, { useState } from "react";
import { Download, Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useDemo,
  currentStudent,
  id,
  yen,
  type Qualification,
  type Attachment,
} from "@/src/demo/store";
import {
  Page,
  Section,
  Field,
  Modal,
  DataTable,
  Status,
  FileField,
  download,
  csv,
  Empty,
} from "./ui";

export default function QualificationsPage({
  staff = false,
}: {
  staff?: boolean;
}) {
  const { data, setData, notify } = useDemo();
  const [selected, setSelected] = useState<Qualification>();
  const [attachment, setAttachment] = useState<Attachment>();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [fee, setFee] = useState(0);
  const [date, setDate] = useState("2026-11-15");
  const [deadline, setDeadline] = useState("2026-10-30");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setData((s) => ({
      ...s,
      applications: [
        ...s.applications,
        {
          id: id(),
          qualificationId: selected.id,
          student: currentStudent,
          status: "確認待ち",
          attachment,
        },
      ],
    }));
    setSelected(undefined);
    setAttachment(undefined);
    notify("検定申込を提出しました。");
  };
  const update = (applicationId: string, status: string) => {
    setData((s) => ({
      ...s,
      applications: s.applications.map((a) =>
        a.id === applicationId ? { ...a, status } : a,
      ),
    }));
    notify("申込状況を更新しました。");
  };
  return (
    <Page
      title={staff ? "検定・資格管理" : "検定・資格申込"}
      description={
        staff
          ? "目標資格、申込名簿、合否結果をまとめて管理します。"
          : "取得目標の資格を確認し、検定申込と指定書類の提出ができます。"
      }
      action={
        staff && (
          <Button onClick={() => setEditOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            目標資格を追加
          </Button>
        )
      }
    >
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.qualifications.map((q) => {
          const application = data.applications.find(
            (a) => a.qualificationId === q.id && a.student === currentStudent,
          );
          return (
            <Section key={q.id} title={q.name} description={q.organizer}>
              <div className="space-y-4">
                <Award className="w-8 h-8 text-indigo-500" />
                <dl className="grid grid-cols-2 gap-y-3 text-sm">
                  <dt className="text-slate-500">試験日</dt>
                  <dd>{q.date}</dd>
                  <dt className="text-slate-500">申込期限</dt>
                  <dd>{q.deadline}</dd>
                  <dt className="text-slate-500">受験料（税込）</dt>
                  <dd className="font-semibold">{yen(q.fee)}</dd>
                </dl>
                {!staff && (
                  <>
                    <Status value={application?.status || "未申込"} />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          download(
                            `${q.name}_申込用紙サンプル.txt`,
                            `${q.name}\n受講生番号：\n氏名：\n連絡先：\n※画面確認用の申込用紙サンプルです。`,
                            "text/plain;charset=utf-8",
                          )
                        }
                      >
                        <Download className="w-3 h-3 mr-1" />
                        申込用紙（サンプル）
                      </Button>
                      <Button
                        size="sm"
                        disabled={!!application}
                        onClick={() => {
                          setSelected(q);
                          setAttachment(undefined);
                        }}
                      >
                        検定を申し込む
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Section>
          );
        })}
      </div>
      <Section title={staff ? "申込名簿・結果管理" : "あなたの申込状況"}>
        {staff && (
          <Button
            variant="outline"
            className="mb-4"
            onClick={() =>
              download(
                "検定申込名簿.csv",
                csv([
                  ["氏名", "資格", "状況"],
                  ...data.applications.map((a) => [
                    a.student,
                    data.qualifications.find((q) => q.id === a.qualificationId)
                      ?.name || "",
                    a.status,
                  ]),
                ]),
              )
            }
          >
            <Download className="w-4 h-4 mr-2" />
            名簿CSVを出力
          </Button>
        )}
        <DataTable
          headers={[
            "受講生",
            "資格",
            "状態",
            "得点",
            "提出書類",
            ...(staff ? ["結果・操作"] : []),
          ]}
          rows={data.applications
            .filter((a) => staff || a.student === currentStudent)
            .map((a) => [
              a.student,
              data.qualifications.find((q) => q.id === a.qualificationId)?.name,
              <Status value={a.status} />,
              staff ? (
                <Input
                  aria-label={`${a.student}の検定得点`}
                  type="number"
                  min={0}
                  className="w-24"
                  value={a.score ?? ""}
                  onChange={(e) => {
                    const score =
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value);
                    setData((s) => ({
                      ...s,
                      applications: s.applications.map((item) =>
                        item.id === a.id ? { ...item, score } : item,
                      ),
                    }));
                  }}
                />
              ) : (
                (a.score ?? "—")
              ),
              a.attachment ? (
                <a
                  href={a.attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline"
                >
                  書類を確認
                </a>
              ) : (
                "未提出"
              ),
              ...(staff
                ? [
                    <Select
                      aria-label={`${a.student}の検定状況`}
                      value={a.status}
                      onChange={(e) => update(a.id, e.target.value)}
                    >
                      {[
                        "確認待ち",
                        "受理済み",
                        "結果待ち",
                        "合格",
                        "不合格",
                        "欠席",
                        "差し戻し",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>,
                  ]
                : []),
            ])}
        />
      </Section>
      <Modal
        open={!!selected}
        onClose={() => setSelected(undefined)}
        title="検定申込の確認"
      >
        {selected && (
          <form onSubmit={submit} className="space-y-4">
            <p className="font-bold">{selected.name}</p>
            <p className="text-sm text-slate-500">
              試験日：{selected.date} ／ 受験料：{yen(selected.fee)}
            </p>
            <FileField
              label="申込書類"
              value={attachment}
              onChange={setAttachment}
            />
            <label className="flex gap-2 text-sm items-start">
              <input
                required
                type="checkbox"
                className="mt-1 accent-indigo-600"
              />
              試験日・受験料・申込内容を確認しました。
            </label>
            <Button type="submit" className="w-full">
              申込を提出
            </Button>
          </form>
        )}
      </Modal>
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="取得目標資格を追加"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || deadline > date) {
              notify("資格名と、試験日以前の申込期限を確認してください。");
              return;
            }
            setData((s) => ({
              ...s,
              qualifications: [
                ...s.qualifications,
                { id: id(), name: name.trim(), organizer, fee, date, deadline },
              ],
            }));
            setEditOpen(false);
            setName("");
            notify("目標資格を追加しました。");
          }}
        >
          <Field label="資格名">
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="主催者">
            <Input
              required
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
            />
          </Field>
          <Field label="受験料（税込）">
            <Input
              type="number"
              required
              min={0}
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="試験日">
              <Input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="申込期限">
              <Input
                required
                type="date"
                max={date}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </Field>
          </div>
          <Button type="submit" className="w-full">
            資格を追加
          </Button>
        </form>
      </Modal>
    </Page>
  );
}
