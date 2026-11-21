import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { GradientButton } from '../components/GradientButton';
import { colors, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding1'>;

export default function Onboarding1Screen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.art}>
          <Text style={[styles.star, { left: 4, top: 30 }]}>★</Text>
          <Text style={[styles.star, { left: 62, top: 0, fontSize: 24 }]}>★</Text>
          <Text style={[styles.star, { right: 10, top: 26 }]}>★</Text>
          <View style={[styles.numBlock, { left: 4, top: 62, backgroundColor: '#3E9EE8', transform: [{ rotate: '-6deg' }] }]}>
            <Text style={styles.numText}>2</Text>
          </View>
          <View style={[styles.numBlockBig, { left: 42, top: 40, backgroundColor: '#8A78F8' }]}>
            <Text style={styles.numTextBig}>2</Text>
          </View>
          <View style={[styles.numBlock, { right: 4, top: 62, backgroundColor: '#FF9800', transform: [{ rotate: '6deg' }] }]}>
            <Text style={styles.numText}>3</Text>
          </View>
        </View>
        <Text style={styles.title}>Build the Number</Text>
        <Text style={styles.subtitle}>Choose 4 numbers from the grid to make the target number!</Text>
      </View>
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <GradientButton label="Next" onPress={() => navigation.navigate('Onboarding2')} style={{ width: '100%' }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 40,
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  body: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: {
    width: 150,
    height: 130,
    marginBottom: 18,
  },
  star: {
    position: 'absolute',
    color: '#FFC107',
    fontSize: 17,
  },
  numBlock: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBlockBig: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  numTextBig: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '800',
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: colors.inkSoft,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 260,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.orange,
  },
});
