import { expect, test } from "@playwright/test";
import { addTask } from "./helpers";

test("rejects an empty task and accepts it after typing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add item", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Add item" }).click();

  await expect(dialog.getByRole("alert")).toHaveText(
    "Item text cannot be empty"
  );
  await expect(
    dialog.getByRole("textbox", { name: "Item name" })
  ).toBeFocused();

  await dialog.getByRole("textbox", { name: "Item name" }).fill("Valid task");
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Add item" }).click();

  await expect(
    page.getByRole("button", { name: "Select Valid task" })
  ).toBeVisible();
});

test("shows pending and overdue status", async ({ page }) => {
  await page.goto("/");
  await addTask(page, "Late task", { dueDate: "2020-01-01" });
  await addTask(page, "Open task");

  const items = page.getByRole("listitem");
  await expect(items.filter({ hasText: "Late task" })).toContainText("Overdue");
  await expect(items.filter({ hasText: "Open task" })).toContainText("Pending");
});

test("edits a task and restores it with undo", async ({ page }) => {
  await page.goto("/");
  await addTask(page, "Original", { priority: "low", category: "work" });

  await page.getByRole("button", { name: "Edit Original" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("textbox", { name: "Item name" })).toHaveValue(
    "Original"
  );
  await dialog.getByRole("textbox", { name: "Item name" }).fill("Updated");
  await dialog.getByLabel("Priority").selectOption("high");
  await dialog.getByRole("button", { name: "Save changes" }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Select Updated" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit Updated" })
  ).toBeFocused();

  await page.getByRole("button", { name: "Undo last action" }).click();
  await expect(
    page.getByRole("button", { name: "Select Original" })
  ).toBeVisible();
});
