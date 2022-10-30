const { exec } = require("child_process");

class CommandExecutonResult {
	constructor(error, output, errorMsg) {
		this.errorCode = error;
		this.output = output;
		this.errorMessage = errorMsg;
	}
}

module.exports = {
	async executeCommand(cmdString) {
		return new Promise((resolve, _) => {
			exec(cmdString, (error, stdout, stderr) => {
				resolve(new CommandExecutonResult(error, stdout, stderr));
			});
		});
	}
};


