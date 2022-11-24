const { MoleculerError } = require("moleculer").Errors;
const shellCommandExecutor = require("./shell_command_executor.mixin");

module.exports = {

	async makeTransfer(params) {
		const argsParams=[params.federationId, params.senderMemberId, params.recipientMemberId, params.amount ];
		const args=["--federation-id", "--sender-id", "--recipient-id", "--amount"];

		const cmd = "./bootstrap-scripts/create_federation.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, argsParams);
		if (result.error === null) {
			console.log(`Transfer for federation with id: ${params.federationId} from member with id: ${params.senderMemberId} to member with id: ${params.recipientMemberId} has succeeded`);
			console.log(result.output);
		} else {
			console.error(`Transfer for federation with id: ${params.federationId} from member with id: ${params.senderMemberId} to member with id: ${params.recipientMemberId} has failed`);
			console.error(result.errorMessage);
		}
		return result;
	}
};
