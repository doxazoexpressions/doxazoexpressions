import type { CapacitorConfig } from '@capacitor/cli';

// Production Capacitor config for native iOS/Android builds (TestFlight, App Store, Play Store).
// IMPORTANT: Do NOT add a `server.url` block here. That would point the native app at the
// Lovable sandbox preview instead of the bundled production web assets in `dist/`, which is
// exactly what caused the TestFlight build to redirect to the lovableproject.com URL.
const config: CapacitorConfig = {
  appId: 'com.doxazo.expressions',
  appName: 'Doxazo Expressions',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#0f1a2b',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f1a2b',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0f1a2b',
  },
  android: {
    backgroundColor: '#0f1a2b',
  },
};

export default config;
