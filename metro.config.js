const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Tells Metro to use the `exports` field in package.json so it picks the
// CJS build of socket.io-client instead of the ESM build (which uses bare
// relative ".js" imports that Metro can't resolve).
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
