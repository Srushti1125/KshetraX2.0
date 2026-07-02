const db = require('../db');

// Upload Voice Note & Analyze with Python AI Service
exports.upload = async (req, res) => {
  const {
    id,
    workerId,
    workerName,
    deviceId,
    projectId,
    duration,
    timestamp,
    location,
    transcript
  } = req.body;

  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const audioUrl = req.file
      ? `${protocol}://${req.headers.host}/uploads/voice_notes/${req.file.filename}`
      : null;

    if (!audioUrl) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    // 1. Insert Voice message record
    await db.query(
      `INSERT INTO voice_messages (
        id, worker_id, worker_name, device_id, project_id, audio_url, duration, timestamp, location, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')`,
      [
        id,
        workerId,
        workerName,
        deviceId,
        projectId || 'default',
        audioUrl,
        parseInt(duration || 0),
        BigInt(timestamp),
        location ? JSON.stringify(location) : null
      ]
    );

    // 2. Query Python AI Service for LangChain / Gemini Analysis
    const textToAnalyze = transcript || `Construction update voice note logged by ${workerName}.`;
    let aiResult = null;

    try {
      console.log(`🤖 Requesting AI analysis from Python service for transcript: "${textToAnalyze}"`);
      const aiResponse = await fetch('http://localhost:8000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: textToAnalyze })
      });

      if (aiResponse.ok) {
        aiResult = await aiResponse.json();
        console.log('🤖 AI Analysis success:', aiResult);
      } else {
        console.warn('⚠️ Python AI service returned error status:', aiResponse.status);
      }
    } catch (aiErr) {
      console.warn('⚠️ Could not reach Python AI microservice (is it running on port 8000?):', aiErr.message);
    }

    // 3. If AI detected a task, insert it into PostgreSQL
    if (aiResult && aiResult.has_task && aiResult.task) {
      console.log('📌 AI Auto-Detected Task. Inserting into PostgreSQL...');
      await db.query(
        `INSERT INTO tasks (title, description, due_date, priority, status, voice_message_id)
         VALUES ($1, $2, $3, $4, 'pending', $5)`,
        [
          aiResult.task.title,
          aiResult.task.description,
          aiResult.task.due_date || 'ASAP',
          aiResult.task.priority || 'medium',
          id
        ]
      );
    }

    res.status(201).json({ success: true, audioUrl, aiResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// List Voice Updates
exports.list = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, worker_id as "workerId", worker_name as "workerName", audio_url as "audioUrl", 
              duration, timestamp, location, status, manager_response as "managerResponse"
       FROM voice_messages 
       ORDER BY timestamp DESC`
    );

    const mapped = result.rows.map(row => ({
      ...row,
      timestamp: Number(row.timestamp)
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Respond to voice note (approve/flag)
exports.respond = async (req, res) => {
  const { status, respondedBy } = req.body;
  const { id } = req.params;

  try {
    await db.query(
      `UPDATE voice_messages 
       SET status = $1, manager_response = $2::jsonb 
       WHERE id = $3`,
      [status, JSON.stringify({ respondedBy, respondedAt: Date.now() }), id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
