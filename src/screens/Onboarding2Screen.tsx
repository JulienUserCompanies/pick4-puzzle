import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { GradientButton } from '../components/GradientButton';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding2'>;

const ONBOARDED_KEY = 'pick4:onboarded:v1';

const STEPS = ['Tap 4 numbers', 'Add them together', 'Reach the target!'];

export default function Onboarding2Screen({ navigation }: Props) {
  async function getStarted() {
    await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    navigation.replace('Home');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.art}>
          <Text style={[styles.star, { left: 20, top: 0 }]}>★</Text>
          <Text style={[styles.star, { right: 30, top: 6, fontSize: 20 }]}>★</Text>
          <View style={styles.tileGrid}>
            {[
              { v: '2', bg: colors.blue, shadow: colors.blueDeep },
              { v: '3', bg: colors.blue, shadow: colors.blueDeep },
              { v: '8', bg: colors.blue, shadow: colors.blueDeep },
              { v: '9', bg: colors.green, shadow: colors.greenDeep },
            ].map((tile, i) => (
              <View
                key={i}
                style={[styles.tile, { backgroundColor: tile.bg, borderBottomColor: tile.shadow }]}
              >
                <Text style={styles.tileText}>{tile.v}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.pointer}>👆</Text>
        </View>
        <Text style={styles.title}>How to Play</Text>
        <View style={styles.steps}>
          {STEPS.map((step) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
      {/* 2 dots now, not 3 — this is page 2 of 2 (Splash's CTA counts as page 1). */}
      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>
      <GradientButton label="Get Started" onPress={getStarted} style={{ width: '100%' }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 40,
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  body: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: {
    width: 150,
    height: 120,
    marginBottom: 22,
  },
  star: {
    position: 'absolute',
    color: '#FFC107',
    fontSize: 22,
  },
  tileGrid: {
    position: 'absolute',
    left: 0,
    top: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 102,
    gap: 6,
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '800',
  },
  pointer: {
    position: 'absolute',
    right: -6,
    bottom: -4,
    fontSize: 36,
    transform: [{ rotate: '-12deg' }],
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 16,
  },
  steps: {
    gap: 12,
    width: '100%',
    maxWidth: 270,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },
  stepText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.orange,
  },
});
