// Learn more https://docs.expo.io/guides/customizing-metro
const path = require("path");
const { withRozenite } = require("@rozenite/metro");
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolve rozenite-zustand-plugin when linked via "file:.."
const pluginRoot = path.resolve(__dirname, "..");
config.watchFolders = [...(config.watchFolders || []), pluginRoot];

module.exports = withRozenite(config, { enabled: true });
