// components/feedback/AlertProvider.tsx
// Global provider for custom themed alerts

import React, { useState, useEffect } from 'react';
import FeedbackDialog from './FeedbackDialog';
import { setAlertHandler, getAlertIcon, convertButtons } from '@/utils/customAlert';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons: any[];
  type?: 'success' | 'error' | 'warning' | 'info';
}

const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'info',
  });

  useEffect(() => {
    // Register the alert handler
    setAlertHandler((props) => {
      setAlertState({
        visible: true,
        title: props.title,
        message: props.message,
        buttons: props.buttons || [],
        type: props.type || 'info',
      });
    });
  }, []);

  const handleDismiss = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  const { icon, color } = getAlertIcon(alertState.type);
  const feedbackButtons = convertButtons(alertState.buttons);

  return (
    <>
      {children}
      <FeedbackDialog
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        icon={icon}
        iconColor={color}
        buttons={feedbackButtons}
        onDismiss={handleDismiss}
      />
    </>
  );
};

export default AlertProvider;
