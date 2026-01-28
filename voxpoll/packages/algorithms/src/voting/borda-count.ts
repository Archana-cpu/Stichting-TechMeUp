/**
 * Borda Count voting method
 */

export interface RankedVote {
  rankings: string[]; // Option IDs in order of preference
  weight?: number;
}

export interface BordaCountResult {
  scores: Map<string, number>;
  ranking: Array<{ optionId: string; score: number }>;
  winner: string | null;
  isTie: boolean;
}

/**
 * Calculate results using Borda Count
 * Each position in the ranking earns points (n-1 for 1st, n-2 for 2nd, etc.)
 * The option with the most points wins
 */ 
export function calculateBordaCount(
  votes: RankedVote[],
  optionIds: string[]
): BordaCountResult {
  if (votes.length === 0 || optionIds.length === 0) {
    return {
      scores: new Map(),
      ranking: [],
      winner: null,
      isTie: false,
    };
  }

  const scores = new Map<string, number>();
  const n = optionIds.length;

  // Initialize scores
  for (const optionId of optionIds) {
    scores.set(optionId, 0);
  }

  // Calculate Borda scores
  for (const vote of votes) {
    const weight = vote.weight ?? 1;
    for (let i = 0; i < vote.rankings.length && i < n; i++) {
      const optionId = vote.rankings[i];
      if (optionId && scores.has(optionId)) {
        // Points: n-1 for 1st place, n-2 for 2nd, etc.
        const points = (n - 1 - i) * weight;
        scores.set(optionId, (scores.get(optionId) ?? 0) + points);
      }
    }
  }

  // Create ranking
  const ranking = Array.from(scores.entries())
    .map(([optionId, score]) => ({ optionId, score }))
    .sort((a, b) => b.score - a.score);

  // Determine winner
  const maxScore = ranking[0]?.score ?? 0;
  const topOptions = ranking.filter((r) => r.score === maxScore);
  const isTie = topOptions.length > 1;

  return {
    scores,
    ranking,
    winner: isTie ? null : (ranking[0]?.optionId ?? null),
    isTie,
  };
}