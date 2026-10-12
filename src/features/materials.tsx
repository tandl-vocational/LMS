import React, { useState } from "react";
import { Plus, ShoppingCart, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDemo, id, yen } from "@/src/demo/store";
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

export default function MaterialsPage() {
  const { data, setData, notify } = useDemo();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(30);
  const [vendor, setVendor] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const items = data.materials.filter((m) =>
    `${m.title}${m.publisher}${m.vendor}`.includes(search),
  );
  const orderItems = data.materials.filter(
    (m) => selected.includes(m.id) && m.status === "未発注",
  );
  return (
    <Page
      title="教材登録・一括発注"
      description="教材の価格・購入先・必要冊数を管理し、発注内容を確認します。"
      action={
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          教材を登録
        </Button>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Metric label="登録教材" value={`${data.materials.length}点`} />
        <Metric
          label="未発注の教材"
          value={`${data.materials.filter((m) => m.status === "未発注").length}点`}
          tone="amber"
        />
        <Metric
          label="必要教材費（税込）"
          value={yen(
            data.materials.reduce((sum, m) => sum + m.price * m.quantity, 0),
          )}
        />
      </div>
      <Section title="教材一覧">
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="教材名・出版社・購入先で検索"
          />
          <Button
            disabled={!orderItems.length}
            onClick={() => setConfirm(true)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            選択教材の発注確認（{orderItems.length}）
          </Button>
        </div>
        <DataTable
          headers={[
            "選択",
            "教材・出版社",
            "単価（税込）",
            "必要冊数",
            "購入先",
            "状態",
            "操作",
          ]}
          rows={items.map((m) => [
            <input
              type="checkbox"
              aria-label={`${m.title}を選択`}
              disabled={m.status !== "未発注"}
              checked={selected.includes(m.id)}
              onChange={(e) =>
                setSelected((s) =>
                  e.target.checked ? [...s, m.id] : s.filter((i) => i !== m.id),
                )
              }
              className="accent-indigo-600 w-4 h-4"
            />,
            <div>
              <p className="font-semibold">{m.title}</p>
              <p className="text-xs text-slate-500">{m.publisher}</p>
            </div>,
            yen(m.price),
            <Input
              type="number"
              aria-label={`${m.title}の必要冊数`}
              min={1}
              max={999}
              className="w-20"
              value={m.quantity}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (n >= 1 && n <= 999)
                  setData((s) => ({
                    ...s,
                    materials: s.materials.map((i) =>
                      i.id === m.id ? { ...i, quantity: n } : i,
                    ),
                  }));
              }}
              disabled={m.status !== "未発注"}
            />,
            m.vendor,
            <Status value={m.status} />,
            m.status === "発注済み" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setData((s) => ({
                    ...s,
                    materials: s.materials.map((i) =>
                      i.id === m.id ? { ...i, status: "納品済み" } : i,
                    ),
                  }));
                  notify("納品を確認しました。");
                }}
              >
                <PackageCheck className="w-3 h-3 mr-1" />
                納品確認
              </Button>
            ) : (
              "—"
            ),
          ])}
        />
      </Section>
      <Modal open={open} onClose={() => setOpen(false)} title="教材を登録">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || quantity < 1) return;
            setData((s) => ({
              ...s,
              materials: [
                ...s.materials,
                {
                  id: id(),
                  title: title.trim(),
                  publisher,
                  price,
                  quantity,
                  vendor,
                  status: "未発注",
                },
              ],
            }));
            setOpen(false);
            setTitle("");
            notify("教材を登録しました。");
          }}
        >
          <Field label="教材名">
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="出版社">
            <Input
              required
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="単価（税込）">
              <Input
                required
                min={0}
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </Field>
            <Field label="必要冊数">
              <Input
                required
                min={1}
                max={999}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </Field>
          </div>
          <Field label="購入先・担当者">
            <Input
              required
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            />
          </Field>
          <Button className="w-full" type="submit">
            教材を登録
          </Button>
        </form>
      </Modal>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="一括発注の確認"
        description="内容を確認すると、デモの発注状態が更新されます。"
      >
        <div className="space-y-4">
          {orderItems.map((m) => (
            <div key={m.id} className="flex justify-between gap-3 text-sm">
              <span>
                {m.title} × {m.quantity}冊
              </span>
              <strong>{yen(m.price * m.quantity)}</strong>
            </div>
          ))}
          <div className="border-t pt-4 flex justify-between font-bold">
            <span>合計（税込）</span>
            <span>
              {yen(
                orderItems.reduce((sum, m) => sum + m.price * m.quantity, 0),
              )}
            </span>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              setData((s) => ({
                ...s,
                materials: s.materials.map((m) =>
                  selected.includes(m.id) && m.status === "未発注"
                    ? { ...m, status: "発注済み" }
                    : m,
                ),
              }));
              setSelected([]);
              setConfirm(false);
              notify(
                "発注内容を確認しました。外部への注文は送信していません。",
              );
            }}
          >
            発注内容を確定
          </Button>
        </div>
      </Modal>
    </Page>
  );
}
