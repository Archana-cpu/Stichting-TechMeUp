/**
 * Hot Score Algorithm
 * Similar to Reddit's hot ranking algorithm
 * Combines popularity with recency
 */

export interface HotScoreInput {
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  referenceDate?: Date; // Default: now
}

/**
 * Calculate a "hot" score that balances popularity with recency
 * Higher scores = more popular and/or more recent
 */
export function calculateHotScore(input: HotScoreInput): number {
  const { upvotes, downvotes, createdAt } = input;
  const referenceDate = input.referenceDate ?? new Date();

  // Calculate net score (can be negative)
  const score = upvotes - downvotes;

  // Logarithmic scaling of the score magnitude
  // This prevents posts with massive scores from dominating forever
  const magnitude = Math.log10(Math.max(Math.abs(score), 1));

  // Sign of the score (-1, 0, or 1)
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;

  // Time factor: seconds since a fixed epoch (similar to Reddit)
  // We use Jan 1, 2024 as our epoch
  const epoch = new Date("2024-01-01T00:00:00Z").getTime();
  const seconds = (createdAt.getTime() - epoch) / 1000;

  // The time divisor determines how quickly posts decay
  // 45000 seconds = 12.5 hours
  // After 12.5 hours, a post needs ~10x the score to maintain the same ranking
  const timeDivisor = 45000;

  return sign * magnitude + seconds / timeDivisor;
}

/**
 * Calculate a controversy score
 * Higher when votes are evenly split between up and down
 */
export function calculateControversy(upvotes: number, downvotes: number): number {
  const total = upvotes + downvotes;
  if (total === 0) return 0;

  // Controversy is highest when votes are 50/50
  const balance = Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes, 1);

  // Scale by total votes (more votes = more controversial if balanced)
  return Math.pow(total, balance);
}

/**
 * Calculate a "best" score using Wilson score with time decay
 * Good for showing the best content from all time with slight recency bias
 */
export function calculateBestScore(input: HotScoreInput): number {
  const { upvotes, downvotes, createdAt } = input;
  const referenceDate = input.referenceDate ?? new Date();

  // Wilson score for quality
  const total = upvotes + downvotes;
  if (total === 0) return 0;

  const z = 1.96; // 95% confidence
  const phat = upvotes / total;
  const wilsonLower =
    (phat +
      (z * z) / (2 * total) -
      z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * total)) / total)) /
    (1 + (z * z) / total);

  // Very slight time decay (1 week half-life)
  const ageInDays = (referenceDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const timeFactor = Math.pow(0.5, ageInDays / 7);

  // Combine with slight weight towards quality
  return wilsonLower * 0.9 + wilsonLower * timeFactor * 0.1;
}
