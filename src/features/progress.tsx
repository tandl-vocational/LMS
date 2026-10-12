import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "@/components/navigation/Link";
import { useDemo, students, currentStudent } from "@/src/demo/store";
import { Page, Section, Metric, DataTable, Status, SearchBox } from "./ui";

export default function ProgressPage({ staff = false }: { staff?: boolean }) {
  const { data } = useDemo();
  const [search, setSearch] = useState("");
  return (
    <Page
      title={staff ? "受講生・学習進捗" : "学習履歴・評価"}
      description={
        staff
          ? "受講生の進捗、出席状況、課題の提出状況を確認します。"
          : "学習の進み具合と、講師からの評価を確認できます。"
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Metric label="修了セット" value="42 / 60" />
        <Metric label="学習進捗" value="70%" tone="emerald" />
        <Metric
          label="講師評価済み"
          value={`${data.submissions.filter((s) => s.status === "評価確定" && (staff || s.student === currentStudent)).length}件`}
        />
      </div>
      {staff && (
        <Section title="受講生一覧">
          <div className="mb-4">
            <SearchBox value={search} onChange={setSearch} />
          </div>
          <DataTable
            headers={["受講生", "受講生番号", "学習進捗", "通算出席率", "対応"]}
            rows={students
              .filter((s) => `${s.name}${s.id}`.includes(search))
              .map((s) => [
                s.name,
                s.id,
                <div className="w-32">
                  <span className="text-xs">{s.progress}%</span>
                  <Progress value={s.progress} className="mt-1" />
                </div>,
                <span
                  className={
                    s.attendance < 80
                      ? "text-red-600 font-bold"
                      : s.attendance < 85
                        ? "text-amber-600 font-bold"
                        : ""
                  }
                >
                  {s.attendance}%
                </span>,
                <Link
                  href="/secretariat/notifications"
                  className="text-indigo-600 text-xs font-semibold"
                >
                  学習フォロー
                </Link>,
              ])}
          />
        </Section>
      )}
      <Section title="提出課題・評価">
        <DataTable
          headers={["受講生", "課題", "状態", "最終得点", "講師コメント"]}
          rows={data.submissions
            .filter((s) => staff || s.student === currentStudent)
            .map((s) => [
              s.student,
              <span className="inline-block max-w-64 whitespace-normal">
                {s.lesson}
              </span>,
              <Status value={s.status} />,
              s.status === "評価確定" ? `${s.score}点` : "採点待ち",
              <span className="inline-block max-w-64 whitespace-normal text-xs">
                {s.status === "評価確定"
                  ? s.feedback
                  : "講師の確認後に表示されます。"}
              </span>,
            ])}
        />
      </Section>
      {!staff && (
        <Section title="学習セット">
          <DataTable
            headers={["学習日・セット", "動画", "クイズ", "演習", "操作"]}
            rows={[
              [
                "Day 13 セット3",
                "視聴済み",
                "再挑戦が必要",
                "未提出",
                <Link
                  href="/student/learn/day13-set3"
                  className="text-indigo-600 font-semibold"
                >
                  学習する
                </Link>,
              ],
              [
                "Day 14 セット2",
                "視聴済み",
                "未受験",
                "未提出",
                <Link
                  href="/student/learn/day14-set2"
                  className="text-indigo-600 font-semibold"
                >
                  学習する
                </Link>,
              ],
            ]}
          />
        </Section>
      )}
    </Page>
  );
}
