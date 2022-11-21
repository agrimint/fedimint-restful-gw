const ApiGateway = require("moleculer-web");
// const ENUMS = require('../middlewares/enums')

module.exports = {
	name: "ussd-api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.USSD_PORT,
		server: true,
		bodyParsers: {
			json: true,
			urlencoded: { extended: true }
		},
		routes: [{
			path: "/",
			whitelist: [
				"ussd.menu"
			],
			aliases: {
				"POST ussd": "ussd.menu"
			},
			bodyParsers: {
				json: true,
				urlencoded: { extended: true }
			},
		}]
	}
};
