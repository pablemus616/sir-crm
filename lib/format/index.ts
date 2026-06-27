const LOCALE = "es-GT";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat(LOCALE);

const compactNumberFormatter = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
});

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" });

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

// Alias for consistency with spec
export function formatGTQ(value: number): string {
  return formatCurrency(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCompactNumber(value: number): string {
  return compactNumberFormatter.format(value);
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  if (days > 0) return `${days} d ${hours} h`;
  const mins = Math.floor((seconds % 3_600) / 60);
  return hours > 0 ? `${hours} h ${mins} min` : `${mins} min`;
}

export function formatDate(value: string | number | Date): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | number | Date): string {
  return dateTimeFormatter.format(new Date(value));
}
