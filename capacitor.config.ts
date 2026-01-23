import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fibextelecom.autopago',
  appName: 'AutoPago Fibex Telecom',
  webDir: 'dist/form-pay-fibex',
  server: {
    androidScheme: 'http',
  },
  plugins: {
    NetworkInfo: {
      android: {
        classpath: 'com.fibextelecom.autopago.NetworkInfoPlugin'
      }
    },
    Printer: {
      android: {
        classpath: 'com.fibextelecom.autopago.PrinterPlugin'
      }
    }
  }
};

export default config;
