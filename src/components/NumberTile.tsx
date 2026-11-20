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
    backgroundColor: '#2a2a42',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1.5%',
  },
  tileSelected: {
    backgroundColor: '#5b6cff',
  },
  tilePressed: {
    opacity: 0.8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e8e8f5',
  },
  valueSelected: {
    color: '#ffffff',
  },
});
