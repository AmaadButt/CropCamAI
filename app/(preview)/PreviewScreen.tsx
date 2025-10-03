import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as Location from 'expo-location';

const PreviewScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    uri?: string;
    width?: string;
    height?: string;
    capturedAt?: string;
  }>();
  const { uri, width, height, capturedAt } = params;
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Discard photo?', 'Leave preview without saving?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.replace('/(camera)/CameraScreen')
          }
        ]);
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [router])
  );

  useEffect(() => {
    (async () => {
      if (!(await Location.hasServicesEnabledAsync())) {
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation(loc);
        } catch (error) {
          console.warn('Location error', error);
        }
      }
    })();
  }, []);

  if (!uri) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.message}>No image to preview.</Text>
        <Pressable onPress={() => router.replace('/(camera)/CameraScreen')} style={styles.actionButton}>
          <Text style={styles.actionLabel}>Back to camera</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!uri) return;
    try {
      setSaving(true);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Camera', asset, false);
      Alert.alert('Saved', 'Image added to your media library.');
    } catch (error) {
      Alert.alert('Save failed', 'Unable to save image. Please try again.');
      console.error('Save error', error);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!uri) return;
    try {
      setSharing(true);
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing not supported', 'Sharing is not available on this platform.');
        return;
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Share failed', 'Unable to share image.');
      console.error('Share error', error);
    } finally {
      setSharing(false);
    }
  };

  const displayTimestamp = capturedAt ? new Date(Number(capturedAt)).toLocaleString() : 'Unknown';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri }} style={styles.preview} resizeMode="contain" />
        <View style={styles.metaCard}>
          <Text style={styles.metaTitle}>Metadata</Text>
          <Text style={styles.metaLine}>Captured: {displayTimestamp}</Text>
          <Text style={styles.metaLine}>
            Dimensions: {width ?? '—'} × {height ?? '—'}
          </Text>
          {location && (
            <Text style={styles.metaLine}>
              Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
            </Text>
          )}
          {!location && (
            <Text style={styles.metaHint}>Location data available when permission is granted.</Text>
          )}
        </View>
        <View style={styles.actionsRow}>
          <Pressable onPress={() => router.replace('/(camera)/CameraScreen')} style={styles.secondaryButton}>
            <Text style={styles.secondaryLabel}>Retake</Text>
          </Pressable>
          <Pressable onPress={handleSave} style={styles.primaryButton} disabled={saving}>
            <Text style={styles.primaryLabel}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
          <Pressable onPress={handleShare} style={styles.secondaryButton} disabled={sharing}>
            <Text style={styles.secondaryLabel}>{sharing ? 'Sharing…' : 'Share'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f141a'
  },
  content: {
    padding: 16,
    alignItems: 'center'
  },
  preview: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    backgroundColor: '#000'
  },
  metaCard: {
    width: '100%',
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1c252f'
  },
  metaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8
  },
  metaLine: {
    fontSize: 14,
    color: '#d7dee7',
    marginBottom: 4
  },
  metaHint: {
    fontSize: 12,
    color: '#96a0ad'
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 24
  },
  primaryButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 14,
    backgroundColor: '#2f80ed',
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '700'
  },
  secondaryButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 14,
    backgroundColor: '#ffffff22',
    borderRadius: 12,
    alignItems: 'center'
  },
  secondaryLabel: {
    color: '#fff',
    fontWeight: '600'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  message: {
    fontSize: 16,
    marginBottom: 12
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#2f80ed',
    borderRadius: 12
  },
  actionLabel: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default PreviewScreen;
