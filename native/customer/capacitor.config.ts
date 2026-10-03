/// <reference types="@capacitor/push-notifications" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.co.irepairandrescue.app',
  appName: 'iRepair',
  webDir: 'www',
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    handleApplicationNotifications: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'banner', 'list']
    }
  }
};

export default config;
