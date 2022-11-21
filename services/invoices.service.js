"use strict";

const InvoiceMixin = require("../mixins/invoice.mixin");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */


module.exports = {
	name: "invoices",

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
				memberId: "string",
				federationId: "string",
				amount: "number",
				description: "string"
			},
			async handler(ctx) {
				const result = await InvoiceMixin.createInvoice(ctx.params);
				return result;
			}
		},

		update: {
			rest: "PUT /",
			params: {
				memberId: "string",
				federationId: "string",
				invoice: "string"
			},
			async handler(ctx) {
				const result = await InvoiceMixin.payInvoice(ctx.params);
				return result;
			}
		}
	}
};
