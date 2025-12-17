export const useMoney = () => {
  /**
   * Formats a number in cents into a localized currency string.
   * @param cents The amount in cents (e.g., 1234)
   * @returns A formatted currency string (e.g., "€12.34")
   */
  const format = (cents: number | null | undefined): string => {
    if (cents === null || cents === undefined) {
      cents = 0;
    }
    const amountInEuros = cents / 100;
    return new Intl.NumberFormat("nl", {
      style: "currency",
      currency: "EUR",
    }).format(amountInEuros);
  };

  /**
   * Parses a string or number representing euros into cents.
   * @param euroValue The value in euros (e.g., "12,34" or 12.34)
   * @returns The amount in cents as an integer (e.g., 1234)
   */
  const parse = (euroValue: string | number | null | undefined): number => {
    if (euroValue === null || euroValue === undefined) {
      return 0;
    }

    const cleanString = String(euroValue).replace(",", ".");

    const sanitizedString = cleanString.replace(/[^\d.]/g, "");

    const parsedFloat = parseFloat(sanitizedString);

    if (isNaN(parsedFloat)) {
      return 0;
    }

    return Math.round(parsedFloat * 100);
  };

  const toEuro = (cents: string | number | null | undefined): number => {
    if (cents === null || cents === undefined) {
      return 0;
    }
    return Number(cents) / 100;
  };

  return { format, parse, toEuro };
};
