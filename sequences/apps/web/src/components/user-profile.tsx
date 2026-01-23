'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
} from '@seq/ui';
import {
  Settings,
  LogOut,
  TrendingUp,
  TrendingDown,
  Minus,
  Film,
  Users,
  Heart,
} from 'lucide-react';
import type { User, Emotion } from '@seq/database';
import { EmotionChart } from './emotions/emotion-chart';

type EmotionStat = {
  emotionId: number;
  count: number;
  emotion?: Emotion;
};

type UserProfileProps = {
  user: User & {
    _count: {
      sequences: number;
      followers: number;
      following: number;
    };
  };
  stats: {
    totalSequences: number;
    avgEmotionPolarity: number;
    avgThoughtPolarity: number;
    avgBehaviorPolarity: number;
  };
  emotionStats?: EmotionStat[];
};

export function UserProfile({ user, stats, emotionStats }: UserProfileProps) {
  const t = useTranslations();

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getPolarityInfo = (value: number) => {
    if (value > 0) {
      return { icon: TrendingUp, color: 'text-green-500', label: 'Positive' };
    }
    if (value < 0) {
      return { icon: TrendingDown, color: 'text-red-500', label: 'Negative' };
    }
    return { icon: Minus, color: 'text-blue-500', label: 'Neutral' };
  };

  const avgPolarity = (stats.avgEmotionPolarity + stats.avgThoughtPolarity + stats.avgBehaviorPolarity) / 3;
  const polarityInfo = getPolarityInfo(avgPolarity);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container max-w-2xl py-8 px-4">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.username} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-2xl font-bold">{user.name ?? user.username}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              
              {user.bio && (
                <p className="mt-4 text-sm text-muted-foreground max-w-md">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-8 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{user._count.sequences}</div>
                  <div className="text-xs text-muted-foreground">Sequences</div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{user._count.followers}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{user._count.following}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emotional Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Emotional Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalSequences === 0 ? (
              <div className="text-center py-8">
                <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No sequences yet</p>
                <Button className="mt-4" asChild>
                  <Link href="/create">Create Your First Sequence</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Trend */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Trend</p>
                    <p className={`text-xl font-bold ${polarityInfo.color}`}>
                      {polarityInfo.label}
                    </p>
                  </div>
                  <polarityInfo.icon className={`h-10 w-10 ${polarityInfo.color}`} />
                </div>

                {/* Individual Trends */}
                <div className="grid grid-cols-3 gap-4">
                  <TrendCard
                    label="Emotion"
                    value={stats.avgEmotionPolarity}
                    icon="💜"
                  />
                  <TrendCard
                    label="Thought"
                    value={stats.avgThoughtPolarity}
                    icon="💭"
                  />
                  <TrendCard
                    label="Behavior"
                    value={stats.avgBehaviorPolarity}
                    icon="🎯"
                  />
                </div>

                {/* Emotion Breakdown */}
                {emotionStats && emotionStats.length > 0 && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Emotion Breakdown
                    </h3>
                    <EmotionChart stats={emotionStats} variant="bar" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/storyboard">
                <Film className="mr-2 h-4 w-4" />
                View Storyboard
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Separator className="my-2" />
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type TrendCardProps = {
  label: string;
  value: number;
  icon: string;
};

function TrendCard({ label, value, icon }: TrendCardProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <div className="text-center p-3 rounded-lg bg-muted/30">
      <span className="text-2xl">{icon}</span>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      <p className={`text-sm font-medium mt-1 ${
        isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'
      }`}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}
      </p>
    </div>
  );
}
