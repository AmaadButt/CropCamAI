import { Linking, Platform } from 'react-native';
import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export type PermissionState = {
  camera: boolean;
  mediaLibrary: boolean;
};

export const requestPermissionsAsync = async (): Promise<PermissionState> => {
  const [cameraStatus, mediaStatus] = await Promise.all([
    Camera.Camera.requestCameraPermissionsAsync(),
    MediaLibrary.requestPermissionsAsync()
  ]);

  return {
    camera: cameraStatus.status === 'granted',
    mediaLibrary: mediaStatus.status === 'granted'
  };
};

export const openSettings = async () => {
  if (Platform.OS === 'ios') {
    await Linking.openURL('app-settings:');
  } else {
    await Linking.openSettings();
  }
};
