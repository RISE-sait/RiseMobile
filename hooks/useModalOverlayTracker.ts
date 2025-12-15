import { useEffect, useSyncExternalStore } from "react";

type Listener = () => void;

let activeModalCount = 0;
const listeners = new Set<Listener>();

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const emit = () => {
  listeners.forEach((listener) => {
    listener();
  });
};

const getSnapshot = () => activeModalCount > 0;

export const useModalOverlayPresence = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);

export const useRegisterModalOverlay = () => {
  useEffect(() => {
    activeModalCount += 1;
    if (__DEV__) {
      console.log(`[ModalTracker] overlay++ -> ${activeModalCount}`);
    }
    emit();

    return () => {
      activeModalCount = Math.max(0, activeModalCount - 1);
      if (__DEV__) {
        console.log(`[ModalTracker] overlay-- -> ${activeModalCount}`);
      }
      emit();
    };
  }, []);
};
