import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  value: number;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function NumberTile({ value, selected, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.tile,
        selected && styles.tileSelected,
        pressed && !disabled && styles.tilePressed,
      ]}
    >
      <Text style={[styles.value, selected && styles.valueSelected]}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1.5%',
  },
  tileSelected: {
    backgroundColor: '#c6ff3d',
    borderColor: '#c6ff3d',
  },
  tilePressed: {
    opacity: 0.8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f2f2ed',
  },
  valueSelected: {
    color: '#0a0a0a',
  },
});
