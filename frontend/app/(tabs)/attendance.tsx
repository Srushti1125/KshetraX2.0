import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, User } from 'lucide-react-native';

import { API_URL } from '@/config/api';

export default function AttendanceScreen() {

  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_URL}/api/attendance/all`);
      if (!response.ok) throw new Error('Failed to fetch attendance history');
      const list = await response.json();
      setAttendance(list);
      setLoading(false);
    } catch (err) {
      console.log('Error fetching attendance:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Site Attendance Report</Text>

        <View style={styles.dateContainer}>
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.dateText}>Live Attendance Records</Text>
        </View>
      </View>

      {attendance.length === 0 && (
        <Text style={styles.emptyText}>No attendance records found</Text>
      )}

      {attendance.map((item) => (
        <View key={item.id} style={styles.card}>

          <View style={styles.row}>
            <User size={18} color="#2563eb" />
            <Text style={styles.label}>Worker ID</Text>
            <Text style={styles.value}>{item.userId}</Text>
          </View>

          <View style={styles.row}>
            <Clock size={18} color="#10b981" />
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>
              {new Date(item.checkInTime).toLocaleString()}
            </Text>
          </View>

          <View style={styles.row}>
            <MapPin size={18} color="#ef4444" />
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.value}>
              {Math.floor(item.distanceFromSite)} meters
            </Text>
          </View>

          <Text style={styles.status}>
            Status: <Text style={{ color: '#10b981' }}>{item.status?.toUpperCase()}</Text>
          </Text>

          {item.selfie && (
            <Image
              source={{ uri: item.selfie }}
              style={styles.image}
            />
          )}
        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    width: 80,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  status: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 12,
  },
});
