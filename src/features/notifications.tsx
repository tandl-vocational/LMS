import React, { useState } from "react";
import { Send, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDemo, id } from "@/src/demo/store";
import { Page, Section, Field, Modal, DataTable, Status } from "./ui";

export default function NotificationsPage({
  student = false,
}: {
  student?: boolean;
}) {
  const { data, setData, notify } = useDemo();
  const [recipients, setRecipients] = useState("受講生全員");
  const [channel, setChannel] = useState("LINE");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  return (
    <Page
      title={student ? "お知らせ・LINE連携" : "学習アラート・通知管理"}
      description={
        student
          ? "事務局からのお知らせを確認し、LINE通知の受け取りを設定できます。"
          : "未ログイン・クイズ停滞・出席リスクの受講生を確認し、フォロー内容を作成します。"
      }
    >
      {student ? (
        <Section title="LINE通知の設定">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Status value={data.lineLinked ? "連携済み" : "未連携"} />
              <p className="text-sm text-slate-500 mt-2">
                講義予定や学習フォローの通知を受け取れます。
              </p>
            </div>
            <Button
              variant={data.lineLinked ? "outline" : "default"}
              onClick={() => setPreview(true)}
            >
              <Link2 className="w-4 h-4 mr-2" />
              {data.lineLinked ? "連携設定を変更" : "LINE連携を設定"}
            </Button>
          </div>
        </Section>
      ) : (
        <>
          <Section title="要フォローの受講生">
            <DataTable
              headers={["受講生", "アラート", "対応"]}
              rows={[
                [
                  "伊藤 結衣",
                  "3日間未ログイン",
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRecipients("伊藤 結衣");
                      setMessage(
                        "最近の受講状況について、困っていることはありませんか？事務局まで気軽にご相談ください。",
                      );
                    }}
                  >
                    フォロー文を作成
                  </Button>,
                ],
                [
                  "渡辺 翔太",
                  "出席率79.2%・要確認",
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRecipients("渡辺 翔太");
                      setMessage(
                        "出席状況についてご相談があります。次回の面談日程を事務局と調整しましょう。",
                      );
                    }}
                  >
                    フォロー文を作成
                  </Button>,
                ],
              ]}
            />
          </Section>
          <Section title="通知を作成">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (message.trim()) setPreview(true);
              }}
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="宛先">
                  <Select
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                  >
                    {["受講生全員", "伊藤 結衣", "渡辺 翔太", "山田 太郎"].map(
                      (r) => (
                        <option key={r}>{r}</option>
                      ),
                    )}
                  </Select>
                </Field>
                <Field label="通知方法">
                  <Select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option>LINE</option>
                    <option>アプリ内通知</option>
                  </Select>
                </Field>
              </div>
              <Field label="メッセージ">
                <Textarea
                  required
                  maxLength={500}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="講義予定やフォロー内容を入力してください"
                />
              </Field>
              <p className="text-xs text-slate-500 text-right">
                {message.length}/500文字
              </p>
              <Button type="submit" disabled={!message.trim()}>
                <Send className="w-4 h-4 mr-2" />
                送信内容を確認
              </Button>
            </form>
          </Section>
        </>
      )}
      <Section title="お知らせ一覧">
        <div className="space-y-3">
          {data.notifications.map((n) => (
            <article
              key={n.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex gap-3 items-center">
                <Status value={n.status} />
                <span className="text-xs text-slate-500">
                  {n.channel} ／ {n.recipients}
                </span>
              </div>
              <p className="text-sm mt-3 whitespace-pre-wrap">{n.message}</p>
            </article>
          ))}
        </div>
      </Section>
      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title={student ? "LINE連携の確認" : "通知内容の確認"}
      >
        {student ? (
          <div className="space-y-4">
            <p className="text-sm">
              LINE通知を{data.lineLinked ? "解除" : "有効に"}
              した場合の表示を確認します。
            </p>
            <p className="text-xs text-slate-500">
              UIプレビューでは実際のLINEアカウントに接続しません。
            </p>
            <Button
              className="w-full"
              onClick={() => {
                setData((s) => ({ ...s, lineLinked: !s.lineLinked }));
                setPreview(false);
                notify("LINE連携のプレビュー設定を更新しました。");
              }}
            >
              {data.lineLinked ? "連携を解除" : "連携後の表示を確認"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">
              {recipients} ／ {channel}
            </p>
            <p className="bg-slate-50 rounded-xl p-4 text-sm whitespace-pre-wrap">
              {message}
            </p>
            <Button
              className="w-full"
              onClick={() => {
                setData((s) => ({
                  ...s,
                  notifications: [
                    {
                      id: id(),
                      recipients,
                      channel,
                      message,
                      status: "送信プレビュー",
                    },
                    ...s.notifications,
                  ],
                }));
                setPreview(false);
                setMessage("");
                notify(
                  "通知の送信プレビューを記録しました。外部への送信は行っていません。",
                );
              }}
            >
              送信後の表示を確認
            </Button>
          </div>
        )}
      </Modal>
    </Page>
  );
}
