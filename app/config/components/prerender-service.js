'use strinct';

const joi = require('joi');
const configObj = require('../../../config');

const prerenderServiceConfigSchema = joi
  .object({
    enable: joi.boolean().default(true),
    port: joi.number().positive().default(3000),
    instances: joi.number().positive().default(0),
  })
  .default();

const configSchema = joi
  .object({
    prerenderService: prerenderServiceConfigSchema,
  })
  .unknown()
  .required();

const { error: err, value: confVars } = joi.validate(configObj, configSchema);

if (err) {
  throw new Error(`Config validation error: ${err.message}`);
}

const config = {
  prerenderService: confVars.prerenderService,
};

module.exports = config;
