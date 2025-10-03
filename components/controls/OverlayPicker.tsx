import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { OVERLAY_REGISTRY } from '../../overlays';
import type { OverlayRegistryEntry } from '../../overlays';
import { useTheme } from '../../theme/ThemeProvider';

export type OverlayPickerProps = {
  activeId: string;
  onSelect: (id: string) => void;
  overlays?: Pick<OverlayRegistryEntry, 'id' | 'label'>[];
};

const OverlayPicker: React.FC<OverlayPickerProps> = ({ activeId, onSelect, overlays }) => {
  const { theme } = useTheme();
  const data = overlays ?? OVERLAY_REGISTRY;
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        horizontal
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = item.id === activeId;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.label} overlay`}
              onPress={() => onSelect(item.id)}
              style={[styles.chip, { backgroundColor: active ? theme.accent : '#00000055' }]}
              hitSlop={12}
            >
              <Text style={[styles.label, { color: active ? '#fff' : theme.textPrimary }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4
  },
  label: {
    fontSize: 14,
    fontWeight: '600'
  }
});

export default OverlayPicker;
