const { MoleculerError } = require("moleculer").Errors;
const shellCommandExecutor = require("./shell_command_executor.mixin");

module.exports = {

	async pegIn(params) {
		const argsParams = [params.federationId, params.transactionId, params.memberId, params.pegInAddress];
		const args = ["--federation-id", "--transaction-id", "--member-id", "--peg-in-address"];

		const cmd = "./bootstrap-scripts/peg_in.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, argsParams);
		if (result.error === null) {
			return result.output;
		} else {
			console.error(result.error);
			console.error(`Peg-in for member with id: ${params.memberId} in federation ${params.federationId} has failed, reason: ${result.errorMessage}`);
			throw new MoleculerError(result.errorMessage, 500, "Internal Server Error");
		}
	}

};
