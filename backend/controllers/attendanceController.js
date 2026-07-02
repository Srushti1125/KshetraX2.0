const db = require('../db');

// Check In
exports.checkIn = async (req, res) => {
  const {
    sessionId,
    userId,
    userName,
    deviceId,
    siteId,
    checkInTime,
    latitude,
    longitude,
    distanceFromSite,
    trustScore
  } = req.body;

  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const selfieUrl = req.file 
      ? `${protocol}://${req.headers.host}/uploads/selfies/${req.file.filename}`
      : null;

    await db.query(
      `INSERT INTO attendance_sessions (
        id, user_id, user_name, device_id, site_id, check_in_time, 
        check_in_lat, check_in_lng, distance_from_site, selfie_url, trust_at_check_in, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')`,
      [
        sessionId,
        parseInt(userId),
        userName,
        deviceId,
        siteId,
        BigInt(checkInTime),
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(distanceFromSite),
        selfieUrl,
        parseInt(trustScore)
      ]
    );

    res.status(201).json({ success: true, selfieUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Check Out
exports.checkOut = async (req, res) => {
  const { sessionId, checkOutTime, latitude, longitude, totalHours } = req.body;

  try {
    await db.query(
      `UPDATE attendance_sessions 
       SET check_out_time = $1, check_out_lat = $2, check_out_lng = $3, total_hours = $4, status = 'completed'
       WHERE id = $5`,
      [BigInt(checkOutTime), parseFloat(latitude), parseFloat(longitude), parseFloat(totalHours), sessionId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Background GPS Location Ping
exports.ping = async (req, res) => {
  const { sessionId, ping } = req.body;
  try {
    await db.query(
      `UPDATE attendance_sessions 
       SET location_pings = location_pings || $1::jsonb
       WHERE id = $2`,
      [JSON.stringify([ping]), sessionId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch Active Sessions
exports.getActive = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, user_id as "userId", user_name as "userName", check_in_time as "checkInTime", 
              check_in_lat, check_in_lng, location_pings as "locationPings", distance_from_site as "distanceFromSite", status
       FROM attendance_sessions 
       WHERE status = 'active'`
    );
    
    const mapped = result.rows.map(row => ({
      ...row,
      checkInTime: Number(row.checkInTime)
    }));
    
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch All Sessions
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, user_id as "userId", user_name as "userName", check_in_time as "checkInTime", 
              distance_from_site as "distanceFromSite", selfie_url as "selfie", status
       FROM attendance_sessions 
       ORDER BY check_in_time DESC`
    );

    const mapped = result.rows.map(row => ({
      ...row,
      checkInTime: Number(row.checkInTime)
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
