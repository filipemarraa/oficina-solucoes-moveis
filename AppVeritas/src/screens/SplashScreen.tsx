import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import images from '../assets/images';
import { colors, fontSize, fontWeight, spacing } from '../constants/theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.gradientContainer}>
        {/* Simulação de gradiente com View */}
        <View style={styles.gradient} />
      </View>
      
      <View style={styles.content}>
        {/* Logo - use image if present, otherwise emoji fallback */}
        <View style={styles.logoContainer}>
          {images.logo ? (
            <Image source={images.logo} style={styles.logoImage} resizeMode="contain" />
          ) : (
            <Text style={styles.logo}>⚖️</Text>
          )}
        </View>

        <Text style={styles.title}>VERITAS</Text>
        <Text style={styles.subtitle}>Cidadania ativa e Transparente</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
  },
  logoContainer: {
    width: 360,
    height: 360,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 160,
  },
  logo: {
    fontSize: 260,
  },
  logoImage: {
    width: 320,
    height: 320,
  },
  title: {
    fontSize: fontSize.xxxl * 1.5,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: 0,
    letterSpacing: 4,
    marginTop: -50,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.white,
    opacity: 0.9,
  },
});
