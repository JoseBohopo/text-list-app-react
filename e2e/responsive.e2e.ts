import { expect, test, type Page } from "@playwright/test";
import { addTask } from "./helpers";

const viewports = [
  { width: 320, height: 640 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];

async function hasHorizontalOverflow(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );
}

for (const viewport of viewports) {
  test.describe(`at ${viewport.width}px`, () => {
    test.use({ viewport });

    test("empty state fits the screen", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.getByRole("button", { name: "Add your first item" })
      ).toBeVisible();
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test("list, filters and controls fit the screen", async ({ page }) => {
      await page.goto("/");
      await addTask(page, "Unbroken".repeat(12), {
        priority: "high",
        category: "shopping",
        dueDate: "2020-01-01",
      });

      await expect(
        page.getByRole("textbox", { name: "Search tasks" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Undo last action" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Delete selected item" })
      ).toBeVisible();
      expect(await hasHorizontalOverflow(page)).toBe(false);

      await page.getByRole("button", { name: "Filters" }).click();
      const panel = page.getByRole("group", { name: "Filters" });
      await expect(panel).toBeVisible();

      const box = await panel.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test("add dialog fits the screen", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Add item", exact: true }).click();

      const form = page.getByRole("dialog").locator("form");
      await expect(form).toBeVisible();

      const box = await form.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  });
}
