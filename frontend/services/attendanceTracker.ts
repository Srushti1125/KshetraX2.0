import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { API_URL } from '@/config/api';
import { getDistance } from 'geolib';

const LOCATION_TRACKING_TASK = 'background-location-tracking';

// Background task that runs every 5 minutes
TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    try {
      // Get active session from AsyncStorage or Firestore
      const sessionId = await getActiveSessionId();
      
      if (sessionId) {
        await recordLocationPing(sessionId, location);
      }
    } catch (err) {
      console.error('Error recording location:', err);
    }
  }
});

export class AttendanceTracker {
  
  // Start tracking when worker checks in
  static async startTracking(userId: string, sessionId: string): Promise<void> {
    try {
      // Request background location permission
      const { status } = await Location.requestBackgroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Background location permission not granted');
      }

      // Start background location tracking
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5 * 60 * 1000, // 5 minutes
        distanceInterval: 50, // Update if moved 50m
        foregroundService: {
          notificationTitle: 'Attendance Tracking',
          notificationBody: 'Your location is being tracked for attendance',
          notificationColor: '#2563eb',
        },
      });

      console.log('✅ Background tracking started');
      
      // Store session ID for background task
      await storeActiveSessionId(sessionId);
      
    } catch (error) {
      console.error('Failed to start tracking:', error);
      throw error;
    }
  }

  // Stop tracking when worker checks out
  static async stopTracking(): Promise<void> {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
      
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
        console.log('✅ Background tracking stopped');
      }
      
      await clearActiveSessionId();
    } catch (error) {
      console.error('Failed to stop tracking:', error);
    }
  }

  // Calculate total hours worked
  static calculateHours(checkInTime: number, checkOutTime: number): number {
    const milliseconds = checkOutTime - checkInTime;
    const hours = milliseconds / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100; // Round to 2 decimals
  }

  // Validate if location is within geofence
  static isWithinGeofence(
    workerLat: number,
    workerLng: number,
    siteLat: number,
    siteLng: number,
    radius: number
  ): boolean {
    const distance = getDistance(
      { latitude: workerLat, longitude: workerLng },
      { latitude: siteLat, longitude: siteLng }
    );
    
    return distance <= radius;
  }

  // Get real-time location
  static async getCurrentLocation(): Promise<Location.LocationObject> {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return location;
  }
}

// Helper functions
async function recordLocationPing(sessionId: string, location: any) {
  const ping = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
    timestamp: Date.now(),
  };

  try {
    const response = await fetch(`${API_URL}/api/attendance/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, ping }),
    });
    
    if (response.ok) {
      console.log('📍 Location ping recorded:', ping);
    } else {
      console.error('❌ Failed to record location ping on backend');
    }
  } catch (err) {
    console.error('❌ Error pinging backend location:', err);
  }
}

async function getActiveSessionId(): Promise<string | null> {
  // In production, get from AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return await AsyncStorage.getItem('activeSessionId');
}

async function storeActiveSessionId(sessionId: string): Promise<void> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.setItem('activeSessionId', sessionId);
}

async function clearActiveSessionId(): Promise<void> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.removeItem('activeSessionId');
}
