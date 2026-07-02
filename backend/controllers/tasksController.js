const db = require('../db');

// Get All Tasks
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.id, t.title, t.description, t.due_date as "dueDate", t.priority, t.status, 
              t.voice_message_id as "voiceMessageId", v.worker_name as "assignedBy", t.created_at as "createdAt"
       FROM tasks t
       LEFT JOIN voice_messages v ON t.voice_message_id = v.id
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Complete Task
exports.complete = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      `UPDATE tasks SET status = 'completed' WHERE id = $1`,
      [parseInt(id)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
