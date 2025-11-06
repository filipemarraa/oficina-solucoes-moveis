import api from '../config/api';
import { Alert } from 'react-native';

// Auth Service
export const authService = {
  async register(name: string, email: string, password: string) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.error || 'Erro ao cadastrar usuário',
      };
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.error || 'Erro ao fazer login',
      };
    }
  },
};

// Profile Service
export const profileService = {
  async getProfile() {
    try {
      const response = await api.get('/profile');
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.error || 'Erro ao buscar perfil',
      };
    }
  },

  async updateProfile(updates: { name?: string; avatar_url?: string; interests?: string[] }) {
    try {
      const response = await api.put('/profile', updates);
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.error || 'Erro ao atualizar perfil',
      };
    }
  },
};

// Favorites Service
export const favoritesService = {
  async addFavorite(projectId: string, projectData: any) {
    try {
      const response = await api.post('/favorites', {
        project_id: projectId,
        project_data: projectData,
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erro ao adicionar favorito';
      Alert.alert('Erro', errorMsg);
      return { data: null, error: errorMsg };
    }
  },

  async removeFavorite(projectId: string) {
    try {
      const response = await api.delete(`/favorites/${projectId}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erro ao remover favorito';
      Alert.alert('Erro', errorMsg);
      return { data: null, error: errorMsg };
    }
  },

  async getFavorites() {
    try {
      const response = await api.get('/favorites');
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: [],
        error: error.response?.data?.error || 'Erro ao buscar favoritos',
      };
    }
  },

  async isFavorite(projectId: string) {
    try {
      const response = await api.get(`/favorites/check/${projectId}`);
      return response.data.isFavorite;
    } catch (error: any) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  },
};

// Alerts Service
export const alertsService = {
  async createAlert(
    title: string,
    message: string,
    type: 'info' | 'update' | 'success',
    projectId?: string
  ) {
    try {
      const response = await api.post('/alerts', {
        title,
        message,
        type,
        project_id: projectId,
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.error || 'Erro ao criar alerta',
      };
    }
  },

  async getAlerts() {
    try {
      const response = await api.get('/alerts');
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: [],
        error: error.response?.data?.error || 'Erro ao buscar alertas',
      };
    }
  },

  async markAlertAsRead(alertId: string) {
    try {
      const response = await api.patch(`/alerts/${alertId}/read`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.error || 'Erro ao marcar alerta como lido',
      };
    }
  },

  async markAllAlertsAsRead() {
    try {
      const response = await api.patch('/alerts/read-all');
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.error || 'Erro ao marcar alertas como lidos',
      };
    }
  },

  async getUnreadAlertsCount() {
    try {
      const response = await api.get('/alerts/unread-count');
      return response.data.count;
    } catch (error: any) {
      console.error('Erro ao contar alertas não lidos:', error);
      return 0;
    }
  },
};
