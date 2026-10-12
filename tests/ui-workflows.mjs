import { chromium, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const baseURL = process.env.LMS_BASE_URL || "http://127.0.0.1:3000";
const outputDir = path.resolve(
  process.env.LMS_TEST_OUTPUT_DIR || "test-results",
);
fs.mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.LMS_BROWSER_PATH ||
    (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(8000);
const errors = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
const check = async (name, action) => {
  await action();
  checks.push(name);
  console.log("PASS", name);
};
const menu = async (role, path) => {
  await page.getByLabel("表示ロール").selectOption(role);
  await page
    .getByRole("navigation", { name: "メインメニュー" })
    .locator(`a[href="${path}"]`)
    .click();
};
const closeNotice = async () => {
  const button = page.getByRole("button", {
    name: "通知を閉じる",
    exact: true,
  });
  if (await button.count()) await button.click();
};
try {
  await page.goto(`${baseURL}/student/dashboard`);
  await check(
    "Dashboard links and browser back navigate correctly",
    async () => {
      await page
        .locator('main a[href="/student/learn/day14-set2"]')
        .first()
        .click();
      await expect(
        page.getByRole("tab", { name: "Step 2: 100点クイズ", exact: true }),
      ).toBeVisible();
      await page.goBack();
      await expect(page).toHaveURL(/student\/dashboard$/);
    },
  );
  await menu("student", "/student/attendance");
  await check(
    "Student submits an attendance request with attachment",
    async () => {
      await page
        .getByRole("button", { name: "出欠申請を作成", exact: true })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("訓練日", { exact: true }).fill("2026-10-15");
      await dialog
        .getByLabel("申請理由", { exact: true })
        .fill("UI検証：通院のため欠席します。");
      await dialog
        .locator("input[type=file]")
        .setInputFiles({
          name: "証明書.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.4\n%%EOF"),
        });
      await expect(
        dialog.getByText("証明書.pdf", { exact: true }),
      ).toBeVisible();
      await dialog
        .getByRole("button", { name: "申請を提出", exact: true })
        .click();
      await expect(
        page.locator("tr").filter({ hasText: "UI検証：通院" }),
      ).toContainText("確認待ち");
    },
  );
  await menu("secretariat", "/secretariat/attendance");
  await check(
    "Secretariat requires a reason to return an application",
    async () => {
      await page
        .locator("tr")
        .filter({ hasText: "UI検証：通院" })
        .getByRole("button", { name: "確認・承認" })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("審査結果").selectOption("差し戻し");
      await dialog
        .getByRole("button", { name: "審査結果を確定", exact: true })
        .click();
      await expect(dialog).toBeVisible();
      await dialog
        .getByLabel("差し戻し理由（必須）")
        .fill("証明書の日付を確認してください。");
      await dialog
        .getByRole("button", { name: "審査結果を確定", exact: true })
        .click();
      await expect(
        page.locator("tr").filter({ hasText: "UI検証：通院" }),
      ).toContainText("差し戻し");
    },
  );
  await menu("student", "/student/attendance");
  await check(
    "Returned application and review note reach the student",
    async () => {
      await page
        .locator("tr")
        .filter({ hasText: "UI検証：通院" })
        .getByRole("button", { name: "詳細", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toContainText(
        "証明書の日付を確認してください。",
      );
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
    },
  );
  await menu("student", "/student/qualifications");
  await check("Qualification application persists across roles", async () => {
    const card = page
      .locator("section")
      .filter({
        has: page.getByRole("heading", {
          name: "Python3エンジニア認定基礎試験",
          exact: true,
        }),
      });
    await card
      .getByRole("button", { name: "検定を申し込む", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("checkbox").check();
    await dialog
      .getByRole("button", { name: "申込を提出", exact: true })
      .click();
    await menu("secretariat", "/secretariat/qualifications");
    const row = page
      .locator("tr")
      .filter({ hasText: "山田 太郎" })
      .filter({ hasText: "Python3エンジニア" });
    await expect(row).toContainText("確認待ち");
    await row.locator("select").selectOption("受理済み");
  });
  await menu("student", "/student/career");
  await check("Job reporting and career appointment booking", async () => {
    await page
      .getByRole("button", { name: "応募状況を追加", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("企業名").fill("UI検証株式会社");
    await dialog.getByLabel("応募職種").fill("Webエンジニア");
    await dialog
      .getByRole("button", { name: "活動状況を保存", exact: true })
      .click();
    await expect(
      page.getByText("UI検証株式会社", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "この枠を予約", exact: true })
      .first()
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("相談したい内容")
      .fill("応募書類を見ていただきたいです。");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "予約を確定", exact: true })
      .click();
    await expect(
      page.getByText("応募書類を見ていただきたいです。", { exact: true }),
    ).toBeVisible();
  });
  await menu("student", "/student/questions");
  await check("Student question receives an instructor reply", async () => {
    await page.getByRole("button", { name: "質問を作成", exact: true }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("質問のタイトル").fill("UI検証：認証について");
    await dialog.getByLabel("質問内容").fill("APIの認証方法を教えてください。");
    await dialog
      .getByRole("button", { name: "質問を提出", exact: true })
      .click();
    await menu("instructor", "/instructor/questions");
    await page.getByRole("button", { name: /UI検証：認証について/ }).click();
    dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("講師の回答")
      .fill("セッションをサーバーで確認しましょう。");
    await dialog
      .getByRole("button", { name: "回答を確定", exact: true })
      .click();
    await menu("student", "/student/questions");
    await page.getByRole("button", { name: /UI検証：認証について/ }).click();
    await expect(page.getByRole("dialog")).toContainText(
      "セッションをサーバーで確認しましょう。",
    );
    await page.keyboard.press("Escape");
  });
  await menu("student", "/student/learn/day14-set2");
  await check(
    "Quiz failure stays locked; full marks unlock exercise",
    async () => {
      const tab = page.getByRole("tab", {
        name: "Step 3: 演習課題",
        exact: true,
      });
      await expect(tab).toBeDisabled();
      await page
        .getByRole("tab", { name: "Step 2: 100点クイズ", exact: true })
        .click();
      for (const text of [
        "ブラウザのローカルストレージにService Role Keyを保存してAPIを実行する",
        "USING (true)",
        "倍速再生で最後まで再生バーを動かすことのみ",
      ])
        await page.getByText(text, { exact: true }).click();
      await page
        .getByRole("button", { name: "回答を採点する", exact: true })
        .click();
      await expect(tab).toBeDisabled();
      await page
        .getByRole("button", { name: "再挑戦する（100点目標）", exact: true })
        .click();
      for (const text of [
        "Route Handlers (`/app/api/*`) または Server Actions を用いてサーバー側でセッションを検証する",
        "USING (user_id = auth.uid())",
        "講義動画の全編視聴と、理解度チェッククイズでの100点満点達成",
      ])
        await page.getByText(text, { exact: true }).click();
      await page
        .getByRole("button", { name: "回答を採点する", exact: true })
        .click();
      await expect(tab).toBeEnabled();
      await tab.click();
    },
  );
  await check(
    "Submitted exercise reaches grading; confirmed result reaches student",
    async () => {
      await page
        .locator("main textarea")
        .fill(
          "UI検証の提出：セッションを検証し、未認証には401を返す。RLSで本人の行のみ許可する。",
        );
      await page
        .getByRole("button", {
          name: "課題を提出してAI自動採点を受ける",
          exact: true,
        })
        .click();
      await expect(page.getByText(/AI一次採点結果: 95点/)).toBeVisible();
      await menu("instructor", "/instructor/grading");
      await page
        .locator("tr")
        .filter({ hasText: "山田 太郎" })
        .first()
        .getByRole("button", { name: "採点する", exact: true })
        .click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toContainText("UI検証の提出");
      await dialog.getByLabel("講師の最終得点（0〜100点）").fill("90");
      await dialog
        .getByLabel("受講生へのフィードバック")
        .fill("UI検証の最終評価：よくできています。");
      await dialog
        .getByRole("button", { name: "評価内容を確認", exact: true })
        .click();
      await dialog
        .getByRole("button", { name: "評価を確定", exact: true })
        .click();
      await menu("student", "/student/progress");
      await expect(
        page.locator("tr").filter({ hasText: "UI検証の最終評価" }),
      ).toContainText("90点");
    },
  );
  await menu("student", "/student/surveys");
  await check(
    "Survey ratings are available in secretariat aggregation",
    async () => {
      await page
        .getByRole("button", { name: "アンケートに回答", exact: true })
        .click();
      const dialog = page.getByRole("dialog");
      for (const select of await dialog.locator("select").all())
        await select.selectOption("5");
      await dialog
        .getByLabel("その他のご意見（任意）")
        .fill("UI検証のアンケート回答です。");
      await dialog
        .getByRole("button", { name: "回答を送信", exact: true })
        .click();
      await menu("secretariat", "/secretariat/surveys");
      await page
        .getByRole("button", { name: "回答結果を確認", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toContainText("回答数：1件");
      await expect(page.getByRole("dialog")).toContainText(
        "UI検証のアンケート回答です。",
      );
      await page.keyboard.press("Escape");
    },
  );
  await menu("secretariat", "/secretariat/materials");
  await check(
    "Selected materials require confirmation before order state changes",
    async () => {
      await page
        .getByRole("checkbox", {
          name: "Webフルスタック開発実践テキストを選択",
          exact: true,
        })
        .check();
      await page.getByRole("button", { name: /選択教材の発注確認/ }).click();
      await expect(page.getByRole("dialog")).toContainText("¥92,400");
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "発注内容を確定", exact: true })
        .click();
      await expect(
        page
          .locator("tr")
          .filter({ hasText: "Webフルスタック開発実践テキスト" }),
      ).toContainText("発注済み");
    },
  );
  await menu("secretariat", "/secretariat/reports");
  await check("Report preview and CSV download", async () => {
    await page
      .getByRole("button", { name: "帳票をプレビュー", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText("山田 太郎");
    await page.keyboard.press("Escape");
    const promise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "集計CSVを出力", exact: true })
      .click();
    const download = await promise;
    expect(download.suggestedFilename()).toContain("出席管理簿");
  });
  await menu("admin", "/admin/users");
  await check(
    "Account creation and validated CSV import persist through navigation",
    async () => {
      await page
        .getByRole("button", { name: "アカウント新規発行", exact: true })
        .click();
      let dialog = page.getByRole("dialog");
      await dialog
        .getByPlaceholder("例: 高橋 涼介")
        .fill("UI検証 個別アカウント");
      await dialog
        .getByPlaceholder("例: std2026040 (受講生) / inst_yamada (講師)")
        .fill("std2026088");
      await dialog
        .getByRole("button", { name: "アカウントを発行", exact: true })
        .click();
      await expect(
        page.getByText("UI検証 個別アカウント", { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "一括CSVインポート", exact: true })
        .click();
      dialog = page.getByRole("dialog");
      await dialog
        .getByLabel("受講生CSVファイル")
        .setInputFiles({
          name: "students.csv",
          mimeType: "text/csv",
          buffer: Buffer.from(
            "氏名,受講番号\nUI検証 CSVアカウント,std2026089\n",
          ),
        });
      await expect(
        dialog.getByText("UI検証 CSVアカウント", { exact: true }),
      ).toBeVisible();
      await dialog
        .getByRole("button", { name: "1名を一括インポート", exact: true })
        .click();
      await menu("admin", "/admin/audit");
      await menu("admin", "/admin/users");
      await expect(
        page.getByText("UI検証 CSVアカウント", { exact: true }),
      ).toBeVisible();
    },
  );
  await menu("admin", "/admin/users");
  await check("CSV duplicates are rejected before import", async () => {
    await page
      .getByRole("button", { name: "一括CSVインポート", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("受講生CSVファイル")
      .setInputFiles({
        name: "duplicate.csv",
        mimeType: "text/csv",
        buffer: Buffer.from("氏名,受講番号\n重複データ,std2026089\n"),
      });
    await expect(dialog.getByRole("alert")).toContainText("重複");
    await expect(
      dialog.getByRole("button", { name: "0名を一括インポート", exact: true }),
    ).toBeDisabled();
    await page.keyboard.press("Escape");
  });
  await menu("admin", "/admin/revisions");
  await check("Revision restore has a confirmation step", async () => {
    await page
      .getByRole("button", { name: "変更内容を確認", exact: true })
      .first()
      .click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("button", { name: "このバージョンへ復元", exact: true })
      .click();
    await expect(dialog).toContainText("実際のコース内容は上書きしません");
    await dialog
      .getByRole("button", { name: "復元操作を確定", exact: true })
      .click();
    await expect(page.getByText("復元確認済み", { exact: true })).toBeVisible();
  });
  await menu("secretariat", "/secretariat/courses");
  await check("New course fields survive screen navigation", async () => {
    await page
      .getByRole("button", { name: "新しいコース", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("コース名", { exact: true }).fill("UI検証コース");
    await dialog
      .getByRole("button", { name: "下書きを作成", exact: true })
      .click();
    const section = page
      .locator("section")
      .filter({
        has: page.getByRole("heading", { name: "UI検証コース", exact: true }),
      });
    await section
      .getByRole("link", { name: "コースを編集", exact: true })
      .click();
    const editPath = new URL(page.url()).pathname;
    await page
      .locator('input[value="UI検証コース"]')
      .fill("UI検証コース（編集確認）");
    await menu("secretariat", "/secretariat/courses");
    await page.locator(`a[href="${editPath}"]`).click();
    await expect(
      page.locator('input[value="UI検証コース（編集確認）"]'),
    ).toBeVisible();
  });
  await menu("instructor", "/instructor/lessons/builder");
  await check("Lesson builder adds a step and exports its JSON", async () => {
    await page
      .getByRole("button", { name: "新しいステップを追加", exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    await dialog.locator("select").selectOption("text");
    await dialog
      .getByPlaceholder("例: 単元7-2 リース料支払時の仕訳演習")
      .fill("UI検証の追加ステップ");
    await dialog.getByRole("button", { name: "追加する", exact: true }).click();
    await page.getByRole("button", { name: "JSON出力", exact: true }).click();
    dialog = page.getByRole("dialog");
    const json = JSON.parse(await dialog.locator("textarea").inputValue());
    expect(json.steps).toHaveLength(6);
    expect(json.steps.at(-1).title).toBe("UI検証の追加ステップ");
    await page.keyboard.press("Escape");
    await page.getByRole("switch").click();
    await expect(
      page.getByText("受講生 ライブ学習プレビュー実行中", { exact: true }),
    ).toBeVisible();
  });
  await menu("student", "/student/payments");
  await check(
    "Payment preview updates the demo ledger without card details",
    async () => {
      await page
        .getByRole("button", { name: "支払い内容を確認", exact: true })
        .click();
      let dialog = page.getByRole("dialog");
      await expect(dialog.locator("input")).toHaveCount(0);
      await dialog
        .getByRole("button", { name: "支払い完了画面を確認", exact: true })
        .click();
      await expect(dialog).toContainText("実際の請求・決済は行われていません");
      await dialog
        .getByRole("button", { name: "履歴に戻る", exact: true })
        .click();
      await menu("secretariat", "/secretariat/payments");
      await expect(
        page
          .locator("tr")
          .filter({ hasText: "Webフルスタック開発実践テキスト" }),
      ).toContainText("支払い済み");
    },
  );
  await menu("instructor", "/instructor/courses/course-01/curriculum");
  await check(
    "Meeting time validation and student schedule visibility",
    async () => {
      await page
        .getByRole("button", { name: "Web会議を登録", exact: true })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog
        .getByLabel("講義・会議名", { exact: true })
        .fill("UI検証オンライン講義");
      await dialog.getByLabel("開始時刻", { exact: true }).fill("15:00");
      await dialog.getByLabel("終了時刻", { exact: true }).fill("14:00");
      await dialog
        .getByRole("button", { name: "会議予定を登録", exact: true })
        .click();
      await expect(dialog.getByRole("alert")).toContainText("終了時刻");
      await dialog.getByLabel("終了時刻", { exact: true }).fill("16:00");
      await dialog
        .getByRole("button", { name: "会議予定を登録", exact: true })
        .click();
      await menu("student", "/student/schedule");
      await expect(
        page.getByRole("heading", {
          name: "UI検証オンライン講義",
          exact: true,
        }),
      ).toBeVisible();
    },
  );
  await page.goto(`${baseURL}/admin/login`);
  await check("Admin login proceeds to 6-digit MFA preview", async () => {
    await page
      .getByLabel("メールアドレス", { exact: true })
      .fill("test@example.com");
    await page.getByLabel("パスワード", { exact: true }).fill("demo-password");
    await page
      .getByRole("button", { name: "2段階認証へ進む", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "2段階認証", exact: true }),
    ).toBeVisible();
    await page.getByLabel("認証コード", { exact: true }).fill("123456");
    await page
      .getByRole("button", { name: "ログイン後の画面を確認", exact: true })
      .click();
    await expect(page).toHaveURL(/secretariat\/dashboard$/);
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/student/dashboard`);
  await check("Mobile drawer navigation opens attendance form", async () => {
    await page
      .getByRole("button", { name: "メニューを開く", exact: true })
      .click();
    await page
      .getByRole("navigation", { name: "モバイルメニュー" })
      .getByRole("link", { name: "出席・欠席申請", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "出席・欠席申請", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "出欠申請を作成", exact: true })
      .click();
    const box = await page.getByRole("dialog").boundingBox();
    expect(box.width).toBeLessThanOrEqual(390);
    await page.screenshot({
      path: path.join(outputDir, "attendance-mobile.png"),
      fullPage: true,
    });
    await page.keyboard.press("Escape");
  });
  expect(errors).toEqual([]);
  console.log("Workflow scenarios passed:", checks.length);
} catch (e) {
  console.error(e.stack);
  process.exitCode = 1;
} finally {
  fs.writeFileSync(
    path.join(outputDir, "workflows.json"),
    JSON.stringify({ checks, errors, passed: !process.exitCode }, null, 2),
  );
  await browser.close();
}
