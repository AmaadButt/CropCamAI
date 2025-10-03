module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(expo|@expo|expo-camera|expo-.*|@react-native|react-native|@react-native-community|react-native-svg)/)'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
