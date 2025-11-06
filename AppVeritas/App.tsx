/**
 * VERITAS - Cidadania Ativa e Transparente
 * App de transparência governamental
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { colors } from './src/constants/theme';

function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        {/* Top safe area (dynamic island / notch) colored primary */}
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.primary }} />
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primary}
        />
        <RootNavigator />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
