const pool = require('../config/db');

const Interaction = {
  async create(userId, projectId, type) {
    // Upsert interaction
    const result = await pool.query(
      `INSERT INTO project_interactions (user_id, project_id, interaction_type) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, project_id) 
       DO UPDATE SET interaction_type = $3, created_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [userId, projectId, type]
    );
    return result.rows[0];
  },

  async remove(userId, projectId) {
    const result = await pool.query(
      'DELETE FROM project_interactions WHERE user_id = $1 AND project_id = $2 RETURNING *',
      [userId, projectId]
    );
    return result.rows[0];
  },

  async getTrending(limit = 10) {
    // This is a simplified trending algorithm based on total interactions count
    // In a real app, you might want to weigh recent interactions more heavily
    const result = await pool.query(
      `SELECT 
        project_id, 
        COUNT(*) as interaction_count,
        SUM(CASE WHEN interaction_type = 'like' THEN 1 ELSE 0 END) as likes,
        SUM(CASE WHEN interaction_type = 'dislike' THEN 1 ELSE 0 END) as dislikes
       FROM project_interactions 
       GROUP BY project_id 
       ORDER BY interaction_count DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  async getUserInteraction(userId, projectId) {
    const result = await pool.query(
      'SELECT interaction_type FROM project_interactions WHERE user_id = $1 AND project_id = $2',
      [userId, projectId]
    );
    return result.rows[0];
  }
};

module.exports = Interaction;
