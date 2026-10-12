import React, { useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/src/demo/store";
import { Page, Section, Modal, DataTable, Status } from "./ui";

export default function RevisionsPage() {
  const { data, setData, notify } = useDemo();
  const [selected, setSelected] = useState<string>();
  const [restoring, setRestoring] = useState(false);
  const revision = data.revisions.find((r) => r.id === selected);
  return (
    <Page
      title="コース変更履歴・復元"
      description="変更内容を比較し、過去バージョンへ戻す操作を確認できます。"
    >
      <Section title="保存されたバージョン">
        <DataTable
          headers={["バージョン", "コース", "保存日時", "変更者", "操作"]}
          rows={data.revisions.map((r, i) => [
            <div className="flex gap-2 items-center">
              <History className="w-4 h-4 text-indigo-500" />
              <span>v{data.revisions.length - i}</span>
              {r.restored && <Status value="復元確認済み" />}
            </div>,
            r.title,
            r.date,
            r.author,
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelected(r.id);
                setRestoring(false);
              }}
            >
              変更内容を確認
            </Button>,
          ])}
        />
      </Section>
      <Modal
        open={!!revision}
        onClose={() => setSelected(undefined)}
        title="バージョンの確認"
      >
        {revision && (
          <div className="space-y-4">
            <p className="text-sm font-semibold">{revision.title}</p>
            <p className="text-xs text-slate-500">
              {revision.date} ／ {revision.author}
            </p>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-2">変更内容</p>
              <p className="text-sm">{revision.summary}</p>
            </div>
            {restoring ? (
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm">
                  このバージョンへ復元した後の表示を確認します。UIプレビューでは実際のコース内容は上書きしません。
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setRestoring(false)}>
                    戻る
                  </Button>
                  <Button
                    onClick={() => {
                      setData((s) => ({
                        ...s,
                        revisions: s.revisions.map((r) =>
                          r.id === selected ? { ...r, restored: true } : r,
                        ),
                      }));
                      setSelected(undefined);
                      notify("過去バージョンの復元操作を確認しました。");
                    }}
                  >
                    復元操作を確定
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setRestoring(true)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                このバージョンへ復元
              </Button>
            )}
          </div>
        )}
      </Modal>
    </Page>
  );
}
