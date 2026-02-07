import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { MapPin, Smartphone, Camera, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react-native';

export default function AttendanceScreen() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const validationStatus = {
    geofence: true,
    deviceBinding: true,
    biometric: false,
  };

  const attendanceHistory = [
    { id: 1, date: '2024-02-06', checkIn: '08:15 AM', checkOut: '05:30 PM', hours: 9.25, status: 'verified', trustScore: 98 },
    { id: 2, date: '2024-02-05', checkIn: '08:10 AM', checkOut: '05:45 PM', hours: 9.58, status: 'verified', trustScore: 97 },
    { id: 3, date: '2024-02-04', checkIn: '08:25 AM', checkOut: '05:20 PM', hours: 8.92, status: 'flagged', trustScore: 85 },
  ];

  const handleCheckIn = () => {
    setCheckedIn(true);
    setCheckInTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleCheckOut = () => {
    setCheckedIn(false);
    setCheckInTime(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <View style={styles.dateContainer}>
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.dateText}>Today, Feb 7, 2024</Text>
        </View>
      </View>

      <View style={styles.checkInCard}>
        <View style={styles.checkInHeader}>
          <Text style={styles.checkInTitle}>Quick Check-In</Text>
          {checkedIn && (
            <View style={styles.activeBadge}>
              <View style={styles.pulseIndicator} />
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>

        <View style={styles.validationContainer}>
          <Text style={styles.validationTitle}>Validation Status</Text>

          <View style={styles.validationItem}>
            <View style={styles.validationLeft}>
              <MapPin size={20} color={validationStatus.geofence ? '#10b981' : '#6b7280'} />
              <Text style={styles.validationLabel}>Geofence Verification</Text>
            </View>
            {validationStatus.geofence ? (
              <CheckCircle size={20} color="#10b981" />
            ) : (
              <XCircle size={20} color="#ef4444" />
            )}
          </View>

          <View style={styles.validationItem}>
            <View style={styles.validationLeft}>
              <Smartphone size={20} color={validationStatus.deviceBinding ? '#10b981' : '#6b7280'} />
              <Text style={styles.validationLabel}>Device Binding</Text>
            </View>
            {validationStatus.deviceBinding ? (
              <CheckCircle size={20} color="#10b981" />
            ) : (
              <XCircle size={20} color="#ef4444" />
            )}
          </View>

          <View style={styles.validationItem}>
            <View style={styles.validationLeft}>
              <Camera size={20} color={validationStatus.biometric ? '#10b981' : '#6b7280'} />
              <Text style={styles.validationLabel}>Biometric/Selfie</Text>
            </View>
            {validationStatus.biometric ? (
              <CheckCircle size={20} color="#10b981" />
            ) : (
              <TouchableOpacity style={styles.captureButton}>
                <Text style={styles.captureButtonText}>Capture</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {checkedIn && checkInTime && (
          <View style={styles.activeSession}>
            <Clock size={20} color="#2563eb" />
            <Text style={styles.sessionText}>Checked in at {checkInTime}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.checkInButton,
            checkedIn ? styles.checkOutButton : styles.checkInButtonActive,
            !validationStatus.geofence || !validationStatus.deviceBinding || !validationStatus.biometric
              ? styles.checkInButtonDisabled
              : null
          ]}
          onPress={checkedIn ? handleCheckOut : handleCheckIn}
          disabled={!validationStatus.geofence || !validationStatus.deviceBinding || !validationStatus.biometric}
        >
          <Text style={styles.checkInButtonText}>
            {checkedIn ? 'Check Out' : 'Check In'}
          </Text>
        </TouchableOpacity>

        {(!validationStatus.geofence || !validationStatus.deviceBinding || !validationStatus.biometric) && (
          <Text style={styles.warningText}>Complete all validations to check in</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Attendance History</Text>
          <TouchableOpacity>
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {attendanceHistory.map((record) => (
          <View key={record.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDate}>{record.date}</Text>
              <View style={[
                styles.historyStatusBadge,
                record.status === 'verified' ? styles.verifiedBadge : styles.flaggedBadge
              ]}>
                <Text style={[
                  styles.historyStatusText,
                  record.status === 'verified' ? styles.verifiedText : styles.flaggedText
                ]}>{record.status}</Text>
              </View>
            </View>

            <View style={styles.historyDetails}>
              <View style={styles.historyTime}>
                <Text style={styles.historyLabel}>Check In</Text>
                <Text style={styles.historyValue}>{record.checkIn}</Text>
              </View>
              <View style={styles.historyTime}>
                <Text style={styles.historyLabel}>Check Out</Text>
                <Text style={styles.historyValue}>{record.checkOut}</Text>
              </View>
              <View style={styles.historyTime}>
                <Text style={styles.historyLabel}>Hours</Text>
                <Text style={styles.historyValue}>{record.hours}h</Text>
              </View>
            </View>

            <View style={styles.trustScoreContainer}>
              <Text style={styles.trustScoreLabel}>Trust Score</Text>
              <View style={styles.trustScoreBar}>
                <View style={[styles.trustScoreFill, {
                  width: `${record.trustScore}%`,
                  backgroundColor: record.trustScore >= 90 ? '#10b981' : record.trustScore >= 70 ? '#f59e0b' : '#ef4444'
                }]} />
              </View>
              <Text style={styles.trustScoreValue}>{record.trustScore}%</Text>
            </View>
          </View>
        ))}
      </View>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
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
  checkInCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98115',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  validationContainer: {
    marginBottom: 20,
  },
  validationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  validationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  validationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  validationLabel: {
    fontSize: 15,
    color: '#111827',
  },
  captureButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  captureButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  activeSession: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sessionText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  checkInButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkInButtonActive: {
    backgroundColor: '#2563eb',
  },
  checkOutButton: {
    backgroundColor: '#ef4444',
  },
  checkInButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  warningText: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  filterText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  historyStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedBadge: {
    backgroundColor: '#10b98115',
  },
  flaggedBadge: {
    backgroundColor: '#ef444415',
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  verifiedText: {
    color: '#10b981',
  },
  flaggedText: {
    color: '#ef4444',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyTime: {
    flex: 1,
  },
  historyLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  trustScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustScoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    width: 70,
  },
  trustScoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trustScoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  trustScoreValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    width: 40,
    textAlign: 'right',
  },
});
