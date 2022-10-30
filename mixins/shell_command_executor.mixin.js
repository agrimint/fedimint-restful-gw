const { exec } = require("child_process");

class CommandExecutonResult {
	constructor(error, output, errorMsg) {
		this.error = error;
		this.output = output;
		this.errorMessage = errorMsg;
	}
}

module.exports = {
	async executeCommand(cmd, args, params) {
		const cmdArgsString = args.map((arg, idx) => [arg, params[idx]].join("=")).join(" ");
		const cmdString = [cmd, cmdArgsString].join(" ");
		return new Promise((resolve, _) => {
			exec(cmdString, (error, stdout, stderr) => {
				resolve(new CommandExecutonResult(error, stdout, stderr));
			});
		});
	}
};


