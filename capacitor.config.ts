import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.doxazo.expressions',
  appName: 'Doxazo Expressions',
  webDir: 'dist',
  server: {
    url: 'https://7c926cd5-0e07-4118-871e-5ab8fb64751c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
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
