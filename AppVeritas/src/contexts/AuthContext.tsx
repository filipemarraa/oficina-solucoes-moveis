import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, profileService } from '../services/backendService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  interests: string[];
  keywords?: string[];
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('@veritas:token');
      const storedUser = await AsyncStorage.getItem('@veritas:user');

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        await fetchProfile();
      }
    } catch (error) {
      console.error('Erro ao carregar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await profileService.getProfile();
      if (error) throw new Error(error);
      setProfile(data);
    } catch (error: any) {
      console.log('Erro ao buscar perfil:', error.message);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await authService.register(name, email, password);
      
      if (error) throw new Error(error);

      // Marcar como novo usuário para mostrar onboarding
      await AsyncStorage.setItem('@veritas:isNewUser', 'true');
      
      // Não mostrar alert aqui, o AuthScreen fará login automático
    } catch (error: any) {
      Alert.alert('Erro ao criar conta', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await authService.login(email, password);
      
      if (error) throw new Error(error);

      // Salvar token e usuário
      await AsyncStorage.setItem('@veritas:token', data.token);
      await AsyncStorage.setItem('@veritas:user', JSON.stringify(data.user));
      
      setUser(data.user);
      await fetchProfile();
    } catch (error: any) {
      Alert.alert('Erro ao fazer login', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('@veritas:token');
      await AsyncStorage.removeItem('@veritas:user');
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      Alert.alert('Erro ao fazer logout', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setLoading(true);
      
      // Filtrar apenas os campos permitidos pelo backend
      const allowedUpdates: {
        name?: string;
        avatar_url?: string;
        interests?: string[];
        keywords?: string[];
      } = {};
      
      if (updates.name !== undefined) allowedUpdates.name = updates.name;
      if (updates.avatar_url !== undefined && updates.avatar_url !== null) {
        allowedUpdates.avatar_url = updates.avatar_url;
      }
      if (updates.interests !== undefined) allowedUpdates.interests = updates.interests;
      if (updates.keywords !== undefined) allowedUpdates.keywords = updates.keywords;
      
      const { data, error } = await profileService.updateProfile(allowedUpdates);
      
      if (error) throw new Error(error);

      await refreshProfile();
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro ao atualizar perfil', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
