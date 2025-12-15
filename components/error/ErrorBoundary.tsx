import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新state使下一次渲染能够显示降级后的UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 记录RCTImageView相关错误
    if (error.message && error.message.includes('RCTImageView')) {
      console.error('🖼️ RCTImageView Error detected:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      // 你可以渲染任何自定义的降级UI
      return (
        <View style={styles.container}>
          <Text style={styles.text}>
            Something went wrong.
          </Text>
          {this.props.fallback}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
});

export default ErrorBoundary;
