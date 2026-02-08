import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { MapPin, Users, Clock, Activity, RefreshCw } from 'lucide-react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

interface ActiveWorker {
  id: string;
  userId: string;
  userName: string;
  checkInTime: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  hoursWorked: number;
  distanceFromSite: number;
  status: string;
}

export default function LiveAttendanceMap() {
  const [activeSessions, setActiveSessions] = useState<ActiveWorker[]>([]);
  const [site, setSite] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchSite();
    subscribeToActiveSessions();
  }, []);

  // Fetch site data
  const fetchSite = async () => {
    try {
      const siteRef = doc(db, 'sites', 'site_1');
      const siteSnap = await getDoc(siteRef);
      
      if (siteSnap.exists()) {
        setSite(siteSnap.data());
      }
    } catch (error) {
      console.error('Error fetching site:', error);
    }
  };

  // Real-time subscription to active sessions
  const subscribeToActiveSessions = () => {
    const sessionsRef = collection(db, 'attendanceSessions');
    const q = query(sessionsRef, where('status', '==', 'active'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workers: ActiveWorker[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Get latest location ping
        const latestPing = data.locationPings && data.locationPings.length > 0 
          ? data.locationPings[data.locationPings.length - 1]
          : data.checkInLocation;

        // Calculate hours worked
        const hoursWorked = (Date.now() - data.checkInTime) / (1000 * 60 * 60);

        workers.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          checkInTime: data.checkInTime,
          currentLocation: {
            latitude: latestPing.latitude,
            longitude: latestPing.longitude,
          },
          hoursWorked: Math.round(hoursWorked * 100) / 100,
          distanceFromSite: data.distanceFromSite || 0,
          status: data.status,
        });
      });

      setActiveSessions(workers);
      setLastUpdate(new Date());
    });

    return unsubscribe;
  };

  // Manual refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSite();
    setRefreshing(false);
  };

  // Calculate statistics
  const totalActiveWorkers = activeSessions.length;
  const totalHoursWorked = activeSessions.reduce((sum, w) => sum + w.hoursWorked, 0);
  const avgHoursPerWorker = totalActiveWorkers > 0 
    ? Math.round((totalHoursWorked / totalActiveWorkers) * 100) / 100 
    : 0;

  if (!site) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Attendance</Text>
          <Text style={styles.subtitle}>Real-time worker tracking</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={20} color="#2563eb" />
          <Text style={styles.refreshText}>
            {lastUpdate.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
          <Users size={24} color="#2563eb" />
          <Text style={styles.statValue}>{totalActiveWorkers}</Text>
          <Text style={styles.statLabel}>Active Workers</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
          <Clock size={24} color="#10b981" />
          <Text style={styles.statValue}>{avgHoursPerWorker}h</Text>
          <Text style={styles.statLabel}>Avg Hours</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Activity size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{Math.round(totalHoursWorked)}h</Text>
          <Text style={styles.statLabel}>Total Hours</Text>
        </View>
      </View>

      {/* Map View - FREE - No API Key! */}
      <View style={styles.mapContainer}>
        <Text style={styles.sectionTitle}>Geofence Map</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: site.latitude,
            longitude: site.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          mapType="standard"
        >
          {/* Site Center Marker */}
          <Marker
            coordinate={{
              latitude: site.latitude,
              longitude: site.longitude,
            }}
            title="Construction Site"
            description={site.name || 'Site 1'}
          >
            <View style={styles.siteMarker}>
              <View style={styles.siteMarkerInner}>
                <MapPin size={20} color="#fff" />
              </View>
            </View>
          </Marker>

          {/* Geofence Circle (100m radius) */}
          <Circle
            center={{
              latitude: site.latitude,
              longitude: site.longitude,
            }}
            radius={site.radius || 100}
            strokeColor="rgba(16, 185, 129, 0.6)"
            fillColor="rgba(16, 185, 129, 0.15)"
            strokeWidth={3}
          />

          {/* Active Workers */}
          {activeSessions.map((worker) => (
            <Marker
              key={worker.id}
              coordinate={worker.currentLocation}
              title={worker.userName}
              description={`${worker.hoursWorked}h worked`}
            >
              <View style={styles.workerMarker}>
                <View style={styles.workerMarkerInner}>
                  <Users size={16} color="#fff" />
                </View>
              </View>
            </Marker>
          ))}
        </MapView>

        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
            <Text style={styles.legendText}>Site Center</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Active Workers</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981', opacity: 0.3 }]} />
            <Text style={styles.legendText}>100m Geofence</Text>
          </View>
        </View>

      </View>

      {/* Active Workers List */}
      <View style={styles.workersSection}>
        <Text style={styles.sectionTitle}>Active Workers ({totalActiveWorkers})</Text>
        
        {activeSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active workers</Text>
          </View>
        ) : (
          activeSessions.map((worker) => (
            <View key={worker.id} style={styles.workerCard}>
              <View style={styles.workerHeader}>
                <View style={styles.workerInfo}>
                  <Users size={20} color="#2563eb" />
                  <Text style={styles.workerName}>{worker.userName}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <View style={styles.pulseIndicator} />
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>

              <View style={styles.workerDetails}>
                <View style={styles.detailRow}>
                  <Clock size={16} color="#6b7280" />
                  <Text style={styles.detailText}>
                    Checked in: {new Date(worker.checkInTime).toLocaleTimeString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Activity size={16} color="#6b7280" />
                  <Text style={styles.detailText}>
                    Hours worked: {worker.hoursWorked}h
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={styles.detailText}>
                    Distance from site: {Math.round(worker.distanceFromSite)}m
                  </Text>
                </View>
              </View>

              {/* Hours Progress Bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Today's Progress</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min((worker.hoursWorked / 8) * 100, 100)}%`,
                        backgroundColor: worker.hoursWorked >= 8 ? '#10b981' : '#2563eb'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {worker.hoursWorked >= 8 ? 'Full day completed ✅' : `${(8 - worker.hoursWorked).toFixed(1)}h remaining`}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  refreshText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  mapContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  siteMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  siteMarkerInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  workerMarkerInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  mapNote: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  mapNoteText: {
    fontSize: 11,
    color: '#059669',
    textAlign: 'center',
  },
  workersSection: {
    padding: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  workerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  workerDetails: {
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressContainer: {
    gap: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#9ca3af',
  },
});