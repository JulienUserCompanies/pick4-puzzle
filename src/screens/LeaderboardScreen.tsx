import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { BottomNav, NavTab } from '../components/BottomNav';
import { useAuth } from '../storage/AuthContext';
import { DailyLeaderboardRow, fetchTodayLeaderboard } from '../lib/daily';
import { colors, radii, shadows, topHighlight } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

function formatTime(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS: [string, string][] = [
  ['#FFE27A', '#E0A526'], // gold
  ['#F1F3F6', '#C3C9D1'], // silver
  ['#F0B27A', '#B9733A'], // bronze
];

function RankBadge({ index }: { index: number }) {
  if (index > 2) {
    return (
      <View style={styles.rankPlain}>
        <Text style={styles.rankPlainText}>#{index + 1}</Text>
      </View>
    );
  }
  return (
    <View style={styles.medalLedge}>
      <LinearGradient colors={MEDAL_COLORS[index]} style={styles.medalBadge}>
        <LinearGradient colors={topHighlight} style={styles.medalSheen} pointerEvents="none" />
        <Text style={styles.medalGlyph}>{MEDALS[index]}</Text>
      </LinearGradient>
    </View>
  );
}

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
          rows.map((row, i) => {
            const isMe = !!user && row.userId === user.id;
            return (
              <View
                key={`${row.userId}-${i}`}
                style={[styles.rowWrap, isMe && styles.rowWrapMe]}
              >
                <View style={[styles.row, isMe && styles.rowMe]}>
                  <RankBadge index={i} />
                  <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
                    {row.displayName ?? 'A player'}
                    {isMe ? ' (You)' : ''}
                  </Text>
                  <Text style={styles.time}>{formatTime(row.timeMs)}</Text>
                </View>
              </View>
            );
          })
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
  rowWrap: {
    ...shadows.raised,
  },
  rowWrapMe: {
    ...shadows.glowOrange,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowMe: {
    borderColor: colors.orange,
    backgroundColor: colors.cardAlt,
  },
  rankPlain: {
    width: 34,
    alignItems: 'center',
  },
  rankPlainText: {
    color: colors.inkFaint,
    fontSize: 14,
    fontWeight: '700',
  },
  medalLedge: {
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingBottom: 2,
  },
  medalBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  medalSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  medalGlyph: {
    fontSize: 16,
  },
  name: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  nameMe: {
    color: colors.orangeDeep,
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
