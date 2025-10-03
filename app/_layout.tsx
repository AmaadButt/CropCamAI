import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(camera)/CameraScreen" />
            <Stack.Screen name="(preview)/PreviewScreen" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
