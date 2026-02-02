import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type FilterKey = 'all' | 'money' | 'favor' | 'praise' | 'link' | 'image';

const CHIP_LABELS: Record<FilterKey, string> = {
  all: '전체',
  money: '금전',
  favor: '부탁',
  praise: '과한칭찬',
  link: '링크',
  image: '이미지',
};

type FilterChipsProps = {
  selected: FilterKey;
  onSelect: (key: FilterKey) => void;
};

export default function FilterChips({ selected, onSelect }: FilterChipsProps) {
  return (
    <View style={styles.row}>
      {(Object.keys(CHIP_LABELS) as FilterKey[]).map((key) => (
        <Pressable
          key={key}
          style={[styles.chip, selected === key ? styles.chipActive : styles.chipInactive]}
          onPress={() => onSelect(key)}>
          <Text style={[styles.chipText, selected === key ? styles.chipTextActive : styles.chipTextInactive]}>
            {CHIP_LABELS[key]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipActive: {
    backgroundColor: 'rgba(232, 202, 191, 0.9)',
  },
  chipInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  chipText: {
    fontSize: 12,
  },
  chipTextActive: {
    color: '#5d4e45',
    fontWeight: '600',
  },
  chipTextInactive: {
    color: '#7b6c62',
  },
});
