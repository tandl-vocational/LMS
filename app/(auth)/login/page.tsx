"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/navigation/Link";
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedLoginId = loginId.trim();

    if (!trimmedLoginId) {
      setErrorMessage("ユーザーID（受講生番号）を入力してください。");
      return;
    }

    if (!password) {
      setErrorMessage("パスワードを入力してください。");
      return;
    }

    setIsLoading(true);

    try {
      // 01_PRD.md / 02_ARCHITECTURE.md 準拠:
      // 独自ユーザーIDを内部仮想ドメイン {login_id}@student.local.system に変換
      const studentVirtualEmail = `${trimmedLoginId.toLowerCase()}@student.local.system`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: studentVirtualEmail,
        password: password,
      });

      if (error) {
        // セキュリティのため詳細を秘匿し分かりやすいメッセージに統一
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("invalid_grant")
        ) {
          setErrorMessage("ユーザーIDまたはパスワードが正しくありません。");
        } else {
          setErrorMessage(error.message || "ログイン処理に失敗しました。");
        }
        return;
      }

      if (data?.user) {
        // ロールが student であることを確認
        const { data: userProfile } = await supabase
          .from("users")
          .select("role, name")
          .eq("id", data.user.id)
          .single();

        if (userProfile && userProfile.role !== "student") {
          // 管理者や講師が学習者ログインから入った場合は適切な画面に案内
          setSuccessMessage("管理者・講師権限のアカウントです。移動します...");
          setTimeout(() => {
            router.push(`/${userProfile.role}/dashboard`);
          }, 1000);
          return;
        }

        setSuccessMessage("ログインに成功しました。学習ポータルへ移動します...");
        setTimeout(() => {
          router.push("/student/dashboard");
        }, 800);
      }
    } catch (err: unknown) {
      console.error("Login unexpected error:", err);
      setErrorMessage("通信エラーが発生しました。接続環境を確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* 上部ヘッダー（モバイル向けコンパクト表示） */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base tracking-tight block leading-tight">
              LMS Next
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">
              公的職業訓練 受講生ポータル
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SSL保護</span>
        </div>
      </header>

      {/* メインコンテンツ（モバイルファースト） */}
      <main className="w-full max-w-md mx-auto my-auto py-4">
        <Card className="border-slate-200 shadow-xl shadow-slate-100/80 bg-white">
          <CardHeader className="space-y-1.5 text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
              受講生ログイン
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500">
              受講証またはご案内メールに記載された
              <br className="hidden sm:inline" />
              「ユーザーID」と「パスワード」を入力してください。
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* エラーアラート */}
            {errorMessage && (
              <Alert variant="destructive" className="mb-5 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ログイン失敗</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* 成功アラート */}
            {successMessage && (
              <Alert className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-900 animate-in fade-in duration-200 [&>svg]:text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>認証完了</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* ユーザーID 入力欄 */}
              <div className="space-y-1.5">
                <Label htmlFor="login_id" className="text-xs sm:text-sm text-slate-700">
                  ユーザーID (受講生ID)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="login_id"
                    name="login_id"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                    placeholder="例: std2026001"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 text-base sm:text-sm"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 pl-1">
                  ※ メールアドレスの入力は不要です（半角英数）
                </p>
              </div>

              {/* パスワード 入力欄 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" text-xs sm:text-sm text-slate-700>
                    パスワード
                  </Label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("事務局窓口または担当講師へパスワード再発行をお申し出ください。");
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    忘れた場合
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 pr-10 text-base sm:text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* ログインボタン（モバイル最適化：大型タッチターゲット） */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 h-12 text-base font-semibold transition-all shadow-md active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    認証中...
                  </>
                ) : (
                  "学習ポータルにログイン"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-0 border-t border-slate-100 mt-2 text-center">
            <div className="text-xs text-slate-500 pt-3">
              事務局・講師・システム管理者の方は
              <br className="sm:hidden" />
              <Link
                href="/admin/login"
                className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline ml-1"
              >
                管理総合ログイン (Email+2FA)
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* 公的訓練受講生向け注記 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600 leading-relaxed">
            ※ 本システムは公的職業訓練・求職者支援訓練基準に準拠しています。
            <br />
            日々の出席率管理（80%基準）および訓練受講履歴は厳格に記録されます。
          </p>
        </div>
      </main>

      {/* フッター */}
      <footer className="w-full max-w-md mx-auto text-center py-2 text-xs text-slate-600">
        &copy; {new Date().getFullYear()} LMS Next. All rights reserved.
      </footer>
    </div>
  );
}
