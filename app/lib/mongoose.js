const mongoose = require('mongoose');
const config = require('../config');

module.exports = mongoose;

mongoose.Promise = global.Promise;

mongoose.connect(config.mongoURI);

mongoose.connection.on('open', () => console.log('Database connected...')); // eslint-disable-line no-console
mongoose.connection.on('error', err => console.error('Database error:', err.stack)); // eslint-disable-line no-console

process.on('SIGTERM', () => mongoose.connection.close());
