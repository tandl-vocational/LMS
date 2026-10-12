import React, { useState } from "react";
import {
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Link from "@/components/navigation/Link";
import { navigate, type Role } from "@/src/router";
import { Field } from "./ui";

export default function AuthPage({
  admin = false,
  reset = false,
}: {
  admin?: boolean;
  reset?: boolean;
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [role, setRole] = useState<Role>("secretariat");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("ログイン情報を入力してください。");
      return;
    }
    if (reset) {
      setSent(true);
      return;
    }
    if (!password.trim()) {
      setError("パスワードを入力してください。");
      return;
    }
    if (admin && step === 1) {
      setStep(2);
      return;
    }
    if (admin && !/^\d{6}$/.test(code)) {
      setError("6桁の認証コードを入力してください。");
      return;
    }
    navigate(`/${admin ? role : "student"}/dashboard`);
  };
  return (
    <div className="min-h-[calc(100dvh-56px)] bg-gradient-to-br from-indigo-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <GraduationCap className="w-7 h-7" />
          </span>
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">
              LMS Next
            </p>
            <p className="text-xs text-slate-500 mt-1">
              公的職業訓練・学習管理ポータル
            </p>
          </div>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <h1 className="text-xl font-bold text-center">
            {reset
              ? "パスワード再設定"
              : admin
                ? step === 2
                  ? "2段階認証"
                  : "管理者ログイン"
                : "受講生ログイン"}
          </h1>
          <p className="text-xs text-slate-500 text-center mt-2 mb-6">
            {reset
              ? "登録情報を入力して再設定手順を確認します。"
              : admin
                ? step === 2
                  ? "認証アプリの6桁のコードを入力してください。"
                  : "メールアドレスとパスワードでログインします。"
                : "受講生番号とパスワードを入力してください。"}
          </p>
          {sent ? (
            <div className="space-y-4">
              <div
                role="status"
                className="p-4 bg-emerald-50 text-emerald-900 rounded-xl text-sm"
              >
                再設定案内の確認画面です。UIプレビューではメールを送信していません。
              </div>
              <Link
                href="/login"
                className="block text-center text-sm text-indigo-600"
              >
                ログイン画面に戻る
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {step === 1 ? (
                <>
                  <Field
                    label={
                      admin
                        ? "メールアドレス"
                        : reset
                          ? "受講生番号またはメールアドレス"
                          : "ユーザーID（受講生番号）"
                    }
                  >
                    <Input
                      required
                      type={admin ? "email" : "text"}
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={admin ? "name@example.com" : "std2026001"}
                    />
                  </Field>
                  {!reset && (
                    <Field label="パスワード" htmlFor="login-password">
                      <div className="relative">
                        <Input
                          id="login-password"
                          aria-label="パスワード"
                          required
                          type={visible ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-11"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-slate-400"
                          aria-label={
                            visible ? "パスワードを隠す" : "パスワードを表示"
                          }
                          onClick={() => setVisible((v) => !v)}
                        >
                          {visible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </Field>
                  )}
                  {admin && (
                    <Field label="プレビューする管理ロール">
                      <Select
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                      >
                        <option value="secretariat">事務局</option>
                        <option value="instructor">担当講師</option>
                        <option value="admin">システム管理者</option>
                      </Select>
                    </Field>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <ShieldCheck className="w-12 h-12 text-indigo-600" />
                  </div>
                  <Field label="認証コード">
                    <Input
                      required
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="6桁のコード"
                      className="text-center text-xl tracking-[0.4em]"
                    />
                  </Field>
                  <p className="text-xs text-slate-500">
                    デモでは任意の6桁で画面遷移を確認できます。
                  </p>
                </>
              )}
              {error && (
                <p role="alert" className="text-xs text-red-600">
                  {error}
                </p>
              )}
              <Button className="w-full" type="submit">
                {reset
                  ? "再設定手順を確認"
                  : admin && step === 1
                    ? "2段階認証へ進む"
                    : "ログイン後の画面を確認"}
              </Button>
              {step === 2 && (
                <Button
                  variant="ghost"
                  className="w-full"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  入力画面へ戻る
                </Button>
              )}
              {!reset && (
                <Link
                  href="/forgot-password"
                  className="block text-xs text-center text-indigo-600"
                >
                  パスワードをお忘れの方
                </Link>
              )}
            </form>
          )}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              href={admin ? "/login" : "/admin/login"}
              className="text-sm text-slate-600"
            >
              {admin
                ? "受講生ログインはこちら"
                : "管理者・講師・事務局はこちら"}
            </Link>
          </div>
        </section>
        <p className="text-center text-xs text-slate-400 mt-6">© LMS Next</p>
      </div>
    </div>
  );
}
