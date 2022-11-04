"use strict";

const DbMixin = require("../mixins/db.mixin");
const FederationMixin = require("../mixins/federaton.mixin");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const BASE_PORT = 10000;

module.exports = {
	name: "federations",


	mixins: [DbMixin("federations"), FederationMixin],

	settings: {
		fields: [
			"_id",
			"name",
			"nodes"
		]
	},

	hooks: {
		before: {
			async create(ctx) {
				const federationsCount = await this.adapter.count();
				ctx.params.basePort = BASE_PORT + federationsCount * 10 + federationsCount;
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

	}
};
