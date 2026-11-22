import React, { useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DeviceMotion } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { RootStackParamList } from '../navigation/types';
import { Mascot } from '../components/Mascot';
import { GradientButton } from '../components/GradientButton';
import { colors, topHighlight } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const ONBOARDED_KEY = 'pick4:onboarded:v1';

/** Clamp + ease a raw tilt sample so small phone jitter doesn't move anything at all. */
function easeTilt(raw: number, max: number) {
  return Math.max(-max, Math.min(max, raw));
}

interface FloatingNumberSpec {
  value: string;
  top: number;
  left: number;
  size: number;
  /** How strongly this tile reacts to phone tilt relative to the mascot — "closer" tiles (bigger, in front) drift more. */
  depth: number;
  gradient: [string, string];
  bobDuration: number;
  bobDelay: number;
}

const FLOATING_NUMBERS: FloatingNumberSpec[] = [
  { value: '7', top: 2, left: 10, size: 40, depth: 1.5, gradient: [colors.blueGradTop, colors.blueGradBottom], bobDuration: 2200, bobDelay: 0 },
  { value: '3', top: 6, left: 72, size: 34, depth: 1.1, gradient: [colors.purpleLight, colors.purpleDeep], bobDuration: 2600, bobDelay: 300 },
  { value: '9', top: 46, left: 2, size: 30, depth: 0.9, gradient: [colors.greenGradTop, colors.greenGradBottom], bobDuration: 2400, bobDelay: 600 },
  { value: '2', top: 50, left: 80, size: 38, depth: 1.3, gradient: [colors.orangeLight, colors.orangeDeep], bobDuration: 2000, bobDelay: 150 },
  { value: '4', top: 86, left: 14, size: 32, depth: 1.0, gradient: [colors.goldLight, colors.gold], bobDuration: 2800, bobDelay: 450 },
  { value: '6', top: 88, left: 66, size: 28, depth: 0.8, gradient: [colors.blueGradTop, colors.purpleDeep], bobDuration: 2300, bobDelay: 750 },
];

function FloatingNumber({
  spec,
  tiltX,
  tiltY,
}: {
  spec: FloatingNumberSpec;
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
}) {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withDelay(
      spec.bobDelay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: spec.bobDuration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: spec.bobDuration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: (bob.value - 0.5) * 14 + tiltY.value * spec.depth },
      { translateX: tiltX.value * spec.depth },
      { rotate: `${tiltX.value * spec.depth * 0.5}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.floatingLedge,
        {
          top: `${spec.top}%`,
          left: `${spec.left}%`,
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={spec.gradient}
        style={[styles.floatingChip, { width: spec.size, height: spec.size, borderRadius: spec.size / 2 }]}
      >
        <LinearGradient colors={topHighlight} style={styles.floatingSheen} pointerEvents="none" />
        <Text style={[styles.floatingValue, { fontSize: spec.size * 0.42 }]}>{spec.value}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export default function SplashScreen({ navigation }: Props) {
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.4);
  const mascotOpacity = useSharedValue(0);
  const mascotScale = useSharedValue(0.5);
  const ctaOpacity = useSharedValue(0);
  const ctaTranslateY = useSharedValue(14);

  // Phone-tilt parallax — same technique as the Win screen: numbers and the
  // mascot drift gently as you tilt the phone, instead of sitting static.
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const baseline = useRef<{ beta: number; gamma: number } | null>(null);

  useEffect(() => {
    titleOpacity.value = withDelay(120, withTiming(1, { duration: 300 }));
    titleScale.value = withDelay(120, withSpring(1, { damping: 10, stiffness: 160 }));
    mascotOpacity.value = withTiming(1, { duration: 260 });
    mascotScale.value = withSpring(1, { damping: 8, stiffness: 150 });
    // CTA settles in a beat after everything else, so it doesn't feel like
    // the whole screen just dumps itself on the player at once.
    ctaOpacity.value = withDelay(500, withTiming(1, { duration: 260 }));
    ctaTranslateY.value = withDelay(500, withSpring(0, { damping: 12, stiffness: 160 }));
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
          if (!baseline.current) {
            baseline.current = { beta: rotation.beta, gamma: rotation.gamma };
          }
          const dGamma = rotation.gamma - baseline.current.gamma;
          const dBeta = rotation.beta - baseline.current.beta;
          tiltX.value = withTiming(easeTilt(dGamma, 0.5) * 16, { duration: 90 });
          tiltY.value = withTiming(easeTilt(dBeta, 0.5) * 12, { duration: 90 });
        });
      } catch {
        // No motion sensor (e.g. web/simulator) — everything just stays put.
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [tiltX, tiltY]);

  // Splash is now a real first page with its own CTA (per the design mockup,
  // where the splash is tap-to-continue), not an auto-advancing loading
  // screen. A returning player goes straight to Home; a first-time player
  // goes to the single "How to Play" page — the separate "Build the Number"
  // step that used to come before it is retired from this flow, so there
  // are exactly two intro pages, matching what was asked for.
  async function handlePlay() {
    const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
    navigation.replace(onboarded ? 'Home' : 'Onboarding2');
  }

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));
  const mascotWrapStyle = useAnimatedStyle(() => ({
    opacity: mascotOpacity.value,
    transform: [{ scale: mascotScale.value }],
  }));
  // The mascot itself drifts a touch less than the numbers (it reads as
  // "closer to the viewer, more grounded" against the floating digits).
  const mascotTiltStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tiltX.value * 0.6 }, { translateY: tiltY.value * 0.6 }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scene}>
        {FLOATING_NUMBERS.map((spec, i) => (
          <FloatingNumber key={i} spec={spec} tiltX={tiltX} tiltY={tiltY} />
        ))}
        <Animated.View style={[styles.mascotWrap, mascotWrapStyle]}>
          <Animated.View style={mascotTiltStyle}>
            <Mascot pose="waving" size={88} bob />
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View style={titleStyle}>
        <Text style={styles.title}>Pick 4</Text>
        <Text style={styles.subtitle}>Number Puzzle Game</Text>
      </Animated.View>

      <Animated.View style={[styles.ctaWrap, ctaStyle]}>
        <GradientButton label="Let's Play!" onPress={handlePlay} style={{ width: '100%' }} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 36,
  },
  scene: {
    width: 240,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  mascotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingLedge: {
    position: 'absolute',
    backgroundColor: 'rgba(74,59,46,0.16)',
  },
  floatingChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  floatingSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  floatingValue: {
    color: colors.white,
    fontWeight: '800',
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.inkFaint,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  ctaWrap: {
    position: 'absolute',
    bottom: 48,
    left: 32,
    right: 32,
  },
});
