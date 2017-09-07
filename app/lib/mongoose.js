const mongoose = require('mongoose');
const config = require('../config');

module.exports = mongoose;

mongoose.Promise = global.Promise;

const options = {
  server: {
    keepAlive: 120,
  },
  replset: {
    keepAlive: 120,
  },
};
mongoose.connect(config.mongoURI, options);

mongoose.connection.on('open', () => console.log('Database connected...')); // eslint-disable-line no-console
mongoose.connection.on('error', err => console.error('Database error:', err.stack)); // eslint-disable-line no-console

process.on('SIGTERM', () => mongoose.connection.close());
