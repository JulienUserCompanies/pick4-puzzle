import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { RootStackParamList } from '../navigation/types';
import { Mascot } from '../components/Mascot';
import { colors, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const ONBOARDED_KEY = 'pick4:onboarded:v1';

function LogoBlock({
  label,
  rotate,
  gradient,
  delay,
}: {
  label: string;
  rotate: string;
  gradient: [string, string];
  delay: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 9, stiffness: 170 }));
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate }],
  }));

  return (
    <Animated.View
      style={[
        styles.block,
        style,
        { backgroundColor: gradient[1] },
      ]}
    >
      <Text style={styles.blockLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
      await new Promise((resolve) => setTimeout(resolve, 1100));
      if (cancelled) return;
      navigation.replace(onboarded ? 'Home' : 'Onboarding1');
    })();

    return () => {
      cancelled = true;
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoArea}>
        <LogoBlock label="1" rotate="-6deg" gradient={['#6FC8EE', '#3E9EE8']} delay={0} />
        <LogoBlock label="2" rotate="-8deg" gradient={['#9A8CF0', '#6E5EF5']} delay={80} />
        <LogoBlock label="3" rotate="8deg" gradient={['#FFB74D', '#FF9800']} delay={160} />
        <View style={styles.mascotWrap}>
          <Mascot pose="waving" size={64} bob />
        </View>
      </View>
      <Text style={styles.title}>Pick 4</Text>
      <Text style={styles.subtitle}>Number Puzzle Game</Text>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
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
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 26,
  },
  block: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockLabel: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
  },
  mascotWrap: {
    marginLeft: 10,
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.inkFaint,
    fontSize: 14,
    marginTop: 4,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 54,
    width: 180,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '62%',
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 4,
  },
});
