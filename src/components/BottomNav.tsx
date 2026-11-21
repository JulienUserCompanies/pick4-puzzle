import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows } from '../theme';

export type NavTab = 'Home' | 'Leaderboard' | 'Statistics' | 'Profile';

const TABS: { key: NavTab; icon: string; label: string }[] = [
  { key: 'Home', icon: '⌂', label: 'Home' },
  { key: 'Leaderboard', icon: '🏆', label: 'Ranks' },
  { key: 'Statistics', icon: '📊', label: 'Stats' },
  { key: 'Profile', icon: '◕', label: 'Profile' },
];

interface Props {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
}

/** The 4-tab bottom bar shared by Home / Leaderboard / Statistics / Profile, matching the mockup. */
export function BottomNav({ active, onNavigate }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => !isActive && onNavigate(tab.key)}
            style={styles.tab}
            accessibilityLabel={tab.label}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FDF6F1',
    borderRadius: 24,
    paddingBottom: 4,
    paddingTop: 4,
    ...shadows.soft,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#FFE6C2',
  },
  icon: {
    fontSize: 18,
    color: colors.inkFaint,
  },
  iconActive: {
    color: colors.orange,
  },
});
