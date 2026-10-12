# 04_UI_UX_SPEC.md - 画面遷移・UI/UX仕様書

## 1. 画面遷移図 (Site Map & Navigation)

```text
[ Non-Authenticated ]
  ├── /login (学習者専用IDログイン)
  └── /admin/login (管理者3ロール用Email+Password+2FAログイン)

[ Student Area (/student/*) ]
  ├── /student/dashboard (受講ポータル・出席率メーター・要対応タスク)
  ├── /student/learn/[lessonId] (マイクロラーニング画面 + AI Tutor)
  ├── /student/attendance (欠席・遅刻届 ＆ 証明書提出)
  ├── /student/qualifications (検定申込・指定用紙DL/UL)
  └── /student/career (就職活動状況報告)

[ Instructor Area (/instructor/*) ]
  ├── /instructor/dashboard (未採点/未回答タスク・本日の講義・停滞アラート)
  ├── /instructor/grading (記述式課題 AI採点アシスト・確認修正画面)
  └── /instructor/courses/[id]/curriculum (担当科目スケジュール・コメント投稿)

[ Secretariat Area (/secretariat/*) ]
  ├── /secretariat/dashboard (出席率80%アラート・承認待ち・帳票一括出力)
  ├── /secretariat/courses/[id]/edit (コース設計・エビデンス※1注記・同時編集)
  ├── /secretariat/curriculums (日別計画スプレッドシート・時間小計/合計)
  ├── /secretariat/materials (使用教材登録 ＆ 一括発注処理)
  └── /secretariat/attendance (公的出席管理 ＆ 証明書承認ワークフロー)

[ SysAdmin Area (/admin/*) ]
  ├── /admin/dashboard (システムヘルス・エラーログ・全統計・売上)
  ├── /admin/users (ユーザー・権限管理・CSV一括インポート)
  └── /admin/revisions (コース変更履歴・過去バージョン復元)
