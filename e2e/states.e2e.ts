import { expect, test } from "@playwright/test";
import { addTask } from "./helpers";

test("the list screen changes after each action", async ({ page }) => {
  const undo = page.getByRole("button", { name: "Undo last action" });
  const remove = page.getByRole("button", { name: "Delete selected item" });
  const selectAll = page.getByRole("checkbox", {
    name: "Select all filtered tasks",
  });
  const emptyTitle = page.getByRole("heading", { name: "No items yet" });
  const item = page.getByRole("listitem").filter({ hasText: "State task" });

  await page.goto("/");

  // Initial state
  await expect(emptyTitle).toBeVisible();
  await expect(undo).toBeDisabled();
  await expect(remove).toBeDisabled();
  await expect(selectAll).toBeDisabled();

  // After adding a task
  await addTask(page, "State task");
  await expect(emptyTitle).toBeHidden();
  await expect(item).toContainText("Pending");
  await expect(undo).toBeEnabled();
  await expect(remove).toBeDisabled();
  await expect(selectAll).toBeEnabled();
  await expect(selectAll).not.toBeChecked();

  // After selecting it
  await page.getByRole("button", { name: "Select State task" }).click();
  await expect(
    page.getByRole("button", { name: "Select State task" })
  ).toHaveAttribute("aria-pressed", "true");
  await expect(remove).toBeEnabled();
  await expect(selectAll).toBeChecked();

  // After completing it
  await page.getByRole("button", { name: "Complete State task" }).click();
  await expect(item).toContainText("Completed");

  // After deleting it
  await remove.click();
  await expect(emptyTitle).toBeVisible();
  await expect(remove).toBeDisabled();
  await expect(undo).toBeEnabled();

  // After undoing the deletion
  await undo.click();
  await expect(emptyTitle).toBeHidden();
  await expect(item).toContainText("Completed");
  await expect(remove).toBeEnabled();
});
