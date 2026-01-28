/**
 * Wilson Score Interval
 * Used for ranking items with positive/negative votes
 * Accounts for sample size uncertainty
 */

export interface WilsonScoreInput {
  positive: number; // Number of positive votes/upvotes
  negative: number; // Number of negative votes/downvotes
  confidence?: number; // Confidence level (default 0.95 for 95%)
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
 * Calculate the lower bound of Wilson score interval
 * This is used for ranking - items with more votes AND higher positive ratio rank higher
 * Handles the "0 votes" and "few votes" cases better than simple percentage
 */
export function calculateWilsonScore(input: WilsonScoreInput): number {
  const { positive, negative, confidence = 0.95 } = input;
  const n = positive + negative;

  if (n === 0) return 0;

  const z = Z_SCORES[confidence] ?? 1.96;
  const phat = positive / n;

  // Wilson score interval lower bound formula
  const denominator = 1 + (z * z) / n;
  const numerator =
    phat +
    (z * z) / (2 * n) -
    z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n);

  return numerator / denominator;
}

/**
 * Calculate both lower and upper bounds of Wilson score interval
 */
export function calculateWilsonInterval(
  input: WilsonScoreInput
): { lower: number; upper: number } {
  const { positive, negative, confidence = 0.95 } = input;
  const n = positive + negative;

  if (n === 0) return { lower: 0, upper: 0 };

  const z = Z_SCORES[confidence] ?? 1.96;
  const phat = positive / n;

  const denominator = 1 + (z * z) / n;
  const centerAdjustment = (z * z) / (2 * n);
  const spreadAdjustment = z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n);

  return {
    lower: (phat + centerAdjustment - spreadAdjustment) / denominator,
    upper: (phat + centerAdjustment + spreadAdjustment) / denominator,
  };
}
