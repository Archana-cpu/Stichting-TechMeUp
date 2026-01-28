/**
 * Hypothesis Testing Functions
 */

export interface ChiSquareResult {
  chiSquare: number;
  degreesOfFreedom: number;
  pValue: number;
  significant: boolean;
}

/**
 * Perform a chi-square goodness of fit test
 * Tests if observed frequencies match expected frequencies
 * @param observed Array of observed counts
 * @param expected Array of expected counts (or null for uniform distribution)
 * @param alpha Significance level (default 0.05)
 */
export function chiSquareTest(
  observed: number[],
  expected: number[] | null = null,
  alpha = 0.05
): ChiSquareResult {
  if (observed.length === 0) {
    return {
      chiSquare: 0,
      degreesOfFreedom: 0,
      pValue: 1,
      significant: false,
    };
  }

  // If no expected values provided, assume uniform distribution
  const total = observed.reduce((sum, val) => sum + val, 0);
  const exp = expected ?? observed.map(() => total / observed.length);

  if (observed.length !== exp.length) {
    throw new Error("Observed and expected arrays must have the same length");
  }

  // Calculate chi-square statistic
  let chiSquare = 0;
  for (let i = 0; i < observed.length; i++) {
    const o = observed[i] ?? 0;
    const e = exp[i] ?? 1;
    if (e === 0) continue;
    chiSquare += Math.pow(o - e, 2) / e;
  }

  const df = observed.length - 1;
  const pValue = 1 - chiSquareCDF(chiSquare, df);

  return {
    chiSquare,
    degreesOfFreedom: df,
    pValue,
    significant: pValue < alpha,
  };
}

/**
 * Approximate chi-square CDF using the regularized incomplete gamma function
 * This is a simplified approximation for practical use
 */
function chiSquareCDF(x: number, df: number): number {
  if (x <= 0) return 0;
  if (df <= 0) return 0;

  // Use Wilson-Hilferty approximation for larger df
  if (df > 100) {
    const z = Math.pow(x / df, 1 / 3) - (1 - 2 / (9 * df));
    const denominator = Math.sqrt(2 / (9 * df));
    return normalCDF(z / denominator);
  }

  // Use series expansion for smaller df
  const k = df / 2;
  const lambda = x / 2;
  return lowerIncompleteGamma(k, lambda) / gamma(k);
}

/**
 * Standard normal CDF approximation
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Gamma function approximation using Stirling's formula
 */
function gamma(n: number): number {
  if (n <= 0) return Infinity;
  if (Number.isInteger(n) && n <= 20) {
    // Use factorial for small integers
    let result = 1;
    for (let i = 2; i < n; i++) {
      result *= i;
    }
    return result;
  }
  // Stirling's approximation
  return Math.sqrt((2 * Math.PI) / n) * Math.pow(n / Math.E, n);
}

/**
 * Lower incomplete gamma function approximation
 */
function lowerIncompleteGamma(s: number, x: number): number {
  if (x <= 0) return 0;

  // Series expansion
  let sum = 0;
  let term = 1 / s;
  sum = term;

  for (let n = 1; n < 100; n++) {
    term *= x / (s + n);
    sum += term;
    if (Math.abs(term) < 1e-10) break;
  }

  return Math.pow(x, s) * Math.exp(-x) * sum;
}
