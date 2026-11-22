// Prices are in Indian rupees. en-IN gives lakh/crore grouping (e.g. ₹1,25,000).
const whole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const fractional = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Whole-rupee amounts show no decimals (₹445); anything else shows two (₹69.20).
export const money = (n: number): string => (Number.isInteger(n) ? whole.format(n) : fractional.format(n));

export const dateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : 'Something went wrong. Please try again.';

export function hoursLeft(iso: string): number {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 3600000));
}
