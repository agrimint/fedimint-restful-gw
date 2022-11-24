"use strict";

const DbMixin = require("../mixins/db.mixin");
const FederationMixin = require("../mixins/federation.mixin");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const BASE_PORT = 4000;

module.exports = {
	name: "federations",


	mixins: [DbMixin("federations"), FederationMixin],

	settings: {
		fields: [
			"_id",
			"name",
			"nodes",
			"basePort"
		]
	},

	hooks: {
		before: {
			async create(ctx) {
				const federationsCount = await this.adapter.count();
				ctx.params.basePort = BASE_PORT + federationsCount * 100 + federationsCount;
				return ctx;
			}
		},
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

		getPegInAddress: {
			rest: "POST /:id/peg-in-address",
			params: {
				id: "string"
			},
			async handler(ctx) {
				return await FederationMixin.getPegInAddress(ctx.params);
			}
		}
	}
};
