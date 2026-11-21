import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useFeedback } from '../audio/useFeedback';
import { useAuth } from '../storage/AuthContext';
import { useProgress } from '../storage/ProgressContext';
import { GradientButton } from '../components/GradientButton';
import { Mascot } from '../components/Mascot';
import { Confetti } from '../components/Confetti';
import { colors, radii, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TimedResult'>;

export default function TimedResultScreen({ route, navigation }: Props) {
  const { solved, isNewBest } = route.params;
  const { user } = useAuth();
  const { progress } = useProgress();
  const sfx = useFeedback();

  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.4);
  const countScale = useSharedValue(0.4);

  useEffect(() => {
    if (isNewBest) sfx.win();
    titleOpacity.value = withDelay(80, withTiming(1, { duration: 120 }));
    titleScale.value = withDelay(80, withSpring(1, { damping: 9, stiffness: 160 }));
    countScale.value = withDelay(
      200,
      withSequence(withTiming(1.25, { duration: 160 }), withSpring(1, { damping: 8 }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));
  const countStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mascotArea}>
          {isNewBest && <Confetti />}
          <Mascot pose={isNewBest ? 'celebrating' : 'idle'} size={130} popIn />
        </View>

        <Animated.Text style={[styles.title, titleStyle]}>Time's up!</Animated.Text>

        <Animated.View style={[styles.countCard, countStyle]}>
          <Text style={styles.countLabel}>Puzzles solved</Text>
          <Text style={styles.count}>{solved}</Text>
        </Animated.View>

        {isNewBest ? (
          <View style={styles.bestPill}>
            <Text style={styles.bestPillText}>🏆 New personal best!</Text>
          </View>
        ) : (
          <Text style={styles.bestHint}>Your best: {progress.timedBest}</Text>
        )}

        {!user && (
          <Text style={styles.signInHint}>Sign in from Settings to join the Timed leaderboard</Text>
        )}

        <View style={styles.actions}>
          <GradientButton
            label="Play again"
            onPress={() => navigation.replace('Timed')}
            style={{ width: '100%' }}
          />
          <Text style={styles.secondary} onPress={() => navigation.navigate('Home')}>
            Back to home
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  mascotArea: {
    width: 160,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 18,
    textAlign: 'center',
  },
  countCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingHorizontal: 40,
    paddingVertical: 16,
    marginBottom: 14,
    ...shadows.card,
  },
  countLabel: {
    color: colors.inkMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  count: {
    color: colors.orange,
    fontSize: 48,
    fontWeight: '800',
    marginTop: 2,
  },
  bestPill: {
    backgroundColor: colors.gold,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  bestPillText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  bestHint: {
    color: colors.inkFaint,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 24,
  },
  signInHint: {
    color: colors.inkFaint,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  secondary: {
    color: colors.inkFaint,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
  },
});
