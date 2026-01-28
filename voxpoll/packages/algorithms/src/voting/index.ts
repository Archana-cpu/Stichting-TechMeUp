/**
 * Voting Algorithms
 */

export { calculateSimpleVote, type Vote, type SimpleVoteResult, type SimpleVoteOutput } from "./simple.js";
export { calculateRankedChoice, type RankedChoiceResult } from "./ranked-choice.js";
export { calculateBordaCount, type BordaCountResult } from "./borda-count.js";
export { calculateApprovalVoting, type ApprovalResult } from "./approval.js";
