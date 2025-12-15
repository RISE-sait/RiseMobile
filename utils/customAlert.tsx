// utils/customAlert.tsx
// Custom Alert replacement using FeedbackDialog for consistent theming

import React from 'react';
import { COLORS } from '@/constants/colors';
import type { FeedbackDialogButton } from '@/components/feedback/FeedbackDialog';

// State management for the custom alert
let alertComponent: React.ComponentType<any> | null = null;
let showAlertFn: ((props: AlertProps) => void) | null = null;

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertProps {
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Initialize the custom alert system
 * Call this from your root component
 */
export const setAlertHandler = (showFn: (props: AlertProps) => void) => {
  showAlertFn = showFn;
};

/**
 * Show a custom alert dialog that matches the app's theme
 * Drop-in replacement for React Native's Alert.alert()
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: { type?: 'success' | 'error' | 'warning' | 'info' }
) => {
  if (!showAlertFn) {
    // Fallback to console if handler not set
    console.warn('Custom alert handler not initialized. Use setAlertHandler()');
    console.log(`Alert: ${title} - ${message}`);
    return;
  }

  showAlertFn({
    title,
    message: message || '',
    buttons: buttons || [{ text: 'OK' }],
    type: options?.type,
  });
};

/**
 * Map alert type to icon and color
 */
export const getAlertIcon = (type?: string): { icon: string; color: string } => {
  switch (type) {
    case 'success':
      return { icon: 'circle-check', color: COLORS.success };
    case 'error':
      return { icon: 'circle-xmark', color: COLORS.danger };
    case 'warning':
      return { icon: 'triangle-exclamation', color: COLORS.warning };
    case 'info':
    default:
      return { icon: 'circle-info', color: COLORS.info };
  }
};

/**
 * Map button style to FeedbackDialog button style
 */
export const mapButtonStyle = (style?: string): 'default' | 'primary' | 'danger' => {
  switch (style) {
    case 'destructive':
      return 'danger';
    case 'cancel':
      return 'default';
    default:
      return 'primary';
  }
};

/**
 * Convert Alert buttons to FeedbackDialog buttons
 */
export const convertButtons = (buttons?: AlertButton[]): FeedbackDialogButton[] => {
  if (!buttons || buttons.length === 0) {
    return [{ text: 'OK', onPress: () => {}, style: 'primary' }];
  }

  return buttons.map((button) => ({
    text: button.text,
    onPress: button.onPress || (() => {}),
    style: mapButtonStyle(button.style),
  }));
};
