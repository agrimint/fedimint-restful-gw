"use strict";

const DbMixin = require("../mixins/db.mixin");
const MembersMixin = require("../mixins/member.mixin");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */


module.exports = {
	name: "members",


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
				id: "string",
				federationId: "string"
			},
			async handler(ctx) {
				await MembersMixin.createMember(ctx.params);
			}
		},

		joinFederation: {
			rest: "POST /:id/federations/joined",
			params: {
				id: "string",
				federationId: "string",
				connectionInfo: "object"
			},
			async handler(ctx) {
				await MembersMixin.joinFederation(ctx.params);
			}
		},

		createPegInAddress: {
			rest: "POST /:id/peg-in-address",
			params: {
				id: "string",
				federationId: "string"
			},
			async handler(ctx) {
				const result = await MembersMixin.createPegInAddress(ctx.params);
				return result;
			}
		},

		getHoldingsInfo: {
			rest: "GET /:id/holdings",
			params: {
				id: "string",
				federationId: "string"
			},
			async handler(ctx) {
				const result = await MembersMixin.getHoldingsInfo(ctx.params);
				return result;
			}
		},

		claimAmount: {
			rest: "POST /:id/claims",
			params: {
				id: "string",
				federationId: "string",
				amount: "number"
			},
			async handler(ctx) {
				const result = await MembersMixin.claimAmount(ctx.params);
				return result;
			}
		}
	}
};
