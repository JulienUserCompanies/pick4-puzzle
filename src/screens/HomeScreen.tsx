import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../storage/ProgressContext';
import { Mascot } from '../components/Mascot';
import { BottomNav, NavTab } from '../components/BottomNav';
import { colors, radii, shadows, topHighlight } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { progress } = useProgress();

  const totalPoints = Object.values(progress.starsByLevel).reduce(
    (sum, stars) => sum + stars * 20,
    0
  );

  function onNavigate(tab: NavTab) {
    navigation.navigate(tab);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Mascot pose="idle" size={58} style={styles.avatarImg} />
            </View>
            <View>
              <Text style={styles.hello}>Hello, Player</Text>
              <View style={styles.pointsPill}>
                <View style={styles.coin}>
                  <Text style={styles.coinMark}>C</Text>
                </View>
                <Text style={styles.pointsText}>{totalPoints} pts</Text>
              </View>
            </View>
          </View>
          <Pressable
            style={styles.iconButton}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel="Settings"
          >
            <Text style={styles.iconGlyph}>⚙</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate('Daily')} style={styles.dailyGlowWrap}>
          <LinearGradient
            colors={[colors.purple, colors.purpleDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dailyBanner}
          >
            {/* Soft highlight across the top edge, like light hitting a raised surface. */}
            <LinearGradient colors={topHighlight} style={styles.dailyBannerSheen} pointerEvents="none" />

            <View style={styles.dailyIconLedge}>
              <View style={styles.dailyIconWrap}>
                <LinearGradient colors={topHighlight} style={styles.dailyIconSheen} pointerEvents="none" />
                <Text style={styles.dailyIcon}>📅</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dailyTitle}>Daily Challenge</Text>
              <Text style={styles.dailySubtitle}>Play today's puzzle and keep your streak</Text>
            </View>
            <View style={styles.dailyPlayLedge}>
              <LinearGradient
                colors={[colors.orangeLight, colors.orangeDeep]}
                style={styles.dailyPlay}
              >
                <LinearGradient colors={topHighlight} style={styles.dailyPlaySheen} pointerEvents="none" />
                <Text style={styles.dailyPlayGlyph}>▶</Text>
              </LinearGradient>
            </View>
          </LinearGradient>
        </Pressable>

        <View style={styles.modeGrid}>
          <ModeCard
            title="Classic"
            subtitle={`Level ${progress.maxUnlockedLevel}`}
            emoji="🔢"
            onPress={() => navigation.navigate('Levels')}
            background={colors.cardAlt}
            badgeColors={[colors.blueGradTop, colors.purpleDeep]}
          />
          <ModeCard
            title="Timed"
            subtitle={progress.timedBest > 0 ? `Best: ${progress.timedBest}` : undefined}
            emoji="⏱️"
            onPress={() => navigation.navigate('Timed')}
            background={colors.card}
            badgeColors={[colors.orangeLight, colors.orangeDeep]}
          />
          <ModeCard
            title="Daily"
            emoji="📅"
            onPress={() => navigation.navigate('Daily')}
            background={colors.cardAlt}
            badgeColors={[colors.purpleLight, colors.purpleDeep]}
          />
          <ModeCard
            title="Weekly"
            emoji="🏅"
            comingSoon
            background={colors.card}
            badgeColors={[colors.goldLight, colors.gold]}
          />
        </View>
      </ScrollView>

      <View style={styles.navWrap}>
        <BottomNav active="Home" onNavigate={onNavigate} />
      </View>
    </SafeAreaView>
  );
}

function ModeCard({
  title,
  subtitle,
  emoji,
  onPress,
  background,
  comingSoon,
  badgeColors,
}: {
  title: string;
  subtitle?: string;
  emoji: string;
  onPress?: () => void;
  background: string;
  comingSoon?: boolean;
  badgeColors: [string, string];
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.modeCard, { backgroundColor: background }, comingSoon && styles.modeCardDisabled]}
    >
      {/* Subtle sheen across the top of the card, like the daily banner. */}
      <LinearGradient colors={topHighlight} style={styles.modeCardSheen} pointerEvents="none" />

      <View style={styles.modeIconLedge}>
        <LinearGradient colors={badgeColors} style={styles.modeIconBadge}>
          <LinearGradient colors={topHighlight} style={styles.modeIconSheen} pointerEvents="none" />
          <Text style={styles.modeEmoji}>{emoji}</Text>
        </LinearGradient>
      </View>
      <Text style={styles.modeTitle}>{title}</Text>
      {subtitle && <Text style={styles.modeSubtitle}>{subtitle}</Text>}
      {comingSoon && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD9A8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    marginTop: 10,
  },
  hello: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD866',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  coin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinMark: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '800',
  },
  pointsText: {
    color: '#5C3D00',
    fontSize: 11,
    fontWeight: '800',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  iconGlyph: {
    fontSize: 16,
    color: colors.orange,
  },
  dailyGlowWrap: {
    marginBottom: 20,
    ...shadows.glowPurple,
  },
  dailyBanner: {
    borderRadius: radii.lg,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  dailyBannerSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  dailyIconLedge: {
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingBottom: 3,
  },
  dailyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dailyIconSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  dailyIcon: {
    fontSize: 20,
  },
  dailyTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  dailySubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  dailyPlayLedge: {
    borderRadius: 18,
    backgroundColor: colors.orangeDeep,
    paddingBottom: 3,
  },
  dailyPlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dailyPlaySheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  dailyPlayGlyph: {
    color: colors.white,
    fontSize: 14,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 12,
  },
  modeCard: {
    width: '47%',
    minHeight: 130,
    borderRadius: radii.xl,
    padding: 18,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    ...shadows.raised,
  },
  modeCardSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  modeCardDisabled: {
    opacity: 0.6,
  },
  modeIconLedge: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingBottom: 3,
    marginBottom: 12,
  },
  modeIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modeIconSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  modeEmoji: {
    fontSize: 22,
  },
  modeTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  modeSubtitle: {
    color: colors.inkFaint,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comingSoonText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  navWrap: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
});
