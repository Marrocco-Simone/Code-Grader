import { Hono } from "./deps.js";
import { grade } from "./services/gradingService.js";

const app = new Hono();

const queue = [];
const secondsToProcess = 3;

async function processQueue() {
  while (queue.length > 0) {
    let element;
    try {
      console.log("Processing queue: ", queue.length);
      await new Promise((resolve) =>
        setTimeout(resolve, secondsToProcess * 1000)
      ); // simulate a slow request
      console.log("Finished long process");
      element = queue.shift();
      const { code, testCode, url } = element;
      const { grader_feedback, correct } = await grade(code, testCode);
      console.log("Graded result with correct: ", correct);
      console.log("Sending to: ", url);

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ grader_feedback, correct }),
      });
    } catch (e) {
      console.error(e);
      console.error(element);
    }
  }
}

app.get("/", (c) => c.json({ queue_length: queue.length }));

app.post("/", async (c) => {
  try {
    const { code, testCode, user_uuid, url } = await c.req.json();
    if (!code || !testCode || !user_uuid || !url) {
      c.status(400);
      return c.json({ error: "Invalid request" });
    }

    queue.push({ code, testCode, url, user_uuid });
    if (queue.length === 1) {
      console.log("Starting queue processing");
      processQueue();
    } else {
      console.log("Queue is already processing");
    }

    return c.json({ success: true });
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: e.message });
  }
});

const portConfig = { port: 7000, hostname: "0.0.0.0" };
Deno.serve(portConfig, app.fetch);
