const VND_ROUNDING_INCREMENT = 1000;
const USD_CENTS_PER_USD = 100;

export function convertUsdCentsToRoundedVnd(usdCents: number, usdToVndRate: number): number {
  assertNonNegativeInteger(usdCents, 'usdCents');
  assertPositiveInteger(usdToVndRate, 'usdToVndRate');

  const rawVnd = Math.ceil((usdCents * usdToVndRate) / USD_CENTS_PER_USD);
  return roundUpToNearest(rawVnd, VND_ROUNDING_INCREMENT);
}

function roundUpToNearest(value: number, increment: number): number {
  if (value === 0) {
    return 0;
  }

  return Math.ceil(value / increment) * increment;
}

function assertNonNegativeInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer`);
  }
}

function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
}

