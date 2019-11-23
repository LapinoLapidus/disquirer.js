"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Asker_1 = require("./Asker");
class Disquirer {
    /**
     * The constructor used to create a Disquirer object.
     * @param questions The questions to ask.
     * @param settings
     */
    constructor(questions, settings) {
        /**
         * Creates a prompt and returns the an answer array when done with asking all questions.
         * This is probably the method you're gonna use.
         * @param channel
         * @param target
         * @returns promise - Resolves with an array of answers. Rejects with an error.
         */
        this.createPrompt = async (channel, target) => {
            return new Asker_1.Asker([...this._questions], this._settings, channel, target).ask();
        };
        //this._prefix = prefix;
        // Create default settings object if absent
        this._settings = settings
            ? settings
            : {
                invalidAnswerMessage: "Not a valid answer.",
                invalidAnswerDeletionTime: 5000,
                invalidReactionMessage: "You didn't add a valid reaction.",
                invalidReactionDeletionTime: 5000
            };
        // Set defaults
        this._settings.invalidAnswerMessage = this._settings.invalidAnswerMessage
            ? this._settings.invalidAnswerMessage
            : "Not a valid answer.";
        this._settings.invalidAnswerDeletionTime = this._settings.invalidAnswerDeletionTime
            ? this._settings.invalidAnswerDeletionTime
            : 5000;
        this._settings.invalidReactionMessage = this._settings.invalidReactionMessage
            ? this._settings.invalidReactionMessage
            : "You didn't add a valid reaction.";
        this._settings.invalidReactionDeletionTime = this._settings.invalidReactionDeletionTime
            ? this._settings.invalidReactionDeletionTime
            : 5000;
        this._questions = questions;
        this.originalQuestion = questions;
    }
    get questions() {
        return this._questions;
    }
    set questions(value) {
        this._questions = value;
    }
    get settings() {
        return this._settings;
    }
}
exports.Disquirer = Disquirer;
// public get prefix(): string {
//   return this._prefix;
// }
//
// public set prefix(prefix: string) {
//   this._prefix = prefix;
// }
// [0] = :zero: 0️⃣
Disquirer.reactionNumbers = [
    "\u0030\u20E3",
    "\u0031\u20E3",
    "\u0032\u20E3",
    "\u0033\u20E3",
    "\u0034\u20E3",
    "\u0035\u20E3",
    "\u0036\u20E3",
    "\u0037\u20E3",
    "\u0038\u20E3",
    "\u0039\u20E3"
];
