/**
 * Statistical Inference Functions
 */

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  marginOfError: number;
  confidence: number;
}

/**
 * Z-scores for common confidence levels
 */
const Z_SCORES: Record<number, number> = {
  0.80: 1.28,
  0.85: 1.44,
  0.90: 1.645,
  0.95: 1.96,
  0.99: 2.576,
};

/**
 * Calculate margin of error for a proportion
 * @param sampleProportion The observed proportion (0-1)
 * @param sampleSize The sample size
 * @param confidence Confidence level (default 0.95)
 */
export function calculateMarginOfError(
  sampleProportion: number,
  sampleSize: number,
  confidence = 0.95
): number {
  if (sampleSize <= 0) return 0;

  const z = Z_SCORES[confidence] ?? 1.96;
  const p = Math.max(0, Math.min(1, sampleProportion));

  return z * Math.sqrt((p * (1 - p)) / sampleSize);
}

/**
 * Calculate confidence interval for a proportion
 * @param sampleProportion The observed proportion (0-1)
 * @param sampleSize The sample size
 * @param confidence Confidence level (default 0.95)
 */
export function calculateConfidenceInterval(
  sampleProportion: number,
  sampleSize: number,
  confidence = 0.95
): ConfidenceInterval {
  const moe = calculateMarginOfError(sampleProportion, sampleSize, confidence);

  return {
    lower: Math.max(0, sampleProportion - moe),
    upper: Math.min(1, sampleProportion + moe),
    marginOfError: moe,
    confidence,
  };
}

/**
 * Calculate the required sample size for a desired margin of error
 * @param desiredMarginOfError The desired margin of error
 * @param estimatedProportion Estimated proportion (use 0.5 if unknown for most conservative estimate)
 * @param confidence Confidence level (default 0.95)
 */
export function calculateRequiredSampleSize(
  desiredMarginOfError: number,
  estimatedProportion = 0.5,
  confidence = 0.95
): number {
  if (desiredMarginOfError <= 0) return Infinity;

  const z = Z_SCORES[confidence] ?? 1.96;
  const p = Math.max(0, Math.min(1, estimatedProportion));

  return Math.ceil((z * z * p * (1 - p)) / (desiredMarginOfError * desiredMarginOfError));
}

/**
 * Calculate confidence interval for a mean
 * @param sampleMean The sample mean
 * @param sampleStdDev The sample standard deviation
 * @param sampleSize The sample size
 * @param confidence Confidence level (default 0.95)
 */
export function calculateMeanConfidenceInterval(
  sampleMean: number,
  sampleStdDev: number,
  sampleSize: number,
  confidence = 0.95
): ConfidenceInterval {
  if (sampleSize <= 1) {
    return {
      lower: sampleMean,
      upper: sampleMean,
      marginOfError: 0,
      confidence,
    };
  }

  const z = Z_SCORES[confidence] ?? 1.96;
  const standardError = sampleStdDev / Math.sqrt(sampleSize);
  const moe = z * standardError;

  return {
    lower: sampleMean - moe,
    upper: sampleMean + moe,
    marginOfError: moe,
    confidence,
  };
}

/**
 * Two-proportion z-test
 * Tests if two proportions are significantly different
 */
export function twoProportionZTest(
  successes1: number,
  n1: number,
  successes2: number,
  n2: number,
  alpha = 0.05
): { zScore: number; pValue: number; significant: boolean } {
  if (n1 <= 0 || n2 <= 0) {
    return { zScore: 0, pValue: 1, significant: false };
  }

  const p1 = successes1 / n1;
  const p2 = successes2 / n2;
  const pooledP = (successes1 + successes2) / (n1 + n2);

  const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

  if (standardError === 0) {
    return { zScore: 0, pValue: 1, significant: false };
  }

  const zScore = (p1 - p2) / standardError;

  // Two-tailed p-value
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  return {
    zScore,
    pValue,
    significant: pValue < alpha,
  };
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
