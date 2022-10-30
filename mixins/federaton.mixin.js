const shellCommandExecutor = require("../mixins/shell_command_executor.mixin");

module.exports = {

	async setUpFederation(config) {
		const params = [config._id, config.numberOfNodes];
		const args = ["--federation-id", "--nodes"];

		const cmdArgsString = args.map((arg, idx) => [arg, params[idx]].join("=")).join(" ");
		const cmdString = ["./bootstrap-scripts/create_federation.sh", cmdArgsString].join(" ");
		const result = await shellCommandExecutor.executeCommand(cmdString);
		if (!result.error) {
			console.log(`Created config directory for federation with id: ${config._id}`);
			console.log(result.output);
		} else {
			console.error(result.error);
			console.error(`Couldn't create config directory for federation with id: ${config._id}, reason: ${result.errorMessage}`);
		}
	},

	async getConnectionInfo(federationId) {
		const cmdArgs = ["--federation-id", federationId].join("=");
		const cmdString = ["./bootstrap-scripts/get_connection_info.sh", cmdArgs].join(" ");
		const result = await shellCommandExecutor.executeCommand(cmdString);
		if (!result.error) {
			return result.output;
		}
		return {};
	}
};
