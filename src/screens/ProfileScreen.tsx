import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { BottomNav, NavTab } from '../components/BottomNav';
import { Mascot } from '../components/Mascot';
import { useAuth } from '../storage/AuthContext';
import { useProgress } from '../storage/ProgressContext';
import { colors, radii, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { progress } = useProgress();

  const totalPoints = Object.values(progress.starsByLevel).reduce((a, s) => a + s * 20, 0);
  const displayName = user?.email ? user.email.split('@')[0] : 'Guest';

  function onNavigate(tab: NavTab) {
    navigation.navigate(tab);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Mascot pose="idle" size={92} />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.pointsPill}>
          <View style={styles.coin}>
            <Text style={styles.coinMark}>C</Text>
          </View>
          <Text style={styles.pointsText}>{totalPoints} pts</Text>
        </View>
      </View>

      {!user && (
        <Pressable style={styles.signInCard} onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.signInTitle}>Playing as a guest</Text>
          <Text style={styles.signInSub}>Sign in to sync your progress and join the leaderboard</Text>
          <Text style={styles.signInCta}>Sign in →</Text>
        </Pressable>
      )}

      <Pressable style={styles.menuRow} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.menuLabel}>Settings</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      <Pressable style={styles.menuRow} onPress={() => navigation.navigate('Statistics')}>
        <Text style={styles.menuLabel}>Statistics</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <View style={styles.navWrap}>
        <BottomNav active="Profile" onNavigate={onNavigate} />
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
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 18,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD9A8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  name: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFD866',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  coin: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinMark: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  pointsText: {
    color: '#5C3D00',
    fontSize: 12,
    fontWeight: '800',
  },
  signInCard: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 16,
    ...shadows.soft,
  },
  signInTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  signInSub: {
    color: colors.inkFaint,
    fontSize: 13,
    marginBottom: 10,
  },
  signInCta: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: '800',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 15,
    ...shadows.soft,
  },
  menuLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  chevron: {
    color: colors.inkFaint,
    fontSize: 20,
  },
  navWrap: {
    marginTop: 'auto',
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
});
