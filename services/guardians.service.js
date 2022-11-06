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
				const federation = await ctx.call("federations.get", { id: ctx.params.federationId} );
				const params = {
					federationId: ctx.params.federationId,
					node: ctx.params.node,
					basePort: federation.basePort,
					name: ctx.params.name,
					secret: ctx.params.secret
				};
				await GuardianMixin.createGuardianCertificate(params);
				ctx.params;
				delete ctx.params.secret;
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
				await GuardianMixin.exchangeCertificate(params);
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
				await GuardianMixin.startDaemon(ctx.params);
			}
		}
	}
};
