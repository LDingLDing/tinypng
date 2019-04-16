var development = require('./development');
var test = require('./test');
var production = require('./production');

var env = process.env.NODE_ENV || 'development';
var configs = {
  development: development,
  test: test,
  production: production
};
var defaultConfig = {
	serveStatic: '/../www/public',
  env: env
};

var config = Object.assign(defaultConfig, configs[env]);

module.exports = config;