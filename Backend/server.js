const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const pgSession = require('connect-pg-simple')(session);
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://librarymanage-sm1b.onrender.com',
      'http://localhost:8080',
      'file://'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully');
  }
  release();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

app.set('trust proxy', 1);

app.use(session({
  store: new pgSession({
    pool: pool,
    ttl: 24 * 60 * 60,
  }),
  secret: process.env.SESSION_SECRET || 'your-secure-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
}));

const authenticateUser = (req, res, next) => {
  console.log('Auth check:', req.session.user, req.path);
  if (req.path === '/api/auth/login' || (req.session && req.session.user)) {
    return next();
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const authRoutes = require('./routes/auth')(pool, bcrypt);
const userRoutes = require('./routes/users')(pool, bcrypt);
const studentRoutes = require('./routes/students')(pool);
const scheduleRoutes = require('./routes/schedules')(pool);
const settingsRoutes = require('./routes/settings')(pool);
const setupCronJobs = require('./utils/cronJobs');

app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateUser, userRoutes);
app.use('/api/students', authenticateUser, studentRoutes);
app.use('/api/schedules', authenticateUser, scheduleRoutes);
app.use('/api/settings', authenticateUser, settingsRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Student Management API' });
});

app.get('/*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Index.html not found in dist folder');
  }
});

async function initializeSessionTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid varchar NOT NULL PRIMARY KEY,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire)
    `);
    console.log('Session table initialized');
  } catch (err) {
    console.error('Error initializing session table:', err.stack);
    throw err; // Ensure errors propagate
  }
}

async function initializeSettingsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key varchar PRIMARY KEY,
        value varchar NOT NULL
      )
    `);
    console.log('Settings table initialized');
  } catch (err) {
    console.error('Error initializing settings table:', err.stack);
    throw err; // Ensure errors propagate
  }
}

async function createDefaultAdmin() {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Error creating default admin:', err.stack);
  }
}

const PORT = process.env.PORT || 3000;

Promise.all([initializeSessionTable(), initializeSettingsTable()])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      createDefaultAdmin();
      console.log('Starting cron jobs...');
      const { sendExpiryReminders } = setupCronJobs(pool);
      sendExpiryReminders().catch(err => {
        console.error('Immediate cron job execution failed:', err.stack);
      });
    });
  })
  .catch(err => {
    console.error('Server startup failed:', err.stack);
    process.exit(1); // Exit with failure code
  });