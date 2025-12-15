module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // React Native Worklets plugin MUST be last!
      'react-native-worklets/plugin',
    ],
  };
};