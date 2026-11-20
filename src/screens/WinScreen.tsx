import React, { useEffect } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useFeedback } from '../audio/useFeedback';

type Props = NativeStackScreenProps<RootStackParamList, 'Win'>;

export default function WinScreen({ route, navigation }: Props) {
  const { level, stars } = route.params;
  const sfx = useFeedback();

  useEffect(() => {
    sfx.win();
    // Only on first mount of this celebration screen, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Level {level} complete!</Text>

        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={[styles.star, i < stars && styles.starFilled]}>
              ★
            </Text>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              navigation.replace('Game', { level: level + 1 })
            }
          >
            <Text style={styles.primaryButtonText}>Next level</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.secondaryButtonText}>Back to levels</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    color: '#f2f2ed',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
  },
  star: {
    color: '#2a2a28',
    fontSize: 44,
  },
  starFilled: {
    color: '#c6ff3d',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#c6ff3d',
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6b6f67',
    fontSize: 16,
    fontWeight: '600',
  },
});
