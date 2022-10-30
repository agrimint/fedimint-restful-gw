"use strict";

const DbMixin = require("../mixins/db.mixin");
const GuardianMixin = require("../mixins/guardian.mixin");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

 module.exports = {
	name: "guardians",

	mixins: [DbMixin("guardians"), GuardianMixin],

	settings: {
		fields: [
			"_id",
			"name",
			"node",
			"federationId",
			"pinCode"
		],
	},

	hooks: {
		after: {
			create(ctx, res) {
				GuardianMixin.createGuardianCertificate(res);
				return res;
			}
		}
	},

	dependencies: [],

	actions: {
		exchangeKey: {
			rest: "PUT /:id/keys/exchange",
			params: {
				id: "string",
				federationId: "string",
				node: "number",
				pinCode: "string"
			},
			async handler(ctx) {
				const federation = await ctx.call("federations.get", { id: ctx.params.federationId} );
				const params = {
					federationId: federation._id,
					federationName: federation.name,
					node: ctx.params.node,
					pinCode: ctx.params.pinCode
				};
				const result = await GuardianMixin.exchangeCertificate(params);
				return result;
			}
		},

		joinFederation: {
			rest: "PUT /:id/federations/joined",
			params: {
				id: "string",
				federationId: "string",
				node: "number",
				pinCode: "string"
			},
			async handler(ctx) {
				const result = await GuardianMixin.startDaemon(ctx.params);
				return result;
			}
		},
	}
};
