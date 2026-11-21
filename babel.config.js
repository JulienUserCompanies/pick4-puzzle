module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated v4 moved its worklet transform into this
    // separate package; must stay last in the plugins list.
    plugins: ['react-native-worklets/plugin'],
  };
};
