const { build } = require('electron-builder');

build({
  config: {
    appId: 'com.albasimia.ricecaster',
    productName: 'Rice Caster',
    files: ['app/**/*'],
  },
});