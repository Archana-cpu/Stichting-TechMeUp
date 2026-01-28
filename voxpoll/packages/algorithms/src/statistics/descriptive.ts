/**
 * Descriptive Statistics Functions
 */

/**
 * Calculate the arithmetic mean (average)
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate the median (middle value)
 */
export function median(values: number[]): number {
  
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
  }
  return sorted[mid] ?? 0;
}

/**
 * Calculate the mode (most frequent value)
 * Returns all modes if there are ties
 */
export function mode(values: number[]): number[] {

  if (values.length === 0) return [];

  const frequency = new Map<number, number>();
  let maxFreq = 0;

  for (const val of values) {
    const freq = (frequency.get(val) ?? 0) + 1;
    frequency.set(val, freq);
    maxFreq = Math.max(maxFreq, freq);
  }

  const modes: number[] = [];
  for (const [val, freq] of frequency.entries()) {
    if (freq === maxFreq) {
      modes.push(val);
    }
  }

  return modes.sort((a, b) => a - b);
}

/**
 * Calculate the variance (population variance)
 */
export function variance(values: number[], sample = false): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return 0;

  const avg = mean(values);
  const squaredDiffs = values.map((val) => Math.pow(val - avg, 2));
  const divisor = sample ? values.length - 1 : values.length;

  return squaredDiffs.reduce((sum, val) => sum + val, 0) / divisor;
}

/**
 * Calculate the standard deviation
 */
export function standardDeviation(values: number[], sample = false): number {
  return Math.sqrt(variance(values, sample));
}

/**
 * Calculate a specific percentile
 * @param values Array of numbers
 * @param p Percentile (0-100)
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  if (p < 0 || p > 100) throw new Error("Percentile must be between 0 and 100");

  const sorted = [...values].sort((a, b) => a - b);

  if (p === 0) return sorted[0] ?? 0;
  if (p === 100) return sorted[sorted.length - 1] ?? 0;

  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  const lowerVal = sorted[lower] ?? 0;
  const upperVal = sorted[upper] ?? 0;

  return lowerVal + weight * (upperVal - lowerVal);
}

/**
 * Calculate quartiles (Q1, Q2, Q3)
 */
export function quartiles(values: number[]): { q1: number; q2: number; q3: number } {
  return {
    q1: percentile(values, 25),
    q2: percentile(values, 50), // Same as median
    q3: percentile(values, 75),
  };
}

/**
 * Calculate the interquartile range (IQR)
 */
export function interquartileRange(values: number[]): number {
  const q = quartiles(values);
  return q.q3 - q.q1;
}

/**
 * Identify outliers using the IQR method
 */
export function findOutliers(values: number[]): { lower: number[]; upper: number[] } {
  const q = quartiles(values);
  const iqr = q.q3 - q.q1;
  const lowerBound = q.q1 - 1.5 * iqr;
  const upperBound = q.q3 + 1.5 * iqr;

  return {
    lower: values.filter((v) => v < lowerBound),
    upper: values.filter((v) => v > upperBound),
  };
}
