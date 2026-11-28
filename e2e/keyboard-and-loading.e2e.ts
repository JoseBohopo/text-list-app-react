import { expect, test, type Page } from "@playwright/test";
import { addTask } from "./helpers";

const TOTAL = 41;

function buildSavedState() {
  const items = Array.from({ length: TOTAL }, (_, index) => {
    const number = index + 1;
    return {
      id: number,
      text: `Task ${String(number).padStart(2, "0")}`,
      selected: false,
      priority: "medium",
      category: "other",
      completed: false,
      createdAt: new Date(Date.UTC(2024, 0, 1, 0, 0, number)).toISOString(),
    };
  });

  return JSON.stringify({
    state: {
      items,
      focusedIndex: -1,
      history: [],
      filters: { search: "", showCompleted: true },
    },
    version: 0,
  });
}

async function seedManyTasks(page: Page) {
  await page.addInitScript((saved) => {
    localStorage.setItem("listStore", saved);
  }, buildSavedState());
}

function taskButton(page: Page, text: string) {
  return page.getByRole("button", { name: `Select ${text}`, exact: true });
}

test("arrow keys, Home and End move focus between tasks", async ({ page }) => {
  await page.goto("/");
  await addTask(page, "First", { priority: "high" });
  await addTask(page, "Second", { priority: "medium" });
  await addTask(page, "Third", { priority: "low" });

  // Initial state: focus on the first task
  await taskButton(page, "First").focus();
  await expect(taskButton(page, "First")).toBeFocused();

  // After ArrowDown
  await page.keyboard.press("ArrowDown");
  await expect(taskButton(page, "Second")).toBeFocused();

  // After End
  await page.keyboard.press("End");
  await expect(taskButton(page, "Third")).toBeFocused();

  // ArrowDown on the last task stays there
  await page.keyboard.press("ArrowDown");
  await expect(taskButton(page, "Third")).toBeFocused();

  // After ArrowUp
  await page.keyboard.press("ArrowUp");
  await expect(taskButton(page, "Second")).toBeFocused();

  // After Home
  await page.keyboard.press("Home");
  await expect(taskButton(page, "First")).toBeFocused();
});

test("loads tasks in blocks of 20 while scrolling", async ({ page }) => {
  await seedManyTasks(page);
  await page.goto("/");

  const progress = page.getByText(/Showing \d+ of 41 tasks/);

  // Initial state: only the first block is rendered
  await expect(progress).toHaveText("Showing 20 of 41 tasks");
  await expect(taskButton(page, "Task 20")).toBeVisible();
  await expect(taskButton(page, "Task 21")).toHaveCount(0);

  // After scrolling to the bottom: everything is loaded
  await expect(async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(progress).toHaveText("Showing 41 of 41 tasks", {
      timeout: 1000,
    });
  }).toPass();
  await expect(taskButton(page, "Task 41")).toHaveCount(1);
});

test("ArrowDown on the last loaded task loads the next block", async ({
  page,
}) => {
  await seedManyTasks(page);
  await page.goto("/");

  // Initial state: 20 tasks, focus on the last one
  await expect(page.getByText("Showing 20 of 41 tasks")).toBeVisible();
  await taskButton(page, "Task 20").focus();
  await expect(taskButton(page, "Task 20")).toBeFocused();

  // After ArrowDown: the next block loads and its first task is focused
  await page.keyboard.press("ArrowDown");
  await expect(taskButton(page, "Task 21")).toBeFocused();
  await expect(page.getByText(/Showing \d+ of 41 tasks/)).not.toHaveText(
    "Showing 20 of 41 tasks"
  );
});
