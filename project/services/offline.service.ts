import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { OfflineAttendanceRecord } from '@/types/database';
import { ValidationService } from './validation.service';

const OFFLINE_RECORDS_KEY = 'offline_attendance_records';

export class OfflineService {
  static async saveOfflineRecord(
    record: OfflineAttendanceRecord
  ): Promise<void> {
    try {
      const existingRecords = await this.getOfflineRecords();
      existingRecords.push(record);
      await AsyncStorage.setItem(
        OFFLINE_RECORDS_KEY,
        JSON.stringify(existingRecords)
      );
    } catch (error) {
      console.error('Error saving offline record:', error);
      throw error;
    }
  }

  static async getOfflineRecords(): Promise<OfflineAttendanceRecord[]> {
    try {
      const records = await AsyncStorage.getItem(OFFLINE_RECORDS_KEY);
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error('Error getting offline records:', error);
      return [];
    }
  }

  static async syncOfflineRecords(): Promise<{
    success: number;
    failed: number;
  }> {
    const records = await this.getOfflineRecords();
    let success = 0;
    let failed = 0;

    for (const record of records) {
      if (record.synced) continue;

      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .insert({
            worker_id: record.worker_id,
            site_id: record.site_id,
            check_in_time: record.check_in_time,
            check_in_lat: record.check_in_lat,
            check_in_lng: record.check_in_lng,
            device_id: record.device_id,
            synced: true,
          })
          .select()
          .single();

        if (error) {
          failed++;
          continue;
        }

        if (data) {
          await ValidationService.processAttendanceValidation(data.id);
        }

        record.synced = true;
        success++;
      } catch (error) {
        failed++;
        console.error('Error syncing record:', error);
      }
    }

    const updatedRecords = records.filter((r) => !r.synced);
    await AsyncStorage.setItem(
      OFFLINE_RECORDS_KEY,
      JSON.stringify(updatedRecords)
    );

    return { success, failed };
  }

  static async clearSyncedRecords(): Promise<void> {
    const records = await this.getOfflineRecords();
    const unsyncedRecords = records.filter((r) => !r.synced);
    await AsyncStorage.setItem(
      OFFLINE_RECORDS_KEY,
      JSON.stringify(unsyncedRecords)
    );
  }

  static async getPendingSyncCount(): Promise<number> {
    const records = await this.getOfflineRecords();
    return records.filter((r) => !r.synced).length;
  }
}
