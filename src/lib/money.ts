const rupeeFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const coverageFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

export function formatRupees(amount: number): string {
  return rupeeFormat.format(amount);
}

export function formatCoverageMonths(months: number | null): string {
  if (months === null || !Number.isFinite(months)) {
    return "Not calculated";
  }
  const text = coverageFormat.format(months);
  return `${text} ${text === "1" ? "month" : "months"}`;
}

export function parseWholeNumber(raw: string): number | null {
  const cleaned = raw.replace(/[₹,\s]/g, "");
  if (!/^\d+$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isSafeInteger(value)) return null;
  return value;
}
