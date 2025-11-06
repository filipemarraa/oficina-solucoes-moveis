import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// Configurar URL baseado na plataforma
const getBaseURL = () => {
  if (API_URL && !API_URL.includes('localhost')) {
    // Se API_URL não usa localhost, usar como está (produção ou IP customizado)
    return API_URL;
  }
  
  // Desenvolvimento local
  if (Platform.OS === 'android') {
    // Android emulador usa 10.0.2.2 para acessar localhost do host
    return 'http://10.0.2.2:3001';
  }
  
  // iOS e outros usam localhost normalmente
  return 'http://localhost:3001';
};

// Criar instância do axios
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('🌐 API Base URL:', getBaseURL());

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@veritas:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado - fazer logout
      await AsyncStorage.removeItem('@veritas:token');
      await AsyncStorage.removeItem('@veritas:user');
    }
    return Promise.reject(error);
  }
);

export default api;
