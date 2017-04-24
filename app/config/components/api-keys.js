'use strinct';

const joi = require('joi');
const configObj = require('../../../config');

const apiKeysConfigSchema = joi
  .object({
    googleMaps: joi.string().required(),
    googleMapsServer: joi.string(),
    stripePublic: joi.string().required(),
    stripeSecret: joi.string().required(),
  })
  .required();

const configSchema = joi
  .object({
    apiKeys: apiKeysConfigSchema,
  })
  .unknown()
  .required();

const { error: err, value: confVars } = joi.validate(configObj, configSchema);

if (err) {
  throw new Error(`Config validation error: ${err.message}`);
}

const config = {
  apiKeys: confVars.apiKeys,
};

module.exports = config;
