import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { AttendanceRecord, Site } from '@/types/database';
import { Clock } from 'lucide-react-native';

export default function HistoryScreen() {
  const { worker } = useAuth();
  const [attendance, setAttendance] = useState<
    (AttendanceRecord & { sites: Site })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  const loadAttendanceHistory = async () => {
    if (!worker) return;

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, sites(*)')
      .eq('worker_id', worker.id)
      .order('check_in_time', { ascending: false })
      .limit(50);

    if (data) {
      setAttendance(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance History</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {attendance.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No attendance records yet</Text>
          </Card>
        ) : (
          attendance.map((record) => (
            <Card key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.siteName}>{record.sites.name}</Text>
                <StatusBadge status={record.status} />
              </View>

              <View style={styles.recordRow}>
                <Clock size={16} color="#6b7280" />
                <Text style={styles.recordText}>
                  Check In: {new Date(record.check_in_time).toLocaleString()}
                </Text>
              </View>

              {record.check_out_time && (
                <>
                  <View style={styles.recordRow}>
                    <Clock size={16} color="#6b7280" />
                    <Text style={styles.recordText}>
                      Check Out: {new Date(record.check_out_time).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.hoursWorked}>
                    <Text style={styles.hoursLabel}>Hours Worked:</Text>
                    <Text style={styles.hoursValue}>
                      {record.hours_worked.toFixed(2)}h
                    </Text>
                  </View>
                </>
              )}

              {record.validation_reason && (
                <View style={styles.reasonContainer}>
                  <Text style={styles.reasonText}>{record.validation_reason}</Text>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
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
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recordCard: {
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  siteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  hoursWorked: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  hoursLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  hoursValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  reasonContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 12,
    color: '#991b1b',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
});
