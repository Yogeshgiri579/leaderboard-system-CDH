require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { seedDatabaseIfEmpty } = require('./utils/seedData');
const userRoutes = require('./routes/userRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'CloudDevOpsHub Leaderboard API',
    timestamp: new Date().toISOString(),
    mentor: 'Vikas Ratnawat',
    community: 'CloudDevOpsHub',
  });
});

// Boot Server
async function startServer() {
  await connectDB();
  await seedDatabaseIfEmpty();

  app.listen(PORT, () => {
    console.log(`🚀 CloudDevOpsHub Leaderboard Server running on http://localhost:${PORT}`);
    console.log(`📊 API Endpoints: /api/leaderboard | /api/leaderboard/stats | /api/users/submit`);
  });
}

startServer();
