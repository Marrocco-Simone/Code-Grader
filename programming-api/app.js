import * as assignmentService from "./services/assignmentService.js";
import * as submissionService from "./services/submissionService.js";
import * as cachingService from "./services/cachingService.js";
import { Hono } from "./deps.js";

const app = new Hono();

app.get("/", (c) => c.text("hello world"));

// * return all assignments
app.get("/assignments", async (c) => {
  try {
    const assignments = await assignmentService.findAll();
    return c.json(assignments);
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: e.message });
  }
});

// * return specific assignment
app.get("/assignments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const assignment = await assignmentService.find(id);
    if (!assignment) {
      return c.json({ error: "Assignment not found" });
    }
    return c.json(assignment);
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: e.message });
  }
});

// * return user data
app.get("/grades/:user_uuid", async (c) => {
  try {
    const user_uuid = c.req.param("user_uuid");
    const submissions = await submissionService.findAll(user_uuid);
    const maxAssignmentIndex = submissions.reduce(
      (max, submission) => Math.max(max, submission.programming_assignment_id),
      0
    );
    let points = 0;
    let currentAssignment = 1;
    for (let i = 1; i <= maxAssignmentIndex; i++) {
      if (
        !submissions.some((s) => s.programming_assignment_id === i && s.correct)
      ) {
        break;
      }
      points += 100;
      currentAssignment = i + 1;
    }
    return c.json({
      user_uuid,
      points,
      currentAssignment,
    });
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: e.message });
  }
});

// * return all submissions of an assignment
app.get("/grades/:user_uuid/:id", async (c) => {
  try {
    const user_uuid = c.req.param("user_uuid");
    const id = c.req.param("id");
    const submissions = await submissionService.findAllOfAssignment(
      user_uuid,
      id
    );
    return c.json(submissions);
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: e.message });
  }
});

// * create new submission of an assignment
app.post("/grades/:user_uuid/:id", async (c) => {
  const user_uuid = c.req.param("user_uuid");
  let submission_id;
  try {
    const { code } = await c.req.json();
    if (!code) {
      c.status(400);
      return c.json({ error: "No code given" });
    }

    const id = c.req.param("id");
    const assignment = await assignmentService.find(id);
    if (!assignment) {
      return c.json({ error: "Assignment not found" });
    }

    const anotherPending = await submissionService.findAnotherPending(
      user_uuid
    );
    if (anotherPending) {
      c.status(409);
      return c.json({ error: "You have already a submission in queue" });
    }

    const identicalSubmission = await submissionService.find(
      user_uuid,
      id,
      code
    );
    if (identicalSubmission) {
      const { grader_feedback, correct } = identicalSubmission;
      const submission = await submissionService.create(user_uuid, id, code);
      await submissionService.update(
        user_uuid,
        submission.id,
        grader_feedback,
        correct
      );
      return c.json({
        submission: { ...identicalSubmission, already_submitted: true },
      });
    }

    const submission = await submissionService.create(user_uuid, id, code);
    submission_id = submission.id;
    const testCode = assignment["test_code"];
    const data = {
      testCode,
      code,
      user_uuid,
      url: `http://nginx:7800/api/submissions/${user_uuid}/${submission_id}`,
    };

    console.log("Sending to grader new data of user: ", user_uuid);
    const response = await fetch("http://nginx:7800/grader/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const res = await response.json();
    const { _, error } = res;
    if (error) {
      await submissionService.remove(user_uuid, submission_id);
      c.status(response.status);
      return c.json({ error });
    } else {
      await cachingService.store(
        `/submissions/${user_uuid}/${submission_id}`,
        submission
      );
      return c.json({ submission });
    }
  } catch (e) {
    console.error(e);
    await submissionService.remove(user_uuid, submission_id);
    c.status(500);
    return c.json({ error: e.message });
  }
});

// * receive updates from grader about a submission
app.post("/submissions/:user_uuid/:id", async (c) => {
  try {
    const user_uuid = c.req.param("user_uuid");
    const id = c.req.param("id");
    const { grader_feedback, correct } = await c.req.json();
    console.log("Received grader feedback with correct: ", correct);
    await submissionService.update(user_uuid, id, grader_feedback, correct);
    await cachingService.remove(`/submissions/${user_uuid}/${id}`);
    return c.json({ success: true });
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: e.message });
  }
});

// * get single submission (useful for polling)
app.get("/submissions/:user_uuid/:id", async (c) => {
  try {
    const user_uuid = c.req.param("user_uuid");
    const id = c.req.param("id");
    const cachedSubmission = await cachingService.retrieve(
      `/submissions/${user_uuid}/${id}`
    );
    if (cachedSubmission) {
      console.log("Returning cached submission for id: ", id);
      return c.json({ submission: cachedSubmission });
    }

    console.log("Fetching submission for id: ", id);
    const submission = await submissionService.findById(user_uuid, id);
    if (!submission) {
      c.status(400);
      return c.json({ error: "Submission not found" });
    } else {
      return c.json({ submission });
    }
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: e.message });
  }
});

// * delete all submissions of a user
app.delete("/submissions/:user_uuid/reset", async (c) => {
  try {
    const user_uuid = c.req.param("user_uuid");
    await submissionService.removeAll(user_uuid);
    return c.json({ success: true });
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: e.message });
  }
});

// * delete a submission
app.delete("/submissions/:user_uuid/:id", async (c) => {
  try {
    const user_uuid = c.req.param("user_uuid");
    const id = c.req.param("id");
    const submission = await submissionService.findById(user_uuid, id);
    if (!submission) {
      c.status(400);
      return c.json({ error: "Submission not found" });
    }
    await submissionService.remove(user_uuid, id);
    await cachingService.remove(`/submissions/${user_uuid}/${id}`);
    return c.json({ success: true });
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: e.message });
  }
});

const portConfig = { port: 7777, hostname: "0.0.0.0" };
Deno.serve(portConfig, app.fetch);
