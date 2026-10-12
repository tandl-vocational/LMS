import React, { useState } from "react";
import { Plus, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDemo, currentStudent, id, type Job } from "@/src/demo/store";
import {
  Page,
  Section,
  Field,
  Metric,
  Modal,
  DataTable,
  Status,
  Empty,
} from "./ui";
const stages = ["書類選考", "一次面接", "最終面接", "内定", "不採用", "辞退"];
export default function CareerPage({ staff = false }: { staff?: boolean }) {
  const { data, setData, notify } = useDemo();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string>();
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState(stages[0]);
  const [date, setDate] = useState("2026-10-12");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState<string>();
  const [bookingNotes, setBookingNotes] = useState("");
  const [filter, setFilter] = useState("すべて");
  const jobs = data.jobs.filter(
    (j) =>
      (staff || j.student === currentStudent) &&
      (filter === "すべて" || j.stage === filter),
  );
  const edit = (job?: Job) => {
    setEditing(job?.id);
    setCompany(job?.company || "");
    setTitle(job?.title || "");
    setStage(job?.stage || stages[0]);
    setDate(job?.date || "2026-10-12");
    setNotes(job?.notes || "");
    setOpen(true);
  };
  return (
    <Page
      title={staff ? "就職支援・面談管理" : "就職活動・キャリア面談"}
      description={
        staff
          ? "選考状況とキャリア面談の予定を確認し、受講生の就職活動を支援します。"
          : "応募状況を報告し、キャリアコンサルタントとの面談を予約できます。"
      }
      action={
        !staff && (
          <Button onClick={() => edit()}>
            <Plus className="w-4 h-4 mr-2" />
            応募状況を追加
          </Button>
        )
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Metric label="応募企業" value={`${jobs.length}社`} />
        <Metric
          label="内定"
          value={`${jobs.filter((j) => j.stage === "内定").length}社`}
          tone="emerald"
        />
        <Metric
          label="予約済み面談"
          value={`${data.appointments.filter((a) => a.student && (staff || a.student === currentStudent)).length}件`}
        />
      </div>
      <Section title="就職活動状況">
        <Select
          aria-label="選考段階で絞り込み"
          className="max-w-xs mb-4"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {["すべて", ...stages].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <DataTable
          headers={[
            ...(staff ? ["受講生"] : []),
            "応募企業・職種",
            "選考段階",
            "次回予定",
            "メモ",
            ...(!staff ? ["操作"] : []),
          ]}
          rows={jobs.map((j) => [
            ...(staff ? [j.student] : []),
            <div>
              <p className="font-semibold">{j.company}</p>
              <p className="text-xs text-slate-500 mt-1">{j.title}</p>
            </div>,
            <Status value={j.stage} />,
            j.date,
            <span className="inline-block max-w-48 whitespace-normal text-xs">
              {j.notes}
            </span>,
            ...(!staff
              ? [
                  <Button variant="outline" size="sm" onClick={() => edit(j)}>
                    状況を更新
                  </Button>,
                ]
              : []),
          ])}
        />
      </Section>
      <Section
        title="キャリア面談"
        description="1枠60分。面談で相談したい内容を事前に共有できます。"
      >
        <div className="grid md:grid-cols-3 gap-3">
          {data.appointments
            .filter((a) => staff || !a.student || a.student === currentStudent)
            .map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-slate-200 p-4 space-y-3"
              >
                <Calendar className="w-5 h-5 text-indigo-500" />
                <p className="font-semibold text-sm">
                  {a.date} ／ {a.time}
                </p>
                <p className="text-xs text-slate-500">{a.consultant}</p>
                {a.student ? (
                  <>
                    <Status value="予約済み" />
                    <p className="text-sm">{a.student}</p>
                    {a.notes && (
                      <p className="text-xs whitespace-pre-wrap text-slate-500">
                        {a.notes}
                      </p>
                    )}
                    {!staff && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setData((s) => ({
                            ...s,
                            appointments: s.appointments.map((slot) =>
                              slot.id === a.id
                                ? {
                                    ...slot,
                                    student: undefined,
                                    notes: undefined,
                                  }
                                : slot,
                            ),
                          }));
                          notify("面談予約をキャンセルしました。");
                        }}
                      >
                        予約をキャンセル
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Status value="予約可能" />
                    {!staff && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setBooking(a.id);
                          setBookingNotes("");
                        }}
                      >
                        この枠を予約
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
        </div>
      </Section>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "応募状況を更新" : "応募状況を追加"}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!company.trim()) return;
            const job: Job = {
              id: editing || id(),
              student: currentStudent,
              company: company.trim(),
              title,
              stage,
              date,
              notes,
            };
            setData((s) => ({
              ...s,
              jobs: editing
                ? s.jobs.map((j) => (j.id === editing ? job : j))
                : [job, ...s.jobs],
            }));
            setOpen(false);
            notify("応募状況を更新しました。");
          }}
        >
          <Field label="企業名">
            <Input
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </Field>
          <Field label="応募職種">
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="選考段階">
              <Select value={stage} onChange={(e) => setStage(e.target.value)}>
                {stages.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="次回予定日">
              <Input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
          </div>
          <Field label="活動メモ">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </Field>
          <Button type="submit" className="w-full">
            活動状況を保存
          </Button>
        </form>
      </Modal>
      <Modal
        open={!!booking}
        onClose={() => setBooking(undefined)}
        title="キャリア面談を予約"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setData((s) => ({
              ...s,
              appointments: s.appointments.map((a) =>
                a.id === booking
                  ? { ...a, student: currentStudent, notes: bookingNotes }
                  : a,
              ),
            }));
            setBooking(undefined);
            notify("キャリア面談を予約しました。");
          }}
        >
          <p className="text-sm">
            {data.appointments.find((a) => a.id === booking)?.date} ／{" "}
            {data.appointments.find((a) => a.id === booking)?.time}
          </p>
          <Field label="相談したい内容">
            <Textarea
              required
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={4}
              placeholder="希望職種や応募書類など、相談したい内容をご記入ください。"
            />
          </Field>
          <Button type="submit" className="w-full">
            予約を確定
          </Button>
        </form>
      </Modal>
    </Page>
  );
}
