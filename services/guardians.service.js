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
			"federationId"
		],
	},

	hooks: {
		before: {
			async create(ctx) {
				await GuardianMixin.createGuardianCertificate(ctx.params);
				const guardian = ctx.params;
				delete guardian.secret;
				return guardian;
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
				secret: "string"
			},
			async handler(ctx) {
				const federation = await ctx.call("federations.get", { id: ctx.params.federationId} );
				const params = {
					federationId: federation._id,
					federationName: federation.name,
					node: ctx.params.node,
					secret: ctx.params.secret
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
				secret: "string"
			},
			async handler(ctx) {
				const result = await GuardianMixin.startDaemon(ctx.params);
				return result;
			}
		}
	}
};
