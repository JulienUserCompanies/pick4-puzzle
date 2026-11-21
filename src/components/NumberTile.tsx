import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii, topHighlight } from '../theme';

interface Props {
  value: number;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const BLUE: [string, string] = [colors.blueGradTop, colors.blueGradBottom];
const GREEN: [string, string] = [colors.greenGradTop, colors.greenGradBottom];

/** A single tappable number tile — blue by default, pops green + a check badge once picked. */
export function NumberTile({ value, selected, onPress, disabled }: Props) {
  const press = useSharedValue(1);
  const pop = useSharedValue(1);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    // Royal-Match-style overshoot pop whenever the selection state flips,
    // matching the mockup's .pf-tile-pop keyframes.
    pop.value = withSequence(
      withTiming(1.14, { duration: 0 }),
      withTiming(0.93, { duration: 110 }),
      withSpring(1, { damping: 9, stiffness: 220 })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value * pop.value }],
  }));

  const shadowColor = selected ? colors.greenDeep : colors.blueDeep;

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        if (!disabled) press.value = withTiming(0.95, { duration: 80 });
      }}
      onPressOut={() => {
        press.value = withTiming(1, { duration: 100 });
      }}
      onPress={onPress}
      style={styles.wrap}
    >
      <Animated.View style={[styles.ledge, { backgroundColor: shadowColor }, animatedStyle]}>
        <LinearGradient
          colors={selected ? GREEN : BLUE}
          style={[styles.tile, disabled && !selected && styles.tileDisabled]}
        >
          <LinearGradient colors={topHighlight} style={styles.sheen} pointerEvents="none" />
          <Text style={styles.value}>{value}</Text>
          {selected && (
            <View style={styles.badge}>
              <Text style={styles.badgeMark}>✓</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexBasis: '30%',
    aspectRatio: 1,
    margin: '1.65%',
  },
  ledge: {
    flex: 1,
    borderRadius: radii.lg,
    paddingBottom: 5,
  },
  tile: {
    flex: 1,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  tileDisabled: {
    opacity: 0.5,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMark: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
});
