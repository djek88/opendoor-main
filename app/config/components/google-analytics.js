'use strinct';

const joi = require('joi');
const configObj = require('../../../config');

const googleAnalyticsConfigSchema = joi
  .object({
    trackingId: joi.string().default('invalidTrackingId'),
  })
  .default();

const configSchema = joi
  .object({
    googleAnalytics: googleAnalyticsConfigSchema,
  })
  .unknown()
  .required();

const { error: err, value: confVars } = joi.validate(configObj, configSchema);

if (err) {
  throw new Error(`Config validation error: ${err.message}`);
}

const config = {
  googleAnalytics: confVars.googleAnalytics,
};

module.exports = config;
