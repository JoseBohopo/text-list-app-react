export function validateInput(value: string): string | null {
  if (!value.trim()) return "Item text cannot be empty";
  if (value.trim().length > 100) return "Item text is too long";
  return null;
}
