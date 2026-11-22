import React, { useMemo } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../storage/ProgressContext';
import { CHAPTER_SIZE, TOTAL_LEVELS, tierForLevel } from '../engine/difficulty';
import { DifficultyTier } from '../engine/types';
import { colors, radii, shadows, topHighlight } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

interface Chapter {
  index: number;
  startLevel: number;
  endLevel: number;
  tier: DifficultyTier;
}

const TIER_COLORS: Record<DifficultyTier, [string, string]> = {
  easy: [colors.blueGradTop, colors.blueGradBottom],
  mid: [colors.greenGradTop, colors.greenGradBottom],
  hard: [colors.orangeLight, colors.orangeDeep],
  expert: [colors.purpleLight, colors.purpleDeep],
};

const TIER_LABELS: Record<DifficultyTier, string> = {
  easy: 'Easy',
  mid: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

function buildChapters(): Chapter[] {
  const chapters: Chapter[] = [];
  for (let start = 1; start <= TOTAL_LEVELS; start += CHAPTER_SIZE) {
    const end = Math.min(start + CHAPTER_SIZE - 1, TOTAL_LEVELS);
    chapters.push({ index: chapters.length, startLevel: start, endLevel: end, tier: tierForLevel(start) });
  }
  return chapters;
}

/** Chapter-select screen — 1000 levels grouped into ~20-level chapters, since a single flat 1000-tile grid doesn't scale. Tapping an unlocked chapter opens ChapterLevelsScreen for that range. */
export default function LevelsScreen({ navigation }: Props) {
  const { progress, loading } = useProgress();
  const chapters = useMemo(buildChapters, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading…</Text>
      </SafeAreaView>
    );
  }

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
        data={chapters}
        keyExtractor={(chapter) => String(chapter.index)}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item: chapter }) => {
          const unlocked = progress.maxUnlockedLevel >= chapter.startLevel;
          let earnedStars = 0;
          for (let level = chapter.startLevel; level <= chapter.endLevel; level++) {
            earnedStars += progress.starsByLevel[level] ?? 0;
          }
          const maxStars = (chapter.endLevel - chapter.startLevel + 1) * 3;
          const complete = earnedStars === maxStars;

          return (
            <Pressable
              disabled={!unlocked}
              onPress={() =>
                navigation.navigate('ChapterLevels', {
                  chapterIndex: chapter.index,
                  startLevel: chapter.startLevel,
                  endLevel: chapter.endLevel,
                })
              }
              style={[styles.cardLedge, !unlocked && styles.cardLedgeLocked]}
              accessibilityLabel={
                unlocked
                  ? `Chapter ${chapter.index + 1}, levels ${chapter.startLevel} to ${chapter.endLevel}`
                  : `Chapter ${chapter.index + 1}, locked`
              }
            >
              <View style={[styles.card, unlocked && complete && styles.cardComplete]}>
                {unlocked ? (
                  <LinearGradient colors={TIER_COLORS[chapter.tier]} style={styles.iconBadge}>
                    <LinearGradient colors={topHighlight} style={styles.iconBadgeSheen} pointerEvents="none" />
                    <Text style={styles.iconBadgeText}>{chapter.index + 1}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.iconBadgeLocked}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}
                <Text style={styles.chapterTitle}>Chapter {chapter.index + 1}</Text>
                <Text style={styles.chapterRange}>
                  Levels {chapter.startLevel}–{chapter.endLevel}
                </Text>
                {unlocked && (
                  <View style={styles.starsRow}>
                    <Text style={styles.starsText}>★ {earnedStars}</Text>
                    <Text style={styles.starsOutOf}>/ {maxStars}</Text>
                  </View>
                )}
                <Text style={[styles.tierLabel, { color: TIER_COLORS[chapter.tier][1] }]}>
                  {TIER_LABELS[chapter.tier]}
                </Text>
              </View>
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
  cardLedge: {
    flex: 1,
    margin: 6,
    borderRadius: radii.lg,
    backgroundColor: '#E8D3B0',
    paddingBottom: 4,
    ...shadows.raised,
  },
  cardLedgeLocked: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  cardComplete: {
    backgroundColor: colors.cardAlt,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  iconBadgeSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  iconBadgeText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  iconBadgeLocked: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardAlt,
    marginBottom: 10,
  },
  lockIcon: {
    fontSize: 18,
  },
  chapterTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  chapterRange: {
    color: colors.inkFaint,
    fontSize: 11,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  starsText: {
    color: '#FFC107',
    fontSize: 13,
    fontWeight: '800',
  },
  starsOutOf: {
    color: colors.inkFaint,
    fontSize: 11,
    marginLeft: 2,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
  },
});
