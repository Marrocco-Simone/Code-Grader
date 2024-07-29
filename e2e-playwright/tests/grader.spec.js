const { test, expect } = require("@playwright/test");

async function printPage(page) {
  const html = await page.content();
  console.log(html);
}

async function init(page) {
  await page.goto("/");

  // * wait for page to load
  await page.locator("span").filter({ hasText: "Points:" }).waitFor();
  await expect(
    page.locator("span").filter({ hasText: "Points: 0" })
  ).toHaveCount(1);
}

async function newAssignment(page, title, handout) {
  // * see assignment is correct
  await expect(page.locator("h1").filter({ hasText: title })).toHaveCount(1);
  await expect(
    page.locator("p").filter({
      hasText: handout,
    })
  ).toHaveCount(1);
  await expect(
    page.locator("button").filter({ hasText: `Send for grading` })
  ).toHaveCount(1);

  // * see no submissions are received
  await expect(
    page.locator("h2").filter({
      hasText: `Your submissions`,
    })
  ).toHaveCount(0);
  await expect(
    page.locator("button").filter({ hasText: `Delete` })
  ).toHaveCount(0);

  // * see #code-editor-textarea is present and clear it
  await expect(page.locator("#code-editor-textarea")).toHaveCount(1);
  await page.locator("#code-editor-textarea").fill("");
  await expect(await page.inputValue("#code-editor-textarea")).toBe("");
}

async function sendFailingCode(page, code) {
  // * put code and send it
  await page.locator("#code-editor-textarea").fill(code);
  await page.locator("button").filter({ hasText: `Send for grading` }).click();

  // * see submission is received
  await page.locator("h2").filter({ hasText: "Your submissions" }).waitFor();
  await expect(
    page.locator("p").filter({ hasText: "Status: pending" })
  ).toHaveCount(1);
  await expect(
    page.locator("h2").filter({
      hasText: `Sent!`,
    })
  ).toHaveCount(1);

  // * read result
  await page.locator("p").filter({ hasText: "Status: processed" }).waitFor();
  await expect(
    page.locator("h2").filter({
      hasText: `Incorrect!`,
    })
  ).toHaveCount(1);
  await expect(
    page.locator("p").filter({ hasText: "Result: Fail" })
  ).toHaveCount(1);

  // * delete submission
  await page.locator("button").filter({ hasText: `Delete` }).click();
  await expect(
    page.locator("h2").filter({
      hasText: `Your submissions`,
    })
  ).toHaveCount(0);
  await expect(
    page.locator("button").filter({ hasText: `Delete` })
  ).toHaveCount(0);
  await expect(
    page.locator("h2").filter({
      hasText: `Deleted!`,
    })
  ).toHaveCount(1);
  await page.locator("button").filter({ hasText: `OK` }).click();
}

async function sendCorrectCodeAndGetPoints(page, code) {
  // * put code and send it
  await page.locator("#code-editor-textarea").fill(code);
  await page.locator("button").filter({ hasText: `Send for grading` }).click();

  // * see submission is received
  await page.locator("h2").filter({ hasText: "Your submissions" }).waitFor();
  await expect(
    page.locator("p").filter({ hasText: "Status: pending" })
  ).toHaveCount(1);
  await expect(
    page.locator("h2").filter({
      hasText: `Sent!`,
    })
  ).toHaveCount(1);

  // * read result
  await page.locator("p").filter({ hasText: "Status: processed" }).waitFor();
  await expect(
    page.locator("h2").filter({
      hasText: `Correct!`,
    })
  ).toHaveCount(1);

  await expect(
    page.locator("p").filter({ hasText: "Result: Success" })
  ).toHaveCount(1);

  // * check the problem is solved
  await expect(
    page.locator("span").filter({ hasText: "Points: 100" })
  ).toHaveCount(1);
  await expect(
    page.locator("button").filter({ hasText: "Go to next assignment" })
  ).toHaveCount(1);
}

async function goToNextAssignment(page) {
  await expect(
    page.locator("button").filter({ hasText: "Go to next assignment" })
  ).toHaveCount(1);
  await page
    .locator("button")
    .filter({ hasText: "Go to next assignment" })
    .click();
  await page.locator("h1").filter({ hasText: title_2 }).waitFor();
}

const title_1 = "Hello";
const handout_1 = `Write a function "hello" that returns the string "Hello"`;

const title_2 = "Hello world";
const handout_2 = `Write a function "hello" that returns the string "Hello world!"`;

const code_fail = `def hello():\n\treturn "Ciao"`;
const code_success = `def hello():\n\treturn "Hello"`;

test("Application loads main page.", async ({ page }) => {
  await init(page);
  await newAssignment(page, title_1, handout_1);
});

test("Send failing code for grading.", async ({ page }) => {
  await init(page);
  await newAssignment(page, title_1, handout_1);
  await sendFailingCode(page, code_fail);
});

test("Send correct code for grading, get points and go to next assignment.", async ({
  page,
}) => {
  await init(page);
  await newAssignment(page, title_1, handout_1);
  await sendCorrectCodeAndGetPoints(page, code_success);
  await goToNextAssignment(page, title_2);
  await newAssignment(page, title_2, handout_2);
});
