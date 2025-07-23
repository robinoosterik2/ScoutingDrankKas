function euroToCents(euro: number): number {
  return Math.round((typeof euro === "string" ? parseFloat(euro) : euro) * 100);
}

function centsToEuro(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

export { euroToCents, centsToEuro };
