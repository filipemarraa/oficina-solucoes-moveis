import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ProjectsScreen,
  FavoritesScreen,
  TrendingScreen,
  ProfileScreen,
} from '../screens';
import { MainTabParamList } from '../types';
import { colors, fontSize } from '../constants/theme';
import { Badge } from '../components';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Componente de ícone customizado com emoji
const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export const MainTabNavigator: React.FC = () => {
  const trendingBadgeCount = 3; // Mock - virá do contexto/estado global
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryCyan,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom + 8),
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarLabel: 'Projetos',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favoritos',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⭐" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Trending"
        component={TrendingScreen}
        options={{
          tabBarLabel: 'Em Alta',
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon emoji="🔥" focused={focused} />
              {trendingBadgeCount > 0 && (
                <View style={styles.badge}>
                  <Badge count={trendingBadgeCount} size="small" />
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
});
