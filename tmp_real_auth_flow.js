const fs = require("fs");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

function readDbState() {
  return JSON.parse(execFileSync("node", ["tmp_db_check.js"], { encoding: "utf8" }));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const result = {};
  const base = "http://127.0.0.1:3010";

  await page.goto(`${base}/dashboard`);
  await page.waitForURL(/\/login/);
  result.unauthDashboardUrl = page.url();

  await page.getByLabel("邮箱").fill("Keyzii@163.com");
  await page.getByLabel("密码").fill("2025Mauy@163com");
  await page.getByRole("button", { name: "进入仪表盘" }).click();
  await page.waitForURL(`${base}/dashboard`, { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  result.firstLoginUrl = page.url();
  result.firstLoginDashboardVisible = await page.getByText("Dashboard").first().isVisible();
  result.accountEmailVisible = await page.getByText("keyzii@163.com").isVisible();
  result.firstLoginDbState = readDbState();
  await page.screenshot({ path: "test-results/auth-final-dashboard.png", fullPage: true });

  await page.getByRole("button", { name: "退出登录" }).click();
  await page.waitForURL(/\/login/);
  result.afterFirstLogoutUrl = page.url();

  await page.getByLabel("邮箱").fill("Keyzii@163.com");
  await page.getByLabel("密码").fill("2025Mauy@163com");
  await page.getByRole("button", { name: "进入仪表盘" }).click();
  await page.waitForURL(`${base}/dashboard`, { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  result.secondLoginUrl = page.url();
  result.secondLoginDashboardVisible = await page.getByText("Dashboard").first().isVisible();
  result.secondLoginDbState = readDbState();
  await page.screenshot({ path: "test-results/auth-final-dashboard-second-login.png", fullPage: true });

  fs.writeFileSync("test-results/auth-final-flow.json", JSON.stringify(result, null, 2));
  await browser.close();
  console.log(JSON.stringify(result, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
