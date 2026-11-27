import { expect, test, type Page } from "@playwright/test";

const OUTPUT = "docs/screenshots";

const tasks = [
  {
    text: "Finish quarterly report",
    category: "work",
    priority: "high",
    dueDate: "2024-03-01",
    completed: false,
  },
  {
    text: "Book dentist appointment",
    category: "health",
    priority: "medium",
    dueDate: "2030-06-10",
    completed: false,
  },
  {
    text: "Buy groceries for the week",
    category: "shopping",
    priority: "medium",
    completed: false,
  },
  {
    text: "Call mom",
    category: "personal",
    priority: "low",
    completed: false,
  },
  {
    text: "Review open pull requests",
    category: "work",
    priority: "high",
    completed: true,
  },
];

function buildSavedState() {
  const items = tasks.map((task, index) => ({
    id: index + 1,
    selected: false,
    createdAt: new Date(Date.UTC(2024, 0, 1, 0, 0, index)).toISOString(),
    ...(task.completed
      ? { completedAt: new Date(Date.UTC(2024, 0, 2)).toISOString() }
      : {}),
    ...task,
  }));

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

async function seed(page: Page) {
  await page.addInitScript((saved) => {
    localStorage.setItem("listStore", saved);
  }, buildSavedState());
}

async function shoot(page: Page, name: string) {
  await expect(page.getByRole("main")).toBeVisible();
  await page.screenshot({
    path: `${OUTPUT}/${name}.png`,
    animations: "disabled",
  });
}

test.describe("light theme", () => {
  test.use({ colorScheme: "light" });

  test("empty state", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "No items yet" })
    ).toBeVisible();
    await shoot(page, "empty-light");
  });

  test("filters", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Filters" }).click();
    await page
      .getByRole("combobox", { name: "Filter by priority" })
      .selectOption("high");
    await page
      .getByRole("combobox", { name: "Filter by category" })
      .selectOption("work");
    await expect(page.getByRole("group", { name: "Filters" })).toBeVisible();
    await shoot(page, "filters");
  });
});

test.describe("dark theme", () => {
  test.use({ colorScheme: "dark" });

  test("task list", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(page.getByRole("listitem")).toHaveCount(tasks.length);
    await shoot(page, "list-dark");
  });

  test("add dialog", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Add item", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "Item name" })
      .fill("Plan the weekend trip");
    await shoot(page, "add-dialog-dark");
  });
});

test.describe("mobile", () => {
  test.use({
    colorScheme: "light",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  test("task list", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await expect(page.getByRole("listitem")).toHaveCount(tasks.length);
    await shoot(page, "mobile");
  });
});
