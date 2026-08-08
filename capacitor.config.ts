import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.akrelectronics.app',
  appName: 'AKR Electronics',
  webDir: 'www',
  server: {
    url: 'https://akr-electronics.vercel.app',
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 700,
      backgroundColor: '#FFFFFFFF',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#111827FF',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
    },
  },
};

export default config;
