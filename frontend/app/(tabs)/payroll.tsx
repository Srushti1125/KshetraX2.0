import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Wallet, Users, TrendingUp, Download, ChevronRight } from 'lucide-react-native';

export default function PayrollScreen() {
  const summary = {
    totalWorkers: 47,
    totalPayable: 234500,
    advances: 45000,
    deductions: 8200,
    netPayable: 181300,
  };

  const workers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      workerId: 'WRK-2145',
      hoursWorked: 184,
      hourlyRate: 150,
      grossPay: 27600,
      advances: 5000,
      deductions: 200,
      netPay: 22400,
      status: 'pending',
    },
    {
      id: 2,
      name: 'Amit Singh',
      workerId: 'WRK-3421',
      hoursWorked: 176,
      hourlyRate: 180,
      grossPay: 31680,
      advances: 8000,
      deductions: 500,
      netPay: 23180,
      status: 'pending',
    },
    {
      id: 3,
      name: 'Suresh Patel',
      workerId: 'WRK-4532',
      hoursWorked: 192,
      hourlyRate: 160,
      grossPay: 30720,
      advances: 6000,
      deductions: 0,
      netPay: 24720,
      status: 'paid',
    },
  ];

  const paymentCycles = [
    { id: 1, period: 'Jan 16 - Jan 31, 2024', workers: 47, amount: 181300, status: 'current' },
    { id: 2, period: 'Jan 1 - Jan 15, 2024', workers: 45, amount: 175200, status: 'completed' },
    { id: 3, period: 'Dec 16 - Dec 31, 2023', workers: 42, amount: 168900, status: 'completed' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payroll</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Current Cycle Summary</Text>
        <Text style={styles.summaryPeriod}>Jan 16 - Jan 31, 2024</Text>

        <View style={styles.totalPayableContainer}>
          <Text style={styles.totalPayableLabel}>Net Payable</Text>
          <Text style={styles.totalPayableAmount}>₹{summary.netPayable.toLocaleString()}</Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Total Workers</Text>
            <Text style={styles.summaryItemValue}>{summary.totalWorkers}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Gross Pay</Text>
            <Text style={styles.summaryItemValue}>₹{summary.totalPayable.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Advances</Text>
            <Text style={[styles.summaryItemValue, styles.deductionValue]}>
              -₹{summary.advances.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Deductions</Text>
            <Text style={[styles.summaryItemValue, styles.deductionValue]}>
              -₹{summary.deductions.toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.processButton}>
          <Text style={styles.processButtonText}>Process Payroll</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Worker Wages</Text>
          <TouchableOpacity>
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {workers.map((worker) => (
          <TouchableOpacity key={worker.id} style={styles.workerCard}>
            <View style={styles.workerHeader}>
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{worker.name}</Text>
                <Text style={styles.workerId}>{worker.workerId}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                worker.status === 'paid' ? styles.statusPaid : styles.statusPending
              ]}>
                <Text style={[
                  styles.statusText,
                  worker.status === 'paid' ? styles.statusPaidText : styles.statusPendingText
                ]}>{worker.status}</Text>
              </View>
            </View>

            <View style={styles.workerDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hours Worked</Text>
                <Text style={styles.detailValue}>{worker.hoursWorked}h</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hourly Rate</Text>
                <Text style={styles.detailValue}>₹{worker.hourlyRate}/h</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gross Pay</Text>
                <Text style={styles.detailValue}>₹{worker.grossPay.toLocaleString()}</Text>
              </View>
            </View>

            {(worker.advances > 0 || worker.deductions > 0) && (
              <View style={styles.adjustmentsSection}>
                <Text style={styles.adjustmentsTitle}>Adjustments</Text>
                {worker.advances > 0 && (
                  <View style={styles.adjustmentRow}>
                    <Text style={styles.adjustmentLabel}>Advances</Text>
                    <Text style={styles.adjustmentValue}>
                      -₹{worker.advances.toLocaleString()}
                    </Text>
                  </View>
                )}
                {worker.deductions > 0 && (
                  <View style={styles.adjustmentRow}>
                    <Text style={styles.adjustmentLabel}>Deductions</Text>
                    <Text style={styles.adjustmentValue}>
                      -₹{worker.deductions.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.netPayContainer}>
              <Text style={styles.netPayLabel}>Net Payable</Text>
              <Text style={styles.netPayAmount}>₹{worker.netPay.toLocaleString()}</Text>
            </View>

            <ChevronRight
              size={20}
              color="#9ca3af"
              style={styles.chevron}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Cycles</Text>

        {paymentCycles.map((cycle) => (
          <TouchableOpacity key={cycle.id} style={styles.cycleCard}>
            <View style={styles.cycleHeader}>
              <Text style={styles.cyclePeriod}>{cycle.period}</Text>
              <View style={[
                styles.cycleStatusBadge,
                cycle.status === 'current' ? styles.cycleCurrent : styles.cycleCompleted
              ]}>
                <Text style={[
                  styles.cycleStatusText,
                  cycle.status === 'current' ? styles.cycleCurrentText : styles.cycleCompletedText
                ]}>{cycle.status}</Text>
              </View>
            </View>

            <View style={styles.cycleDetails}>
              <View style={styles.cycleDetailItem}>
                <Users size={16} color="#6b7280" />
                <Text style={styles.cycleDetailText}>{cycle.workers} Workers</Text>
              </View>
              <View style={styles.cycleDetailItem}>
                <Wallet size={16} color="#6b7280" />
                <Text style={styles.cycleDetailText}>₹{cycle.amount.toLocaleString()}</Text>
              </View>
            </View>

            <ChevronRight
              size={20}
              color="#9ca3af"
              style={styles.chevron}
            />
          </TouchableOpacity>
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
  exportButton: {
    backgroundColor: '#eff6ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  summaryPeriod: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
  },
  totalPayableContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  totalPayableLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  totalPayableAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563eb',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryItem: {
    width: '47%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  summaryItemLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  deductionValue: {
    color: '#ef4444',
  },
  processButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  processButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
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
  filterText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  workerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  workerId: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPaid: {
    backgroundColor: '#10b98115',
  },
  statusPending: {
    backgroundColor: '#f59e0b15',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusPaidText: {
    color: '#10b981',
  },
  statusPendingText: {
    color: '#f59e0b',
  },
  workerDetails: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  adjustmentsSection: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  adjustmentsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  adjustmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  adjustmentLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  adjustmentValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  netPayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  netPayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  netPayAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
  },
  cycleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cyclePeriod: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  cycleStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cycleCurrent: {
    backgroundColor: '#2563eb15',
  },
  cycleCompleted: {
    backgroundColor: '#10b98115',
  },
  cycleStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cycleCurrentText: {
    color: '#2563eb',
  },
  cycleCompletedText: {
    color: '#10b981',
  },
  cycleDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  cycleDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cycleDetailText: {
    fontSize: 13,
    color: '#6b7280',
  },
});
