"use strict";

const PegInMixin = require("../mixins/peg_in.mixin");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */


module.exports = {
	name: "peg-ins",


	mixins: [ ],

	settings: {
		fields: [ ]
	},

	hooks: {

	},

	dependencies: [],

	actions: {
		create: {
			rest: "POST /",
			params: {
				federationId: "string",
				transactionId: "string"
			},
			async handler(ctx) {
				await PegInMixin.pegIn(ctx.params);
			}
		}
	}
};
