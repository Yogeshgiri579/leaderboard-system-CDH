const User = require('../models/User');
const Post = require('../models/Post');
const { getDBStatus } = require('../config/db');

// Empty initial users - only real users submitted via the app will appear on the leaderboard
const initialUsers = [];

// In-Memory storage fallback when MongoDB server is not connected
let inMemoryUsers = [];
let inMemoryPosts = [];

async function seedDatabaseIfEmpty() {
  // No-op: Dummy data removed
}

module.exports = {
  seedDatabaseIfEmpty,
  inMemoryUsers,
  inMemoryPosts,
};
