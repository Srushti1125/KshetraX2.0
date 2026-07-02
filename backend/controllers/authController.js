const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'kshetrax-super-secret-key';

// Register User
exports.register = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, trust_score',
      [email.toLowerCase().trim(), passwordHash, role || 'worker']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
      deviceId: user.device_id,
      trustScore: user.trust_score
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch User Profile
exports.getUser = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, role, device_id as "deviceId", trust_score as "trustScore" FROM users WHERE id = $1',
      [parseInt(req.params.uid)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Bind Device footprint
exports.bindDevice = async (req, res) => {
  const { deviceId } = req.body;
  try {
    const result = await db.query(
      'UPDATE users SET device_id = $1 WHERE id = $2 RETURNING id, email, role, device_id as "deviceId", trust_score as "trustScore"',
      [deviceId, parseInt(req.params.uid)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
