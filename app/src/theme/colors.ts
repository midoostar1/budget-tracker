export const colors = {
  primary: '#6366f1', // Indigo
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  
  secondary: '#10b981', // Green
  secondaryDark: '#059669',
  secondaryLight: '#34d399',
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  surface: '#ffffff',
  
  text: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  income: '#10b981',
  expense: '#ef4444',
  
  // Dark mode colors
  dark: {
    background: '#111827',
    backgroundSecondary: '#1f2937',
    surface: '#374151',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    border: '#374151',
    borderLight: '#4b5563',
  },
} as const;

export type ColorPalette = typeof colors;

