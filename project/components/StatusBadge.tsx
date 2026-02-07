import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AttendanceStatus } from '@/types/database';

interface StatusBadgeProps {
  status: AttendanceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'validated':
        return { color: '#10b981', label: 'Validated' };
      case 'flagged':
        return { color: '#ef4444', label: 'Flagged' };
      case 'pending':
      default:
        return { color: '#f59e0b', label: 'Pending' };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
