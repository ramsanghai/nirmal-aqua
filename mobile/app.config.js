const fs = require('fs');

// google-services.json (Firebase Android app) is needed for FCM push in a real build.
// It is added at build time; the config stays valid without it so `expo start` works.
// On EAS the file is provided through the GOOGLE_SERVICES_JSON file environment variable;
// locally we fall back to ./google-services.json when it exists.
const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || (fs.existsSync('./google-services.json') ? './google-services.json' : undefined);

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
    ...(googleServicesFile ? { googleServicesFile } : {}),
  },
  plugins: [
    ['expo-notifications', { color: '#0F4C4A', defaultChannel: 'orders' }],
    ['expo-location', { locationWhenInUsePermission: 'Nirmal Aqua uses your location to pin the delivery address.' }],
    'expo-font',
  ],
  extra: { eas: { projectId: '4de80b2c-77cc-4b86-90b2-cc42903fdbd0' } },
});
