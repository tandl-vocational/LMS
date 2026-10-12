import React, { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Link from "@/components/navigation/Link";
import { useDemo, id } from "@/src/demo/store";
import {
  Page,
  Section,
  Metric,
  Field,
  Modal,
  SearchBox,
  Status,
  Empty,
} from "./ui";

export default function CoursesPage() {
  const { data, setData, notify } = useDemo();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("すべて");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [start, setStart] = useState("2027-01-05");
  const [end, setEnd] = useState("2027-06-30");
  const [error, setError] = useState("");
  const courses = data.courses.filter(
    (c) =>
      c.title.includes(search) && (filter === "すべて" || c.status === filter),
  );
  return (
    <Page
      title="コース一覧・設計"
      description="基本設計、シラバス、日別計画、就職支援体制を管理します。"
      action={
        <Button
          onClick={() => {
            setOpen(true);
            setError("");
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          新しいコース
        </Button>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Metric
          label="開講中"
          value={`${data.courses.filter((c) => c.status === "開講中").length}コース`}
          tone="emerald"
        />
        <Metric
          label="募集中"
          value={`${data.courses.filter((c) => c.status === "募集中").length}コース`}
        />
        <Metric
          label="下書き"
          value={`${data.courses.filter((c) => c.status === "下書き").length}コース`}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="コース名で検索"
        />
        <Select
          className="w-40"
          aria-label="コースの状態"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {["すべて", "開講中", "募集中", "下書き"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {courses.map((c) => (
          <Section key={c.id} title={c.title} description={c.period}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Status value={c.status} />
                <p className="text-sm text-slate-500">
                  受講生 {c.count} / 定員 {c.capacity}名
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  className="inline-flex items-center rounded-lg bg-indigo-600 text-white px-4 py-2 text-xs font-semibold"
                  href={`/secretariat/courses/${c.id}/edit`}
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  コースを編集
                </Link>
                <Link
                  className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold"
                  href={`/secretariat/curriculums?course=${c.id}`}
                >
                  日別計画
                </Link>
              </div>
            </div>
          </Section>
        ))}
      </div>
      {!courses.length && <Empty text="条件に一致するコースはありません。" />}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="新しいコースを作成"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || end < start) {
              setError("コース名と訓練期間を確認してください。");
              return;
            }
            setData((s) => ({
              ...s,
              courses: [
                ...s.courses,
                {
                  id: id(),
                  title: title.trim(),
                  period: `${start.replaceAll("-", "/")}–${end.replaceAll("-", "/")}`,
                  capacity,
                  count: 0,
                  status: "下書き",
                },
              ],
            }));
            setOpen(false);
            setTitle("");
            notify("コースの下書きを作成しました。");
          }}
        >
          <Field label="コース名">
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="定員">
            <Input
              required
              min={1}
              max={500}
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="訓練開始日">
              <Input
                required
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Field>
            <Field label="訓練終了日">
              <Input
                required
                type="date"
                min={start}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Field>
          </div>
          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full">
            下書きを作成
          </Button>
        </form>
      </Modal>
    </Page>
  );
}
