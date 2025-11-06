const pool = require('../config/db');

const Favorite = {
  async create(userId, projectId, projectData) {
    const result = await pool.query(
      'INSERT INTO favorites (user_id, project_id, project_data) VALUES ($1, $2, $3) RETURNING *',
      [userId, projectId, JSON.stringify(projectData)]
    );
    return result.rows[0];
  },

  async findByUser(userId) {
    const result = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async findOne(userId, projectId) {
    const result = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND project_id = $2',
      [userId, projectId]
    );
    return result.rows[0];
  },

  async delete(userId, projectId) {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND project_id = $2 RETURNING *',
      [userId, projectId]
    );
    return result.rows[0];
  },
};

module.exports = Favorite;
