"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@seq/ui";
import {
  Plus,
  Film,
  Heart,
  Brain,
  Activity,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { Emotion, Trigger, Sequence } from "@seq/database";

import { StatCard, StatGrid } from "./primitives";
import { EmotionChart } from "./emotions";
import { PolarityIndicator } from "./polarity";

type DashboardProps = {
  user: {
    id: string;
    name?: string | null;
    username: string | null;
  };
  recentSequences: (Sequence & { emotion: Emotion; trigger: Trigger })[];
  stats: {
    totalSequences: number;
    avgEmotionPolarity: number;
    avgThoughtPolarity: number;
    avgBehaviorPolarity: number;
  };
  emotionStats: {
    emotionId: number;
    count: number;
    emotion?: Emotion;
  }[];
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function Dashboard({
  user,
  recentSequences,
  stats,
  emotionStats,
}: DashboardProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:ml-16">
      {/* Background light effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">
              {t("welcome", { name: user.name || user.username || "User" })}
            </h1>
            <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          <Button asChild size="lg">
            <Link href={`/${locale}/create`}>
              <Plus className="mr-2 h-4 w-4" />
              {t("newSequence")}
            </Link>
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatGrid columns={4} className="gap-6">
            <StatCard
              title={t("totalSequences")}
              value={stats.totalSequences}
              icon={Film}
              variant="calming"
            />
            <StatCard
              title={t("emotionTrend")}
              value={
                <PolarityIndicator
                  value={Math.round(stats.avgEmotionPolarity)}
                  size="lg"
                />
              }
              icon={Heart}
            />
            <StatCard
              title={t("thoughtTrend")}
              value={
                <PolarityIndicator
                  value={Math.round(stats.avgThoughtPolarity)}
                  size="lg"
                />
              }
              icon={Brain}
            />
            <StatCard
              title={t("behaviorTrend")}
              value={
                <PolarityIndicator
                  value={Math.round(stats.avgBehaviorPolarity)}
                  size="lg"
                />
              }
              icon={Activity}
            />
          </StatGrid>
        </motion.div>

        {/* Asymmetric grid layout */}
        <motion.div
          variants={itemVariants}
          className="grid gap-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-8">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xl">
                  {t("recentSequences")}
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${locale}/storyboard`}>
                    {t("viewAll")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentSequences.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    >
                      <Sparkles className="h-12 w-12 text-muted-foreground" />
                    </motion.div>
                    <p className="text-muted-foreground mt-4">
                      {t("noSequences")}
                    </p>
                    <Button className="mt-6" asChild>
                      <Link href={`/${locale}/create`}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("createFirst")}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSequences.map((sequence, index) => (
                      <motion.div
                        key={sequence.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Link
                          href={`/${locale}/sequence/${sequence.id}`}
                          className="block rounded-lg border p-4 transition-all hover:bg-accent hover:border-primary/20 hover:shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-2xl shrink-0">
                              {sequence.emotion.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate mb-1">
                                {sequence.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {sequence.summary}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{sequence.trigger.icon}</span>
                                <span>
                                  {new Date(
                                    sequence.eventDate
                                  ).toLocaleDateString(locale)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  {t("emotionDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emotionStats.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    {t("noDataYet")}
                  </p>
                ) : (
                  <EmotionChart stats={emotionStats} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{t("quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/${locale}/create`}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("newSequence")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/${locale}/storyboard`}>
                    <Film className="mr-2 h-4 w-4" />
                    {t("viewStoryboard")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
