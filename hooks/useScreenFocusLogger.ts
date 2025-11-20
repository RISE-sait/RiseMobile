import { useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

/**
 * Lightweight dev helper that logs when a screen mounts, unmounts,
 * gains focus, or loses focus.
 */
const useScreenFocusLogger = (screenName: string) => {
  const idRef = useRef(`${screenName}-${Date.now()}`);

  useEffect(() => {
    if (__DEV__) {
      console.log(`[ScreenLog:${screenName}] mounted (${idRef.current})`);
    }
    return () => {
      if (__DEV__) {
        console.log(`[ScreenLog:${screenName}] unmounted (${idRef.current})`);
      }
    };
  }, [screenName]);

  useFocusEffect(
    useCallback(() => {
      if (__DEV__) {
        console.log(`[ScreenLog:${screenName}] focused (${idRef.current})`);
      }
      return () => {
        if (__DEV__) {
          console.log(`[ScreenLog:${screenName}] unfocused (${idRef.current})`);
        }
      };
    }, [screenName]),
  );
};

export default useScreenFocusLogger;
