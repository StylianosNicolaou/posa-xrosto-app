export type Currency = "EUR" | "USD" | "GBP";

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  position: "before" | "after"; // Symbol position relative to amount
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  EUR: { code: "EUR", symbol: "€", name: "Euro", position: "after" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", position: "before" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", position: "before" },
};

export const DEFAULT_CURRENCY: Currency = "EUR";

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency: Currency = DEFAULT_CURRENCY): string {
  const currencyInfo = CURRENCIES[currency];
  const formatted = amount.toFixed(2);
  
  if (currencyInfo.position === "before") {
    return `${currencyInfo.symbol}${formatted}`;
  } else {
    return `${formatted}${currencyInfo.symbol}`;
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency = DEFAULT_CURRENCY): string {
  return CURRENCIES[currency].symbol;
}

/**
 * Detect currency from text (for OCR)
 */
export function detectCurrency(text: string): Currency {
  const upperText = text.toUpperCase();
  
  // Check for explicit currency codes and symbols
  if (upperText.includes("EUR") || upperText.includes("€")) return "EUR";
  if (upperText.includes("GBP") || upperText.includes("£")) return "GBP";
  if (upperText.includes("USD") || upperText.includes("$")) return "USD";
  
  // Default to EUR
  return DEFAULT_CURRENCY;
}
