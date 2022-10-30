const shellCommandExecutor = require("../mixins/shell_command_executor.mixin");

module.exports = {

	async createGuardianCertificate(config) {
		const params = [config.federationId, config.node, config.name, config.pinCode];
		const args = ["--federation-id", "--node", "--name", "--secret"];

		const cmdArgsString = args.map((arg, idx) => [arg, params[idx]].join("=")).join(" ");
		const cmdString = ["./bootstrap-scripts/create_guardian_cert.sh", cmdArgsString].join(" ");
		const result = await shellCommandExecutor.executeCommand(cmdString);
		if (!result.error) {
			console.log(`Created config directory for guardian with id: ${config._id}`);
			console.log(result.output);
		} else {
			console.error(result.error);
			console.error(`Couldn't create config directory for guardian with id: ${config._id}, reason: ${result.errorMessage}`);
		}
	},

	async exchangeCertificate(config) {
		const params = [config.federationId, config.federationName, config.node, config.pinCode];
		const args = ["--federation-id", "--federation-name", "--node", "--secret"];

		const cmdArgsString = args.map((arg, idx) => [arg, params[idx]].join("=")).join(" ");
		const cmdString = ["./bootstrap-scripts/exchange_keys.sh", cmdArgsString].join(" ");
		const result = await shellCommandExecutor.executeCommand(cmdString);
		if (!result.error) {
			console.log(`Initiated key exchange for guardian with id: ${config.node}`);
			console.log(result.output);
		} else {
			console.error(result.error);
			console.error(`Failed to exchange keys for guardian with id: ${config.node}, reason: ${result.errorMessage}`);
		}
	},

	async startDaemon(config) {
		const params = [config.federationId, config.node, config.pinCode];
		const args = ["--federation-id", "--node", "--secret"];

		const cmdArgsString = args.map((arg, idx) => [arg, params[idx]].join("=")).join(" ");
		const cmdString = ["./bootstrap-scripts/start_federation_guardian_daemon.sh", cmdArgsString].join(" ");
		const result = await shellCommandExecutor.executeCommand(cmdString);
		if (!result.error) {
			console.log(`Starting guardian daemoon with node id: ${config.node}`);
			console.log(result.output);
		} else {
			console.error(result.error);
			console.error(`Failed to start guardian daemoon with node id: ${config.node}, reason: ${result.errorMessage}`);
		}
	}
};
