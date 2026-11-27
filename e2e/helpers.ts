import { expect, type Page } from "@playwright/test";

interface TaskOptions {
  priority?: "low" | "medium" | "high";
  category?: "work" | "personal" | "shopping" | "health" | "other";
  dueDate?: string;
}

export async function addTask(
  page: Page,
  text: string,
  options: TaskOptions = {}
) {
  await page.getByRole("button", { name: "Add item", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Item name" }).fill(text);

  if (options.priority) {
    await dialog.getByLabel("Priority").selectOption(options.priority);
  }
  if (options.category) {
    await dialog.getByLabel("Category").selectOption(options.category);
  }
  if (options.dueDate) {
    await dialog.getByLabel("Due date (optional)").fill(options.dueDate);
  }

  await dialog.getByRole("button", { name: "Add item" }).click();
  await expect(dialog).toBeHidden();
}
