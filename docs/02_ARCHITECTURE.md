# 02_ARCHITECTURE.md - システム構成・技術スタック仕様書

## 1. システム全体構成図 (System Architecture)

```text
[ Client Layer ]
  ├── Student (Mobile / Desktop Browser)
  ├── Instructor / Secretariat / SysAdmin (Desktop Browser)
  └── LINE App (Messaging Integration)
        │
[ Application Layer (Next.js 14+ App Router) ]
  ├── React Server Components / Client Components (Tailwind CSS + shadcn/ui)
  ├── Server Actions / Route Handlers (API)
  └── Yjs / Supabase Realtime Client (Collaborative Engine)
        │
[ Service & Integration Layer ]
  ├── Google Gemini API (gemini-2.5-flash / gemini-2.5-pro)
  ├── Stripe API (Payments & Webhooks)
  └── LINE Messaging API (Push Notifications)
        │
[ Database & Infrastructure Layer (Supabase / PostgreSQL) ]
  ├── Supabase Auth (Email / Custom ID / MFA TOTP)
  ├── PostgreSQL (Database + Row Level Security)
  ├── Supabase Storage (PDF / Image / Evidences / Certificates)
  └── Supabase Realtime (WebSockets Presence & Postgres Changes)
