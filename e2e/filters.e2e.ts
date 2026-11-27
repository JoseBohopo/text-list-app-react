import { expect, test } from "@playwright/test";
import { addTask } from "./helpers";

test("search and filters narrow the list and can be cleared", async ({
  page,
}) => {
  const search = page.getByRole("textbox", { name: "Search tasks" });
  const filterButton = page.getByRole("button", { name: "Filters" });
  const noMatches = page.getByText("No tasks match the current filters.");
  const alpha = page.getByRole("listitem").filter({ hasText: "Alpha work" });
  const beta = page.getByRole("listitem").filter({ hasText: "Beta home" });
  const gamma = page.getByRole("listitem").filter({ hasText: "Gamma health" });

  await page.goto("/");

  // Initial state: no tasks, so the filters are disabled
  await filterButton.click();
  await expect(
    page.getByRole("combobox", { name: "Filter by category" })
  ).toBeDisabled();
  await expect(
    page.getByRole("combobox", { name: "Filter by priority" })
  ).toBeDisabled();
  await page.keyboard.press("Escape");

  await addTask(page, "Alpha work", { category: "work", priority: "high" });
  await addTask(page, "Beta home", { category: "personal", priority: "low" });
  await addTask(page, "Gamma health", { category: "health", priority: "high" });

  // After adding tasks: everything is visible and there are no active filters
  await expect(alpha).toBeVisible();
  await expect(beta).toBeVisible();
  await expect(gamma).toBeVisible();
  await expect(page.locator("#active-filter-count")).toHaveText(
    "0 active filters"
  );

  // After searching
  await search.fill("beta");
  await expect(beta).toBeVisible();
  await expect(alpha).toBeHidden();
  await expect(gamma).toBeHidden();

  // After a search with no results
  await search.fill("zzz");
  await expect(noMatches).toBeVisible();

  // After clearing the search
  await search.fill("");
  await expect(noMatches).toBeHidden();
  await expect(alpha).toBeVisible();

  // After filtering by priority
  await filterButton.click();
  const panel = page.getByRole("group", { name: "Filters" });
  await panel
    .getByRole("combobox", { name: "Filter by priority" })
    .selectOption("high");
  await expect(alpha).toBeVisible();
  await expect(gamma).toBeVisible();
  await expect(beta).toBeHidden();
  await expect(page.locator("#active-filter-count")).toHaveText(
    "1 active filters"
  );

  // After adding a category filter
  await panel
    .getByRole("combobox", { name: "Filter by category" })
    .selectOption("health");
  await expect(gamma).toBeVisible();
  await expect(alpha).toBeHidden();
  await expect(page.locator("#active-filter-count")).toHaveText(
    "2 active filters"
  );

  // After removing both filters
  await panel
    .getByRole("combobox", { name: "Filter by priority" })
    .selectOption("");
  await panel
    .getByRole("combobox", { name: "Filter by category" })
    .selectOption("");
  await expect(alpha).toBeVisible();
  await expect(beta).toBeVisible();
  await expect(gamma).toBeVisible();
  await expect(page.locator("#active-filter-count")).toHaveText(
    "0 active filters"
  );
});

test("the completed switch hides and shows completed tasks", async ({
  page,
}) => {
  const done = page.getByRole("listitem").filter({ hasText: "Done task" });
  const open = page.getByRole("listitem").filter({ hasText: "Open task" });

  await page.goto("/");
  await addTask(page, "Done task");
  await addTask(page, "Open task");
  await page.getByRole("button", { name: "Complete Done task" }).click();

  // Initial state: completed tasks are shown
  await expect(done).toBeVisible();
  await expect(open).toBeVisible();

  // After turning the switch off
  await page.getByRole("button", { name: "Filters" }).click();
  const showCompleted = page.getByRole("switch", {
    name: "Show completed tasks",
  });
  const switchLabel = page.getByText("Show completed", { exact: true });

  await expect(showCompleted).toBeChecked();
  await switchLabel.click();
  await expect(showCompleted).not.toBeChecked();
  await expect(done).toBeHidden();
  await expect(open).toBeVisible();

  // After turning it back on
  await switchLabel.click();
  await expect(showCompleted).toBeChecked();
  await expect(done).toBeVisible();
});
