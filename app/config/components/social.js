'use strinct';

const joi = require('joi');
const configObj = require('../../../config');

const socialConfigSchema = joi
  .object({
    twitterAccount: joi.string().required(),
  })
  .required();

const configSchema = joi
  .object({
    social: socialConfigSchema,
  })
  .unknown()
  .required();

const { error: err, value: confVars } = joi.validate(configObj, configSchema);

if (err) {
  throw new Error(`Config validation error: ${err.message}`);
}

const config = {
  social: confVars.social,
};

module.exports = config;
