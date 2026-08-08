const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules in dev only.
  // This fixes iOS styling issues in development mode, but breaks
  // `expo export` (its web + node/SSR targets bundle concurrently and race
  // on the same on-disk cache file, crashing Metro's SHA-1 crawl).
  forceWriteFileSystem: process.env.NODE_ENV !== "production",
});
