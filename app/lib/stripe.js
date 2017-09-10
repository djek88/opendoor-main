const config = require('../config');
const stripe = require('stripe');

module.exports = stripe(config.apiKeys.stripeSecret);
