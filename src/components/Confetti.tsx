import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const PIECES = [
  { emoji: '🔶', left: -40, top: 2, size: 15, delay: 100 },
  { emoji: '🔷', left: -20, top: 32, size: 10, delay: 500 },
  { emoji: '🔷', left: 34, top: 6, size: 14, delay: 300 },
  { emoji: '🔶', left: 50, top: 36, size: 10, delay: 700 },
];

function Piece({ emoji, left, top, size, delay }: (typeof PIECES)[number]) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1600, easing: Easing.in(Easing.quad) }), -1, false)
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.15 ? progress.value / 0.15 : 1 - progress.value,
    transform: [
      { translateY: -16 + progress.value * 86 },
      { rotate: `${progress.value * 380}deg` },
    ],
  }));

  return (
    <Animated.Text style={[styles.piece, { left, top, fontSize: size }, style]}>
      {emoji}
    </Animated.Text>
  );
}

/** Looping confetti burst around the win-screen mascot, matching the mockup's .pf-confetti. */
export function Confetti() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      {PIECES.map((p, i) => (
        <Piece key={i} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  piece: {
    position: 'absolute',
  },
});
