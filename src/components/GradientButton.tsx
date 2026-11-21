import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors, radii, topHighlight } from '../theme';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  /** Royal-Match-style idle glow pulse, matching the mockup's .pf-cta. Off by default for secondary CTAs. */
  glow?: boolean;
}

/** The orange gradient "primary action" button used across the app (Next, Get Started, Submit, Play…). */
export function GradientButton({ label, onPress, disabled, style, glow = true }: Props) {
  const press = useSharedValue(1);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!glow || disabled) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [glow, disabled, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value * (1 + pulse.value * 0.012) }],
    shadowOpacity: 0.3 + pulse.value * 0.15,
    shadowRadius: 10 + pulse.value * 8,
  }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        press.value = withSpring(0.96, { damping: 14, stiffness: 260 });
      }}
      onPressOut={() => {
        press.value = withSpring(1, { damping: 10, stiffness: 220 });
      }}
      onPress={onPress}
      style={style}
    >
      <AnimatedGradient
        colors={disabled ? ['#F5D9C4', '#EAC2A4'] : [colors.orangeLight, colors.orangeDeep]}
        style={[styles.button, animatedStyle]}
      >
        <LinearGradient colors={topHighlight} style={styles.sheen} pointerEvents="none" />
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      </AnimatedGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    shadowColor: colors.orangeShadow,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  label: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  labelDisabled: {
    color: '#A99A86',
  },
});
