import { ConfigContext, ExpoConfig } from 'expo/config'

const APP_ENV = process.env.APP_ENV || 'development'

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: 'SeagunTech',
    slug: 'seaguntech-expo-template',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icons/app-icon.png',
    scheme: 'seaguntechexpotemplate',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.app.seaguntechexpotemplate',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/icons/app-icon.png',
      },
      edgeToEdgeEnabled: true,
      package: 'com.app.seaguntechexpotemplate',
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/splashscreen/splash.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/InstrumentSerif-Regular.ttf',
            './assets/fonts/InstrumentSerif-Italic.ttf',
          ],
        },
      ],
      [
        'expo-audio',
        {
          microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone.',
          recordAudioAndroid: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: '', // Add your EAS project ID here
      },
      appEnv: APP_ENV,
    },
  }
}
