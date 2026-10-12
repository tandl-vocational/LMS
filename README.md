# LMS Next

公的職業訓練・求職者支援訓練に対応するLMSのUIプレビューです。ZIPで共有された実装を土台に、4ロールのメニュー、画面遷移、未実装だったフォームや管理画面を追加しています。

現在は **UIを確認する段階** です。デモデータは画面移動後も保持されますが、再読み込み・リセットで初期状態に戻ります。実際の認証、DB保存、AI、決済、LINE送信、Web会議には接続しません。

## 起動

Node.js 24を用意し、このリポジトリで実行します。

```sh
npx --yes bun@1.4.3 install --frozen-lockfile
npm run dev
```

ターミナルに表示されたアドレスをブラウザで開きます。最初に学習者ダッシュボードが表示されます。上部の「表示ロール」で、学習者・講師・事務局・システム管理者を切り替えられます。

従来の確認用Vite設定は不要です。元の `next/link` を、URL・戻る操作に対応するプレビュー用のナビゲーションへ置き換えています。Next.jsへの移行はUI確定後の工程です。

## 検証

```sh
npm run lint
npm run build
```

`lint` はTypeScriptの型チェックです。起動した開発サーバーに対してブラウザ検証を実行します。

```sh
# システムにChromiumがない場合は、初回のみ実行
npx playwright install chromium
npm run test:ui
```

UI検証は、48の画面入口、学習者画面10件のスマホ幅表示、21の操作シナリオをチェックします。標準の接続先はポート3000です。別のポートやブラウザを使う場合は `LMS_BASE_URL`、`LMS_BROWSER_PATH` を設定できます。検証結果は `test-results/` に保存されます。

## 仕様と確認範囲

- [プロダクト要件](docs/01_PRD.md)
- [画面構成](docs/04_UI_UX_SPEC.md)
- [UIの確認項目・次の工程](docs/UI_COVERAGE.md)

申請→承認・差し戻し、課題提出→講師評価、質問→回答、検定申込、面談予約、アンケート、教材発注の確認、ユーザーCSV取り込みを、デモ内で操作できます。

公的帳票のプレビューと集計CSVは確認できます。指定Excel/PDF様式、実際のLINE・Stripe・Gemini・Supabase連携は、UI確定後に接続します。

## 画面例

GitHub上で、UIのスクリーンショットを確認できます。

- [事務局：出席管理・申請承認](docs/screenshots/secretariat-attendance.png)
- [学習者：スマホ表示](docs/screenshots/student-mobile.png)
