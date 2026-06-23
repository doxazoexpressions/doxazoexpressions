import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7c926cd50e074118871e5ab8fb64751c',
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
