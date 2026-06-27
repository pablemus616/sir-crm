const LOCALE = "es-GT";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat(LOCALE);

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" });

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(value: string | number | Date): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | number | Date): string {
  return dateTimeFormatter.format(new Date(value));
}
