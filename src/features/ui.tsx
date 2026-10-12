import React, { useId, useState } from "react";
import { FileText, Search, X, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Attachment } from "@/src/demo/store";

export function Page({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-600 mb-2">LMS Next</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {description}
          </p>
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}
export function Section({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      <div className="p-5 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
export function Metric({
  label,
  value,
  detail,
  tone = "indigo",
}: {
  label: string;
  value: string | number;
  detail?: string;
  tone?: "indigo" | "amber" | "red" | "emerald";
}) {
  const colors = {
    indigo: "text-indigo-600",
    amber: "text-amber-600",
    red: "text-red-600",
    emerald: "text-emerald-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-2 ${colors[tone]}`}>{value}</p>
      {detail && <p className="text-xs text-slate-500 mt-2">{detail}</p>}
    </div>
  );
}
export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: React.ReactElement;
  htmlFor?: string;
}) {
  const generated = useId();
  const child = children as React.ReactElement<{ id?: string }>;
  const fieldId = htmlFor || child.props.id || generated;
  return (
    <div className="space-y-1.5 min-w-0">
      <label htmlFor={fieldId} className="text-xs font-semibold text-slate-700">
        {label}
      </label>
      {htmlFor ? child : React.cloneElement(child, { id: fieldId })}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
export function Empty({
  text = "該当するデータはありません。",
  action,
}: {
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-3">
      <Inbox className="w-8 h-8 text-slate-300" />
      <p className="text-sm">{text}</p>
      {action}
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "名前・キーワードで検索",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative max-w-sm w-full">
      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
      <Input
        aria-label={placeholder}
        className="pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
export function Status({ value }: { value: string }) {
  return (
    <Badge
      variant={
        /差し戻し|不合格|80%未満|不採用/.test(value)
          ? "destructive"
          : /注意|未払い|確認待ち|採点待ち/.test(value)
            ? "warning"
            : /承認|受理|済|合格|内定|公開|開講|完了|回答済/.test(value) &&
                !/未/.test(value)
              ? "success"
              : "secondary"
      }
    >
      {value}
    </Badge>
  );
}
export function DataTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  empty?: string;
}) {
  if (!rows.length) return <Empty text={empty} />;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 font-semibold whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-slate-50/70">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className="px-4 py-3 align-middle whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center gap-4">
            <DialogTitle>{title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="閉じる"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function FileField({
  value,
  onChange,
  label = "添付書類（PDF・画像）",
}: {
  value?: Attachment;
  onChange: (value?: Attachment) => void;
  label?: string;
}) {
  const [error, setError] = useState("");
  return (
    <div className="space-y-2">
      <Field label={label} hint="PDF・JPEG・PNG、5MBまで">
        <Input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setError("");
            if (!file) return;
            if (
              file.size > 5 * 1024 * 1024 ||
              !["application/pdf", "image/jpeg", "image/png"].includes(
                file.type,
              )
            ) {
              setError("PDF・JPEG・PNGの5MB以下のファイルを選択してください。");
              e.target.value = "";
              return;
            }
            if (value) URL.revokeObjectURL(value.url);
            onChange({ name: file.name, url: URL.createObjectURL(file) });
          }}
        />
      </Field>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      {value && (
        <div className="flex items-center gap-2 text-xs">
          <FileText className="w-4 h-4 text-indigo-500" />
          <a
            href={value.url}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 underline truncate"
          >
            {value.name}
          </a>
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(value.url);
              onChange();
            }}
            className="ml-auto text-slate-500"
            aria-label="添付を削除"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
export function download(
  name: string,
  text: string,
  type = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(
    new Blob([type.includes("csv") ? "\uFEFF" : "", text], { type }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csv(rows: (string | number)[][]) {
  return rows
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
}
