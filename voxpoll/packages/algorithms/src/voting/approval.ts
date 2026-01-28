/**
 * Approval Voting
 */

export interface ApprovalVote {
  approvedOptions: string[]; // Option IDs the voter approves of
  weight?: number;
}

export interface ApprovalResult {
  counts: Map<string, number>;
  ranking: Array<{ optionId: string; count: number; approvalRate: number }>;
  winner: string | null;
  isTie: boolean;
  totalVoters: number;
}

/**
 * Calculate results using Approval Voting
 * Voters can approve of as many options as they like
 * The option with the most approvals wins
 */
export function calculateApprovalVoting(
  votes: ApprovalVote[],
  optionIds: string[]
): ApprovalResult {
  if (votes.length === 0 || optionIds.length === 0) {
    return {
      counts: new Map(),
      ranking: [],
      winner: null,
      isTie: false,
      totalVoters: 0,
    };
  }

  const counts = new Map<string, number>();
  const totalWeight = votes.reduce((sum, v) => sum + (v.weight ?? 1), 0);

  // Initialize counts
  for (const optionId of optionIds) {
    counts.set(optionId, 0);
  }

  // Count approvals
  for (const vote of votes) {
    const weight = vote.weight ?? 1;
    for (const optionId of vote.approvedOptions) {
      if (counts.has(optionId)) {
        counts.set(optionId, (counts.get(optionId) ?? 0) + weight);
      }
    }
  }

  // Create ranking with approval rates
  const ranking = Array.from(counts.entries())
    .map(([optionId, count]) => ({
      optionId,
      count,
      approvalRate: totalWeight > 0 ? (count / totalWeight) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Determine winner
  const maxCount = ranking[0]?.count ?? 0;
  const topOptions = ranking.filter((r) => r.count === maxCount);
  const isTie = topOptions.length > 1;

  return {
    counts,
    ranking,
    winner: isTie ? null : (ranking[0]?.optionId ?? null),
    isTie,
    totalVoters: votes.length,
  };
}
