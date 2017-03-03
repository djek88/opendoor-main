'use strinct';

const joi = require('joi');
const configObj = require('../../../config');

const l10nConfigSchema = joi.object({
		timeFormat: joi.string().default('hh:mm tt'),
		dateFormat: joi.string().default('yyyy-MM-dd'),
		dateTimeFormat: joi.string().default('yyyy-MM-dd hh:mm tt')
	})
	.default();

const configSchema = joi.object({
		l10n: l10nConfigSchema
	})
	.unknown()
	.required();

const { error: err, value: confVars } = joi.validate(configObj, configSchema);

if (err) {
	throw new Error(`Config validation error: ${err.message}`);
}

const config = {
	l10n: confVars.l10n
};

module.exports = config;
