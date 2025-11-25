import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SplashScreen,
  AuthScreen,
  OnboardingScreen,
  InterestsScreen,
  ProjectDetailsScreen,
  NotificationsScreen,
} from '../screens';
import { MainTabNavigator } from './MainTabNavigator';
import { RootStackParamList, Category } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const STORAGE_KEYS = {
  HAS_SEEN_ONBOARDING: '@veritas:hasSeenOnboarding',
  USER_INTERESTS: '@veritas:userInterests',
  IS_NEW_USER: '@veritas:isNewUser',
  HAS_COMPLETED_INTERESTS: '@veritas:hasCompletedInterests',
};

export const RootNavigator: React.FC = () => {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasCompletedInterests, setHasCompletedInterests] = useState(false);

  useEffect(() => {
    checkInitialState();
  }, []);

  useEffect(() => {
    // Verificar se é um novo usuário quando o user mudar
    if (user) {
      checkIfNewUser();
    }
  }, [user]);

  const checkInitialState = async () => {
    try {
      const onboarding = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
      setHasSeenOnboarding(onboarding === 'true');

      const completedInterests = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_INTERESTS);
      setHasCompletedInterests(completedInterests === 'true');
    } catch (error) {
      console.error('Error checking initial state:', error);
    }
  };

  const checkIfNewUser = async () => {
    try {
      const newUserFlag = await AsyncStorage.getItem(STORAGE_KEYS.IS_NEW_USER);
      setIsNewUser(newUserFlag === 'true');
    } catch (error) {
      console.error('Error checking new user flag:', error);
    }
  };

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
    // Limpar flag de novo usuário após ver onboarding
    await AsyncStorage.removeItem(STORAGE_KEYS.IS_NEW_USER);
    setHasSeenOnboarding(true);
    setIsNewUser(false);
  };

  const handleInterestsSave = async (interests: Category[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(interests));
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_INTERESTS, 'true');
    setHasCompletedInterests(true);
    // Recarregar profile para pegar os interesses atualizados
    await refreshProfile();
  };

  if (isLoading) {
    return (
      <SplashScreen onFinish={handleSplashFinish} />
    );
  }

  const isAuthenticated = !!user;
  const needsInterestsScreen = !hasCompletedInterests;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      >
        {!isAuthenticated ? (
          // Usuário não autenticado - mostrar Auth
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : isNewUser || !hasSeenOnboarding ? (
          // Novo usuário ou primeira vez - mostrar Onboarding
          <Stack.Screen name="Onboarding">
            {props => <OnboardingScreen {...props} onFinish={handleOnboardingFinish} />}
          </Stack.Screen>
        ) : needsInterestsScreen ? (
          // Usuário autenticado sem interesses - mostrar Interests
          <Stack.Screen name="Interests">
            {props => <InterestsScreen {...props} onSave={handleInterestsSave} />}
          </Stack.Screen>
        ) : (
          // Usuário completo - mostrar app principal
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
