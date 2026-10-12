import React, { useState } from "react";
import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, DataTable, download } from "./ui";

export type ImportedStudent = { name: string; loginId: string };
function parse(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"') {
      if (quoted && input[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else value += ch;
  }
  if (quoted) throw new Error("CSVの引用符が閉じられていません。");
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
export default function CsvImport({
  onClose,
  onImport,
  existing,
}: {
  onClose: () => void;
  onImport: (students: ImportedStudent[]) => void;
  existing: string[];
}) {
  const [students, setStudents] = useState<ImportedStudent[]>([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const load = async (file?: File) => {
    setStudents([]);
    setError("");
    if (!file) return;
    setFileName(file.name);
    if (file.size > 5 * 1024 * 1024) {
      setError("5MB以下のCSVファイルを選択してください。");
      return;
    }
    try {
      const rows = parse(await file.text());
      const header = rows.shift();
      const name = header?.findIndex((h) => h === "氏名");
      const login = header?.findIndex((h) => h === "受講番号");
      if (name === undefined || login === undefined || name < 0 || login < 0)
        throw new Error("「氏名」と「受講番号」の見出しが必要です。");
      if (!rows.length || rows.length > 1000)
        throw new Error("1〜1000名のデータを指定してください。");
      const used = new Set(existing.map((v) => v.toLowerCase()));
      const result = rows.map((r, i) => {
        const student = { name: r[name], loginId: r[login] };
        if (
          !student.name ||
          !student.loginId ||
          !/^[a-zA-Z0-9_-]+$/.test(student.loginId)
        )
          throw new Error(
            `${i + 2}行目：氏名と英数字の受講番号を確認してください。`,
          );
        if (used.has(student.loginId.toLowerCase()))
          throw new Error(
            `${i + 2}行目：受講番号 ${student.loginId} が重複しています。`,
          );
        used.add(student.loginId.toLowerCase());
        return student;
      });
      setStudents(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "CSVを読み込めませんでした。");
    }
  };
  return (
    <Modal
      open
      onClose={onClose}
      title="受講生名簿CSV一括インポート"
      description="アップロードした名簿の内容を確認してから、デモのアカウント一覧に追加します。"
    >
      <div className="space-y-4">
        <div
          className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void load(e.dataTransfer.files[0]);
          }}
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-sm mb-3">CSVを選択、またはここにドロップ</p>
          <Input
            aria-label="受講生CSVファイル"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => void load(e.target.files?.[0])}
          />
        </div>
        <p className="text-xs text-slate-500">
          列項目：氏名, 受講番号, 電話番号, 開講コースID（UTF-8）
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            download(
              "受講生名簿サンプル.csv",
              "氏名,受講番号,電話番号,開講コースID\r\nテスト 受講生,std2026099,,course-01",
            )
          }
        >
          <Download className="w-3 h-3 mr-1" />
          サンプルCSVをダウンロード
        </Button>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {!!students.length && (
          <>
            <p className="text-xs text-slate-500">
              {fileName} ／ {students.length}名
            </p>
            <DataTable
              headers={["氏名", "受講番号"]}
              rows={students.map((s) => [s.name, s.loginId])}
            />
          </>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            disabled={!students.length || !!error}
            onClick={() => onImport(students)}
          >
            {students.length}名を一括インポート
          </Button>
        </div>
      </div>
    </Modal>
  );
}
