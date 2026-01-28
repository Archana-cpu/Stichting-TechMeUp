/**
 * Simple plurality voting (first-past-the-post)
 */

export interface Vote {
  optionId: string;
  weight?: number;
}

export interface SimpleVoteResult {
  optionId: string;
  count: number;
  percentage: number;
}

export interface SimpleVoteOutput {
  results: SimpleVoteResult[];
  totalVotes: number;
  winner: SimpleVoteResult | null;
  isTie: boolean;
}

/**
 * Calculate results for simple plurality voting
 * Each voter selects one option, the option with the most votes wins
 */
export function calculateSimpleVote(votes: Vote[]): SimpleVoteOutput {
  if (votes.length === 0) {
    return {
      results: [],
      totalVotes: 0,
      winner: null,
      isTie: false,
    };
  }

  // Count votes with optional weighting
  const voteCounts = new Map<string, number>();
  let totalWeight = 0;

  for (const vote of votes) {
    const weight = vote.weight ?? 1;
    const currentCount = voteCounts.get(vote.optionId) ?? 0;
    voteCounts.set(vote.optionId, currentCount + weight);
    totalWeight += weight;
  }

  // Convert to results array
  const results: SimpleVoteResult[] = Array.from(voteCounts.entries())
    .map(([optionId, count]) => ({
      optionId,
      count,
      percentage: totalWeight > 0 ? (count / totalWeight) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Determine winner
  const maxCount = results[0]?.count ?? 0;
  const topOptions = results.filter((r) => r.count === maxCount);
  const isTie = topOptions.length > 1;

  return {
    results,
    totalVotes: votes.length,
    winner: isTie ? null : (results[0] ?? null),
    isTie,
  };
}
