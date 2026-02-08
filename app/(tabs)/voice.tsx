import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mic, Square, CheckCircle, List } from 'lucide-react-native';
import { VoiceMessage } from "../types/voice";
import { VoiceStorageService } from "../services/voiceStorage-local";
import * as Device from 'expo-device';

export default function VoiceUpdate() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    requestPermissions();
    loadMessageCount();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const requestPermissions = async () => {
    const audioStatus = await Audio.requestPermissionsAsync();
    const locationStatus = await Location.requestForegroundPermissionsAsync();
    
    if (audioStatus.status !== 'granted' || locationStatus.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'This feature needs microphone and location access to work properly.'
      );
    }
  };

  const loadMessageCount = async () => {
    const workerId = await AsyncStorage.getItem('userId') || 'unknown';
    const count = await VoiceStorageService.getWorkerMessageCount(workerId);
    setTotalMessages(count);
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setDuration(0);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (recording && recording._canRecord) {
          stopRecording();
        }
      }, 30000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setIsSaving(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        await saveVoiceMessage(uri);
      }
      
      setRecording(null);
      setDuration(0);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to save recording');
    } finally {
      setIsSaving(false);
    }
  };

  const saveVoiceMessage = async (audioUri: string) => {
    try {
      // Get worker info
      const workerId = await AsyncStorage.getItem('userId') || 'unknown';
      const workerName = await AsyncStorage.getItem('userName') || 'Unknown Worker';
      const projectId = await AsyncStorage.getItem('currentProject') || 'default';

      // Get location
      let location = undefined;
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        location = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy || undefined,
        };
      } catch (err) {
        console.log('Could not get location:', err);
      }

      // Create voice message
      const voiceMessage: VoiceMessage = {
        id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workerId,
        workerName,
        deviceId: Device.modelName || 'unknown',
        projectId,
        audioUri,
        duration,
        timestamp: Date.now(),
        location,
        status: 'pending',
        metadata: {
          fileSize: 0,
          mimeType: 'audio/m4a',
        },
      };

      // Save locally
      await VoiceStorageService.saveLocal(voiceMessage);
      
      setLastSaved(new Date());
      loadMessageCount();

      Alert.alert(
        'Saved! ✅',
        'Voice update saved successfully.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error saving voice message:', error);
      Alert.alert('Error', 'Failed to save voice message');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Update</Text>
      <Text style={styles.subtitle}>Quick voice notes for supervisors</Text>

      {/* Recording Status */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.pulseOuter}>
            <View style={styles.pulseInner} />
          </View>
          <Text style={styles.recordingText}>RECORDING...</Text>
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>
        </View>
      )}

      {/* Waveform Placeholder */}
      {isRecording && (
        <View style={styles.waveform}>
          {[...Array(20)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.waveBar,
                { height: Math.random() * 60 + 20 }
              ]} 
            />
          ))}
        </View>
      )}

      {/* Main Action Button */}
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
          isSaving && styles.recordButtonDisabled
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : isRecording ? (
          <Square size={60} color="#fff" fill="#fff" />
        ) : (
          <Mic size={60} color="#fff" />
        )}
      </TouchableOpacity>

      <Text style={styles.instruction}>
        {isRecording ? 'Tap to stop (max 30s)' : 'Tap to start recording'}
      </Text>

      {/* Status Section */}
      <View style={styles.statusSection}>
        {lastSaved && (
          <View style={styles.statusItem}>
            <CheckCircle size={20} color="#16a34a" />
            <Text style={styles.statusText}>
              Last saved: {lastSaved.toLocaleTimeString()}
            </Text>
          </View>
        )}

        {totalMessages > 0 && (
          <View style={styles.statsBadge}>
            <List size={20} color="#3b82f6" />
            <Text style={styles.statsText}>
              You have {totalMessages} voice message{totalMessages !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Auto-tagging Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Auto-tagged with:</Text>
        <Text style={styles.infoItem}>✓ Your ID & Device</Text>
        <Text style={styles.infoItem}>✓ Timestamp</Text>
        <Text style={styles.infoItem}>✓ GPS Location</Text>
        <Text style={styles.infoItem}>✓ Project ID</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  recordingIndicator: {
    alignItems: 'center',
    marginBottom: 30,
  },
  pulseOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ef4444',
    opacity: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pulseInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ef4444',
  },
  recordingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: 30,
    gap: 4,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  recordButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordButtonActive: {
    backgroundColor: '#ef4444',
  },
  recordButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  statusSection: {
    width: '100%',
    marginBottom: 30,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#16a34a',
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  infoBox: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#334155',
  },
  infoItem: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
});