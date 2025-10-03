import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  LayoutChangeEvent
} from 'react-native';
import { Camera } from 'expo-camera';
import { useTheme } from '../../theme/ThemeProvider';

const colorOptions = ['#2f80ed', '#56ccf2', '#f2994a', '#eb5757', '#27ae60', '#f2f2f2'];

export type SettingsSheetProps = {
  visible: boolean;
  onClose: () => void;
  color: string;
  onColorChange: (color: string) => void;
  opacity: number;
  onOpacityChange: (value: number) => void;
  thickness: number;
  onThicknessChange: (value: number) => void;
  zoom: number;
  onZoomChange: (value: number) => void;
  flashMode: Camera.FlashMode;
  onFlashModeChange: (mode: Camera.FlashMode) => void;
  whiteBalance: Camera.WhiteBalance;
  onWhiteBalanceChange: (mode: Camera.WhiteBalance) => void;
  exposureCompensation?: number;
  onExposureChange?: (value: number) => void;
  exposureSupported?: boolean;
};

type SliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  format?: (value: number) => string;
};

const SliderControl: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  minimumValue = 0,
  maximumValue = 1,
  step = 0.05,
  format
}) => {
  const [barWidth, setBarWidth] = useState(1);
  const ratio = (value - minimumValue) / (maximumValue - minimumValue);
  const indicatorLeft = Math.max(0, Math.min(ratio, 1)) * barWidth;

  const clampToStep = (next: number) => {
    const stepped = Math.round(next / step) * step;
    return Math.max(minimumValue, Math.min(maximumValue, stepped));
  };

  const handleEvent = (locationX: number) => {
    const normalized = Math.max(0, Math.min(locationX / barWidth, 1));
    const nextValue = minimumValue + normalized * (maximumValue - minimumValue);
    onChange(clampToStep(nextValue));
  };

  return (
    <View style={styles.sliderRow}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <View
        style={styles.sliderBar}
        onLayout={(event: LayoutChangeEvent) => setBarWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderGrant={event => handleEvent(event.nativeEvent.locationX)}
        onResponderMove={event => handleEvent(event.nativeEvent.locationX)}
      >
        <View style={styles.sliderTrack} />
        <View style={[styles.sliderIndicator, { left: indicatorLeft - 8 }]} />
      </View>
      <Text style={styles.sliderValue}>{format ? format(value) : value.toFixed(2)}</Text>
    </View>
  );
};

const SettingsSheet: React.FC<SettingsSheetProps> = ({
  visible,
  onClose,
  color,
  onColorChange,
  opacity,
  onOpacityChange,
  thickness,
  onThicknessChange,
  zoom,
  onZoomChange,
  flashMode,
  onFlashModeChange,
  whiteBalance,
  onWhiteBalanceChange,
  exposureCompensation,
  onExposureChange,
  exposureSupported
}) => {
  const { theme } = useTheme();

  const flashModes = useMemo(
    () => [
      { label: 'Auto', mode: Camera.Constants.FlashMode.auto },
      { label: 'On', mode: Camera.Constants.FlashMode.on },
      { label: 'Off', mode: Camera.Constants.FlashMode.off }
    ],
    []
  );

  const whiteBalanceOptions = useMemo(
    () => [
      { label: 'Auto', mode: Camera.Constants.WhiteBalance.auto },
      { label: 'Sunny', mode: Camera.Constants.WhiteBalance.sunny },
      { label: 'Cloudy', mode: Camera.Constants.WhiteBalance.cloudy },
      { label: 'Incandescent', mode: Camera.Constants.WhiteBalance.incandescent },
      { label: 'Fluorescent', mode: Camera.Constants.WhiteBalance.fluorescent }
    ],
    []
  );

  const renderModeButtons = (
    options: { label: string; mode: number }[],
    current: number,
    onChange: (mode: number) => void
  ) => (
    <View style={styles.modeRow}>
      {options.map(option => {
        const active = option.mode === current;
        return (
          <Pressable
            key={option.label}
            onPress={() => onChange(option.mode)}
            style={[styles.modeButton, active && { backgroundColor: theme.accent }]}
            accessibilityRole="button"
            accessibilityLabel={`${option.label} option`}
          >
            <Text style={[styles.modeText, active && { color: '#fff' }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.surface }]} onPress={() => {}}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.sectionLabel}>Overlay Color</Text>
          <View style={styles.swatchRow}>
            {colorOptions.map(option => {
              const active = option === color;
              const swatchStyle: ViewStyle = {
                backgroundColor: option,
                borderWidth: active ? 2 : 1,
                borderColor: active ? theme.accent : '#ffffff33'
              };
              return (
                <Pressable
                  key={option}
                  style={[styles.swatch, swatchStyle]}
                  onPress={() => onColorChange(option)}
                  accessibilityRole="button"
                  accessibilityLabel={`Set overlay color ${option}`}
                />
              );
            })}
          </View>
          <SliderControl
            label="Opacity"
            value={opacity}
            onChange={onOpacityChange}
            minimumValue={0.1}
            maximumValue={1}
            step={0.05}
            format={value => `${Math.round(value * 100)}%`}
          />
          <SliderControl
            label="Thickness"
            value={thickness}
            onChange={onThicknessChange}
            minimumValue={1}
            maximumValue={8}
            step={1}
            format={value => `${Math.round(value)}dp`}
          />
          <SliderControl
            label="Zoom"
            value={zoom}
            onChange={onZoomChange}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            format={value => `${Math.round(value * 100)}%`}
          />
          <Text style={styles.sectionLabel}>Flash</Text>
          {renderModeButtons(flashModes, flashMode, mode => onFlashModeChange(mode as Camera.FlashMode))}
          <Text style={styles.sectionLabel}>White Balance</Text>
          {renderModeButtons(
            whiteBalanceOptions,
            whiteBalance,
            mode => onWhiteBalanceChange(mode as Camera.WhiteBalance)
          )}
          {exposureSupported && onExposureChange ? (
            <SliderControl
              label="Exposure"
              value={exposureCompensation ?? 0}
              onChange={onExposureChange}
              minimumValue={-1}
              maximumValue={1}
              step={0.1}
              format={value => value.toFixed(1)}
            />
          ) : (
            <Text style={styles.helperText}>
              Exposure compensation not supported on this device.
            </Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end'
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 12
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6
  },
  sliderLabel: {
    flexBasis: 90,
    fontSize: 14
  },
  sliderBar: {
    flex: 1,
    height: 24,
    justifyContent: 'center'
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff33'
  },
  sliderIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    top: 4
  },
  sliderValue: {
    width: 70,
    textAlign: 'right',
    fontVariant: ['tabular-nums']
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  modeButton: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff22'
  },
  modeText: {
    fontSize: 14,
    color: '#ffffff'
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 6
  }
});

export default SettingsSheet;
