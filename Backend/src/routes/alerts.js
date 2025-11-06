const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const authMiddleware = require('../middleware/auth');

// Listar alertas do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const alerts = await Alert.findByUser(req.userId);
    res.json(alerts);
  } catch (err) {
    console.error('Erro ao buscar alertas:', err);
    res.status(500).json({ error: 'Erro ao buscar alertas' });
  }
});

// Criar alerta
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, message, type, project_id } = req.body;
    
    if (!title || !message || !type) {
      return res.status(400).json({ error: 'title, message e type são obrigatórios' });
    }

    if (!['info', 'update', 'success'].includes(type)) {
      return res.status(400).json({ error: 'type deve ser: info, update ou success' });
    }

    const alert = await Alert.create(req.userId, { title, message, type, projectId: project_id });
    res.status(201).json(alert);
  } catch (err) {
    console.error('Erro ao criar alerta:', err);
    res.status(500).json({ error: 'Erro ao criar alerta' });
  }
});

// Marcar alerta como lido
router.patch('/:alertId/read', authMiddleware, async (req, res) => {
  try {
    const alert = await Alert.markAsRead(req.params.alertId, req.userId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }
    
    res.json(alert);
  } catch (err) {
    console.error('Erro ao marcar alerta como lido:', err);
    res.status(500).json({ error: 'Erro ao marcar alerta como lido' });
  }
});

// Marcar todos como lidos
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    const alerts = await Alert.markAllAsRead(req.userId);
    res.json({ success: true, count: alerts.length });
  } catch (err) {
    console.error('Erro ao marcar alertas como lidos:', err);
    res.status(500).json({ error: 'Erro ao marcar alertas como lidos' });
  }
});

// Contar alertas não lidos
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Alert.countUnread(req.userId);
    res.json({ count });
  } catch (err) {
    console.error('Erro ao contar alertas não lidos:', err);
    res.status(500).json({ error: 'Erro ao contar alertas não lidos' });
  }
});

module.exports = router;
