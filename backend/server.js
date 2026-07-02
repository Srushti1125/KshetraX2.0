require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads', 'selfies'),
  path.join(__dirname, 'uploads', 'voice_notes')
];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created uploads directory: ${dir}`);
  }
});

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Modular Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/voice', require('./routes/voice'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/sites', require('./routes/sites'));

// Database Auto-Initialization
async function initializeDb() {
  try {
    console.log('🔄 Initializing PostgreSQL tables...');

    // 1. Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'worker',
        device_id TEXT,
        trust_score INT NOT NULL DEFAULT 100
      );
    `);

    // 2. Sites Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        radius INT NOT NULL DEFAULT 100
      );
    `);

    // Seed default site
    await db.query(`
      INSERT INTO sites (id, name, latitude, longitude, radius)
      VALUES ('site_1', 'Main Construction Site', 12.9716, 77.5946, 100)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Attendance Sessions Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance_sessions (
        id TEXT PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_name TEXT NOT NULL,
        device_id TEXT,
        site_id TEXT REFERENCES sites(id),
        check_in_time BIGINT NOT NULL,
        check_out_time BIGINT,
        check_in_lat DOUBLE PRECISION NOT NULL,
        check_in_lng DOUBLE PRECISION NOT NULL,
        check_out_lat DOUBLE PRECISION,
        check_out_lng DOUBLE PRECISION,
        distance_from_site DOUBLE PRECISION,
        selfie_url TEXT,
        trust_at_check_in INT,
        status TEXT NOT NULL DEFAULT 'active',
        location_pings JSONB DEFAULT '[]'::jsonb,
        total_hours DOUBLE PRECISION DEFAULT 0.0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

    // 4. Voice Messages Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS voice_messages (
        id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        worker_name TEXT NOT NULL,
        device_id TEXT,
        project_id TEXT DEFAULT 'default',
        audio_url TEXT NOT NULL,
        duration INT NOT NULL,
        timestamp BIGINT NOT NULL,
        location JSONB,
        status TEXT NOT NULL DEFAULT 'pending',
        manager_response JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

    // 5. Tasks Table (AI Generated Tasks)
    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        voice_message_id TEXT REFERENCES voice_messages(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

    // 6. Material Logs Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS material_logs (
        id SERIAL PRIMARY KEY,
        material TEXT NOT NULL,
        quantity_used DOUBLE PRECISION NOT NULL,
        unit TEXT DEFAULT 'bags',
        area_completed DOUBLE PRECISION NOT NULL,
        notes TEXT,
        created_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

    // 7. Material Standards Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS material_standards (
        id TEXT PRIMARY KEY,
        ratio DOUBLE PRECISION NOT NULL
      );
    `);

    // Seed default cement standard
    await db.query(`
      INSERT INTO material_standards (id, ratio)
      VALUES ('cement', 0.05)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Seed default users for testing
    const defaultPasswordHash = await bcrypt.hash('password123', 10);
    await db.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES 
        ('worker@kshetrax.com', $1, 'worker'),
        ('manager@kshetrax.com', $1, 'manager'),
        ('admin@kshetrax.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [defaultPasswordHash]);
    console.log('👥 Default testing users seeded');

    console.log('✅ PostgreSQL database tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL tables:', error);
  }
}

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  await initializeDb();
});
