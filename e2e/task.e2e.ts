import { expect, test } from "@playwright/test";

test("adds a task and keeps it after reload", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Add item", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "Item name" }).fill("Browser test");
  await dialog.getByRole("button", { name: "Add item" }).click();

  const task = page.getByRole("button", {
    name: "Select Browser test",
    exact: true,
  });

  await expect(task).toBeVisible();
  await page.reload();
  await expect(task).toBeVisible();
});

test("supports keyboard selection, completion and undo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add item", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Item name" })
    .fill("Keyboard task");
  await dialog.getByRole("button", { name: "Add item" }).click();

  const task = page.getByRole("button", { name: "Select Keyboard task" });
  const complete = page.getByRole("button", { name: "Complete Keyboard task" });

  await task.focus();
  await task.press("Enter");
  await expect(task).toHaveAttribute("aria-pressed", "true");

  await complete.click();
  await expect(complete).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Undo last action" }).click();
  await expect(complete).toHaveAttribute("aria-pressed", "false");
  await expect(task).toHaveAttribute("aria-pressed", "true");
});

test("restores focus after closing the dialog and filters", async ({
  page,
}) => {
  await page.goto("/");

  const addButton = page.getByRole("button", { name: "Add item", exact: true });
  await addButton.click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("textbox", { name: "Item name" })
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(addButton).toBeFocused();

  const filterButton = page.getByRole("button", { name: "Filters" });
  await filterButton.click();
  await expect(filterButton).toBeFocused();
  await expect(page.getByRole("group", { name: "Filters" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("group", { name: "Filters" })).not.toBeVisible();
  await expect(filterButton).toBeFocused();
});
