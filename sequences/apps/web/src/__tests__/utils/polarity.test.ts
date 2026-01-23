import { describe, it, expect } from 'vitest';

// ============================================================================
// POLARITY CALCULATION TESTS
// ============================================================================

function calculatePolarity(sequence: {
  emotionPolarity: number;
  emotionIntensity: number;
  thoughtPolarity: number;
  thoughtIntensity: number;
  behaviorPolarity: number;
  behaviorImpact: number;
}): number {
  const emotionScore = sequence.emotionPolarity * sequence.emotionIntensity;
  const thoughtScore = sequence.thoughtPolarity * sequence.thoughtIntensity;
  const behaviorScore = sequence.behaviorPolarity * sequence.behaviorImpact;
  return Math.round((emotionScore + thoughtScore + behaviorScore) / 3);
}

describe('calculatePolarity', () => {
  it('should return positive value for positive inputs', () => {
    const sequence = {
      emotionPolarity: 5,
      emotionIntensity: 4,
      thoughtPolarity: 3,
      thoughtIntensity: 3,
      behaviorPolarity: 4,
      behaviorImpact: 5,
    };
    expect(calculatePolarity(sequence)).toBeGreaterThan(0);
  });

  it('should return negative value for negative inputs', () => {
    const sequence = {
      emotionPolarity: -5,
      emotionIntensity: 4,
      thoughtPolarity: -3,
      thoughtIntensity: 3,
      behaviorPolarity: -4,
      behaviorImpact: 5,
    };
    expect(calculatePolarity(sequence)).toBeLessThan(0);
  });

  it('should return zero for balanced inputs', () => {
    const sequence = {
      emotionPolarity: 0,
      emotionIntensity: 5,
      thoughtPolarity: 0,
      thoughtIntensity: 5,
      behaviorPolarity: 0,
      behaviorImpact: 5,
    };
    expect(calculatePolarity(sequence)).toBe(0);
  });

  it('should handle mixed polarity inputs', () => {
    const sequence = {
      emotionPolarity: 5,
      emotionIntensity: 3,
      thoughtPolarity: -5,
      thoughtIntensity: 3,
      behaviorPolarity: 0,
      behaviorImpact: 3,
    };
    expect(calculatePolarity(sequence)).toBe(0);
  });

  it('should weight by intensity/impact', () => {
    const lowIntensity = {
      emotionPolarity: 5,
      emotionIntensity: 1,
      thoughtPolarity: 5,
      thoughtIntensity: 1,
      behaviorPolarity: 5,
      behaviorImpact: 1,
    };

    const highIntensity = {
      emotionPolarity: 5,
      emotionIntensity: 5,
      thoughtPolarity: 5,
      thoughtIntensity: 5,
      behaviorPolarity: 5,
      behaviorImpact: 5,
    };

    expect(calculatePolarity(highIntensity)).toBeGreaterThan(calculatePolarity(lowIntensity));
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('calculatePolarity edge cases', () => {
  it('should handle extreme values', () => {
    const extreme = {
      emotionPolarity: 10,
      emotionIntensity: 5,
      thoughtPolarity: 10,
      thoughtIntensity: 5,
      behaviorPolarity: 10,
      behaviorImpact: 5,
    };
    expect(calculatePolarity(extreme)).toBe(50);
  });

  it('should handle minimum values', () => {
    const minimum = {
      emotionPolarity: -10,
      emotionIntensity: 5,
      thoughtPolarity: -10,
      thoughtIntensity: 5,
      behaviorPolarity: -10,
      behaviorImpact: 5,
    };
    expect(calculatePolarity(minimum)).toBe(-50);
  });

  it('should handle zero intensity', () => {
    const zeroIntensity = {
      emotionPolarity: 10,
      emotionIntensity: 0,
      thoughtPolarity: 10,
      thoughtIntensity: 0,
      behaviorPolarity: 10,
      behaviorImpact: 0,
    };
    expect(calculatePolarity(zeroIntensity)).toBe(0);
  });
});
