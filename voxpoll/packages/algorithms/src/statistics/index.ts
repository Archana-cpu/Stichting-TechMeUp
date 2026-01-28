/**
 * Statistical Functions
 */

export {
  mean,
  median,
  mode,
  variance,
  standardDeviation,
  percentile,
  quartiles,
} from "./descriptive.js";

export {
  chiSquareTest,
  type ChiSquareResult,
} from "./hypothesis.js";

export {
  calculateMarginOfError,
  calculateConfidenceInterval,
  type ConfidenceInterval,
} from "./inference.js";
