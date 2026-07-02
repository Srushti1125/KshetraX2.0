import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useState, useEffect } from "react";
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceStorageService } from "@/services/voiceStorage";
import { Play, Pause, MapPin, Clock, User, Flag, CheckCircle, RefreshCw } from 'lucide-react-native';

interface VoiceMessageItem {
  id: string;
  workerId: string;
  workerName: string;
  timestamp: number;
  duration: number;
  audioUri: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: string;
  managerResponse?: {
    status: string;
    note?: string;
    respondedAt: number;
  };
}

export default function VoiceReview() {
  const [messages, setMessages] = useState<VoiceMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    loadMessages();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      console.log('📥 Loading voice messages...');
      const data = await VoiceStorageService.fetchManagerMessages();
      console.log(`✅ Loaded ${data.length} messages`);
      setMessages(data);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      Alert.alert('Error', 'Failed to load voice messages');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (message: VoiceMessageItem) => {
    try {
      // Stop current playback
      if (sound) {
        console.log('⏹️ Stopping current playback');
        await sound.unloadAsync();
        setSound(null);
      }

      if (playingId === message.id) {
        setPlayingId(null);
        return;
      }

      console.log('▶️ Playing audio from local file:', message.audioUri);

      // Load and play from local file
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: message.audioUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setPlayingId(message.id);
      console.log('✅ Audio playback started');

      // Listen for playback completion
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('⏹️ Audio playback finished');
          setPlayingId(null);
        }
      });

    } catch (error) {
      console.error('❌ Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio. The file may have been deleted.');
    }
  };

  const handleResponse = async (messageId: string, action: 'approve' | 'flag') => {
    Alert.alert(
      action === 'approve' ? 'Approve Message' : 'Flag Message',
      `Are you sure you want to ${action} this voice update?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const managerId = await AsyncStorage.getItem('userId') || 'manager';
              
              await VoiceStorageService.updateMessageResponse(messageId, {
                status: action === 'approve' ? 'approved' : 'flagged',
                respondedBy: managerId,
              });
              
              console.log(`${action === 'approve' ? '✅' : '🚩'} Message ${action}ed:`, messageId);
              Alert.alert('Success', `Message ${action}ed successfully`);
              loadMessages();
            } catch (error) {
              console.error('Error updating message:', error);
              Alert.alert('Error', 'Failed to update message');
            }
          },
        },
      ]
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: VoiceMessageItem }) => {
    const isPlaying = playingId === item.id;

    return (
      <View style={styles.messageCard}>
        {/* Header */}
        <View style={styles.messageHeader}>
          <View style={styles.workerInfo}>
            <User size={20} color="#3b82f6" />
            <Text style={styles.workerName}>{item.workerName}</Text>
          </View>
          
          {item.managerResponse?.status === 'approved' && (
            <View style={styles.approvedBadge}>
              <CheckCircle size={16} color="#16a34a" />
              <Text style={styles.approvedText}>Approved</Text>
            </View>
          )}
          
          {item.managerResponse?.status === 'flagged' && (
            <View style={styles.flaggedBadge}>
              <Flag size={16} color="#dc2626" />
              <Text style={styles.flaggedText}>Flagged</Text>
            </View>
          )}
        </View>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Clock size={16} color="#64748b" />
            <Text style={styles.metadataText}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>

          {item.location && (
            <View style={styles.metadataItem}>
              <MapPin size={16} color="#64748b" />
              <Text style={styles.metadataText}>
                {(() => {
                  try {
                    const loc = typeof item.location === 'string' ? JSON.parse(item.location) : item.location;
                    if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
                      return `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
                    }
                    return 'Location Tagged';
                  } catch (e) {
                    return 'Location Tagged';
                  }
                })()}
              </Text>
            </View>
          )}
        </View>

        {/* Audio Player */}
        <View style={styles.audioPlayer}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={() => playAudio(item)}
          >
            {isPlaying ? (
              <Pause size={24} color="#fff" />
            ) : (
              <Play size={24} color="#fff" />
            )}
          </TouchableOpacity>

          <View style={styles.audioInfo}>
            <View style={styles.waveformMini}>
              {[...Array(15)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.waveBarMini,
                    isPlaying && { backgroundColor: '#3b82f6' }
                  ]} 
                />
              ))}
            </View>
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          </View>
        </View>

        {/* Actions */}
        {!item.managerResponse && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleResponse(item.id, 'approve')}
            >
              <CheckCircle size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.flagButton]}
              onPress={() => handleResponse(item.id, 'flag')}
            >
              <Flag size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Flag</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading voice messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Voice Updates</Text>
          <Text style={styles.subtitle}>{messages.length} total messages</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadMessages}
        >
          <RefreshCw size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No voice messages yet</Text>
            <Text style={styles.emptySubtext}>Voice updates from workers will appear here</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={loadMessages}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  refreshButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  approvedText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  flaggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  flaggedText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  metadata: {
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metadataText: {
    fontSize: 13,
    color: '#64748b',
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#ef4444',
  },
  audioInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waveformMini: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    gap: 2,
  },
  waveBarMini: {
    flex: 1,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    height: '60%',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#16a34a',
  },
  flagButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
  },
});
