import type { Emotion, Trigger, Sequence, Person, SequencePerson } from '@seq/database';

// ============================================================================
// SEQUENCE TYPES
// ============================================================================

export type SequenceWithRelations = Sequence & {
  emotion: Emotion;
  trigger: Trigger;
  people: (SequencePerson & { person: Person })[];
  _count: { reactions: number; comments: number };
};

// ============================================================================
// VIEW MODES
// ============================================================================

export type ViewMode = 'grid' | 'list' | 'timeline' | 'canvas';
export type CanvasLayout = 'horizontal' | 'vertical' | 'free';

// ============================================================================
// STORYBOARD PROPS
// ============================================================================

export type StoryboardProps = {
  initialSequences: SequenceWithRelations[];
  emotions: Emotion[];
  triggers: Trigger[];
  userPreferences?: {
    viewMode: ViewMode;
    canvasLayout: CanvasLayout;
  };
};

// ============================================================================
// NODE POSITION (FOR CANVAS MODE)
// ============================================================================

export type NodePosition = {
  id: string;
  x: number;
  y: number;
};

// ============================================================================
// FILTER STATE
// ============================================================================

export type FilterState = {
  searchQuery: string;
  emotionFilter: string;
  triggerFilter: string;
  personFilter: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  sortBy: 'newest' | 'oldest' | 'mostPositive' | 'mostNegative';
};

// ============================================================================
// POLARITY HELPERS
// ============================================================================

export function calculatePolarity(sequence: SequenceWithRelations): number {
  const emotionScore = sequence.emotionPolarity * sequence.emotionIntensity;
  const thoughtScore = sequence.thoughtPolarity * sequence.thoughtIntensity;
  const behaviorScore = sequence.behaviorPolarity * sequence.behaviorImpact;
  return Math.round((emotionScore + thoughtScore + behaviorScore) / 3);
}

export function getPolarityColor(polarity: number): string {
  if (polarity > 25) return 'bg-emerald-500';
  if (polarity > 10) return 'bg-green-500';
  if (polarity > 0) return 'bg-green-400';
  if (polarity === 0) return 'bg-slate-400';
  if (polarity > -10) return 'bg-orange-400';
  if (polarity > -25) return 'bg-red-400';
  return 'bg-red-500';
}

export function getPolarityGradient(polarity: number): string {
  if (polarity > 25) return 'from-emerald-500/20 to-emerald-600/10';
  if (polarity > 10) return 'from-green-500/20 to-green-600/10';
  if (polarity > 0) return 'from-green-400/20 to-green-500/10';
  if (polarity === 0) return 'from-slate-400/20 to-slate-500/10';
  if (polarity > -10) return 'from-orange-400/20 to-orange-500/10';
  if (polarity > -25) return 'from-red-400/20 to-red-500/10';
  return 'from-red-500/20 to-red-600/10';
}
