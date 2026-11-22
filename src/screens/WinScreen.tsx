import React, { useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
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
import { GradientButton } from '../components/GradientButton';
import { Mascot } from '../components/Mascot';
import { Confetti } from '../components/Confetti';
import { colors, radii, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Win'>;

/** Clamp + ease a raw tilt sample so small phone jitter doesn't move the mascot at all. */
function easeTilt(raw: number, max: number) {
  const clamped = Math.max(-max, Math.min(max, raw));
  return clamped;
}

export default function WinScreen({ route, navigation }: Props) {
  const { level, stars } = route.params;
  const sfx = useFeedback();

  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.4);
  const starsOpacity = useSharedValue(0);
  const starsScale = useSharedValue(0.4);
  const pointsScale = useSharedValue(1);

  // Device-tilt parallax on the mascot: hold the phone and it leans
  // with it, like the "juicy" reference the mockup's motion was modeled on.
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const baseline = useRef<{ beta: number; gamma: number } | null>(null);

  useEffect(() => {
    sfx.win();
    titleOpacity.value = withDelay(80, withTiming(1, { duration: 120 }));
    titleScale.value = withDelay(80, withSpring(1, { damping: 9, stiffness: 160 }));
    starsOpacity.value = withDelay(160, withTiming(1, { duration: 120 }));
    starsScale.value = withDelay(160, withSpring(1, { damping: 9, stiffness: 160 }));
    pointsScale.value = withDelay(
      460,
      withSequence(withTiming(1.3, { duration: 160 }), withSpring(1, { damping: 8 }))
    );
    // Only on first mount of this celebration screen, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let subscription: ReturnType<typeof DeviceMotion.addListener> | null = null;
    let cancelled = false;

    (async () => {
      try {
        const available = await DeviceMotion.isAvailableAsync();
        if (!available || cancelled) return;
        const { status } = await DeviceMotion.requestPermissionsAsync();
        if (status !== 'granted' || cancelled) return;

        DeviceMotion.setUpdateInterval(60);
        subscription = DeviceMotion.addListener(({ rotation }) => {
          if (!rotation) return;
          // Use the first reading as "neutral" so the mascot starts centered
          // whatever angle the player happens to be holding the phone at.
          if (!baseline.current) {
            baseline.current = { beta: rotation.beta, gamma: rotation.gamma };
          }
          const dGamma = rotation.gamma - baseline.current.gamma;
          const dBeta = rotation.beta - baseline.current.beta;
          tiltX.value = withTiming(easeTilt(dGamma, 0.5) * 26, { duration: 90 });
          tiltY.value = withTiming(easeTilt(dBeta, 0.5) * 18, { duration: 90 });
        });
      } catch {
        // No motion sensor (e.g. web/simulator) — the mascot just stays put.
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [tiltX, tiltY]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));
  const starsStyle = useAnimatedStyle(() => ({
    opacity: starsOpacity.value,
    transform: [{ scale: starsScale.value }],
  }));
  const pointsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pointsScale.value }],
  }));
  const mascotTiltStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tiltX.value }, { translateY: tiltY.value }, { rotate: `${tiltX.value * 0.4}deg` }],
  }));

  const pointsEarned = stars * 20;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mascotArea}>
          <Confetti />
          <Animated.View style={mascotTiltStyle}>
            <Mascot pose="celebrating" size={140} popIn />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.title, titleStyle]}>Level {level} complete!</Animated.Text>

        <Animated.View style={[styles.starsRow, starsStyle]}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={[styles.star, i < stars && styles.starFilled]}>
              ★
            </Text>
          ))}
        </Animated.View>

        <Animated.View style={[styles.pointsRow, pointsStyle]}>
          <View style={styles.coin}>
            <Text style={styles.coinMark}>C</Text>
          </View>
          <Text style={styles.pointsText}>+{pointsEarned} pts</Text>
        </Animated.View>

        <View style={styles.actions}>
          <GradientButton
            label="Next level"
            onPress={() => navigation.replace('Game', { level: level + 1 })}
            style={{ width: '100%' }}
          />
          <Text style={styles.secondary} onPress={() => navigation.navigate('Home')}>
            Back to levels
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
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  star: {
    color: colors.border,
    fontSize: 36,
  },
  starFilled: {
    color: '#FFC107',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 28,
    ...shadows.soft,
  },
  coin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinMark: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  pointsText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
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
