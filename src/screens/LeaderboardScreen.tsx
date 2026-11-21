import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { BottomNav, NavTab } from '../components/BottomNav';
import { useAuth } from '../storage/AuthContext';
import { DailyLeaderboardRow, fetchTodayLeaderboard } from '../lib/daily';
import { colors, radii, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

function formatTime(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<DailyLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTodayLeaderboard().then((data) => {
      if (!cancelled) {
        setRows(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function onNavigate(tab: NavTab) {
    navigation.navigate(tab);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Leaderboard</Text>
        <Text style={styles.subtitle}>Fastest Daily Challenge solves, today only</Text>
      </View>

      <View style={styles.listArea}>
        {loading ? (
          <ActivityIndicator color={colors.orange} style={{ marginTop: 24 }} />
        ) : rows.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {user
                ? "No one's finished today's Daily Challenge yet — be the first!"
                : "No results yet today. Sign in and play the Daily Challenge to appear here."}
            </Text>
          </View>
        ) : (
          rows.map((row, i) => (
            <View key={`${row.displayName ?? 'anon'}-${i}`} style={styles.row}>
              <Text style={styles.rank}>{MEDALS[i] ?? `#${i + 1}`}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {row.displayName ?? 'A player'}
              </Text>
              <Text style={styles.time}>{formatTime(row.timeMs)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.navWrap}>
        <BottomNav active="Leaderboard" onNavigate={onNavigate} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 14,
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
  listArea: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 24,
    alignItems: 'center',
    ...shadows.soft,
  },
  emptyText: {
    color: colors.inkFaint,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    ...shadows.soft,
  },
  rank: {
    fontSize: 16,
    width: 30,
  },
  name: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  time: {
    color: colors.orange,
    fontSize: 15,
    fontWeight: '800',
  },
  navWrap: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    paddingTop: 8,
  },
});
