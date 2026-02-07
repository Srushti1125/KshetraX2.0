import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TrustScoreDisplayProps {
  score: number;
  size?: 'small' | 'large';
}

export function TrustScoreDisplay({
  score,
  size = 'large',
}: TrustScoreDisplayProps) {
  const getScoreColor = () => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const isSmall = size === 'small';

  return (
    <View style={styles.container}>
      <View style={[styles.scoreCircle, isSmall && styles.scoreCircleSmall]}>
        <Text
          style={[
            styles.scoreText,
            { color: getScoreColor() },
            isSmall && styles.scoreTextSmall,
          ]}
        >
          {score}
        </Text>
      </View>
      <Text style={[styles.label, isSmall && styles.labelSmall]}>
        Trust Score
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreCircleSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreTextSmall: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  labelSmall: {
    fontSize: 12,
  },
});
