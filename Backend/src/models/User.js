const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  async create({ name, email, password }) {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hash]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, avatar_url, interests, keywords, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async update(id, { name, avatar_url, interests, keywords }) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(avatar_url);
    }
    if (interests !== undefined) {
      updates.push(`interests = $${paramIndex++}`);
      values.push(interests);
    }
    if (keywords !== undefined) {
      updates.push(`keywords = $${paramIndex++}`);
      values.push(keywords);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, avatar_url, interests, keywords`,
      values
    );
    return result.rows[0];
  },
};

module.exports = User;
