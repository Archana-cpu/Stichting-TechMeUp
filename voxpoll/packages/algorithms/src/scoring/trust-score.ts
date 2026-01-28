/**
 * User Trust Score calculation
 */

export interface TrustScoreInput {
  accountAge: number; // Days since account creation
  emailVerified: boolean;
  phoneVerified: boolean;
  pollsCreated: number;
  pollsParticipated: number;
  commentsCount: number;
  reportsAgainst: number;
  reportsSubmitted: number;
  accurateReports: number; // Reports that were acted upon
  warningsReceived: number;
  bansReceived: number;
}

export interface TrustScoreResult {
  score: number; // 0-100
  level: "untrusted" | "new" | "basic" | "trusted" | "verified" | "expert";
  factors: {
    accountAge: number;
    verification: number;
    activity: number;
    reputation: number;
  };
}

/**
 * Calculate a user's trust score based on various factors
 * Score ranges from 0-100
 */
export function calculateTrustScore(input: TrustScoreInput): TrustScoreResult {
  // Account age factor (0-20 points)
  // Logarithmic growth: most benefit in first year
  const ageScore = Math.min(20, Math.log10(input.accountAge + 1) * 8);

  // Verification factor (0-20 points)
  let verificationScore = 0;
  if (input.emailVerified) verificationScore += 10;
  if (input.phoneVerified) verificationScore += 10;

  // Activity factor (0-30 points)
  const pollActivity = Math.min(15, Math.log10(input.pollsCreated + input.pollsParticipated + 1) * 5);
  const commentActivity = Math.min(10, Math.log10(input.commentsCount + 1) * 4);
  const reportQuality = input.reportsSubmitted > 0
    ? Math.min(5, (input.accurateReports / input.reportsSubmitted) * 5)
    : 0;
  const activityScore = pollActivity + commentActivity + reportQuality;

  // Reputation factor (0-30 points, can go negative)
  const baseReputation = 30;
  const reportPenalty = input.reportsAgainst * 2;
  const warningPenalty = input.warningsReceived * 5;
  const banPenalty = input.bansReceived * 15;
  const reputationScore = Math.max(0, baseReputation - reportPenalty - warningPenalty - banPenalty);

  // Calculate total score
  const totalScore = Math.round(
    Math.max(0, Math.min(100, ageScore + verificationScore + activityScore + reputationScore))
  );

  // Determine trust level
  let level: TrustScoreResult["level"];
  if (totalScore < 10 || input.bansReceived > 0) {
    level = "untrusted";
  } else if (totalScore < 25) {
    level = "new";
  } else if (totalScore < 50) {
    level = "basic";
  } else if (totalScore < 75) {
    level = "trusted";
  } else if (totalScore < 90) {
    level = "verified";
  } else {
    level = "expert";
  }

  return {
    score: totalScore,
    level,
    factors: {
      accountAge: Math.round(ageScore),
      verification: Math.round(verificationScore),
      activity: Math.round(activityScore),
      reputation: Math.round(reputationScore),
    },
  };
}
