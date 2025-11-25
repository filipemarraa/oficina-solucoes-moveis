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
    // Retorna alertas que:
    // 1. Não têm projeto associado (alertas gerais do sistema)
    // 2. OU têm projeto associado E o projeto está nos favoritos do usuário
    const result = await pool.query(
      `SELECT a.* 
       FROM alerts a
       LEFT JOIN favorites f ON a.project_id = f.project_id AND f.user_id = $1
       WHERE a.user_id = $1 
       AND (a.project_id IS NULL OR f.project_id IS NOT NULL)
       ORDER BY a.created_at DESC`,
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
