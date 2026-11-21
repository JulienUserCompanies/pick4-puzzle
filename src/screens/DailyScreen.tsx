import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Mascot } from '../components/Mascot';
import { GradientButton } from '../components/GradientButton';
import { useAuth } from '../storage/AuthContext';
import { supabase } from '../lib/supabase';
import {
  DailyChallenge,
  challengeToPuzzle,
  fetchTodayChallenge,
  hasSubmittedToday,
} from '../lib/daily';
import { colors, radii, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Daily'>;

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DailyScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [streakDays, setStreakDays] = useState<boolean[]>(Array(7).fill(false));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const today = await fetchTodayChallenge();
      if (cancelled) return;
      setChallenge(today);

      if (user) {
        const submitted = await hasSubmittedToday(user.id);
        if (cancelled) return;
        setAlreadyPlayed(submitted);

        // Last 7 calendar dates (oldest first), marked where a result exists.
        const dates: string[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setUTCDate(d.getUTCDate() - i);
          dates.push(d.toISOString().slice(0, 10));
        }
        const { data } = await supabase
          .from('daily_results')
          .select('challenge_date')
          .eq('user_id', user.id)
          .in('challenge_date', dates);
        if (cancelled) return;
        const played = new Set((data ?? []).map((r) => r.challenge_date));
        setStreakDays(dates.map((d) => played.has(d)));
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  function play() {
    if (!challenge) return;
    navigation.navigate('Game', {
      level: 0,
      daily: true,
      dailyPuzzle: challengeToPuzzle(challenge),
    });
  }

  const streakCount = streakDays.filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()} accessibilityLabel="Back">
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      <View style={styles.headerArea}>
        <Mascot pose="thinking" size={88} bob />
        <Text style={styles.title}>Daily Challenge</Text>
        <Text style={styles.subtitle}>Build the target number with 4 numbers!</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.orange} style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayHeaderText}>TODAY</Text>
          </View>
          <View style={styles.todayBody}>
            {!challenge ? (
              <Text style={styles.emptyText}>No challenge is live yet — check back soon!</Text>
            ) : alreadyPlayed ? (
              <>
                <Text style={styles.todayLabel}>Make {challenge.target}</Text>
                <Text style={styles.doneText}>You've already played today's puzzle. ✓</Text>
              </>
            ) : (
              <>
                <Text style={styles.todayLabel}>Make {challenge.target}</Text>
                <Pressable style={styles.playButton} onPress={play}>
                  <Text style={styles.playGlyph}>▶</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      )}

      <View style={styles.streakCard}>
        <Text style={styles.streakTitle}>🔥 Your Streak: {user ? streakCount : 0} days</Text>
        {user ? (
          <View style={styles.streakRow}>
            {DAY_LABELS.map((label, i) => (
              <View key={i} style={styles.streakDay}>
                <Text style={styles.streakDayLabel}>{label}</Text>
                <Text style={[styles.streakMark, streakDays[i] && styles.streakMarkFilled]}>
                  {streakDays[i] ? '●' : '○'}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.signInHint}>Sign in from Settings to track your streak</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 17,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  backArrow: {
    color: colors.ink,
    fontSize: 16,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.inkFaint,
    fontSize: 13,
    textAlign: 'center',
  },
  todayCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 18,
    ...shadows.card,
  },
  todayHeader: {
    width: '100%',
    backgroundColor: colors.purple,
    paddingVertical: 8,
    alignItems: 'center',
  },
  todayHeaderText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  todayBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  todayLabel: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  emptyText: {
    color: colors.inkFaint,
    fontSize: 14,
    textAlign: 'center',
  },
  doneText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    color: colors.white,
    fontSize: 22,
  },
  streakCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: 16,
    gap: 12,
  },
  streakTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakDay: {
    alignItems: 'center',
    gap: 4,
  },
  streakDayLabel: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  streakMark: {
    color: colors.border,
    fontSize: 16,
  },
  streakMarkFilled: {
    color: colors.success,
  },
  signInHint: {
    color: colors.inkFaint,
    fontSize: 12,
  },
});
