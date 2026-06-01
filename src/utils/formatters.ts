// Shared formatting helpers.

export function formatDate(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
}

export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function truncate(value: string, max = 80): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}
