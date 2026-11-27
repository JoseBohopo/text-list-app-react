import { expect, test, type Page } from "@playwright/test";
import { addTask } from "./helpers";

async function openFilters(page: Page) {
  const button = page.getByRole("button", { name: "Filters" });
  if ((await button.getAttribute("aria-expanded")) !== "true") {
    await button.click();
  }
}

async function setCategoryFilter(page: Page, value: string) {
  await openFilters(page);
  await page
    .getByRole("combobox", { name: "Filter by category" })
    .selectOption(value);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("group", { name: "Filters" })).toBeHidden();
}

test("select all only affects filtered tasks", async ({ page }) => {
  const selectAll = page.getByRole("checkbox", {
    name: "Select all filtered tasks",
  });
  const remove = page.getByRole("button", { name: "Delete selected item" });
  const work = page.getByRole("button", { name: "Select Work task" });
  const home = page.getByRole("button", { name: "Select Home task" });

  await page.goto("/");
  await addTask(page, "Work task", { category: "work" });
  await addTask(page, "Home task", { category: "personal" });

  // Initial state: nothing selected
  await expect(selectAll).not.toBeChecked();
  await expect(remove).toBeDisabled();

  // After filtering and selecting all
  await setCategoryFilter(page, "work");
  await selectAll.check();
  await expect(work).toHaveAttribute("aria-pressed", "true");
  await expect(selectAll).toBeChecked();

  // After clearing the filter: the hidden task was not selected
  await setCategoryFilter(page, "");
  await expect(work).toHaveAttribute("aria-pressed", "true");
  await expect(home).toHaveAttribute("aria-pressed", "false");
  expect(
    await selectAll.evaluate((el: HTMLInputElement) => el.indeterminate)
  ).toBe(true);

  // After selecting the rest: everything is selected
  await selectAll.check();
  await expect(home).toHaveAttribute("aria-pressed", "true");
  await expect(selectAll).toBeChecked();

  // After unchecking: nothing is selected
  await selectAll.uncheck();
  await expect(work).toHaveAttribute("aria-pressed", "false");
  await expect(home).toHaveAttribute("aria-pressed", "false");
  await expect(remove).toBeDisabled();
});

test("deleting with hidden selected tasks asks for confirmation", async ({
  page,
}) => {
  const remove = page.getByRole("button", { name: "Delete selected item" });
  const undo = page.getByRole("button", { name: "Undo last action" });
  const work = page.getByRole("listitem").filter({ hasText: "Work task" });
  const home = page.getByRole("listitem").filter({ hasText: "Home task" });

  await page.goto("/");
  await addTask(page, "Work task", { category: "work" });
  await addTask(page, "Home task", { category: "personal" });

  // Select both, then hide one with a filter
  await page
    .getByRole("checkbox", { name: "Select all filtered tasks" })
    .check();
  await setCategoryFilter(page, "work");
  await expect(home).toBeHidden();

  // After clicking delete: the confirmation dialog appears
  await remove.click();
  const modal = page.getByRole("dialog", { name: "Delete selected tasks?" });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText("2 selected task(s)");
  await expect(modal).toContainText("1 hidden by filters");
  await expect(modal.getByRole("button", { name: "Cancel" })).toBeFocused();

  // After cancelling: nothing is deleted and focus returns to delete
  await modal.getByRole("button", { name: "Cancel" }).click();
  await expect(modal).toBeHidden();
  await expect(work).toBeVisible();
  await expect(remove).toBeFocused();

  // After confirming: both tasks are deleted
  await remove.click();
  await modal.getByRole("button", { name: "Delete tasks" }).click();
  await expect(modal).toBeHidden();
  await expect(work).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "No items yet" })
  ).toBeVisible();

  // After undo: both tasks come back
  await undo.click();
  await expect(work).toBeVisible();
  await setCategoryFilter(page, "");
  await expect(home).toBeVisible();
});