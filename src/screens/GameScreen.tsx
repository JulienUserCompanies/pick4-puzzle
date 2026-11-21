import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generatePuzzle } from '../engine/generator';
import { tierForLevel } from '../engine/difficulty';
import { Puzzle } from '../engine/types';
import { NumberTile } from '../components/NumberTile';
import { GradientButton } from '../components/GradientButton';
import { Mascot } from '../components/Mascot';
import { Confetti } from '../components/Confetti';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../storage/ProgressContext';
import { useAuth } from '../storage/AuthContext';
import { useFeedback } from '../audio/useFeedback';
import { submitDailyResult } from '../lib/daily';
import { colors, radii, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

type Feedback = 'none' | 'win' | 'lose' | 'dailyWin';

const TIER_LABEL: Record<string, string> = {
  easy: 'Beginner',
  mid: 'Intermediate',
  hard: 'Expert',
};

/** 3 stars for a clean solve, 2 for one wrong submit, 1 for two or more. */
function starsForAttempts(wrongAttempts: number): number {
  if (wrongAttempts === 0) return 3;
  if (wrongAttempts === 1) return 2;
  return 1;
}

/** How many levels in a row, ending just before `uptoLevel`, were solved with a clean 3-star run. */
function perfectStreak(starsByLevel: Record<number, number>, uptoLevel: number): number {
  let streak = 0;
  let lvl = uptoLevel;
  while (starsByLevel[lvl] === 3) {
    streak += 1;
    lvl -= 1;
  }
  return streak;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {icon ? `${icon} ` : ''}
        {value}
      </Text>
    </View>
  );
}

export default function GameScreen({ route, navigation }: Props) {
  const { level, daily, dailyPuzzle } = route.params;
  const { progress, recordWin } = useProgress();
  const { user } = useAuth();
  const sfx = useFeedback();

  const [puzzle, setPuzzle] = useState<Puzzle>(() => dailyPuzzle ?? generatePuzzle(level));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAt = useRef(Date.now());

  // Live-ticking timer for the header stat card; stops once the level is won
  // (it keeps running through a wrong-answer retry, same as the real clock would).
  useEffect(() => {
    if (feedback === 'win' || feedback === 'dailyWin') return;
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt.current), 1000);
    return () => clearInterval(id);
  }, [feedback]);

  const runningTotal = useMemo(
    () => [...selected].reduce((sum, i) => sum + puzzle.grid[i], 0),
    [selected, puzzle]
  );

  const locked = feedback !== 'none';
  const streak = perfectStreak(progress.starsByLevel, (daily ? progress.maxUnlockedLevel : level) - 1);
  const tierLabel = TIER_LABEL[tierForLevel(level || 1)];

  function toggleTile(index: number) {
    if (locked) return;
    sfx.tap();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < puzzle.pickCount) {
        next.add(index);
      }
      return next;
    });
  }

  function submit() {
    if (selected.size !== puzzle.pickCount || locked) return;
    const won = runningTotal === puzzle.target;
    if (won) {
      sfx.correct();
      if (daily) {
        setFeedback('dailyWin');
        if (user) {
          const timeMs = Date.now() - startedAt.current;
          submitDailyResult(user.id, timeMs, wrongAttempts + 1);
        }
      } else {
        const stars = starsForAttempts(wrongAttempts);
        recordWin(level, stars);
        setFeedback('win');
        navigation.navigate('Win', { level, stars });
      }
    } else {
      sfx.wrong();
      setWrongAttempts((n) => n + 1);
      setFeedback('lose');
    }
  }

  function tryAgain() {
    setSelected(new Set());
    setFeedback('none');
  }

  function resetSelection() {
    if (locked) return;
    setSelected(new Set());
  }

  const exceeded = runningTotal > puzzle.target;
  const totalColor = runningTotal === puzzle.target ? colors.success : exceeded ? colors.orange : colors.inkFaint;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.navigate('Home')} accessibilityLabel="Back" hitSlop={8}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.eyebrow}>
          {daily ? 'DAILY CHALLENGE' : `${tierLabel.toUpperCase()} · LEVEL ${level}`}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pick 4</Text>
          <Text style={styles.subtitle}>Build the number with 4 numbers</Text>
        </View>
        <View style={styles.headerIcon}>
          <Mascot pose="idle" size={34} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Level" value={daily ? 'Daily' : String(level)} />
        <StatCard label="Time" value={formatTime(elapsedMs)} />
        <StatCard label="Streak" value={String(streak)} icon="⭐" />
      </View>

      <View style={styles.targetCard}>
        <Text style={styles.targetLabel}>MAKE</Text>
        <Text style={styles.target}>{puzzle.target}</Text>
      </View>

      <View style={styles.totalPill}>
        <Text style={[styles.totalText, { color: totalColor }]}>
          {runningTotal} / {puzzle.target}
        </Text>
      </View>

      <View style={styles.dotsRow}>
        {Array.from({ length: puzzle.pickCount }).map((_, i) => (
          <View key={i} style={[styles.dot, i < selected.size && styles.dotFilled]} />
        ))}
      </View>

      <View style={styles.grid}>
        {puzzle.grid.map((value, index) => (
          <NumberTile
            key={index}
            value={value}
            selected={selected.has(index)}
            onPress={() => toggleTile(index)}
            disabled={locked}
          />
        ))}
      </View>

      {feedback === 'none' ? (
        <View style={styles.actionsRow}>
          <Pressable style={styles.resetButton} onPress={resetSelection}>
            <Text style={styles.resetIcon}>↺</Text>
            <Text style={styles.resetLabel}>Reset</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <GradientButton
              label={`Submit (${selected.size}/${puzzle.pickCount})`}
              onPress={submit}
              disabled={selected.size !== puzzle.pickCount}
              glow={selected.size === puzzle.pickCount}
            />
          </View>
        </View>
      ) : feedback === 'lose' ? (
        <View style={styles.loseArea}>
          <Mascot pose="confused" size={56} popIn />
          <Text style={styles.loseText}>Not quite — try again!</Text>
          <GradientButton label="Try again" onPress={tryAgain} style={{ width: '100%' }} />
        </View>
      ) : feedback === 'dailyWin' ? (
        <View style={styles.dailyWinArea}>
          <Confetti />
          <Mascot pose="celebrating" size={72} popIn />
          <Text style={styles.dailyWinTitle}>Daily Challenge complete!</Text>
          <Text style={styles.dailyWinSub}>
            {user ? "You're on today's leaderboard." : 'Sign in to join the leaderboard next time.'}
          </Text>
          <GradientButton
            label="Back to Home"
            onPress={() => navigation.navigate('Home')}
            style={{ width: '100%' }}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  backArrow: {
    color: colors.ink,
    fontSize: 20,
  },
  eyebrow: {
    color: colors.inkFaint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.inkFaint,
    fontSize: 12,
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: 8,
    alignItems: 'center',
    ...shadows.soft,
  },
  statLabel: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  targetCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 10,
    ...shadows.card,
  },
  targetLabel: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  target: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: '800',
    marginTop: 2,
  },
  totalPill: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 8,
    ...shadows.soft,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
    marginBottom: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotFilled: {
    backgroundColor: colors.success,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  resetButton: {
    alignItems: 'center',
    gap: 4,
  },
  resetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    color: colors.orange,
    fontSize: 17,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
  resetLabel: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: '700',
  },
  loseArea: {
    alignItems: 'center',
    gap: 10,
  },
  loseText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  dailyWinArea: {
    alignItems: 'center',
    gap: 8,
  },
  dailyWinTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  dailyWinSub: {
    color: colors.inkFaint,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
});
