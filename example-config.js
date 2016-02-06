var config = {
		port: 80
	,	hostname: '0.0.0.0'
	, sitename: 'OpenDoor.ooo'
	,	url: 'http://192.168.100.4:8000'
	,	cookieKeys: '1223'
	,	sessionSecret: '1234567890QWERTY1223'
	, mongoURI: 'mongodb://localhost:27017/opendoor'
	, mailConfig: {
		//	transport: 'gmail'
		//,	service: 'Gmail'
		//,	auth: {
		//	 	user: 'user@gmail.com'
		//	,	pass: 'userpass'
		//}
		//,	senderAddress: 'user@gmail.com'
			transport: 'smtp'
		,	host: 'localhost'
		,	port: 25
		,	auth: {
				user: 'username'
			,	pass: 'password'
			}
		}
	,	apiKeys: {
			googleMaps: 'yourApiKey'
		,	googleMapsServer: 'yourApiKey'
		}
	, social: {
		twitterAccount: 'yourAccount'
	}
};

module.exports = config;