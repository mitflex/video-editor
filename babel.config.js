module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  plugins.push([
    'module-resolver',
    {
      alias: {
        '@': './',
      },
    },
  ]);

  plugins.push('react-native-reanimated/plugin');

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
