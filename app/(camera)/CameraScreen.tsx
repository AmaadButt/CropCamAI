import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OverlayPicker from '../../components/controls/OverlayPicker';
import SettingsSheet from '../../components/controls/SettingsSheet';
import FocusRing from '../../components/controls/FocusRing';
import NLBar from '../../components/controls/NLBar';
import useAccelerometerLevel from '../../lib/useAccelerometerLevel';
import { OVERLAY_REGISTRY, findOverlay } from '../../overlays';
import type { OverlayRegistryEntry } from '../../overlays';
import type { OverlayDef } from '../../custom/OverlayDef';
import analyzeImage from '../../lib/analyzeImage';
import { useTheme } from '../../theme/ThemeProvider';
import { requestPermissionsAsync, openSettings } from '../../lib/permissions';

const SETTINGS_KEY = 'camera-settings-v1';
const PRESETS_KEY = 'camera-overlay-presets-v1';

type PersistedSettings = {
  overlayId: string;
  color: string;
  opacity: number;
  thickness: number;
  flashMode: number;
  aspectRatio: '3:4' | '9:16';
  zoom: number;
};

type CustomPreset = {
  id: string;
  summary: string;
  def: OverlayDef;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const CameraScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Camera | null>(null);
  const pinchBaseZoom = useRef(0);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [mediaPermission, setMediaPermission] = useState<boolean>(false);
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.auto);
  const [whiteBalance, setWhiteBalance] = useState(Camera.Constants.WhiteBalance.auto);
  const [aspectRatio, setAspectRatio] = useState<'3:4' | '9:16'>('3:4');
  const [zoom, setZoom] = useState(0);
  const [overlayColor, setOverlayColor] = useState(theme.overlayDefault);
  const [overlayOpacity, setOverlayOpacity] = useState(0.8);
  const [overlayThickness, setOverlayThickness] = useState(2);
  const [activeOverlayId, setActiveOverlayId] = useState('thirds');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [customOverlayDef, setCustomOverlayDef] = useState<OverlayDef | null>(null);
  const [overlaySummary, setOverlaySummary] = useState('Rule of Thirds');
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [exposureSupported, setExposureSupported] = useState(false);
  const [exposureCompensation, setExposureCompensation] = useState(0);
  const [focusRing, setFocusRing] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0
  });
  const [loadingCapture, setLoadingCapture] = useState(false);
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [analysisImageUri, setAnalysisImageUri] = useState<string | null>(null);
  const [analysisOverlays, setAnalysisOverlays] = useState<OverlayDef[]>([]);
  const [analysisTilt, setAnalysisTilt] = useState(0);
  const [allowCloudAnalysis, setAllowCloudAnalysis] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const { tiltDeg } = useAccelerometerLevel();

  useEffect(() => {
    (async () => {
      const permission = await requestPermissionsAsync();
      setHasPermission(permission.camera);
      setMediaPermission(permission.mediaLibrary);
      if (!permission.camera) {
        Alert.alert(
          'Camera permission needed',
          'Please grant camera access in Settings to use the capture features.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openSettings }
          ]
        );
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          const parsed: PersistedSettings = JSON.parse(stored);
          setActiveOverlayId(parsed.overlayId);
          setOverlayColor(parsed.color);
          setOverlayOpacity(parsed.opacity);
          setOverlayThickness(parsed.thickness);
          setFlashMode(parsed.flashMode as Camera.FlashMode);
          setAspectRatio(parsed.aspectRatio);
          setZoom(parsed.zoom);
        }
      } catch (error) {
        console.warn('Failed to load settings', error);
      }
      try {
        const presetRaw = await AsyncStorage.getItem(PRESETS_KEY);
        if (presetRaw) {
          const parsed = JSON.parse(presetRaw) as CustomPreset[];
          setCustomPresets(parsed);
        }
      } catch (error) {
        console.warn('Failed to load presets', error);
      }
    })();
  }, []);

  useEffect(() => {
    const persist: PersistedSettings = {
      overlayId: activeOverlayId,
      color: overlayColor,
      opacity: overlayOpacity,
      thickness: overlayThickness,
      flashMode,
      aspectRatio,
      zoom
    };
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(persist)).catch(error =>
      console.warn('Persist settings error', error)
    );
  }, [activeOverlayId, overlayColor, overlayOpacity, overlayThickness, flashMode, aspectRatio, zoom]);

  const persistPresets = useCallback(
    (presets: CustomPreset[]) => {
      setCustomPresets(presets);
      AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(presets)).catch(error =>
        console.warn('Persist presets error', error)
      );
    },
    []
  );

  const availableOverlays = useMemo(() => {
    const customEntries: OverlayRegistryEntry[] = customPresets
      .map(preset => {
        const registryEntry = findOverlay(preset.def.kind);
        if (!registryEntry) return null;
        return {
          id: preset.id,
          label: preset.summary,
          Component: registryEntry.Component
        };
      })
      .filter(Boolean) as OverlayRegistryEntry[];

    return [...OVERLAY_REGISTRY, ...customEntries];
  }, [customPresets]);

  const activeOverlayEntry = useMemo(() => {
    if (customOverlayDef) {
      const component = findOverlay(customOverlayDef.kind)?.Component;
      if (component) {
        return {
          id: customOverlayDef.kind,
          label: overlaySummary,
          Component: component
        };
      }
    }
    if (activePresetId) {
      const preset = customPresets.find(item => item.id === activePresetId);
      if (preset) {
        const entry = findOverlay(preset.def.kind);
        if (entry) {
          return { id: preset.id, label: preset.summary, Component: entry.Component };
        }
      }
    }
    const fallback = findOverlay(activeOverlayId);
    if (fallback) {
      return { id: fallback.id, label: fallback.label, Component: fallback.Component };
    }
    return null;
  }, [activeOverlayId, activePresetId, customOverlayDef, overlaySummary, customPresets]);

  const componentMap = useMemo(() => {
    const map: Record<string, React.ComponentType<any>> = {};
    OVERLAY_REGISTRY.forEach(entry => {
      map[entry.id] = entry.Component;
    });
    return map;
  }, []);

  const onOverlaySelect = useCallback((id: string) => {
    setActivePresetId(null);
    setCustomOverlayDef(null);
    setActiveOverlayId(id);
    const found = findOverlay(id);
    setOverlaySummary(found ? found.label : 'Custom overlay');
  }, []);

  const onPresetSelect = useCallback(
    (id: string) => {
      const preset = customPresets.find(item => item.id === id);
      if (!preset) return;
      setActivePresetId(id);
      setCustomOverlayDef(preset.def);
      setOverlaySummary(preset.summary);
    },
    [customPresets]
  );

  const handleOverlayChipPress = useCallback(
    (id: string) => {
      const preset = customPresets.find(item => item.id === id);
      if (preset) {
        onPresetSelect(id);
      } else {
        onOverlaySelect(id);
      }
    },
    [customPresets, onOverlaySelect, onPresetSelect]
  );

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const ratio = aspectRatio === '3:4' ? 3 / 4 : 9 / 16;
  let frameWidth = screenWidth;
  let frameHeight = frameWidth / ratio;
  if (frameHeight > screenHeight) {
    frameHeight = screenHeight;
    frameWidth = frameHeight * ratio;
  }
  const frameStyle = useMemo(
    () => ({
      width: frameWidth,
      height: frameHeight
    }),
    [frameWidth, frameHeight]
  );

  const onFlipCamera = () => {
    setCameraType(prev => (prev === CameraType.back ? CameraType.front : CameraType.back));
  };

  const cycleAspectRatio = () => {
    setAspectRatio(prev => (prev === '3:4' ? '9:16' : '3:4'));
  };

  const cycleFlashMode = () => {
    setFlashMode(prev => {
      if (prev === Camera.Constants.FlashMode.off) return Camera.Constants.FlashMode.auto;
      if (prev === Camera.Constants.FlashMode.auto) return Camera.Constants.FlashMode.on;
      return Camera.Constants.FlashMode.off;
    });
  };

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || loadingCapture) return;
    try {
      setLoadingCapture(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const photo = await cameraRef.current.takePictureAsync({ quality: 1, exif: true });
      router.push({
        pathname: '/(preview)/PreviewScreen',
        params: {
          uri: photo.uri,
          width: String(photo.width ?? 0),
          height: String(photo.height ?? 0),
          capturedAt: String(Date.now())
        }
      });
    } catch (error) {
      Alert.alert('Capture failed', 'Unable to capture photo. Please try again.');
      console.error('Capture error', error);
    } finally {
      setLoadingCapture(false);
    }
  }, [loadingCapture, router]);

  const handlePinchEvent = useCallback(
    (event: any) => {
      if (event.nativeEvent.state === State.ACTIVE) {
        const scale = event.nativeEvent.scale;
        const nextZoom = clamp(pinchBaseZoom.current + (scale - 1) / 4, 0, 1);
        setZoom(parseFloat(nextZoom.toFixed(2)));
      }
    },
    []
  );

  const handlePinchStateChange = useCallback(
    (event: any) => {
      if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
        pinchBaseZoom.current = zoom;
      }
    },
    [zoom]
  );

  const handleFocus = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setFocusRing({ visible: true, x: locationX, y: locationY });
    setTimeout(() => setFocusRing(prev => ({ ...prev, visible: false })), 800);
  };

  const handleParsedOverlay = (def: OverlayDef, summary: string) => {
    setCustomOverlayDef(def);
    setOverlaySummary(summary);
    setActivePresetId(null);
    setActiveOverlayId(def.kind);
  };

  const handleSavePreset = (def: OverlayDef, summary: string) => {
    const id = `preset-${Date.now()}`;
    const next = [...customPresets, { id, def, summary }];
    persistPresets(next);
    Alert.alert('Preset saved', 'Your overlay preset is ready to use from the picker.');
  };

  const openAnalysisModal = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (result.canceled) return;
    const asset = result.assets[0];
    setAnalysisImageUri(asset.uri);
    setAnalysisModalVisible(true);
    setAnalysisOverlays([]);
    setAnalysisTilt(0);
  };

  const runAnalysis = async () => {
    if (!analysisImageUri || !allowCloudAnalysis) return;
    setAnalyzing(true);
    try {
      const overlays = await analyzeImage(analysisImageUri);
      setAnalysisOverlays(overlays);
    } catch (error) {
      console.warn('Analysis failed', error);
      Alert.alert('Analysis unavailable', 'Falling back to manual controls.');
      setAnalysisOverlays([]);
    } finally {
      setAnalyzing(false);
    }
  };

  const analysisOverlayComponents = useMemo(() => {
    return analysisOverlays
      .map(def => {
        const component = componentMap[def.kind];
        if (!component) return null;
        return { def, Component: component };
      })
      .filter(Boolean) as { def: OverlayDef; Component: React.ComponentType<any> }[];
  }, [analysisOverlays, componentMap]);

  const applyManualOverlay = (kind: OverlayDef['kind']) => {
    const def: OverlayDef = { kind };
    setAnalysisOverlays(prev => [...prev, def]);
  };

  const renderAnalysisModal = () => (
    <Modal
      visible={analysisModalVisible}
      animationType="slide"
      onRequestClose={() => setAnalysisModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Image Guides</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Allow cloud analysis</Text>
          <Switch value={allowCloudAnalysis} onValueChange={setAllowCloudAnalysis} />
        </View>
        <Pressable
          style={[styles.analyzeButton, !allowCloudAnalysis && { opacity: 0.5 }]}
          onPress={runAnalysis}
          disabled={!allowCloudAnalysis || analyzing}
        >
          <Text style={styles.analyzeLabel}>{analyzing ? 'Analyzing…' : 'Run analysis'}</Text>
        </Pressable>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {analysisImageUri ? (
            <View style={styles.analysisPreview}>
              <Image source={{ uri: analysisImageUri }} style={styles.analysisImage} resizeMode="contain" />
              <View style={styles.analysisOverlayLayer} pointerEvents="none">
                <View style={[styles.horizonGuide, { transform: [{ rotate: `${analysisTilt}deg` }] }]} />
                {analysisOverlayComponents.map(item => {
                  const Component = item.Component;
                  return (
                    <Component
                      key={JSON.stringify(item.def)}
                      width={300}
                      height={400}
                      color={item.def.color ?? overlayColor}
                      opacity={item.def.opacity ?? overlayOpacity}
                      thickness={item.def.thickness ?? overlayThickness}
                      safeInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
                    />
                  );
                })}
              </View>
            </View>
          ) : (
            <Text style={styles.helperText}>Select an image to preview guides.</Text>
          )}
          <Text style={styles.sectionHeading}>Manual presets</Text>
          <View style={styles.manualRow}>
            <Pressable style={styles.manualChip} onPress={() => applyManualOverlay('thirds')}>
              <Text style={styles.manualLabel}>Thirds</Text>
            </Pressable>
            <Pressable style={styles.manualChip} onPress={() => applyManualOverlay('goldenRatio')}>
              <Text style={styles.manualLabel}>Golden ratio</Text>
            </Pressable>
            <Pressable style={styles.manualChip} onPress={() => applyManualOverlay('diagonals')}>
              <Text style={styles.manualLabel}>Diagonals</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionHeading}>Horizon angle</Text>
          <View
            style={styles.angleSlider}
            onStartShouldSetResponder={() => true}
            onResponderMove={event =>
              setAnalysisTilt(clamp(event.nativeEvent.locationX - 150, -45, 45))
            }
            onResponderGrant={event =>
              setAnalysisTilt(clamp(event.nativeEvent.locationX - 150, -45, 45))
            }
          >
            <View style={styles.angleTrack} />
            <View style={[styles.angleThumb, { left: 150 + analysisTilt }]} />
          </View>
          <Text style={styles.angleValue}>{analysisTilt.toFixed(1)}°</Text>
        </ScrollView>
        <Pressable style={styles.closeButton} onPress={() => setAnalysisModalVisible(false)}>
          <Text style={styles.closeLabel}>Close</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.helperText}>Requesting camera permission…</Text>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.helperText}>Camera access is required to use CropCamAI.</Text>
        <Pressable style={styles.analyzeButton} onPress={openSettings}>
          <Text style={styles.analyzeLabel}>Open Settings</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const OverlayComponent = activeOverlayEntry?.Component;
  const resolvedColor = customOverlayDef?.color ?? overlayColor;
  const resolvedOpacity = customOverlayDef?.opacity ?? overlayOpacity;
  const resolvedThickness = customOverlayDef?.thickness ?? overlayThickness;
  const overlayExtras = useMemo(() => {
    const extras: Record<string, unknown> = {};
    if (customOverlayDef?.rect) {
      extras.rectPct = customOverlayDef.rect;
    }
    if (customOverlayDef?.insetPct !== undefined) {
      extras.insetPct = customOverlayDef.insetPct;
    }
    if (customOverlayDef?.extras) {
      Object.assign(extras, customOverlayDef.extras);
    }
    if (customOverlayDef?.animate !== undefined) {
      extras.animate = customOverlayDef.animate;
    }
    return extras;
  }, [customOverlayDef]);

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}
    >
      <View style={styles.topBar}>
        <Pressable
          style={styles.iconButton}
          onPress={onFlipCamera}
          accessibilityRole="button"
          accessibilityLabel="Flip camera"
        >
          <Text style={styles.iconText}>↺</Text>
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={cycleFlashMode}
          accessibilityRole="button"
          accessibilityLabel="Toggle flash"
        >
          <Text style={styles.iconText}>⚡</Text>
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={cycleAspectRatio}
          accessibilityRole="button"
          accessibilityLabel="Toggle aspect ratio"
        >
          <Text style={styles.iconText}>{aspectRatio}</Text>
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={() => setSettingsVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Text style={styles.iconText}>⚙︎</Text>
        </Pressable>
      </View>
      <View style={styles.previewWrapper}>
        <PinchGestureHandler onGestureEvent={handlePinchEvent} onHandlerStateChange={handlePinchStateChange}>
          <View style={[styles.cameraContainer, frameStyle]}>
            <Camera
              ref={ref => (cameraRef.current = ref)}
              style={StyleSheet.absoluteFill}
              type={cameraType}
              flashMode={flashMode}
              whiteBalance={whiteBalance}
              zoom={zoom}
              ratio={aspectRatio === '3:4' ? '3:4' : '9:16'}
              onCameraReady={async () => {
                if (!cameraRef.current) return;
                if (cameraRef.current.setExposureCompensationAsync) {
                  setExposureSupported(true);
                  await cameraRef.current.setExposureCompensationAsync(exposureCompensation);
                }
              }}
            />
            <Pressable style={StyleSheet.absoluteFill} onPress={handleFocus} accessibilityLabel="Camera focus area" />
            {OverlayComponent && (
              <OverlayComponent
                width={frameWidth}
                height={frameHeight}
                color={resolvedColor}
                opacity={resolvedOpacity}
                thickness={resolvedThickness}
                safeInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
                tiltDeg={activeOverlayEntry?.id === 'horizon' ? tiltDeg : undefined}
                {...overlayExtras}
              />
            )}
            <FocusRing x={focusRing.x} y={focusRing.y} visible={focusRing.visible} />
          </View>
        </PinchGestureHandler>
      </View>
      <View style={styles.overlaySummaryRow}>
        <Text style={styles.overlaySummary}>{overlaySummary}</Text>
      </View>
      <View style={styles.bottomControls}>
        <OverlayPicker
          activeId={activeOverlayEntry?.id ?? activeOverlayId}
          onSelect={handleOverlayChipPress}
          overlays={availableOverlays.map(item => ({ id: item.id, label: item.label }))}
        />
        <View style={styles.captureRow}>
          <Pressable
            style={styles.secondaryButton}
            onPress={openAnalysisModal}
            accessibilityRole="button"
            accessibilityLabel="Open guides"
          >
            <Text style={styles.secondaryText}>Guides</Text>
          </Pressable>
          <Pressable
            style={[styles.shutter, loadingCapture && { opacity: 0.6 }]}
            onPress={handleCapture}
            accessibilityRole="button"
            accessibilityLabel="Capture photo"
            disabled={loadingCapture}
          />
          <Pressable
            style={styles.secondaryButton}
            onPress={async () => {
              if (!mediaPermission) {
                const status = await MediaLibrary.requestPermissionsAsync();
                setMediaPermission(status.status === 'granted');
              } else {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images
                });
                if (!result.canceled) {
                  const asset = result.assets[0];
                  router.push({
                    pathname: '/(preview)/PreviewScreen',
                    params: {
                      uri: asset.uri,
                      width: String(asset.width ?? 0),
                      height: String(asset.height ?? 0),
                      capturedAt: String(Date.now())
                    }
                  });
                }
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Pick image"
          >
            <Text style={styles.secondaryText}>Import</Text>
          </Pressable>
        </View>
      </View>
      <NLBar onParsed={handleParsedOverlay} onSavePreset={handleSavePreset} />
      <SettingsSheet
        visible={isSettingsVisible}
        onClose={() => setSettingsVisible(false)}
        color={overlayColor}
        onColorChange={setOverlayColor}
        opacity={overlayOpacity}
        onOpacityChange={setOverlayOpacity}
        thickness={overlayThickness}
        onThicknessChange={setOverlayThickness}
        zoom={zoom}
        onZoomChange={setZoom}
        flashMode={flashMode}
        onFlashModeChange={setFlashMode}
        whiteBalance={whiteBalance}
        onWhiteBalanceChange={setWhiteBalance}
        exposureCompensation={exposureCompensation}
        onExposureChange={async value => {
          setExposureCompensation(value);
          if (cameraRef.current?.setExposureCompensationAsync) {
            try {
              await cameraRef.current.setExposureCompensationAsync(value);
            } catch (error) {
              console.warn('Exposure adjustment failed', error);
            }
          }
        }}
        exposureSupported={exposureSupported}
      />
      {renderAnalysisModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  helperText: {
    textAlign: 'center',
    color: '#cccccc',
    marginTop: 12
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconText: {
    fontSize: 16,
    color: '#fff'
  },
  previewWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000'
  },
  overlaySummaryRow: {
    alignItems: 'center',
    paddingVertical: 6
  },
  overlaySummary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  bottomControls: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12
  },
  shutter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 6,
    borderColor: '#fff'
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff22',
    borderRadius: 12
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0f141a'
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#fff'
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff'
  },
  analyzeButton: {
    backgroundColor: '#2f80ed',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  analyzeLabel: {
    color: '#fff',
    fontWeight: '600'
  },
  analysisPreview: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#000'
  },
  analysisImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined
  },
  analysisOverlayLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  },
  horizonGuide: {
    width: '90%',
    height: 2,
    backgroundColor: '#fffb',
    position: 'absolute'
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#fff'
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  manualChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff22'
  },
  manualLabel: {
    color: '#fff'
  },
  angleSlider: {
    height: 32,
    marginHorizontal: 16,
    justifyContent: 'center',
    width: 300,
    alignSelf: 'center'
  },
  angleTrack: {
    height: 4,
    backgroundColor: '#ffffff33',
    borderRadius: 2
  },
  angleThumb: {
    position: 'absolute',
    top: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  angleValue: {
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginBottom: 12,
    color: '#fff'
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center'
  },
  closeLabel: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default CameraScreen;
