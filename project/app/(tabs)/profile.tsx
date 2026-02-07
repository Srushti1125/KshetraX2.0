import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useOffline } from '@/contexts/OfflineContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TrustScoreDisplay } from '@/components/TrustScoreDisplay';
import { User, Phone, Mail, Shield, Wifi, WifiOff } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { worker, user, signOut } = useAuth();
  const { isOnline, pendingSyncCount, syncOfflineData } = useOffline();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const handleSync = async () => {
    Alert.alert('Syncing', 'Syncing offline data...', [{ text: 'OK' }]);
    await syncOfflineData();
    Alert.alert('Success', 'All offline data synced successfully!');
  };

  if (!worker || !user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.trustScoreCard}>
          <TrustScoreDisplay score={worker.trust_score} />
        </Card>

        <Card>
          <View style={styles.infoRow}>
            <User size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{worker.name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Mail size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{worker.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Shield size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={[styles.infoValue, styles.roleValue]}>
                {worker.role.toUpperCase()}
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Sync Status</Text>
          <View style={styles.syncRow}>
            {isOnline ? (
              <Wifi size={20} color="#10b981" />
            ) : (
              <WifiOff size={20} color="#ef4444" />
            )}
            <Text style={styles.syncText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          {pendingSyncCount > 0 && (
            <View style={styles.pendingContainer}>
              <Text style={styles.pendingText}>
                {pendingSyncCount} records pending sync
              </Text>
              <Button
                title="Sync Now"
                onPress={handleSync}
                disabled={!isOnline}
                style={styles.syncButton}
              />
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Wage Information</Text>
          <View style={styles.wageRow}>
            <Text style={styles.wageLabel}>Hourly Rate:</Text>
            <Text style={styles.wageValue}>₹{worker.hourly_wage}/hr</Text>
          </View>
          <View style={styles.wageRow}>
            <Text style={styles.wageLabel}>Overtime Rate:</Text>
            <Text style={styles.wageValue}>
              ₹{(worker.hourly_wage * 1.5).toFixed(2)}/hr
            </Text>
          </View>
        </Card>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          style={styles.signOutButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  trustScoreCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  roleValue: {
    color: '#2563eb',
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  pendingContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  pendingText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 8,
  },
  syncButton: {
    marginTop: 8,
  },
  wageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  wageLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  wageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  signOutButton: {
    marginVertical: 20,
  },
});
