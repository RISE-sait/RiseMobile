import React, { useState, useEffect, useCallback } from 'react';
import { Image, ImageProps, View, ActivityIndicator, StyleSheet } from 'react-native';
import { ImageSourceProp } from 'react-native';

interface Props extends Omit<ImageProps, 'source'> {
  source: ImageSourceProp;
  fallback?: ImageSourceProp;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

interface State {
  hasError: boolean;
  isLoading: boolean;
  retryCount: number;
}

export const SafeImage: React.FC<Props> = ({
  source,
  fallback,
  onLoad,
  onError,
  style,
  ...props
}) => {
  const [state, setState] = useState<State>({
    hasError: false,
    isLoading: true,
    retryCount: 0
  });

  const handleLoad = useCallback(() => {
    setState({ hasError: false, isLoading: false, retryCount: 0 });
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error: any) => {
    console.warn('🖼️ SafeImage error:', error);

    setState(prev => {
      // 限制重试次数，避免无限重试
      if (prev.retryCount < 3) {
        return {
          ...prev,
          hasError: false,
          isLoading: true,
          retryCount: prev.retryCount + 1
        };
      } else {
        return {
          ...prev,
          hasError: true,
          isLoading: false
        };
      }
    });

    onError?.(error);
  }, [onError]);

  // 添加延迟重试
  useEffect(() => {
    if (state.hasError && state.retryCount > 0 && state.retryCount < 3) {
      const timer = setTimeout(() => {
        setState({ hasError: false, isLoading: true });
      }, 1000 * state.retryCount); // 递增延迟

      return () => clearTimeout(timer);
    }
  }, [state.hasError, state.retryCount]);

  if (state.hasError && fallback) {
    return (
      <Image
        source={fallback}
        style={[styles.image, style]}
        {...props}
      />
    );
  }

  if (state.hasError) {
    return (
      <View style={[styles.image, styles.placeholder, style]}>
        <ActivityIndicator size="small" color="#999" />
      </View>
    );
  }

  return (
    <View>
      {state.isLoading && (
        <View style={[styles.image, styles.loadingOverlay, style]}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
      <Image
        source={source}
        style={[styles.image, style]}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SafeImage;
