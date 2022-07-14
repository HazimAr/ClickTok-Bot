import { launch } from "puppeteer";
import { Sigi } from "./types";

(async () => {
  const browser = await launch();
  const page = await browser.newPage();
  await page.goto(`https://tiktok.com/@khaby.lame`, {
    waitUntil: "networkidle0",
  });
  console.log(await page.content());

  const element = await page.$("#SIGI_STATE").catch(console.error);
  // @ts-ignore
  if (!element) return;

  const sigi: Sigi = JSON.parse(await element.evaluate((e) => e.textContent));
  console.log(sigi);
})();
