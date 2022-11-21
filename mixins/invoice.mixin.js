const { MoleculerError } = require("moleculer").Errors;
const shellCommandExecutor = require("./shell_command_executor.mixin");

module.exports = {

	async createInvoice(params) {
		const argsParams = [ params.federationId, params.memberId, params.amount, params.description ];
		const args = [ "--federation-id", "--member-id", "--amount", "--description" ];

		const cmd = "./bootstrap-scripts/create_invoice.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, argsParams);
		if (result.error === null) {
			return JSON.parse(result.output);
		} else {
			console.error(result.error);
			console.error(`Couldn't create invoice for member with id: ${params.memberId} in federation ${params.federationId}, reason: ${result.errorMessage}`);
			throw new MoleculerError(result.errorMessage, 500, "Internal Server Error");
		}
	},

	async payInvoice(params) {
		const argsParams = [ params.federationId, params.memberId, params.invoice];
		const args = [ "--federation-id", "--member-id", "--invoice"];

		const cmd = "./bootstrap-scripts/pay_invoice.sh";
		const result = await shellCommandExecutor.executeCommand(cmd, args, argsParams);
		if (result.error === null) {
			return JSON.parse(result.output);
		} else {
			console.error(result.error);
			console.error(`Couldn't pay invoice with id: ${params.invoice} for member with id: ${params.memberId} in federation ${params.federationId}, reason: ${result.errorMessage}`);
			throw new MoleculerError(result.errorMessage, 500, "Internal Server Error");
		}
	}
};
