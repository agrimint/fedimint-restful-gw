/* eslint-disable max-len */
const ENUMS = require("../enums");
const DbMixin = require("../mixins/db.mixin");
const HTTPClientService = require("moleculer-http-client");


const AfricasTalking = require("africastalking")({
	apiKey: process.env.AT_KEY,
	username: "sandbox",
});

const USSDMessages = {

	async WELCOME(user, ctx) {
		user.ussdState = ENUMS.ussdStates.WELCOME;
		user.ussdSession = ctx.params.sessionId;
		await ctx.call("ussd.update", user);
		return `CON Welcome to AgriMint!
    AgriMint is your own community bank where you can
    securely save money, pay, borrow and 
    protect against surprising events,
    together with other members!

    1. Create AgriMint account
		2. Login into your account
    9. Exit`;
	},

	async REGISTER(user, ctx) {
		user.ussdState = ENUMS.ussdStates.REGISTER;
		await ctx.call("ussd.update", user);
		// TODO Validate OTP before setting PIN
		return `CON Please enter your secret PIN code
    to let us know that it’s you.  
    Don’t share your PIN code with anyone,
    including other AgriMint members and guardians!`;
	},

	async REGISTER_CON(user, ctx) {
		const [command, otp, pin, confirmPin] = ctx.params.text.split("*");
		if ((command === "1") && pin && !confirmPin) {
			return "CON Please confirm your PIN code";
		} else if ((command === "1") && (pin === confirmPin)) {
			await ctx.call("ussd.setPin", { user, pin });
			const did = await ctx.call("identity.createWallet", { userId: user._id });
			user.state = ENUMS.userStates.REGISTERED;
			user.ussdState = ENUMS.ussdStates.CONFIRM;
			await ctx.call("ussd.update", user);
			await ctx.call("identity.setSession", { user });
			return `CON PIN Set. Identity created.
      DID: ${did}
      1. Continue
      99. Exit`;
		} else if ((command === 1) && (pin !== confirmPin)) {
			return await this.SESSION_END(user, ctx, "PIN does not match.");
		}
	},


	async CONFIRM_VCS(user, ctx) {
		if (!user.credentialData.confirmed) {
			let confirmationString = "";
			for (let type of Object.keys(user.credentialData)) {
				confirmationString += `${type.toUpperCase()}: ${user.credentialData[type]}
        `;
			}
			user.credentialData.confirmed = ENUMS.inProgress;
			await ctx.call("ussd.update", user);
			return `CON Please confirm: ${confirmationString}
      1. Confirm
      99. Exit`;
		} else if (user.credentialData.confirmed === ENUMS.inProgress) { // TODO Reconsider the confirmed prop states
			const textSplit = ctx.params.text.split("*");
			if (textSplit.slice(-1)[0] === "1" || textSplit.length === 2) {
				await ctx.call("ussd.getVCs", { user });
				user.credentialData.confirmed = true; // TODO Reconsider the confirmed prop states
				user.state = ENUMS.userStates.CONFIRMED;
				user.ussdState = ENUMS.ussdStates.SUBSCRIBE;
				await ctx.call("ussd.update", user);
				return `CON Credentials issued.
        1. Continue
        99. Exit`;
			} else {
				return await this.SESSION_END(user, ctx, `Bye. Dial again ${ctx.params.serviceCode} to continue`);
			}
		} else {
			return await this.SESSION_END(user, ctx, `Bye. Dial again ${ctx.params.serviceCode} to continue`);
		}
	},

	async LOGIN_PROMPT() {
		return Promise.resolve("CON Enter PIN:");
	},

	async SUBSCRIBE(user, ctx) {
		const textSplit = ctx.params.text.split("*");
		if (textSplit.slice(-1)[0] === "1" || textSplit.length === 2) {
			user.ussdState = ENUMS.ussdStates.BAG;
			await ctx.call("ussd.update", user);
			return `CON Welcome ${user.name},
      please select following service:
      1. Subscribe (enter contract for 2023 season)
      99. Exit`;
		} else {
			return await this.SESSION_END(user, ctx, `Bye. Dial again ${ctx.params.serviceCode} to continue`);
		}
	},

	async BAG(user, ctx) {
		const textSplit = ctx.params.text.split("*");
		if (textSplit.slice(-1)[0] === "1") {
			user.ussdState = ENUMS.ussdStates.BUYAGREE;
			await ctx.call("ussd.update", user);
			return `CON Mavuno Technologies will supply the sulphur in time
      and spray it in between May and September 2023.
      Choose the amount of Sulphur you want to subscribe to:
      1. ${user.creditData.bagsRecommended - 2} Bags
      2. ${user.creditData.bagsRecommended - 1} Bags
      3. ${user.creditData.bagsRecommended} Bags (Mavuno recommendation)
      4. ${user.creditData.bagsRecommended + 1} Bags
      5. ${user.creditData.bagsRecommended + 2} Bags
      99. Cancel`;
		} else {
			return await this.SESSION_END(user, ctx, `Bye. Dial again ${ctx.params.serviceCode} to continue`);
		}
	},

	async BUYAGREE(user, ctx) {
		const textSplit = ctx.params.text.split("*");
		const selection = textSplit.slice(-1)[0];
		if (selection > "6") {
			return await this.SESSION_END(user, ctx, `Bye. Dial again ${ctx.params.serviceCode} to continue`);
		}
		const correction = [-2, -1, 0, 1, 2];
		const selectedBags = user.creditData.bagsRecommended + correction[parseInt(selection) - 1];
		const totalPayment = selectedBags * user.creditData.bagPrice;
		const prePayment = 0.2 * totalPayment;
		const outstandingPayment = 0.8 * totalPayment;
		user.agreement = { selectedBags, prePayment, outstandingPayment }; // TODO Add timestamp
		user.ussdState = ENUMS.ussdStates.SELLAGREE;
		await ctx.call("ussd.update", user);
		return `CON You are to subscribe for ${selectedBags}
    Bags for the 2023 Season. Our current Price is 
    ${user.creditData.bagPrice} TZS per bag.
    You will need to pay ${prePayment} TZS in advance and
    ${outstandingPayment} TZS will be deducted
    after the 2023 harvest season.
    1. Agree and Continue
    99. Cancel`;
	},

	async SELLAGREE(user, ctx) {
		const textSplit = ctx.params.text.split("*");
		const { outstandingPayment } = user.agreement;
		if (textSplit.slice(-1)[0] === "1") {
			user.ussdState = ENUMS.ussdStates.APPLY;
			await ctx.call("ussd.update", user);
			return `CON I agree that the payment of ${outstandingPayment}
      will be deducted from my AMCOS
      after the 2023 harvest season. I further agree that I will
      pay any and all outstanding amount before 31.01.2024
      if my AMCOS didn't deduct my debt.
      1. Agree and Continue
      99. Cancel`;
		} else {
			return await this.SESSION_END(user, ctx, `Bye. Dial again ${ctx.params.serviceCode} to continue`);
		}
	},

	async APPLY(user, ctx) {
		const textSplit = ctx.params.text.split("*");
		const { selectedBags, prePayment, outstandingPayment } = user.agreement;
		if (textSplit.slice(-1)[0] === "1") {
			user.ussdState = ENUMS.ussdStates.APPLY_CON;
			await ctx.call("ussd.update", user);
			return `CON By pressing 1. I hereby agree to subscribe for ${selectedBags}
      for ${prePayment + outstandingPayment} TZS. 
      I agree to pay ${prePayment} TZS will be paid in advance and
      ${outstandingPayment} TZS will be deducted/paid after the 2023 harvest season.
      I agree to all further Terms and Conditions (link). 
      1. Subscribe
      99. Cancel`;
		} else {
			return await this.SESSION_END(user, ctx, `Bye. Dial again ${ctx.params.serviceCode} to continue`);
		}
	},

	async APPLY_CON(user, ctx) {
		const textSplit = ctx.params.text.split("*");
		if (textSplit.slice(-1)[0] === "1") {
			user.state = ENUMS.userStates.APPLIED;
			await ctx.call("ussd.update", user);
			return "END Congrats!";
		} else {
			return await this.SESSION_END(user, ctx, `Bye. Dial again ${ctx.params.serviceCode} to continue`);
		}
	},

	async SESSION_END(user, ctx, message) {
		const { serviceCode } = ctx.params;
		user.ussdSession = "";
		user.ussdState = ENUMS.ussdStates.NULL;
		await ctx.call("ussd.update", user);
		return `END ${message}
    Session ended.
    Dial again ${serviceCode} to start new session.`;
	}
};

