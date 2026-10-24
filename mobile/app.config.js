const fs = require('fs');

// google-services.json (Firebase Android app) is needed for FCM push in a real build.
// It is added at build time; the config stays valid without it so `expo start` works.
const hasGoogleServices = fs.existsSync('./google-services.json');

module.exports = () => ({
  name: 'Nirmal Aqua',
  slug: 'nirmal-aqua',
  scheme: 'nirmalaqua',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  splash: { image: './assets/splash-icon.png', resizeMode: 'contain', backgroundColor: '#0F4C4A' },
  android: {
    package: 'com.nirmalaqua.app',
    adaptiveIcon: { backgroundColor: '#0F4C4A', foregroundImage: './assets/android-icon-foreground.png' },
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'POST_NOTIFICATIONS'],
    ...(hasGoogleServices ? { googleServicesFile: './google-services.json' } : {}),
  },
  plugins: [
    ['expo-notifications', { color: '#0F4C4A', defaultChannel: 'orders' }],
    ['expo-location', { locationWhenInUsePermission: 'Nirmal Aqua uses your location to pin the delivery address.' }],
    'expo-font',
  ],
  extra: { eas: { projectId: process.env.EAS_PROJECT_ID } },
});
