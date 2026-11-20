import React from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../storage/ProgressContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

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

export default function HomeScreen({ navigation }: Props) {
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
        <View>
          <Text style={styles.title}>Pick 4</Text>
          <Text style={styles.subtitle}>Add any {4} numbers to make the target</Text>
        </View>
        <Pressable
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Settings"
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
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
              style={[styles.levelTile, !unlocked && styles.levelTileLocked]}
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
    backgroundColor: '#1b1b2f',
    paddingTop: 12,
  },
  loadingText: {
    color: '#8a8aa3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8a8aa3',
    fontSize: 14,
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    color: '#e8e8f5',
    fontSize: 18,
  },
  grid: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  levelTile: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 14,
    backgroundColor: '#2a2a42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelTileLocked: {
    opacity: 0.35,
  },
  levelNumber: {
    color: '#ffffff',
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
    color: '#45455e',
    fontSize: 11,
  },
  starFilled: {
    color: '#fbbf24',
  },
});
