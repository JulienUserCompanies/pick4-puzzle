import React, { useEffect } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { mascot } from '../theme';

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface Props {
  pose: keyof typeof mascot;
  size?: number;
  style?: StyleProp<ImageStyle>;
  /** Gentle up/down bob loop, like the mockup's .pf-bob (splash bear, daily-challenge bear). */
  bob?: boolean;
  /** Pop-in on mount, like the mockup's .pf-pop (lose/win bears). */
  popIn?: boolean;
  delay?: number;
}

/** The app's bear mascot in one of five poses, with the same motion language as the mockup. */
export function Mascot({ pose, size = 72, style, bob = false, popIn = false, delay = 0 }: Props) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(popIn ? 0.4 : 1);
  const opacity = useSharedValue(popIn ? 0 : 1);

  useEffect(() => {
    if (bob) {
      translateY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-6, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        )
      );
    }
    if (popIn) {
      opacity.value = withDelay(delay, withTiming(1, { duration: 120 }));
      scale.value = withDelay(delay, withSpring(1, { damping: 9, stiffness: 160 }));
    }
  }, [bob, popIn, delay, translateY, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <AnimatedImage
      source={mascot[pose]}
      style={[{ width: size, height: size }, animatedStyle, style]}
      resizeMode="contain"
    />
  );
}
