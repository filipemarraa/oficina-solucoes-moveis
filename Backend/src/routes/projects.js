const express = require('express');
const router = express.Router();
const Interaction = require('../models/Interaction');
const authMiddleware = require('../middleware/auth');

// Get trending projects
router.get('/trending', authMiddleware, async (req, res) => {
    try {
        const trending = await Interaction.getTrending();
        // Note: In a real application, you would here fetch the full project details 
        // from an external API (like Câmara dos Deputados) using the project_ids.
        // For now, we will return the interaction data and the frontend might need to 
        // fetch details or we mock the details if they are not available.
        // However, the requirement implies we should show the projects. 
        // Since I don't have the external API integration fully visible/mocked in a way 
        // that I can easily call here without more context, I will return the interaction stats.
        // The frontend mock data had full details. 
        // To make this usable, I will assume the frontend will handle the display or 
        // we might need to enrich this data. 
        // Given the prompt "apareca ali os projetos de lei que mais estao recebendo interacoes",
        // I will return the list of IDs and counts.

        res.json(trending);
    } catch (err) {
        console.error('Erro ao buscar projetos em alta:', err);
        res.status(500).json({ error: 'Erro ao buscar projetos em alta' });
    }
});

// Register interaction (like/dislike)
router.post('/:projectId/interaction', authMiddleware, async (req, res) => {
    try {
        const { type } = req.body; // 'like' or 'dislike'
        const { projectId } = req.params;

        if (!['like', 'dislike'].includes(type)) {
            return res.status(400).json({ error: 'Type must be like or dislike' });
        }

        const interaction = await Interaction.create(req.userId, projectId, type);
        res.json(interaction);
    } catch (err) {
        console.error('Erro ao registrar interação:', err);
        res.status(500).json({ error: 'Erro ao registrar interação' });
    }
});

// Remove interaction
router.delete('/:projectId/interaction', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;
        await Interaction.remove(req.userId, projectId);
        res.json({ success: true });
    } catch (err) {
        console.error('Erro ao remover interação:', err);
        res.status(500).json({ error: 'Erro ao remover interação' });
    }
});

module.exports = router;
