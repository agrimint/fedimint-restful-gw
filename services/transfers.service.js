"use strict";

const TransferMixin = require("../mixins/transfer.mixin");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "transfers",


	mixins: [ TransferMixin ],

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
				"federationId": "string",
				"senderMemberId": "string",
				"recipientMemberId": "string",
				"amount": "number"
			},
			async handler(ctx) {
				const result = await TransferMixin.makeTransfer(ctx.params);
				return result;
			}
		}
	}
};
