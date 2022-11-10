const shellCommandExecutor = require("./shell_command_executor.mixin");

module.exports = {

	async createMember(params) {
		const argsParams = [params.federationId, params.id];
		const args = ["--federation-id", "--member-id"];

		const cmd = "./bootstrap-scripts/create_member_dir.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, argsParams);
		return result;
	},

	async joinFederation(params) {
		const connectionInfo = `'${JSON.stringify(params.connectionInfo)}'`;
		const argsParams = [params.federationId, params.id, connectionInfo];
		const args = ["--federation-id", "--member-id", "--connection-info"];

		const cmd = "./bootstrap-scripts/join_federation_member.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, argsParams);
		return result;
	}
};
