const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajoutez cette configuration pour ignorer les avertissements de cycle
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 