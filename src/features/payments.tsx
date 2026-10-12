import React, { useState } from "react";
import { CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useDemo, yen, type Payment } from "@/src/demo/store";
import {
  Page,
  Section,
  Field,
  Metric,
  Modal,
  DataTable,
  Status,
  download,
  csv,
} from "./ui";

export default function PaymentsPage({ staff = false }: { staff?: boolean }) {
  const { data, setData, notify } = useDemo();
  const [selected, setSelected] = useState<Payment>();
  const [method, setMethod] = useState("クレジットカード");
  const [confirmed, setConfirmed] = useState(false);
  const paid = data.payments.filter((p) => p.status === "支払い済み");
  return (
    <Page
      title={staff ? "売上・決済履歴" : "受講料・教材費のお支払い"}
      description={
        staff
          ? "受講料・教材費・受験料の決済状況を確認できます。"
          : "請求内容を確認し、支払い方法を選択できます。"
      }
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <Metric
          label="支払い済み合計"
          value={yen(paid.reduce((sum, p) => sum + p.amount, 0))}
          tone="emerald"
        />
        <Metric
          label="未払い合計"
          value={yen(
            data.payments
              .filter((p) => p.status === "未払い")
              .reduce((sum, p) => sum + p.amount, 0),
          )}
          tone="amber"
        />
        <Metric label="決済履歴" value={`${data.payments.length}件`} />
      </div>
      <Section title="請求・決済履歴">
        {staff && (
          <Button
            variant="outline"
            className="mb-4"
            onClick={() =>
              download(
                "決済履歴.csv",
                csv([
                  ["項目", "金額", "状況", "支払方法", "日付"],
                  ...data.payments.map((p) => [
                    p.title,
                    p.amount,
                    p.status,
                    p.method,
                    p.date,
                  ]),
                ]),
              )
            }
          >
            <Download className="w-4 h-4 mr-2" />
            CSV出力
          </Button>
        )}
        <DataTable
          headers={[
            "請求項目",
            "金額（税込）",
            "支払い期限・日付",
            "状態",
            "操作",
          ]}
          rows={data.payments.map((p) => [
            p.title,
            yen(p.amount),
            p.date,
            <Status value={p.status} />,
            p.status === "未払い" && !staff ? (
              <Button
                size="sm"
                onClick={() => {
                  setSelected(p);
                  setConfirmed(false);
                }}
              >
                <CreditCard className="w-3 h-3 mr-1" />
                支払い内容を確認
              </Button>
            ) : p.status === "支払い済み" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  download(
                    "領収書サンプル.txt",
                    `領収書（プレビュー）\n山田 太郎 様\n${p.title}\n${yen(p.amount)}（税込）\n${p.date}\n実際の決済・領収書ではありません。`,
                    "text/plain;charset=utf-8",
                  )
                }
              >
                領収書（サンプル）
              </Button>
            ) : (
              "—"
            ),
          ])}
        />
      </Section>
      <Modal
        open={!!selected}
        onClose={() => setSelected(undefined)}
        title={confirmed ? "お支払い完了画面（デモ）" : "支払い内容の確認"}
      >
        {selected && (
          <div className="space-y-5">
            {confirmed ? (
              <>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                  <p className="font-bold">支払い後の画面を確認しました。</p>
                  <p className="text-sm mt-2">
                    UIプレビューのため、実際の請求・決済は行われていません。
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => setSelected(undefined)}
                >
                  履歴に戻る
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-slate-50">
                  <p className="text-sm">{selected.title}</p>
                  <p className="text-2xl font-bold mt-2">
                    {yen(selected.amount)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">税込金額</p>
                </div>
                <Field label="支払い方法">
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option>クレジットカード</option>
                    <option>コンビニ決済</option>
                  </Select>
                </Field>
                <p className="text-xs text-slate-500">
                  実際の運用では決済サービスの画面へ移動して支払います。プレビューではカード番号などの入力は不要です。
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    setData((s) => ({
                      ...s,
                      payments: s.payments.map((p) =>
                        p.id === selected.id
                          ? {
                              ...p,
                              status: "支払い済み",
                              method,
                              date: "2026-10-12",
                            }
                          : p,
                      ),
                    }));
                    setConfirmed(true);
                  }}
                >
                  支払い完了画面を確認
                </Button>
              </>
            )}
          </div>
        )}
      </Modal>
    </Page>
  );
}
