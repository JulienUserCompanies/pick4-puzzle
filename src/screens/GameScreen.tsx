import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generatePuzzle } from '../engine/generator';
import { Puzzle } from '../engine/types';
import { NumberTile } from '../components/NumberTile';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../storage/ProgressContext';
import { useFeedback } from '../audio/useFeedback';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

type Feedback = 'none' | 'win' | 'lose';

/** 3 stars for a clean solve, 2 for one wrong submit, 1 for two or more. */
function starsForAttempts(wrongAttempts: number): number {
  if (wrongAttempts === 0) return 3;
  if (wrongAttempts === 1) return 2;
  return 1;
}

export default function GameScreen({ route, navigation }: Props) {
  const { level } = route.params;
  const { recordWin } = useProgress();
  const sfx = useFeedback();

  const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle(level));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [wrongAttempts, setWrongAttempts] = useState(0);

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
      const stars = starsForAttempts(wrongAttempts);
      sfx.correct();
      recordWin(level, stars);
      setFeedback('win');
      navigation.navigate('Win', { level, stars });
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
      ? '#c6ff3d'
      : runningTotal > puzzle.target
      ? '#ff9d42'
      : '#6b6f67';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Home')} accessibilityLabel="Back to levels">
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.levelLabel}>Level {level}</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.targetLabel}>Make</Text>
      <Text style={styles.target}>{puzzle.target}</Text>

      <Text style={[styles.runningTotal, { color: totalColor }]}>
        {runningTotal} / {puzzle.target}
      </Text>

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
        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={resetSelection}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, selected.size !== puzzle.pickCount && styles.buttonDisabled]}
            onPress={submit}
            disabled={selected.size !== puzzle.pickCount}
          >
            <Text style={styles.primaryButtonText}>
              Submit ({selected.size}/{puzzle.pickCount})
            </Text>
          </Pressable>
        </View>
      ) : feedback === 'lose' ? (
        <View style={styles.actions}>
          <Text style={[styles.feedbackText, styles.lose]}>Not quite — that's not the target.</Text>
          <Pressable style={styles.primaryButton} onPress={tryAgain}>
            <Text style={styles.primaryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backArrow: {
    color: '#f2f2ed',
    fontSize: 22,
  },
  levelLabel: {
    color: '#6b6f67',
    fontSize: 16,
    fontWeight: '600',
  },
  targetLabel: {
    color: '#6b6f67',
    fontSize: 16,
    marginTop: 12,
  },
  target: {
    color: '#f2f2ed',
    fontSize: 56,
    fontWeight: '800',
    marginBottom: 8,
  },
  runningTotal: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#c6ff3d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#6b6f67',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  lose: {
    color: '#ff9d42',
  },
});
