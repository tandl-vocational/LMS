# 06_PROJECT_GUIDELINES.md - プロジェクト開発・運用ガイドライン

## 1. 開発環境・インフラ
- **ホスティング:** Vercel (Next.js 14+ App Router)
- **バックエンド / DB:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AIエンジン:** Google Gemini API (gemini-2.5-flash / pro)
- **決済 / 通知:** Stripe API (Webhook連携), LINE Messaging API

## 2. デザイン・UI/UXルール
- **スタイリング:** Tailwind CSS
- **UIコンポーネント:** shadcn/ui (Radix UIベース)
- **レスポンシブ方針:**
  - 学習者画面 (Student) はモバイルファースト（スマホ操作最適化）。
  - 管理側画面 (Admin/Secretariat/Instructor) はPCファースト。

## 3. データベース運用ルール (公的事業・監査対応)
- **論理削除の徹底:** 公的監査に備え、学習履歴やコースデータ等の重要データは原則として物理削除（DELETE）せず、状態フラグ（status = 'deleted'等）による論理削除を想定したクエリ設計を行うこと。

## 4. AIコーディングルール (AIへの指示)
- **コンポーネント分割:** 1つのファイルにすべてを詰め込まず、ヘッダー、サイドバー、メインカード等の小さなコンポーネントに分割してコードを生成すること。
- **実用性:** 「省略」や「// ここに処理を書く」といった手抜きをせず、そのままコピー＆ペーストして動くプロダクションレベルのコードを出力すること。
- **エラー解決:** エラーが提示された場合は、関連するDBスキーマ（03_DATA_SCHEMA.md）を再確認し、推測ではなく正確な修正案を提示すること。
