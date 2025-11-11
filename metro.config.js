const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Custom resolver to fix multiple module resolution issues
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fix for tslib ES module import issues on web
  if (moduleName === 'tslib' || moduleName.startsWith('tslib/')) {
    return {
      filePath: path.resolve(__dirname, 'node_modules/tslib/tslib.js'),
      type: 'sourceFile',
    };
  }

  // Fix for react-async-hook's incorrect package.json module field
  if (moduleName.includes('react-async-hook') && moduleName.includes('.esm.js')) {
    const fixedPath = moduleName.replace('react-async-hook.esm.js', 'dist/react-async-hook.esm.js');
    return context.resolveRequest(context, fixedPath, platform);
  }

  // Use default resolver for everything else
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './app/globals.css' });
