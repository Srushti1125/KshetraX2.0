export interface VoiceMessage {
  id: string;
  workerId: string;
  workerName: string;
  deviceId: string;
  projectId: string;
  audioUri: string; // local file path
  duration: number; // in seconds
  timestamp: number; // Unix timestamp
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  status: 'pending' | 'synced' | 'failed';
  syncedAt?: number;
  metadata: {
    fileSize: number;
    mimeType: string;
  };
  managerResponse?: {
    status: 'approved' | 'flagged' | 'responded';
    note?: string;
    respondedAt: number;
    respondedBy: string;
  };
}

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioUri?: string;
}

export interface SyncQueueItem {
  messageId: string;
  retryCount: number;
  lastAttempt?: number;
}