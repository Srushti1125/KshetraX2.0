import { supabase } from '@/lib/supabase';
import {
  AttendanceRecord,
  ValidationLog,
  Site,
  Worker,
  GeofenceValidation,
} from '@/types/database';
import { GeofenceService } from './geofence.service';

export interface ValidationResult {
  status: 'validated' | 'flagged';
  reason: string;
  logs: Array<{ rule_name: string; rule_result: 'pass' | 'fail'; details: any }>;
  newTrustScore?: number;
}

export class ValidationService {
  static async validateAttendance(
    attendance: AttendanceRecord,
    site: Site,
    worker: Worker
  ): Promise<ValidationResult> {
    const logs: ValidationLog[] = [];
    let flagged = false;
    let reasons: string[] = [];
    let trustScoreChange = 0;

    const geofenceCheck = GeofenceService.validateGeofence(
      {
        latitude: attendance.check_in_lat,
        longitude: attendance.check_in_lng,
      },
      {
        latitude: site.latitude,
        longitude: site.longitude,
      },
      site.radius_meters
    );

    logs.push({
      id: '',
      attendance_id: attendance.id,
      rule_name: 'Geofence Validation',
      rule_result: geofenceCheck.isWithinGeofence ? 'pass' : 'fail',
      details: {
        distance: geofenceCheck.distance,
        allowed_radius: site.radius_meters,
      },
      created_at: new Date().toISOString(),
    });

    if (!geofenceCheck.isWithinGeofence) {
      flagged = true;
      reasons.push(
        `Outside geofence: ${geofenceCheck.distance}m from site (allowed: ${site.radius_meters}m)`
      );
      trustScoreChange -= 5;
    } else {
      trustScoreChange += 2;
    }

    const { data: sameDeviceRecords } = await supabase
      .from('attendance_records')
      .select('worker_id')
      .eq('device_id', attendance.device_id)
      .neq('worker_id', worker.id)
      .limit(1);

    const deviceAnomalyDetected = sameDeviceRecords && sameDeviceRecords.length > 0;

    logs.push({
      id: '',
      attendance_id: attendance.id,
      rule_name: 'Device ID Anomaly Check',
      rule_result: deviceAnomalyDetected ? 'fail' : 'pass',
      details: {
        device_id: attendance.device_id,
        multiple_workers: deviceAnomalyDetected,
      },
      created_at: new Date().toISOString(),
    });

    if (deviceAnomalyDetected) {
      flagged = true;
      reasons.push('Same device ID used by multiple workers');
      trustScoreChange -= 10;
    }

    if (attendance.check_out_time) {
      const checkInTime = new Date(attendance.check_in_time);
      const checkOutTime = new Date(attendance.check_out_time);
      const hoursWorked =
        (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      const abnormalHours = hoursWorked < 0.5 || hoursWorked > 16;

      logs.push({
        id: '',
        attendance_id: attendance.id,
        rule_name: 'Working Hours Validation',
        rule_result: abnormalHours ? 'fail' : 'pass',
        details: {
          hours_worked: hoursWorked,
          threshold_min: 0.5,
          threshold_max: 16,
        },
        created_at: new Date().toISOString(),
      });

      if (abnormalHours) {
        flagged = true;
        reasons.push(`Abnormal working hours: ${hoursWorked.toFixed(2)} hours`);
        trustScoreChange -= 3;
      }
    }

    const newTrustScore = Math.max(
      0,
      Math.min(100, worker.trust_score + trustScoreChange)
    );

    for (const log of logs) {
      await supabase.from('validation_logs').insert({
        attendance_id: log.attendance_id,
        rule_name: log.rule_name,
        rule_result: log.rule_result,
        details: log.details,
      });
    }

    return {
      status: flagged ? 'flagged' : 'validated',
      reason: flagged ? reasons.join('; ') : 'All validation checks passed',
      logs,
      newTrustScore,
    };
  }

  static async processAttendanceValidation(attendanceId: string): Promise<void> {
    const { data: attendance } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('id', attendanceId)
      .single();

    if (!attendance) return;

    const { data: site } = await supabase
      .from('sites')
      .select('*')
      .eq('id', attendance.site_id)
      .single();

    if (!site) return;

    const { data: worker } = await supabase
      .from('workers')
      .select('*')
      .eq('id', attendance.worker_id)
      .single();

    if (!worker) return;

    const result = await this.validateAttendance(attendance, site, worker);

    await supabase
      .from('attendance_records')
      .update({
        status: result.status,
        validation_reason: result.reason,
      })
      .eq('id', attendanceId);

    if (result.newTrustScore !== undefined) {
      await supabase.rpc('update_worker_trust_score', {
        p_worker_id: worker.id,
        p_new_score: result.newTrustScore,
        p_reason: `Attendance validation: ${result.status}`,
      });
    }

    if (result.status === 'validated' && attendance.check_out_time) {
      await supabase.rpc('calculate_wage_entry', {
        p_attendance_id: attendanceId,
      });
    }
  }
}
