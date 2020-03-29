
export enum FlagErrorType {
  // When the USER has messed things up.
  USER_ERROR, // eslint-disable-line no-unused-vars
  // When the BOT somehow is screwed up.
  // This results in Promise rejection and console logging.
  BOT_ERROR, // eslint-disable-line no-unused-vars
}

/** Error for when a flag command fails. */
export class FlagCommandError extends Error {
  // From the enum above - whose fault this was: user or the bot.
  // When the human has failed, specify a userErrorMessage to reply with it.
  flagErrorType:FlagErrorType;
  // A short error message for the user who put in a bad command.
  userErrorMessage:string;

  /**
    * Make error.
    * @param {string} message - A short error message for the user about
    * why the command had an error. Only sent when the user has made an error.
    * @param {FlagErrorType} flagErrorType -Specifies if this was a human or
    * bot error.
    */
  constructor(message:string, flagErrorType:FlagErrorType) {
    super(message);
    this.flagErrorType = flagErrorType;
    this.userErrorMessage = message;
  }
}
