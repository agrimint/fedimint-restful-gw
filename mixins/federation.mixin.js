const { MoleculerError } = require("moleculer").Errors;
const shellCommandExecutor = require("./shell_command_executor.mixin");

module.exports = {

	async setUpFederation(config) {
		const params = [config._id, config.nodes, config.basePort];
		const args = ["--federation-id", "--nodes", "--federation-base-port"];

		const cmd = "./bootstrap-scripts/create_federation.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, params);
		if (result.error === null) {
			console.log(`Created config directory for federation with id: ${config._id}`);
			console.log(result.output);
		} else {
			console.error(result.error);
			console.error(`Couldn't create config directory for federation with id: ${config._id}, reason: ${result.errorMessage}`);
			throw new MoleculerError("Something went wrong", 500, "Internal Server Error");
		}
		return result;
	},

	async getConnectionInfo(federationId) {
		const cmd = "./bootstrap-scripts/get_connection_info.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, [ "--federation-id" ], [ federationId ]);
		if (result.error === null) {
			return result.output;
		} else {
			throw new MoleculerError("Something went wrong", 500, "Internal Server Error");
		}
	}
};
