import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AlertTriangle, Users, Clock, TrendingUp, MapPin } from 'lucide-react-native';

export default function HomeScreen() {
  const stats = [
    { label: 'Active Workers', value: '47', icon: Users, color: '#2563eb' },
    { label: 'Present Today', value: '42', icon: Clock, color: '#10b981' },
    { label: 'Flagged Records', value: '3', icon: AlertTriangle, color: '#ef4444' },
    { label: 'Site Progress', value: '67%', icon: TrendingUp, color: '#8b5cf6' },
  ];

  const sites = [
    { id: 1, name: 'Tower A - Floor 12', workers: 15, status: 'Active', lat: '12.9716', lng: '77.5946' },
    { id: 2, name: 'Tower B - Foundation', workers: 18, status: 'Active', lat: '12.9726', lng: '77.5956' },
    { id: 3, name: 'Parking Structure', workers: 9, status: 'Active', lat: '12.9706', lng: '77.5936' },
  ];

  const recentAlerts = [
    { id: 1, type: 'attendance', message: 'Check-in outside geofence - Worker #2145', time: '10 min ago', severity: 'high' },
    { id: 2, type: 'material', message: 'Material variance detected - Cement stock', time: '1 hour ago', severity: 'medium' },
    { id: 3, type: 'trust', message: 'Low trust score - Worker #3421', time: '2 hours ago', severity: 'low' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.title}>Site Commander</Text>
        </View>
        <TouchableOpacity style={styles.syncButton}>
          <Text style={styles.syncText}>Last sync: 2m ago</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}15` }]}>
              <stat.icon size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Sites</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {sites.map((site) => (
          <TouchableOpacity key={site.id} style={styles.siteCard}>
            <View style={styles.siteHeader}>
              <View style={styles.siteInfo}>
                <Text style={styles.siteName}>{site.name}</Text>
                <View style={styles.siteDetails}>
                  <MapPin size={14} color="#6b7280" />
                  <Text style={styles.siteCoords}>{site.lat}, {site.lng}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#10b98115' }]}>
                <Text style={[styles.statusText, { color: '#10b981' }]}>{site.status}</Text>
              </View>
            </View>
            <View style={styles.siteFooter}>
              <View style={styles.workerCount}>
                <Users size={16} color="#6b7280" />
                <Text style={styles.workerCountText}>{site.workers} Workers</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentAlerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={[
              styles.alertIndicator,
              { backgroundColor: alert.severity === 'high' ? '#ef4444' : alert.severity === 'medium' ? '#f59e0b' : '#6b7280' }
            ]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  syncButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  siteCard: {
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
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  siteDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  siteCoords: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  siteFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  workerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workerCountText: {
    fontSize: 14,
    color: '#6b7280',
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  alertIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
  },
});
