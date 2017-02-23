module.exports = {
	port: 8000,
	hostname: 'localhost',
	sitename: 'OpenDoor.ooo',
	url: 'http://prodServerHostname[:port]', // eg http://176.9.152.11:8000
	prerenderService: {
		enable: true,
		port: 3000,
		instances: 1 // how many servers will be running, 0 = numCpuCores
	},
	cookieKeys: '1223',
	sessionSecret: '1234567890QWERTY1223',
	mongoURI: 'mongodb://localhost:27017/opendoor',
	mailConfig: {
		//	transport: 'gmail',
		//	service: 'Gmail',
		//	auth: {
		//	 	user: 'user@gmail.com',
		//		pass: 'userpass'
		//}
		//	senderAddress: 'user@gmail.com',
		transport: 'smtp',
		host: 'localhost',
		port: 25,
		auth: {
			user: 'username',
			pass: 'password'
		}
	},
	apiKeys: {
		googleMaps: 'yourApiKey',
		googleMapsServer: 'yourApiKey',
		stripePublic: 'yourApiKey',
		stripeSecret: 'yourApiKey'
	},
	social: {
		twitterAccount: '@yourAccount'
	},
	frontend: {
		itemsPerPage: 25,
		maxItemsPerPage: 100
	},
	l10n: {
		timeFormat: 'hh:mm tt',
		dateFormat: 'yyyy-MM-dd',
		dateTimeFormat: 'yyyy-MM-dd hh:mm tt'
	},
	googleAnalytics: {
		trackingId: 'yourTrackingId'
	},
	staticFiles: ['/sitemap.xml']
};