export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function buildFullName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "Без имени";
}

export function getSyncToken(secret?: string): string | null {
  if (!secret) {
    return null;
  }

  return `Bearer ${secret}`;
}
