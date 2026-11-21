import React, { useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generatePuzzle } from '../engine/generator';
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

/** 3 stars for a clean solve, 2 for one wrong submit, 1 for two or more. */
function starsForAttempts(wrongAttempts: number): number {
  if (wrongAttempts === 0) return 3;
  if (wrongAttempts === 1) return 2;
  return 1;
}

export default function GameScreen({ route, navigation }: Props) {
  const { level, daily, dailyPuzzle } = route.params;
  const { recordWin } = useProgress();
  const { user } = useAuth();
  const sfx = useFeedback();

  const [puzzle, setPuzzle] = useState<Puzzle>(() => dailyPuzzle ?? generatePuzzle(level));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const startedAt = useRef(Date.now());

  const runningTotal = useMemo(
    () => [...selected].reduce((sum, i) => sum + puzzle.grid[i], 0),
    [selected, puzzle]
  );

  const locked = feedback !== 'none';

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

  const totalColor =
    runningTotal === puzzle.target
      ? colors.success
      : runningTotal > puzzle.target
      ? colors.error
      : colors.inkFaint;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Home')} accessibilityLabel="Back">
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.levelLabel}>{daily ? 'Daily Challenge' : `Level ${level}`}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.targetArea}>
        <Text style={styles.targetLabel}>Make</Text>
        <Text style={styles.target}>{puzzle.target}</Text>
        <View style={styles.totalPill}>
          <Text style={[styles.totalText, { color: totalColor }]}>
            {runningTotal} / {puzzle.target}
          </Text>
        </View>
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
          <Mascot pose="confused" size={64} popIn />
          <Text style={styles.loseText}>Not quite — try again!</Text>
          <GradientButton label="Try again" onPress={tryAgain} style={{ width: '100%' }} />
        </View>
      ) : feedback === 'dailyWin' ? (
        <View style={styles.dailyWinArea}>
          <Confetti />
          <Mascot pose="celebrating" size={84} popIn />
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
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backArrow: {
    color: colors.ink,
    fontSize: 22,
  },
  levelLabel: {
    color: colors.inkFaint,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    gap: 16,
  },
  targetLabel: {
    color: colors.inkMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  target: {
    color: colors.ink,
    fontSize: 48,
    fontWeight: '800',
    marginTop: -4,
  },
  totalPill: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
    ...shadows.soft,
  },
  totalText: {
    fontSize: 15,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.card,
    color: colors.orange,
    fontSize: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
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
