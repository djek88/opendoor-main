'use strinct';

const joi = require('joi');
const configObj = require('../../../config');

const frontendConfigSchema = joi
  .object({
    itemsPerPage: joi.number().positive().default(25),
    maxItemsPerPage: joi.number().positive().default(100),
  })
  .default();

const configSchema = joi
  .object({
    port: joi.number().positive().default(8000),
    hostname: joi.string().default('localhost'),
    siteName: joi.string().required(),
    url: joi.string().required(),
    cookieKeys: joi.string().default('1223'),
    sessionSecret: joi.string().default('1234567890QWERTY1223'),
    mongoURI: joi.string().default('mongodb://localhost:27017/opendoor'),
    staticFiles: joi.array().items(joi.string()).unique().default(['/sitemap.xml']),
    frontend: frontendConfigSchema,
  })
  .unknown()
  .required();


const { error: err, value: confVars } = joi.validate(configObj, configSchema);

if (err) {
  throw new Error(`Config validation error: ${err.message}`);
}

const config = {
  port: confVars.port,
  hostname: confVars.hostname,
  siteName: confVars.siteName,
  url: confVars.url,
  cookieKeys: confVars.cookieKeys,
  sessionSecret: confVars.sessionSecret,
  mongoURI: confVars.mongoURI,
  staticFiles: confVars.staticFiles,
  frontend: confVars.frontend,
};

module.exports = config;
