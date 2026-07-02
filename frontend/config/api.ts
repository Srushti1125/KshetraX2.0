import { Platform } from 'react-native';

const devUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const API_URL = Platform.select({
  android: devUrl.includes('localhost') ? 'http://10.0.2.2:5000' : devUrl,
  ios: devUrl,
  default: devUrl,
}) as string;
