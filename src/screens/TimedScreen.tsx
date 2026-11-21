import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generatePuzzle } from '../engine/generator';
import { Puzzle } from '../engine/types';
import { NumberTile } from '../components/NumberTile';
import { Mascot } from '../components/Mascot';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../storage/ProgressContext';
import { useAuth } from '../storage/AuthContext';
import { useFeedback } from '../audio/useFeedback';
import { submitTimedResult } from '../lib/timed';
import { colors, radii, shadows, topHighlight } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Timed'>;

const RUN_MS = 60_000;
const READY_SECONDS = 3;

/** Every Timed puzzle is generated at level 1, which always maps to the
 * 'easy' difficulty tier — the sprint's challenge is speed, not harder math. */
function nextPuzzle(): Puzzle {
  return generatePuzzle(1);
}

function formatClock(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

export default function TimedScreen({ navigation }: Props) {
  const { recordTimedBest } = useProgress();
  const { user } = useAuth();
  const sfx = useFeedback();

  const [phase, setPhase] = useState<'ready' | 'playing'>('ready');
  const [readyCount, setReadyCount] = useState(READY_SECONDS);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => nextPuzzle());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(RUN_MS);

  const endedRef = useRef(false);
  const solvedRef = useRef(0); // mirrors `solved`, so the end-of-run effect always submits the final count
  const deadlineRef = useRef<number | null>(null);
  const shakeX = useSharedValue(0);

  // "Ready… 3, 2, 1" countdown before the clock actually starts.
  useEffect(() => {
    if (phase !== 'ready') return;
    if (readyCount <= 0) {
      setPhase('playing');
      deadlineRef.current = Date.now() + RUN_MS;
      return;
    }
    const id = setTimeout(() => setReadyCount((n) => n - 1), 700);
    return () => clearTimeout(id);
  }, [phase, readyCount]);

  const finishRun = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    const finalSolved = solvedRef.current;
    const isNewBest = recordTimedBest(finalSolved);
    if (user) submitTimedResult(user.id, finalSolved);
    navigation.replace('TimedResult', { solved: finalSolved, isNewBest });
  }, [navigation, recordTimedBest, user]);

  // The actual 60-second countdown, ticking off a wall-clock deadline
  // (rather than counting down a fixed step each tick) so it stays accurate
  // even if the JS thread hiccups for a frame or two.
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const left = Math.max(0, (deadlineRef.current ?? 0) - Date.now());
      setTimeLeftMs(left);
      if (left <= 0) {
        clearInterval(id);
        finishRun();
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, finishRun]);

  const runningTotal = useMemo(
    () => [...selected].reduce((sum, i) => sum + puzzle.grid[i], 0),
    [selected, puzzle]
  );

  function triggerShake() {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 45 }),
      withTiming(8, { duration: 70 }),
      withTiming(-6, { duration: 70 }),
      withTiming(0, { duration: 60 })
    );
  }

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  function toggleTile(index: number) {
    if (phase !== 'playing') return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
        sfx.tap();
        return next;
      }
      if (next.size >= puzzle.pickCount) return prev;
      next.add(index);

      // Auto-check the instant the 4th number is picked — no separate Submit
      // tap, so a sprint round can move as fast as the player can think.
      if (next.size === puzzle.pickCount) {
        const total = [...next].reduce((sum, i) => sum + puzzle.grid[i], 0);
        if (total === puzzle.target) {
          sfx.correct();
          setSolved((n) => {
            const updated = n + 1;
            solvedRef.current = updated;
            return updated;
          });
          setPuzzle(nextPuzzle());
          return new Set();
        }
        sfx.wrong();
        triggerShake();
        // Let the player see the full (wrong) selection for a beat before
        // it clears, rather than snapping back instantly.
        setTimeout(() => setSelected(new Set()), 260);
        return next;
      }

      sfx.tap();
      return next;
    });
  }

  function resetSelection() {
    if (phase !== 'playing') return;
    setSelected(new Set());
  }

  const lowTime = timeLeftMs <= 10_000;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.navigate('Home')} accessibilityLabel="Back" hitSlop={8}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.eyebrow}>TIMED SPRINT</Text>
        <View style={styles.solvedPill}>
          <Text style={styles.solvedText}>✓ {solved}</Text>
        </View>
      </View>

      <Text style={[styles.clock, lowTime && styles.clockLow]}>{formatClock(timeLeftMs)}</Text>

      <View style={styles.targetArea}>
        <View style={styles.targetCardLedge}>
          <View style={styles.targetCard}>
            <LinearGradient colors={topHighlight} style={styles.targetCardSheen} pointerEvents="none" />
            <Text style={styles.targetLabel}>Make</Text>
            <Text style={styles.target}>{puzzle.target}</Text>
          </View>
        </View>

        <View style={styles.totalPillLedge}>
          <View style={styles.totalPill}>
            <Text
              style={[
                styles.totalText,
                {
                  color:
                    runningTotal === puzzle.target
                      ? colors.success
                      : runningTotal > puzzle.target
                      ? colors.orange
                      : colors.inkFaint,
                },
              ]}
            >
              {runningTotal} / {puzzle.target}
            </Text>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.grid, shakeStyle]}>
        {puzzle.grid.map((value, index) => (
          <NumberTile
            key={index}
            value={value}
            selected={selected.has(index)}
            onPress={() => toggleTile(index)}
            disabled={phase !== 'playing'}
          />
        ))}
      </Animated.View>

      <Pressable style={styles.resetButton} onPress={resetSelection}>
        <View style={styles.resetLedge}>
          <View style={styles.resetCircle}>
            <LinearGradient colors={topHighlight} style={styles.resetSheen} pointerEvents="none" />
            <Text style={styles.resetGlyph}>↺</Text>
          </View>
        </View>
        <Text style={styles.resetLabel}>Reset</Text>
      </Pressable>

      {phase === 'ready' && (
        <View style={styles.readyOverlay}>
          <Mascot pose="waving" size={88} bob />
          <Text style={styles.readyTitle}>Get ready!</Text>
          <Text style={styles.readyCount}>{readyCount > 0 ? readyCount : 'GO!'}</Text>
        </View>
      )}
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
    marginBottom: 4,
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
  solvedPill: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    ...shadows.soft,
  },
  solvedText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '800',
  },
  clock: {
    alignSelf: 'center',
    color: colors.ink,
    fontSize: 40,
    fontWeight: '800',
    marginVertical: 4,
  },
  clockLow: {
    color: colors.error,
  },
  targetArea: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginVertical: 12,
  },
  targetCardLedge: {
    borderRadius: radii.xl,
    backgroundColor: '#E8D3B0',
    paddingBottom: 6,
    shadowColor: 'rgba(74,59,46,1)',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  targetCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 18,
    overflow: 'hidden',
  },
  targetCardSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  targetLabel: {
    color: colors.inkMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  target: {
    color: colors.ink,
    fontSize: 42,
    fontWeight: '800',
    marginTop: 2,
  },
  totalPillLedge: {
    borderRadius: radii.pill,
    backgroundColor: '#E8D3B0',
    paddingBottom: 3,
    ...shadows.soft,
  },
  totalPill: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  totalText: {
    fontSize: 15,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  resetButton: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: 4,
  },
  resetLedge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8D3B0',
    paddingBottom: 3,
    shadowColor: 'rgba(74,59,46,1)',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  resetCircle: {
    flex: 1,
    borderRadius: 23,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  resetSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  resetGlyph: {
    color: colors.orange,
    fontSize: 18,
  },
  resetLabel: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: '700',
  },
  readyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(253,236,218,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  readyTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  readyCount: {
    color: colors.orange,
    fontSize: 56,
    fontWeight: '800',
    marginTop: 4,
  },
});
