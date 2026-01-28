/**
 * Ranked Choice Voting (Instant Runoff Voting)
 */

export interface RankedVote {
  rankings: string[]; // Option IDs in order of preference (index 0 = first choice)
  weight?: number;
}

export interface RoundResult {
  round: number;
  counts: Map<string, number>;
  eliminated: string | null;
  winner: string | null;
}

export interface RankedChoiceResult {
  winner: string | null;
  rounds: RoundResult[];
  finalCounts: Map<string, number>;
  isTie: boolean;
}

/**
 * Calculate results using Ranked Choice Voting (Instant Runoff)
 * Voters rank options in order of preference
 * If no majority, the last-place option is eliminated and votes are redistributed
 */
export function calculateRankedChoice(
  votes: RankedVote[],
  optionIds: string[]
): RankedChoiceResult {
  if (votes.length === 0 || optionIds.length === 0) {
    return {
      winner: null,
      rounds: [],
      finalCounts: new Map(),
      isTie: false,
    };
  }

  const rounds: RoundResult[] = [];
  let eliminatedOptions = new Set<string>();
  let currentVotes = votes.map((v) => ({ ...v }));
  const totalWeight = votes.reduce((sum, v) => sum + (v.weight ?? 1), 0);
  const majorityThreshold = totalWeight / 2;

  while (true) {
    // Count first-choice votes for remaining options
    const counts = new Map<string, number>();
    for (const optionId of optionIds) {
      if (!eliminatedOptions.has(optionId)) {
        counts.set(optionId, 0);
      }
    }

    for (const vote of currentVotes) {
      const weight = vote.weight ?? 1;
      // Find the highest-ranked non-eliminated option
      const firstChoice = vote.rankings.find((id) => !eliminatedOptions.has(id));
      if (firstChoice && counts.has(firstChoice)) {
        counts.set(firstChoice, (counts.get(firstChoice) ?? 0) + weight);
      }
    }

    // Check for a winner (majority)
    for (const [optionId, count] of counts.entries()) {
      if (count > majorityThreshold) {
        const round: RoundResult = {
          round: rounds.length + 1,
          counts: new Map(counts),
          eliminated: null,
          winner: optionId,
        };
        rounds.push(round);
        return {
          winner: optionId,
          rounds,
          finalCounts: counts,
          isTie: false,
        };
      }
    }

    // Check if only one option remains
    const remainingOptions = Array.from(counts.keys());
    if (remainingOptions.length === 1) {
      const round: RoundResult = {
        round: rounds.length + 1,
        counts: new Map(counts),
        eliminated: null,
        winner: remainingOptions[0] ?? null,
      };
      rounds.push(round);
      return {
        winner: remainingOptions[0] ?? null,
        rounds,
        finalCounts: counts,
        isTie: false,
      };
    }

    // Check for tie (all remaining have same count)
    const uniqueCounts = new Set(counts.values());
    if (uniqueCounts.size === 1 && remainingOptions.length > 1) {
      const round: RoundResult = {
        round: rounds.length + 1,
        counts: new Map(counts),
        eliminated: null,
        winner: null,
      };
      rounds.push(round);
      return {
        winner: null,
        rounds,
        finalCounts: counts,
        isTie: true,
      };
    }

    // Find and eliminate the option with the fewest votes
    let minCount = Infinity;
    let toEliminate: string | null = null;
    for (const [optionId, count] of counts.entries()) {
      if (count < minCount) {
        minCount = count;
        toEliminate = optionId;
      }
    }

    if (toEliminate) {
      eliminatedOptions.add(toEliminate);
      const round: RoundResult = {
        round: rounds.length + 1,
        counts: new Map(counts),
        eliminated: toEliminate,
        winner: null,
      };
      rounds.push(round);
    }

    // Safety check to prevent infinite loops
    if (rounds.length > optionIds.length) {
      return {
        winner: null,
        rounds,
        finalCounts: counts,
        isTie: true,
      };
    }
  }
}
