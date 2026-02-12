import { useState, useCallback, useMemo } from "react";
import type { FeedbackDialogButton } from "@/components/feedback/FeedbackDialog";

interface DialogConfig {
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  buttons?: FeedbackDialogButton[];
}

export const useFeedbackDialog = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<DialogConfig>({
    title: "",
    message: "",
  });

  // New config object API (recommended)
  const showDialog = useCallback(
    (options: DialogConfig) => {
      setConfig({
        ...options,
        buttons: options.buttons || [
          { text: "OK", onPress: () => setVisible(false), style: "primary" },
        ],
      });
      setVisible(true);
    },
    []
  );

  // Legacy positional API (deprecated, kept for backward compatibility)
  const show = useCallback(
    (
      title: string,
      message: string,
      buttons?: FeedbackDialogButton[],
      icon?: string,
      iconColor?: string
    ) => {
      setConfig({
        title,
        message,
        icon,
        iconColor,
        buttons: buttons || [
          { text: "OK", onPress: () => setVisible(false), style: "primary" },
        ],
      });
      setVisible(true);
    },
    []
  );

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  return useMemo(
    () => ({
      visible,
      config,
      show, // Legacy API
      showDialog, // New recommended API
      hide,
    }),
    [visible, config, show, showDialog, hide]
  );
};

export default useFeedbackDialog;
