// After adding new configurations, should add validation rules in appropriate file

// Any DEFAULT and NOT REQUIRED options can be absent
// NOT REQUIRED - config block will be created with default values for child options, if default values are specified

module.exports = {
	// port: undefined,				/*DEFAULT: 8000*/
	// hostname: '',				/*DEFAULT: 'localhost'*/
	siteName: '',					/*REQUIRED, eg: 'OpenDoor.ooo'*/
	url: '',						/*REQUIRED, 'http://prodServerHostname[:port]', eg: 'test.com'*/
	// cookieKeys: '',				/*DEFAULT: '1223'*/
	// sessionSecret: '',			/*DEFAULT: '1234567890QWERTY1223'*/
	// mongoURI: '',				/*DEFAULT: 'mongodb://localhost:27017/opendoor'*/
	// staticFiles: [],				/*DEFAULT: [], eg: ['/path/to/static/file']*/

	apiKeys: {						/*REQUIRED*/
		googleMaps: '',					/*REQUIRED*/
		// googleMapsServer: '',		/*NOT REQUIRED*/
		stripePublic: '',				/*REQUIRED*/
		stripeSecret: ''				/*REQUIRED*/
	},

	social: {						/*REQUIRED*/
		twitterAccount: ''				/*REQUIRED, rg: '@opendoorforall'*/
	},

	// googleAnalytics: {			/*NOT REQUIRED*/
		// trackingId: ''				/*DEFAULT: 'invalidTrackingId'*/
	// },

	// frontend: {					/*NOT REQUIRED*/
		// itemsPerPage: undefined,		/*DEFAULT: 25*/
		// maxItemsPerPage: undefined	/*DEFAULT: 100*/
	//},

	// prerenderService: {			/*NOT REQUIRED*/
		// enable: undefined,			/*DEFAULT: true*/
		// port: undefined,				/*DEFAULT: 3000*/
		// instances: undefined			/*DEFAULT: 0, (how many servers will be running, 0 = numCpuCores)*/
	// },

	// mailConfig: {				/*NOT REQUIRED*/
		// host: '',					/*DEFAULT: 'localhost'*/
		// port: undefined,				/*DEFAULT: 25*/
		// from: '',					/*DEFAULT: 'contanct@opendoor.ooo'*/
		// auth: {						/*NOT REQUIRED*/
			// user: '',					/*REQUIRED IF 'auth' specified*/
			// pass: ''						/*REQUIRED IF 'auth' specified*/
		// },
		// tls: {						/*NOT REQUIRED*/
			// rejectUnauthorized: undefined	/*DEFAULT: false*/
		// }
	// },

	// l10n: {							/*NOT REQUIRED*/
		// timeFormat: '',					/*DEFAULT: 'hh:mm tt'*/
		// dateFormat: '',					/*DEFAULT: 'yyyy-MM-dd'*/
		// dateTimeFormat: ''				/*DEFAULT: 'yyyy-MM-dd hh:mm tt'*/
	// }
};