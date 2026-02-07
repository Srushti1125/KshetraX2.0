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
import { WageEntry } from '@/types/database';
import { DollarSign } from 'lucide-react-native';

export default function WagesScreen() {
  const { worker } = useAuth();
  const [wages, setWages] = useState<WageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    loadWages();
  }, []);

  const loadWages = async () => {
    if (!worker) return;

    const { data, error } = await supabase
      .from('wage_entries')
      .select('*')
      .eq('worker_id', worker.id)
      .order('created_at', { ascending: false });

    if (data) {
      setWages(data);
      const paid = data
        .filter((w) => w.payment_status === 'paid')
        .reduce((sum, w) => sum + w.total_amount, 0);
      const pending = data
        .filter((w) => w.payment_status === 'pending')
        .reduce((sum, w) => sum + w.total_amount, 0);
      setTotalEarned(paid);
      setTotalPending(pending);
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
        <Text style={styles.headerTitle}>Wages</Text>
      </View>

      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <DollarSign size={24} color="#10b981" />
          <Text style={styles.summaryAmount}>₹{totalPending.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <DollarSign size={24} color="#2563eb" />
          <Text style={styles.summaryAmount}>₹{totalEarned.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Paid</Text>
        </Card>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Wage History</Text>
        {wages.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No wage records yet</Text>
          </Card>
        ) : (
          wages.map((wage) => (
            <Card key={wage.id} style={styles.wageCard}>
              <View style={styles.wageHeader}>
                <Text style={styles.wageDate}>
                  {new Date(wage.created_at).toLocaleDateString()}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    wage.payment_status === 'paid'
                      ? styles.statusPaid
                      : styles.statusPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      wage.payment_status === 'paid'
                        ? styles.statusPaidText
                        : styles.statusPendingText,
                    ]}
                  >
                    {wage.payment_status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.wageDetails}>
                <View style={styles.wageRow}>
                  <Text style={styles.wageLabel}>Regular Hours:</Text>
                  <Text style={styles.wageValue}>
                    {wage.regular_hours.toFixed(2)}h
                  </Text>
                </View>
                <View style={styles.wageRow}>
                  <Text style={styles.wageLabel}>Overtime Hours:</Text>
                  <Text style={styles.wageValue}>
                    {wage.overtime_hours.toFixed(2)}h
                  </Text>
                </View>
                <View style={styles.wageRow}>
                  <Text style={styles.wageLabel}>Regular Amount:</Text>
                  <Text style={styles.wageValue}>
                    ₹{wage.regular_amount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.wageRow}>
                  <Text style={styles.wageLabel}>Overtime Amount:</Text>
                  <Text style={styles.wageValue}>
                    ₹{wage.overtime_amount.toFixed(2)}
                  </Text>
                </View>
                {wage.deductions > 0 && (
                  <View style={styles.wageRow}>
                    <Text style={[styles.wageLabel, styles.deductionText]}>
                      Deductions:
                    </Text>
                    <Text style={[styles.wageValue, styles.deductionText]}>
                      -₹{wage.deductions.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>
                  ₹{wage.total_amount.toFixed(2)}
                </Text>
              </View>
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  wageCard: {
    marginBottom: 12,
  },
  wageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wageDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPaid: {
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusPaidText: {
    color: '#065f46',
  },
  statusPendingText: {
    color: '#92400e',
  },
  wageDetails: {
    marginBottom: 12,
  },
  wageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  wageLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  wageValue: {
    fontSize: 14,
    color: '#374151',
  },
  deductionText: {
    color: '#dc2626',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
});
