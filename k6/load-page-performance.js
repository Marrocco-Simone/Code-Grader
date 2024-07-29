import { browser } from "k6/browser";
import http from "k6/http";
import { sleep } from "k6";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export const options = {
  scenarios: {
    ui: {
      executor: "shared-iterations",
      options: {
        browser: {
          type: "chromium",
          headless: false,
        },
      },
    },
  },
  thresholds: {
    browser_web_vital_lcp: ["p(90) < 1000"],
    "browser_web_vital_inp{url:http://nginx:7800}": ["p(90) < 80"],
  },
};

export default async function () {
  const page = await browser.newPage();
  await page.goto("http://nginx:7800", {
    waitUntil: "load",
  });
  await page.close();

  const userId = uuidv4();
  const assignmentId = 1;
  http.get(`http://nginx:7800/api/assignments/${assignmentId}`);
  http.get(`http://nginx:7800/api/grades/${userId}`);
  http.get(`http://nginx:7800/api/grades/${userId}/${assignmentId}`);
}
