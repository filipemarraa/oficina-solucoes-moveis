const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const authMiddleware = require('../middleware/auth');

// Listar favoritos do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.findByUser(req.userId);
    res.json(favorites);
  } catch (err) {
    console.error('Erro ao buscar favoritos:', err);
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
});

// Adicionar favorito
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { project_id, project_data } = req.body;
    
    if (!project_id) {
      return res.status(400).json({ error: 'project_id é obrigatório' });
    }

    // Verificar se já existe
    const existing = await Favorite.findOne(req.userId, project_id);
    if (existing) {
      return res.status(409).json({ error: 'Projeto já está nos favoritos' });
    }

    const favorite = await Favorite.create(req.userId, project_id, project_data);
    res.status(201).json(favorite);
  } catch (err) {
    console.error('Erro ao adicionar favorito:', err);
    res.status(500).json({ error: 'Erro ao adicionar favorito' });
  }
});

// Verificar se projeto está nos favoritos
router.get('/check/:projectId', authMiddleware, async (req, res) => {
  try {
    const favorite = await Favorite.findOne(req.userId, req.params.projectId);
    res.json({ isFavorite: !!favorite });
  } catch (err) {
    console.error('Erro ao verificar favorito:', err);
    res.status(500).json({ error: 'Erro ao verificar favorito' });
  }
});

// Remover favorito
router.delete('/:projectId', authMiddleware, async (req, res) => {
  try {
    const deleted = await Favorite.delete(req.userId, req.params.projectId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Favorito não encontrado' });
    }
    
    res.json({ success: true, message: 'Favorito removido' });
  } catch (err) {
    console.error('Erro ao remover favorito:', err);
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
});

module.exports = router;