module.exports = {
	name: "ussd",
	mixins: [DbMixin("ussd"), HTTPClientService],
	settings: {
		fields: [
			"_id",
			"countryCode",
			"phoneNumber",
			"accessToken",
			"ussdSession",
			"ussdState",
			"name",
			"pin",
			"otp"
		],
	},
	actions: {
		requestOTP: {
			params: {
				"otpType": {
					type: {
						type: "enum",
						values: Object.values(ENUMS.OTPTypes)
					},

				},
				"phoneNumber": "string",
				"countryCode": "string",
				"name": "string",
				"otpLength": "number"
			},
			async handler(ctx) {
				const {
					otpType,
					phoneNumber,
					countryCode,
					name,
					otpLength
				} = ctx.params;
				const otp = await this.actions.post({
					url: `${process.env.USER_API}/otp/request`,
					body: {
						otpType,
						phoneNumber,
						countryCode,
						name,
						otpLength
					}
				});
				this.actions.create({
					countryCode,
					phoneNumber,
					accessToken: "",
					ussdSession: "",
					ussdState: "",
					otp,
					secret: "", // TODO Generate secret
					pin: ""
				});
			}
		},

		menu: {
			params: {
				phoneNumber: "string",
				sessionId: "string",
				serviceCode: "string",
				text: "string"
			},
			async handler(ctx) {
				const {
					phoneNumber: phone,
					sessionId,
					text } = Object.assign({}, ctx.params);
				ctx.meta.$responseType = "text/plain";
				const user = (await ctx.call("ussd.find", {
					query: {
						phone
					}
				}))[0];
				if (text.split("*").slice(-1) === "9") {
					return await USSDMessages.SESSION_END(user, ctx);
				}
				if (text === "" || !this.validateSession(user.ussdSession, sessionId)) {
					return await USSDMessages.WELCOME(user, ctx);
				} else {
					return await this.stateMachine(user, ctx);
				}
			}
		},

		sendSMS: {
			params: {
				countryCode: "string",
				phoneNumber: "string",
				message: "string"
			},
			async handler(ctx) {
				ctx.meta.$contentType = "application/x-www-form-urlencoded";
				ctx.meta.$authToken = process.env.AT_KEY;
				const { countryCode, phoneNumber, message } = Object.assign({}, ctx.params);
				const to = `+${countryCode}${phoneNumber}`;
				const sms = AfricasTalking.SMS;
				const response = await sms.send({ to, message, enque: true });
				return response;
			}
		}
	},

	methods: {
		setUssdState(user) {
			switch (user.ussdState) {
				case ENUMS.ussdStates.WELCOME: {
					if (user.state === ENUMS.userStates.SIGNUP) {
						return ENUMS.ussdStates.REGISTER;
					} if (user.state === ENUMS.userStates.REGISTERED) {
						return ENUMS.ussdStates.CONFIRM;
					} if (user.state === ENUMS.userStates.CONFIRMED) {
						return ENUMS.ussdStates.SUBSCRIBE;
					} if (user.state === ENUMS.userStates.SUBSCRIBED) {
						return ENUMS.ussdStates.APPLY;
					}
				}
					break;

				default: {
					return ENUMS.ussdStates.NULL;
				}
			}
		},

		validateSession(session, sessionId) {
			return (session === sessionId);
		},

		async stateMachine(user, ctx) {
			const { text } = Object.assign({}, ctx.params);
			const [command, ...rest] = text.split("*");
			switch (user.ussdState) {
				case ENUMS.ussdStates.WELCOME: {
					if (command === "1") {
						if (rest.length === 0) {
							return "CON Enter OTP:";
						}
						if (rest.length === 1) {
							if (!(await ctx.call("ussd.validateOtp", { user, otp: rest[0] }))) {
								return await USSDMessages.SESSION_END(user, ctx, "Wrong or expired OTP");
							}
							return await USSDMessages.REGISTER(user, ctx);
						}
					} if (command === "2") {
						const pin = rest[rest.length - 1];
						if (!pin) {
							return await USSDMessages.LOGIN_PROMPT();
						} else {
							if (await ctx.call("ussd.checkPin", { user, pin })) {
								user.ussdState = this.setUssdState(user);
								const userUpdated = await ctx.call("ussd.update", user);
								await ctx.call("identity.setSession", { user });
								return await this.stateMachine(userUpdated, ctx);
							} else {
								return await USSDMessages.LOGIN_PROMPT();
							}
						}
					} if (text === "0") {
						return await USSDMessages.SESSION_END(user, ctx, "Good Bye!");
					}
				}
					break;
				case ENUMS.ussdStates.REGISTER: {
					return await USSDMessages.REGISTER_CON(user, ctx);
				}
				case ENUMS.ussdStates.CONFIRM: {
					return await USSDMessages.CONFIRM_VCS(user, ctx);
				}
				case ENUMS.ussdStates.SUBSCRIBE: {
					return await USSDMessages.SUBSCRIBE(user, ctx);
				}
				case ENUMS.ussdStates.BAG: {
					return await USSDMessages.BAG(user, ctx);
				}
				case ENUMS.ussdStates.BUYAGREE: {
					return await USSDMessages.BUYAGREE(user, ctx);
				}
				case ENUMS.ussdStates.SELLAGREE: {
					return await USSDMessages.SELLAGREE(user, ctx);
				}
				case ENUMS.ussdStates.APPLY: {
					return await USSDMessages.APPLY(user, ctx);
				}
				case ENUMS.ussdStates.APPLY_CON: {
					return await USSDMessages.APPLY_CON(user, ctx);
				}
				default: {
					return await USSDMessages.SESSION_END(user, ctx, `${user.ussdState} state not implemented yet`);
				}
			}
		},
	}
	// async started() {
	// }



	/**
		* Settings
		*/
};
