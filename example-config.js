var config = {
	port: 80
	,	cookieKeys: '1223'
	,	sessionSecret: '1234567890QWERTY1223'
	, mongoURI: 'mongodb://localhost:27017/opendoor'
	, mailConfig: {
		service: 'Gmail'
		,	auth: {
				user: 'user@gmail.com'
			,	pass: 'userpass'
		}
		,	senderAddress: 'user@gmail.com'
	}
	,	apiKeys: {
		googleMaps: 'yourApiKey'
	}
};

module.exports = config;