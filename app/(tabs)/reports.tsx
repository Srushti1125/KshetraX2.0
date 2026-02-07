import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FileText, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react-native';

export default function ReportsScreen() {
  const reportTypes = [
    { id: 1, name: 'Attendance Integrity', icon: CheckCircle, count: 'Daily', color: '#10b981' },
    { id: 2, name: 'Wage Summary', icon: FileText, count: 'Weekly', color: '#2563eb' },
    { id: 3, name: 'Material Utilization', icon: TrendingUp, count: 'Monthly', color: '#8b5cf6' },
    { id: 4, name: 'Anomaly Detection', icon: AlertTriangle, count: '3 Active', color: '#ef4444' },
  ];

  const metricsData = [
    {
      title: 'Attendance Metrics',
      data: [
        { label: 'Average Attendance', value: '89%', trend: 'up', change: '+2.3%' },
        { label: 'On-Time Check-ins', value: '92%', trend: 'up', change: '+1.5%' },
        { label: 'Flagged Records', value: '3', trend: 'down', change: '-2' },
        { label: 'Avg Trust Score', value: '94.2', trend: 'up', change: '+1.8' },
      ],
    },
    {
      title: 'Material Efficiency',
      data: [
        { label: 'Material Wastage', value: '4.2%', trend: 'down', change: '-0.8%' },
        { label: 'Stock Accuracy', value: '96%', trend: 'up', change: '+1.2%' },
        { label: 'Variance Alerts', value: '5', trend: 'up', change: '+2' },
        { label: 'Utilization Rate', value: '87%', trend: 'up', change: '+3.1%' },
      ],
    },
    {
      title: 'Financial Overview',
      data: [
        { label: 'Total Payroll', value: '₹2.4M', trend: 'up', change: '+12%' },
        { label: 'Avg Worker Wage', value: '₹24.5K', trend: 'up', change: '+5%' },
        { label: 'Advance Requests', value: '12', trend: 'down', change: '-3' },
        { label: 'Payment Disputes', value: '0', trend: 'neutral', change: '0' },
      ],
    },
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Weekly Attendance Report',
      date: 'Feb 1-7, 2024',
      type: 'Attendance',
      size: '2.4 MB',
      status: 'ready',
    },
    {
      id: 2,
      name: 'Material Consumption Analysis',
      date: 'January 2024',
      type: 'Materials',
      size: '1.8 MB',
      status: 'ready',
    },
    {
      id: 3,
      name: 'Payroll Summary - Jan 2024',
      date: 'January 2024',
      type: 'Payroll',
      size: '3.2 MB',
      status: 'ready',
    },
  ];

  const systemHealth = {
    syncStatus: 'Excellent',
    lastSync: '2 minutes ago',
    offlineRecords: 0,
    pendingValidations: 3,
    dataIntegrity: 99.8,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
      </View>

      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <Text style={styles.healthTitle}>System Health</Text>
          <View style={styles.healthIndicator}>
            <View style={styles.healthDot} />
            <Text style={styles.healthStatus}>{systemHealth.syncStatus}</Text>
          </View>
        </View>

        <View style={styles.healthGrid}>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Last Sync</Text>
            <Text style={styles.healthValue}>{systemHealth.lastSync}</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Offline Records</Text>
            <Text style={styles.healthValue}>{systemHealth.offlineRecords}</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Pending Validations</Text>
            <Text style={styles.healthValue}>{systemHealth.pendingValidations}</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Data Integrity</Text>
            <Text style={styles.healthValue}>{systemHealth.dataIntegrity}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Types</Text>

        <View style={styles.reportTypesGrid}>
          {reportTypes.map((type) => (
            <TouchableOpacity key={type.id} style={styles.reportTypeCard}>
              <View style={[styles.reportTypeIcon, { backgroundColor: `${type.color}15` }]}>
                <type.icon size={24} color={type.color} />
              </View>
              <Text style={styles.reportTypeName}>{type.name}</Text>
              <Text style={styles.reportTypeCount}>{type.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {metricsData.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          <View style={styles.metricsGrid}>
            {section.data.map((metric, idx) => (
              <View key={idx} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <View style={styles.metricValueRow}>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  {metric.trend !== 'neutral' && (
                    <View style={[
                      styles.trendBadge,
                      metric.trend === 'up' ? styles.trendUp : styles.trendDown
                    ]}>
                      {metric.trend === 'up' ? (
                        <TrendingUp size={12} color="#10b981" />
                      ) : (
                        <TrendingDown size={12} color="#ef4444" />
                      )}
                      <Text style={[
                        styles.trendText,
                        metric.trend === 'up' ? styles.trendUpText : styles.trendDownText
                      ]}>
                        {metric.change}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentReports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportIconContainer}>
              <FileText size={24} color="#2563eb" />
            </View>

            <View style={styles.reportContent}>
              <Text style={styles.reportName}>{report.name}</Text>
              <View style={styles.reportMeta}>
                <Text style={styles.reportDate}>{report.date}</Text>
                <Text style={styles.reportSize}>{report.size}</Text>
              </View>
              <View style={styles.reportTypeBadge}>
                <Text style={styles.reportTypeBadgeText}>{report.type}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.downloadButton}>
              <Download size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.generateButton}>
          <FileText size={20} color="#ffffff" />
          <Text style={styles.generateButtonText}>Generate Custom Report</Text>
        </TouchableOpacity>
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
  },
  healthCard: {
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
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98115',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  healthStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  healthItem: {
    width: '47%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  healthLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
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
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  reportTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportTypeCard: {
    backgroundColor: '#ffffff',
    width: '47%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reportTypeCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    width: '47%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 2,
  },
  trendUp: {
    backgroundColor: '#10b98115',
  },
  trendDown: {
    backgroundColor: '#ef444415',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  trendUpText: {
    color: '#10b981',
  },
  trendDownText: {
    color: '#ef4444',
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  reportMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  reportDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  reportSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  reportTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  reportTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  downloadButton: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
