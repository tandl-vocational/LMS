import React, { useState } from "react";
import { FileText, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useDemo, students } from "@/src/demo/store";
import { Page, Section, Field, Modal, DataTable, download, csv } from "./ui";

export default function ReportsPage() {
  const { data } = useDemo();
  const [course, setCourse] = useState("course-01");
  const [month, setMonth] = useState("2026年10月");
  const [type, setType] = useState("出席管理簿");
  const [preview, setPreview] = useState(false);
  const selected = data.courses.find((c) => c.id === course);
  const rows: (string | number)[][] = [
    ["受講生番号", "氏名", "通算出席率"],
    ...students.map((s) => [s.id, s.name, `${s.attendance}%`]),
  ];
  return (
    <Page
      title="公的帳票・修了証"
      description="出力対象と帳票の種類を選び、内容を確認します。"
    >
      <Section title="帳票の出力条件">
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="対象コース">
            <Select value={course} onChange={(e) => setCourse(e.target.value)}>
              {data.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="対象月">
            <Select value={month} onChange={(e) => setMonth(e.target.value)}>
              {["2026年9月", "2026年10月", "2026年11月"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </Field>
          <Field label="帳票の種類">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {["出席管理簿", "受講生名簿", "訓練実施報告書", "修了証"].map(
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </Select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button onClick={() => setPreview(true)}>
            <FileText className="w-4 h-4 mr-2" />
            帳票をプレビュー
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              download(
                `${type}_${month}.csv`,
                csv([
                  ["帳票", type],
                  ["コース", selected?.title || ""],
                  ["対象月", month],
                  ...rows,
                ]),
              )
            }
          >
            <Download className="w-4 h-4 mr-2" />
            集計CSVを出力
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          指定のExcel・PDF様式への出力は、実際の帳票テンプレートを設定した後に接続します。
        </p>
      </Section>
      <Section title="出力対象の受講生">
        <DataTable headers={rows[0] as string[]} rows={rows.slice(1)} />
      </Section>
      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title="帳票プレビュー（サンプル）"
      >
        <div className="space-y-4">
          <article
            id="report-preview"
            className="border border-slate-300 p-5 sm:p-8 text-slate-900 bg-white"
          >
            <p className="text-xs text-right text-slate-500">
              画面確認用サンプル
            </p>
            <h2 className="text-center font-bold text-xl my-5">{type}</h2>
            <p className="text-sm font-semibold">{selected?.title}</p>
            <p className="text-xs mt-2 mb-5">対象月：{month}</p>
            {type === "修了証" ? (
              <div className="space-y-5 py-10 text-center">
                <p className="text-xl font-semibold">山田 太郎 殿</p>
                <p className="text-sm leading-loose">
                  上記の訓練課程を修了したことを証します。
                </p>
                <p className="text-sm">2027年2月28日</p>
                <p className="text-sm font-bold">LMS Next 職業訓練校</p>
              </div>
            ) : (
              <DataTable headers={rows[0] as string[]} rows={rows.slice(1)} />
            )}
          </article>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            プレビューを印刷・PDF保存
          </Button>
        </div>
      </Modal>
    </Page>
  );
}
