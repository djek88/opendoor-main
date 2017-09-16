const mongoose = require('mongoose');
const config = require('../config');

module.exports = mongoose;

mongoose.Promise = global.Promise;

const options = {
  useMongoClient: true,
};
mongoose.connect(config.mongoURI, options);

mongoose.connection.on('open', () => console.log('Database connected...')); // eslint-disable-line no-console
mongoose.connection.on('error', err => console.error('Database error:', err.stack)); // eslint-disable-line no-console

// process.on('SIGTERM', () => mongoose.disconnect());
