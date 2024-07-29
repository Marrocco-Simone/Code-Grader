import http from "k6/http";
import { sleep } from "k6";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

export const options = {
  duration: "30s",
  vus: 5,
  summaryTrendStats: ["avg", "p(99)"],
};

export default function () {
  const userId = uuidv4();
  const assignmentId = 1;
  const code = 'def hello():\n\treturn "Hello"';

  const res = http.post(
    `http://nginx:7800/api/grades/${userId}/${assignmentId}`,
    JSON.stringify({ code })
  );
  let submission = JSON.parse(res.body).submission;

  while (submission.status === "pending") {
    sleep(0.5);
    const res = http.get(
      `http://nginx:7800/api/submissions/${userId}/${submission.id}`
    );
    submission = JSON.parse(res.body).submission;
  }
}
