import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, MapPin, CheckCircle } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useAuth } from '@/contexts/AuthContext';
import { useOffline } from '@/contexts/OfflineContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Site, AttendanceRecord } from '@/types/database';
import { GeofenceService } from '@/services/geofence.service';
import { OfflineService } from '@/services/offline.service';

export default function CheckInScreen() {
  const { worker } = useAuth();
  const { isOnline, syncOfflineData } = useOffline();
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [activeAttendance, setActiveAttendance] = useState<AttendanceRecord | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    requestLocationPermission();
    loadSites();
    loadActiveAttendance();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
  };

  const loadSites = async () => {
    const { data } = await supabase
      .from('sites')
      .select('*')
      .eq('active', true);
    if (data) {
      setSites(data);
      if (data.length > 0) setSelectedSite(data[0]);
    }
  };

  const loadActiveAttendance = async () => {
    if (!worker) return;
    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('worker_id', worker.id)
      .is('check_out_time', null)
      .order('check_in_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    setActiveAttendance(data);
  };

  const getCurrentLocation = async () => {
    if (!locationPermission) {
      Alert.alert('Error', 'Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  const handleCheckIn = async () => {
    if (!worker || !selectedSite) return;

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Error', 'Camera permission is required');
        return;
      }
    }

    setLoading(true);
    const location = await getCurrentLocation();
    if (!location) {
      setLoading(false);
      return;
    }

    setCurrentLocation(location);

    const validation = GeofenceService.validateGeofence(
      location,
      { latitude: selectedSite.latitude, longitude: selectedSite.longitude },
      selectedSite.radius_meters
    );

    if (!validation.isWithinGeofence) {
      Alert.alert(
        'Outside Geofence',
        `You are ${validation.distance}m away from the site. Allowed: ${selectedSite.radius_meters}m`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
          { text: 'Continue Anyway', onPress: () => setShowCamera(true) },
        ]
      );
    } else {
      setShowCamera(true);
    }

    setLoading(false);
  };

  const handleCheckOut = async () => {
    if (!activeAttendance) return;

    setLoading(true);
    const location = await getCurrentLocation();
    if (!location) {
      setLoading(false);
      return;
    }

    const checkInTime = new Date(activeAttendance.check_in_time);
    const checkOutTime = new Date();
    const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    try {
      const { error } = await supabase
        .from('attendance_records')
        .update({
          check_out_time: checkOutTime.toISOString(),
          check_out_lat: location.latitude,
          check_out_lng: location.longitude,
          hours_worked: hoursWorked,
        })
        .eq('id', activeAttendance.id);

      if (error) throw error;

      Alert.alert('Success', 'Checked out successfully!');
      setActiveAttendance(null);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!worker) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (showCamera && currentLocation && selectedSite) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing="front">
          <View style={styles.cameraOverlay}>
            <Button
              title="Cancel"
              onPress={() => setShowCamera(false)}
              variant="secondary"
            />
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        {!isOnline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>Offline Mode</Text>
          </View>
        )}
      </View>

      {activeAttendance ? (
        <Card style={styles.activeCard}>
          <View style={styles.activeHeader}>
            <CheckCircle size={24} color="#10b981" />
            <Text style={styles.activeTitle}>Currently Checked In</Text>
          </View>
          <Text style={styles.activeTime}>
            Since: {new Date(activeAttendance.check_in_time).toLocaleString()}
          </Text>
          <Button
            title="Check Out"
            onPress={handleCheckOut}
            loading={loading}
            variant="danger"
            style={styles.actionButton}
          />
        </Card>
      ) : (
        <Card>
          <View style={styles.siteSection}>
            <MapPin size={20} color="#6b7280" />
            <Text style={styles.siteLabel}>Select Site</Text>
          </View>
          {sites.map((site) => (
            <Button
              key={site.id}
              title={site.name}
              onPress={() => setSelectedSite(site)}
              variant={selectedSite?.id === site.id ? 'primary' : 'secondary'}
              style={styles.siteButton}
            />
          ))}
          <Button
            title="Check In"
            onPress={handleCheckIn}
            loading={loading}
            style={styles.actionButton}
          />
        </Card>
      )}

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Worker Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{worker.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trust Score:</Text>
          <Text style={styles.infoValue}>{worker.trust_score}/100</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  offlineBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  offlineText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
  },
  activeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ecfdf5',
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065f46',
    marginLeft: 8,
  },
  activeTime: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 16,
  },
  siteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  siteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  siteButton: {
    marginBottom: 8,
  },
  actionButton: {
    marginTop: 16,
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
});
