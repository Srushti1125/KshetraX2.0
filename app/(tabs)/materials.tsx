import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Package, TrendingDown, TrendingUp, AlertTriangle, Plus } from 'lucide-react-native';

export default function MaterialsScreen() {
  const inventory = [
    { id: 1, name: 'Cement (Bags)', stock: 450, consumed: 180, threshold: 200, unit: 'bags', variance: -5.2 },
    { id: 2, name: 'Steel Rods (Tons)', stock: 12.5, consumed: 4.2, threshold: 5, unit: 'tons', variance: 2.1 },
    { id: 3, name: 'Bricks', stock: 8500, consumed: 3200, threshold: 2000, unit: 'pcs', variance: -8.3 },
    { id: 4, name: 'Sand (Cubic Meters)', stock: 35, consumed: 18, threshold: 15, unit: 'm³', variance: 1.5 },
    { id: 5, name: 'Gravel (Cubic Meters)', stock: 28, consumed: 12, threshold: 10, unit: 'm³', variance: -3.7 },
  ];

  const recentActivity = [
    { id: 1, type: 'stock-in', material: 'Cement', quantity: 200, unit: 'bags', date: 'Today 10:30 AM', site: 'Tower A' },
    { id: 2, type: 'consumed', material: 'Steel Rods', quantity: 1.5, unit: 'tons', date: 'Today 09:15 AM', site: 'Tower B' },
    { id: 3, type: 'alert', material: 'Bricks', quantity: 500, unit: 'pcs', date: 'Yesterday 04:20 PM', site: 'Tower A' },
  ];

  const alerts = [
    { id: 1, material: 'Cement', issue: 'Material variance detected', severity: 'high', variance: -5.2 },
    { id: 2, material: 'Bricks', issue: 'Consumption exceeds standard ratio', severity: 'high', variance: -8.3 },
    { id: 3, material: 'Gravel', issue: 'Minor variance in consumption', severity: 'medium', variance: -3.7 },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Materials</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {alerts.length > 0 && (
        <View style={styles.alertsBanner}>
          <AlertTriangle size={20} color="#ef4444" />
          <Text style={styles.alertsBannerText}>
            {alerts.length} material alerts require attention
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Inventory</Text>

        {inventory.map((item) => (
          <TouchableOpacity key={item.id} style={styles.inventoryCard}>
            <View style={styles.inventoryHeader}>
              <View style={styles.inventoryInfo}>
                <Text style={styles.inventoryName}>{item.name}</Text>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockLabel}>Stock:</Text>
                  <Text style={styles.stockValue}>{item.stock} {item.unit}</Text>
                </View>
              </View>

              {item.variance !== 0 && (
                <View style={[
                  styles.varianceBadge,
                  item.variance > 0 ? styles.variancePositive : styles.varianceNegative
                ]}>
                  {item.variance > 0 ? (
                    <TrendingUp size={14} color="#10b981" />
                  ) : (
                    <TrendingDown size={14} color="#ef4444" />
                  )}
                  <Text style={[
                    styles.varianceText,
                    item.variance > 0 ? styles.variancePositiveText : styles.varianceNegativeText
                  ]}>
                    {Math.abs(item.variance)}%
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.consumptionBar}>
              <View style={styles.consumptionBarFill}>
                <View style={[
                  styles.consumptionProgress,
                  { width: `${(item.consumed / item.stock) * 100}%` }
                ]} />
                <View style={[
                  styles.thresholdIndicator,
                  { left: `${(item.threshold / item.stock) * 100}%` }
                ]} />
              </View>
              <View style={styles.consumptionLabels}>
                <Text style={styles.consumptionLabel}>Consumed: {item.consumed} {item.unit}</Text>
                <Text style={styles.thresholdLabel}>Threshold: {item.threshold}</Text>
              </View>
            </View>

            {item.stock <= item.threshold && (
              <View style={styles.lowStockWarning}>
                <AlertTriangle size={14} color="#f59e0b" />
                <Text style={styles.lowStockWarningText}>Low stock warning</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Leakage Alerts</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {alerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={[
              styles.alertSeverityIndicator,
              alert.severity === 'high' ? styles.severityHigh : styles.severityMedium
            ]} />
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertMaterial}>{alert.material}</Text>
                <View style={styles.varianceChip}>
                  <TrendingDown size={12} color="#ef4444" />
                  <Text style={styles.varianceChipText}>{Math.abs(alert.variance)}%</Text>
                </View>
              </View>
              <Text style={styles.alertIssue}>{alert.issue}</Text>
              <TouchableOpacity style={styles.investigateButton}>
                <Text style={styles.investigateButtonText}>Investigate</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={[
              styles.activityIcon,
              activity.type === 'stock-in' ? styles.activityStockIn :
              activity.type === 'consumed' ? styles.activityConsumed :
              styles.activityAlert
            ]}>
              {activity.type === 'stock-in' ? (
                <TrendingUp size={18} color="#10b981" />
              ) : activity.type === 'consumed' ? (
                <TrendingDown size={18} color="#2563eb" />
              ) : (
                <AlertTriangle size={18} color="#ef4444" />
              )}
            </View>

            <View style={styles.activityContent}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityMaterial}>{activity.material}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
              <Text style={styles.activityDetails}>
                {activity.type === 'stock-in' ? 'Stock In: ' :
                 activity.type === 'consumed' ? 'Consumed: ' : 'Alert: '}
                {activity.quantity} {activity.unit}
              </Text>
              <Text style={styles.activitySite}>Site: {activity.site}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertsBanner: {
    backgroundColor: '#fef2f2',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  alertsBannerText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    flex: 1,
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
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  inventoryCard: {
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
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  varianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  variancePositive: {
    backgroundColor: '#10b98115',
  },
  varianceNegative: {
    backgroundColor: '#ef444415',
  },
  varianceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  variancePositiveText: {
    color: '#10b981',
  },
  varianceNegativeText: {
    color: '#ef4444',
  },
  consumptionBar: {
    marginBottom: 12,
  },
  consumptionBarFill: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
  },
  consumptionProgress: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  thresholdIndicator: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#f59e0b',
  },
  consumptionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  consumptionLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  thresholdLabel: {
    fontSize: 12,
    color: '#f59e0b',
  },
  lowStockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
  },
  lowStockWarningText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  alertSeverityIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  severityHigh: {
    backgroundColor: '#ef4444',
  },
  severityMedium: {
    backgroundColor: '#f59e0b',
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertMaterial: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  varianceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef444415',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  varianceChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
  },
  alertIssue: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  investigateButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  investigateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityStockIn: {
    backgroundColor: '#10b98115',
  },
  activityConsumed: {
    backgroundColor: '#2563eb15',
  },
  activityAlert: {
    backgroundColor: '#ef444415',
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityMaterial: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  activityDate: {
    fontSize: 11,
    color: '#6b7280',
  },
  activityDetails: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  activitySite: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
