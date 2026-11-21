import React from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../storage/ProgressContext';
import { colors, radii, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

const TOTAL_LEVELS = 60;

function Stars({ count }: { count: number }) {
  return (
    <View style={styles.starsRow}>
      {[0, 1, 2].map((i) => (
        <Text key={i} style={[styles.star, i < count && styles.starFilled]}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function LevelsScreen({ navigation }: Props) {
  const { progress, loading } = useProgress();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>Classic</Text>
          <Text style={styles.subtitle}>Pick 4 numbers to make the target</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={levels}
        keyExtractor={(level) => String(level)}
        numColumns={4}
        contentContainerStyle={styles.grid}
        renderItem={({ item: level }) => {
          const unlocked = level <= progress.maxUnlockedLevel;
          const stars = progress.starsByLevel[level] ?? 0;
          return (
            <Pressable
              disabled={!unlocked}
              onPress={() => navigation.navigate('Game', { level })}
              style={[
                styles.levelTile,
                !unlocked && styles.levelTileLocked,
                stars > 0 && styles.levelTileEarned,
              ]}
              accessibilityLabel={unlocked ? `Level ${level}` : `Level ${level}, locked`}
            >
              {unlocked ? (
                <>
                  <Text style={styles.levelNumber}>{level}</Text>
                  <Stars count={stars} />
                </>
              ) : (
                <Text style={styles.lockIcon}>🔒</Text>
              )}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 12,
  },
  loadingText: {
    color: colors.inkFaint,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backArrow: {
    color: colors.ink,
    fontSize: 20,
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.inkFaint,
    fontSize: 13,
    marginTop: 2,
  },
  grid: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  levelTile: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  levelTileLocked: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  levelTileEarned: {
    backgroundColor: colors.cardAlt,
  },
  levelNumber: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  lockIcon: {
    fontSize: 18,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 1,
  },
  star: {
    color: colors.border,
    fontSize: 11,
  },
  starFilled: {
    color: '#FFC107',
  },
});
