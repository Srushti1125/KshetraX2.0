import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceMessage } from '../types/voice';

const VOICE_MESSAGES_KEY = '@voice_messages';

export class VoiceStorageService {
  
  // Save voice message locally
  static async saveLocal(message: VoiceMessage): Promise<void> {
    try {
      console.log('💾 Saving message locally:', message.id);
      const existing = await this.getAllLocal();
      existing.push(message);
      await AsyncStorage.setItem(VOICE_MESSAGES_KEY, JSON.stringify(existing));
      console.log('✅ Message saved successfully');
    } catch (error) {
      console.error('❌ Error saving voice message:', error);
      throw error;
    }
  }

  // Get all local messages
  static async getAllLocal(): Promise<VoiceMessage[]> {
    try {
      const data = await AsyncStorage.getItem(VOICE_MESSAGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting local messages:', error);
      return [];
    }
  }

  // Get messages by worker ID
  static async getMessagesByWorker(workerId: string): Promise<VoiceMessage[]> {
    const all = await this.getAllLocal();
    return all.filter(m => m.workerId === workerId);
  }

  // Get messages by project
  static async getMessagesByProject(projectId: string): Promise<VoiceMessage[]> {
    const all = await this.getAllLocal();
    return all.filter(m => m.projectId === projectId);
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
      const messages = await this.getAllLocal();
      const updated = messages.map(m => 
        m.id === messageId 
          ? { 
              ...m, 
              managerResponse: {
                ...response,
                respondedAt: Date.now()
              }
            }
          : m
      );
      await AsyncStorage.setItem(VOICE_MESSAGES_KEY, JSON.stringify(updated));
      console.log('✅ Message response updated:', messageId);
    } catch (error) {
      console.error('Error updating message response:', error);
      throw error;
    }
  }

  // Delete a message
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const messages = await this.getAllLocal();
      const filtered = messages.filter(m => m.id !== messageId);
      await AsyncStorage.setItem(VOICE_MESSAGES_KEY, JSON.stringify(filtered));
      console.log('🗑️ Message deleted:', messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Fetch messages for manager view (sorted by newest first)
  static async fetchManagerMessages(projectId?: string): Promise<VoiceMessage[]> {
    try {
      console.log('📥 Fetching messages from local storage...');
      let messages = await this.getAllLocal();
      
      // Filter by project if specified
      if (projectId) {
        messages = messages.filter(m => m.projectId === projectId);
      }
      
      // Sort by timestamp (newest first)
      messages.sort((a, b) => b.timestamp - a.timestamp);
      
      console.log(`✅ Fetched ${messages.length} messages`);
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

  // Get pending (unreviewed) messages count
  static async getPendingCount(): Promise<number> {
    const messages = await this.getAllLocal();
    return messages.filter(m => !m.managerResponse).length;
  }

  // Clear all local data (for testing/logout)
  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(VOICE_MESSAGES_KEY);
    console.log('🗑️ All voice messages cleared');
  }

  // Export all messages as JSON (for backup/export)
  static async exportMessages(): Promise<string> {
    const messages = await this.getAllLocal();
    return JSON.stringify(messages, null, 2);
  }

  // Import messages from JSON (for restore)
  static async importMessages(jsonData: string): Promise<void> {
    try {
      const messages = JSON.parse(jsonData);
      await AsyncStorage.setItem(VOICE_MESSAGES_KEY, JSON.stringify(messages));
      console.log('✅ Messages imported successfully');
    } catch (error) {
      console.error('❌ Error importing messages:', error);
      throw error;
    }
  }
}