const pool = require('../config/db');

const Alert = {
  async create(userId, { title, message, type, projectId = null }) {
    const result = await pool.query(
      'INSERT INTO alerts (user_id, title, message, type, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, message, type, projectId]
    );
    return result.rows[0];
  },

  async findByUser(userId) {
    const result = await pool.query(
      'SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async markAsRead(alertId, userId) {
    const result = await pool.query(
      'UPDATE alerts SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [alertId, userId]
    );
    return result.rows[0];
  },

  async markAllAsRead(userId) {
    const result = await pool.query(
      'UPDATE alerts SET is_read = true WHERE user_id = $1 AND is_read = false RETURNING *',
      [userId]
    );
    return result.rows;
  },

  async countUnread(userId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM alerts WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(result.rows[0].count);
  },
};

module.exports = Alert;
