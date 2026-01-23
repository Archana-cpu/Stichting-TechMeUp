'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Progress } from '@seq/ui';
import {
  Brain,
  Heart,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import type { Emotion, Trigger, Sequence } from '@seq/database';

// ============================================================================
// TYPES
// ============================================================================

type SequenceWithRelations = Sequence & {
  emotion: Emotion;
  trigger: Trigger;
};

type CbtAnalysisProps = {
  sequences: SequenceWithRelations[];
};

type InsightType = 'positive' | 'negative' | 'neutral' | 'warning';

type Insight = {
  type: InsightType;
  title: string;
  description: string;
  icon: React.ReactNode;
};

// ============================================================================
// CBT ANALYSIS COMPONENT
// ============================================================================

export function CbtAnalysis({ sequences }: CbtAnalysisProps) {
  const t = useTranslations('sequence');
  const tEmotions = useTranslations('emotions');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const analysis = useMemo(() => {
    if (sequences.length === 0) {
      return null;
    }

    const totalEmotionPolarity = sequences.reduce((sum, s) => sum + s.emotionPolarity * s.emotionIntensity, 0);
    const totalThoughtPolarity = sequences.reduce((sum, s) => sum + s.thoughtPolarity * s.thoughtIntensity, 0);
    const totalBehaviorPolarity = sequences.reduce((sum, s) => sum + s.behaviorPolarity * s.behaviorImpact, 0);

    const avgEmotionScore = totalEmotionPolarity / sequences.length;
    const avgThoughtScore = totalThoughtPolarity / sequences.length;
    const avgBehaviorScore = totalBehaviorPolarity / sequences.length;
    const overallScore = (avgEmotionScore + avgThoughtScore + avgBehaviorScore) / 3;

    const emotionCounts = sequences.reduce<Record<string, number>>((acc, s) => {
      acc[s.emotion.key] = (acc[s.emotion.key] || 0) + 1;
      return acc;
    }, {});

    const triggerCounts = sequences.reduce<Record<string, number>>((acc, s) => {
      acc[s.trigger.key] = (acc[s.trigger.key] || 0) + 1;
      return acc;
    }, {});

    const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
    const dominantTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];

    const recentSequences = sequences.slice(-7);
    const lastSequence = recentSequences[recentSequences.length - 1];
    const firstSequence = recentSequences[0];
    const recentTrend = recentSequences.length > 1 && lastSequence && firstSequence
      ? (lastSequence.emotionPolarity - firstSequence.emotionPolarity)
      : 0;

    const highIntensityCount = sequences.filter(
      (s) => s.emotionIntensity >= 4 || s.thoughtIntensity >= 4 || s.behaviorImpact >= 4
    ).length;

    return {
      avgEmotionScore,
      avgThoughtScore,
      avgBehaviorScore,
      overallScore,
      emotionCounts,
      triggerCounts,
      dominantEmotion,
      dominantTrigger,
      recentTrend,
      highIntensityCount,
      totalSequences: sequences.length,
    };
  }, [sequences]);

  // ============================================================================
  // INSIGHTS GENERATION (CBT-BASED)
  // ============================================================================

  const insights = useMemo((): Insight[] => {
    if (!analysis) return [];

    const result: Insight[] = [];

    if (analysis?.overallScore && analysis.overallScore > 15) {
      result.push({
        type: 'positive',
        title: 'Positive Pattern',
        description: 'Your recent sequences show predominantly positive emotional and behavioral patterns. Continue reinforcing these healthy responses.',
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
    } else if (analysis?.overallScore && analysis.overallScore < -15) {
      result.push({
        type: 'negative',
        title: 'Challenging Period',
        description: 'Your sequences indicate a challenging emotional period. Consider discussing these patterns with a mental health professional.',
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      });
    }

    if (analysis?.avgThoughtScore !== undefined && analysis?.avgEmotionScore !== undefined && analysis.avgThoughtScore < analysis.avgEmotionScore - 10) {
      result.push({
        type: 'warning',
        title: 'Thought-Emotion Gap',
        description: 'Your thoughts tend to be more negative than your emotions. This cognitive pattern is common in anxiety. Practice cognitive restructuring techniques.',
        icon: <Brain className="h-5 w-5 text-blue-500" />,
      });
    }

    if (analysis?.avgBehaviorScore !== undefined && analysis?.avgThoughtScore !== undefined && analysis.avgBehaviorScore > analysis.avgThoughtScore + 10) {
      result.push({
        type: 'positive',
        title: 'Behavioral Resilience',
        description: 'Your behaviors show positive adaptation despite challenging thoughts. This indicates strong coping mechanisms.',
        icon: <Zap className="h-5 w-5 text-purple-500" />,
      });
    }

    if (analysis?.highIntensityCount !== undefined && analysis?.totalSequences !== undefined && analysis.highIntensityCount > analysis.totalSequences * 0.5) {
      result.push({
        type: 'warning',
        title: 'High Intensity Patterns',
        description: 'Many of your sequences show high emotional intensity. Practice grounding techniques and emotional regulation strategies.',
        icon: <Heart className="h-5 w-5 text-red-500" />,
      });
    }

    if (analysis?.recentTrend !== undefined && analysis.recentTrend > 2) {
      result.push({
        type: 'positive',
        title: 'Improving Trend',
        description: 'Your recent sequences show an improving emotional trend. Keep up the positive momentum.',
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      });
    } else if (analysis?.recentTrend !== undefined && analysis.recentTrend < -2) {
      result.push({
        type: 'warning',
        title: 'Declining Trend',
        description: 'Your recent sequences show a declining emotional trend. Consider what factors might be contributing to this change.',
        icon: <TrendingDown className="h-5 w-5 text-red-500" />,
      });
    }

    if (result.length === 0) {
      result.push({
        type: 'neutral',
        title: 'Balanced Pattern',
        description: 'Your emotional, thought, and behavioral patterns are relatively balanced. Continue monitoring and self-reflection.',
        icon: <Info className="h-5 w-5 text-blue-500" />,
      });
    }

    return result;
  }, [analysis]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No sequences to analyze. Start tracking your emotional sequences to receive CBT-based insights.
        </CardContent>
      </Card>
    );
  }

  const normalizeScore = (score: number) => Math.max(0, Math.min(100, ((score + 50) / 100) * 100));

  return (
    <div className="space-y-6">
      {/* Score Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">{t('emotion')}</span>
            </div>
            <div className="text-2xl font-bold">
              {analysis.avgEmotionScore > 0 ? '+' : ''}{analysis.avgEmotionScore.toFixed(1)}
            </div>
            <Progress
              value={normalizeScore(analysis.avgEmotionScore)}
              className="mt-2 h-2"
              indicatorClassName={analysis.avgEmotionScore > 0 ? 'bg-green-500' : 'bg-red-500'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{t('thought')}</span>
            </div>
            <div className="text-2xl font-bold">
              {analysis.avgThoughtScore > 0 ? '+' : ''}{analysis.avgThoughtScore.toFixed(1)}
            </div>
            <Progress
              value={normalizeScore(analysis.avgThoughtScore)}
              className="mt-2 h-2"
              indicatorClassName={analysis.avgThoughtScore > 0 ? 'bg-green-500' : 'bg-red-500'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">{t('behavior')}</span>
            </div>
            <div className="text-2xl font-bold">
              {analysis.avgBehaviorScore > 0 ? '+' : ''}{analysis.avgBehaviorScore.toFixed(1)}
            </div>
            <Progress
              value={normalizeScore(analysis.avgBehaviorScore)}
              className="mt-2 h-2"
              indicatorClassName={analysis.avgBehaviorScore > 0 ? 'bg-green-500' : 'bg-red-500'}
            />
          </CardContent>
        </Card>
      </div>

      {/* Pattern Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Emotional Patterns</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Dominant Emotion</p>
              <p className="text-lg font-medium">
                {analysis.dominantEmotion
                  ? `${tEmotions(analysis.dominantEmotion[0] as keyof typeof tEmotions)} (${analysis.dominantEmotion[1]} times)`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Common Trigger</p>
              <p className="text-lg font-medium">
                {analysis.dominantTrigger
                  ? `${analysis.dominantTrigger[0]} (${analysis.dominantTrigger[1]} times)`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sequences</p>
              <p className="text-lg font-medium">{analysis.totalSequences}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Intensity Events</p>
              <p className="text-lg font-medium">{analysis.highIntensityCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CBT Insights */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold">CBT Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex gap-4 rounded-lg border p-4 ${
                  insight.type === 'positive'
                    ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                    : insight.type === 'negative' || insight.type === 'warning'
                      ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950'
                      : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
                }`}
              >
                <div className="shrink-0">{insight.icon}</div>
                <div>
                  <h4 className="font-semibold">{insight.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
