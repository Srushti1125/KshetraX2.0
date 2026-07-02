import { VoiceMessage } from '@/types/voice';
import { API_URL } from '@/config/api';

export class VoiceStorageService {
  
  // Save voice message to backend PostgreSQL & Filesystem
  static async saveLocal(message: VoiceMessage): Promise<void> {
    try {
      console.log('📤 Uploading voice message to backend:', message.id);
      
      const formData = new FormData();
      formData.append('id', message.id);
      formData.append('workerId', message.workerId);
      formData.append('workerName', message.workerName);
      formData.append('deviceId', message.deviceId);
      formData.append('projectId', message.projectId);
      formData.append('duration', message.duration.toString());
      formData.append('timestamp', message.timestamp.toString());
      
      if (message.location) {
        formData.append('location', JSON.stringify(message.location));
      }

      formData.append('audio', {
        uri: message.audioUri,
        name: `voice_${message.id}.m4a`,
        type: 'audio/m4a'
      } as any);

      const response = await fetch(`${API_URL}/api/voice/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload voice note');
      }

      console.log('✅ Voice message uploaded successfully');
    } catch (error) {
      console.error('❌ Error uploading voice message:', error);
      throw error;
    }
  }

  // Get messages by worker ID
  static async getMessagesByWorker(workerId: string): Promise<VoiceMessage[]> {
    try {
      const response = await fetch(`${API_URL}/api/voice/list`);
      if (!response.ok) throw new Error('Failed to fetch list');
      const list: VoiceMessage[] = await response.json();
      return list.filter(m => m.workerId === workerId);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // Update message with manager response
  static async updateMessageResponse(
    messageId: string,
    response: {
      status: 'approved' | 'flagged' | 'responded';
      note?: string;
      respondedBy: string;
    }
  ): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/api/voice/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          status: response.status,
          respondedBy: response.respondedBy,
          note: response.note
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update response on backend');
      }
      console.log('✅ Message response updated:', messageId);
    } catch (error) {
      console.error('Error updating message response:', error);
      throw error;
    }
  }

  // Fetch messages for manager view
  static async fetchManagerMessages(projectId?: string): Promise<VoiceMessage[]> {
    try {
      console.log('📥 Fetching messages from Postgres...');
      const response = await fetch(`${API_URL}/api/voice/list`);
      if (!response.ok) throw new Error('Failed to fetch');
      let messages: VoiceMessage[] = await response.json();
      
      if (projectId) {
        messages = messages.filter(m => m.projectId === projectId);
      }
      return messages;
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return [];
    }
  }

  // Get message count for worker
  static async getWorkerMessageCount(workerId: string): Promise<number> {
    const messages = await this.getMessagesByWorker(workerId);
    return messages.length;
  }
}
