"use strict";

const DbMixin = require("../mixins/db.mixin");
const FederationMixin = require("../mixins/federaton.mixin");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "federations",

	mixins: [DbMixin("federations"), FederationMixin],

	settings: {
		fields: [
			"_id",
			"name",
			"numberOfNodes"
		],
	},

	hooks: {
		after: {
			async create(ctx, res) {
				await FederationMixin.setUpFederation(res);
				return res;
			}
		}
	},

	dependencies: [],

	actions: {
		getConnectionInfo: {
			rest: "GET /:id/connection-info",
			params: {
				id: "string",
			},
			async handler(ctx) {
				const connectionString = await FederationMixin.getConnectionInfo(ctx.params.id);
				const connectionInfo = JSON.parse(connectionString);
				return connectionInfo["connect_info"];
			}
		},

	}
};
