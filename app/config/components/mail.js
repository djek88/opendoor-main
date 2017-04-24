'use strinct';

const joi = require('joi');
const configObj = require('../../../config');

const authSchema = joi
  .object({
    user: joi.string().required(),
    pass: joi.string().required(),
  });

const tlsSchema = joi
  .object({
    rejectUnauthorized: joi.boolean().default(false),
  })
  .default();


const mailConfigSchema = joi
  .object({
    host: joi.string().default('localhost'),
    port: joi.number().positive().default(25),
    from: joi.string().default('contanct@opendoor.ooo'),
    auth: authSchema,
    tls: tlsSchema,
  })
  .default();

const configSchema = joi
  .object({
    mailConfig: mailConfigSchema,
  })
  .unknown()
  .required();

const { error: err, value: confVars } = joi.validate(configObj, configSchema);

if (err) {
  throw new Error(`Config validation error: ${err.message}`);
}

const config = {
  mailConfig: confVars.mailConfig,
};

module.exports = config;
