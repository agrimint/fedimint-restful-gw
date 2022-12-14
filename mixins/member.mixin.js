const { MoleculerError } = require("moleculer").Errors;
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
		const parsedMembers = params.connectionInfo.members.map(member => {
			return member.map(value => {
				return (!Number.isNaN(parseInt(value))) ? Number(value) : value;
			});
		});
		params.connectionInfo.members = parsedMembers;
		const connectionInfo = `'${JSON.stringify(params.connectionInfo)}'`;
		const argsParams = [params.federationId, params.id, connectionInfo];
		const args = ["--federation-id", "--member-id", "--connection-info"];

		const cmd = "./bootstrap-scripts/join_federation_member.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, argsParams);
		if (result.error === null) {
			return JSON.parse(result.output);
		} else {
			console.error(result.error);
			console.error(`Failed to join member with id: ${params.id} to federation ${params.federationId}, reason: ${result.errorMessage}`);
			throw new MoleculerError(result.errorMessage, 500, "Internal Server Error");
		}
	},

	async createPegInAddress(params) {
		const argsParams = [ params.federationId, params.id];
		const args = ["--federation-id", "--member-id"];

		const cmd = "./bootstrap-scripts/create_member_peg_in_address.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, argsParams);
		if (result.error === null) {
			return JSON.parse(result.output);
		} else {
			console.error(result.error);
			console.error(`Couldn't create peg in address for member with id: ${params._id} in federation ${params.federationId}, reason: ${result.errorMessage}`);
			throw new MoleculerError(result.errorMessage, 500, "Internal Server Error");
		}
	},

	async getHoldingsInfo(params) {
		const argsParams = [ params.federationId, params.id];
		const args = ["--federation-id", "--member-id"];
		const cmd = "./bootstrap-scripts/get_member_holdings.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, argsParams);
		if (result.error === null) {
			return JSON.parse(result.output);
		} else {
			console.error(result.error);
			console.error(`Couldn't fetch holdings info for member with id: ${params._id} in federation ${params.federationId}, reason: ${result.errorMessage}`);
			throw new MoleculerError(result.errorMessage, 500, "Internal Server Error");
		}
	},

	async claimAmount(params) {
		const argsParams = [ params.federationId, params.id, params.amoutn];
		const args = ["--federation-id", "--member-id", "--amount"];
		const cmd = "./bootstrap-scripts/claim_federation_funds.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, argsParams);
		if (result.error === null) {
			return JSON.parse(result.output);
		} else {
			console.error(result.error);
			console.error(`Couldn't claim amount for member with id: ${params.id} in federation ${params.federationId}, reason: ${result.errorMessage}`);
			throw new MoleculerError(result.errorMessage, 500, "Internal Server Error");
		}
	}
};
