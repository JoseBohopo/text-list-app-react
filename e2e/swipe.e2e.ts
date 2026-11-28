import { expect, test, type Page } from "@playwright/test";
import { addTask } from "./helpers";

async function enableSyntheticTouch(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "setPointerCapture", {
      configurable: true,
      value: () => {},
    });
  });
}

async function swipeTask(
  page: Page,
  text: string,
  startX: number,
  endX: number
) {
  const taskButton = page.getByRole("button", {
    name: `Select ${text}`,
    exact: true,
  });
  const row = page.locator("[data-task-id]").filter({ has: taskButton });

  const pointer = {
    pointerId: 7,
    pointerType: "touch",
    isPrimary: true,
    clientY: 100,
    bubbles: true,
  };

  await taskButton.dispatchEvent("pointerdown", {
    ...pointer,
    clientX: startX,
  });
  await row.dispatchEvent("pointermove", {
    ...pointer,
    clientX: endX,
  });
  await row.dispatchEvent("pointerup", {
    ...pointer,
    clientX: endX,
  });

  return taskButton;
}

test("swiping right completes a task without selecting it", async ({
  page,
}) => {
  await enableSyntheticTouch(page);
  await page.goto("/");
  await addTask(page, "Swipe complete");

  const task = await swipeTask(page, "Swipe complete", 100, 200);

  await expect(
    page.getByRole("button", { name: "Complete Swipe complete" })
  ).toHaveAttribute("aria-pressed", "true");
  await expect(task).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#status")).toHaveText("Task completed");

  // A click generated after the swipe must not select the task.
  await task.dispatchEvent("click", { bubbles: true, cancelable: true });
  await expect(task).toHaveAttribute("aria-pressed", "false");
});

test("swiping left deletes one task and Undo restores it", async ({ page }) => {
  await enableSyntheticTouch(page);
  await page.goto("/");
  await addTask(page, "Swipe delete");

  await swipeTask(page, "Swipe delete", 200, 100);

  await expect(
    page.getByRole("button", { name: "Select Swipe delete", exact: true })
  ).toHaveCount(0);
  await expect(page.locator("#status")).toHaveText(
    "Deleted Swipe delete. Use Undo last action to restore it."
  );

  await page.getByRole("button", { name: "Undo last action" }).click();
  await expect(
    page.getByRole("button", { name: "Select Swipe delete", exact: true })
  ).toBeVisible();
});
