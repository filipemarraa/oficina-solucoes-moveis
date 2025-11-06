import { supabase } from '../config/supabase';
import { Alert } from 'react-native';

// Favorites Management
export const addFavorite = async (userId: string, project: any) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .insert([{
        user_id: userId,
        project_id: project.id,
        project_data: project,
      }]);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error adding favorite:', error.message);
    Alert.alert('Erro', 'Não foi possível adicionar aos favoritos');
    return false;
  }
};

export const removeFavorite = async (userId: string, projectId: string) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error removing favorite:', error.message);
    Alert.alert('Erro', 'Não foi possível remover dos favoritos');
    return false;
  }
};

export const getFavorites = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error getting favorites:', error.message);
    return [];
  }
};

export const isFavorite = async (userId: string, projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error: any) {
    console.error('Error checking favorite:', error.message);
    return false;
  }
};

// Alerts Management
export const createAlert = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'update' | 'success',
  projectId?: string
) => {
  try {
    const { error } = await supabase
      .from('alerts')
      .insert([{
        user_id: userId,
        title,
        message,
        type,
        project_id: projectId || null,
        is_read: false,
      }]);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error creating alert:', error.message);
    return false;
  }
};

export const getAlerts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error getting alerts:', error.message);
    return [];
  }
};

export const markAlertAsRead = async (alertId: string) => {
  try {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error marking alert as read:', error.message);
    return false;
  }
};

export const markAllAlertsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error marking all alerts as read:', error.message);
    return false;
  }
};

export const getUnreadAlertsCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error('Error getting unread alerts count:', error.message);
    return 0;
  }
};

// Profile Management
export const updateUserInterests = async (userId: string, interests: string[]) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ interests })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error updating interests:', error.message);
    Alert.alert('Erro', 'Não foi possível atualizar os interesses');
    return false;
  }
};
