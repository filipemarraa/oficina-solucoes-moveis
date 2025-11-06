const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Buscar perfil do usuário autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Atualizar perfil do usuário
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, avatar_url, interests, keywords } = req.body;
    const user = await User.update(req.userId, { name, avatar_url, interests, keywords });
    
    if (!user) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

module.exports = router;
