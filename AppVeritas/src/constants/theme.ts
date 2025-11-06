export const colors = {
  // Primary colors
  primary: '#00BCD4', // primary-cyan
  primaryCyan: '#00BCD4',
  primaryBlue: '#2B7EBB',
  primaryDark: '#0097A7',
  
  // Status colors
  success: '#4CAF50', // success-green
  successGreen: '#4CAF50',
  warning: '#FFC107', // warning-yellow
  warningYellow: '#FFC107',
  error: '#FF5252', // error-red
  errorRed: '#FF5252',
  
  // Neutral colors
  white: '#FFFFFF',
  background: '#F5F5F5',
  backgroundLight: '#F5F5F5',
  text: '#212121',
  textDark: '#212121',
  textSecondary: '#757575',
  textGray: '#757575',
  border: '#E0E0E0',
  borderGray: '#E0E0E0',
  
  // Legacy (manter compatibilidade)
  accent: '#FFB300',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
