import { DMChannel, TextChannel, User } from "discord.js";
import { Asker } from "./Asker";
import { Answer } from "./interfaces/Answer";
import { Question } from "./interfaces/Question";
import { Settings } from "./interfaces/Settings";

export { Question } from "./interfaces/Question";
export { Answer } from "./interfaces/Answer";
export { Settings } from "./interfaces/Settings";

export class Disquirer {
  public get questions(): Question[] {
    return this._questions;
  }

  public set questions(value: Question[]) {
    this._questions = value;
  }

  public get settings(): Settings {
    return this._settings;
  }

  // public get prefix(): string {
  //   return this._prefix;
  // }
  //
  // public set prefix(prefix: string) {
  //   this._prefix = prefix;
  // }

  // [0] = :zero: 0️⃣
  public static reactionNumbers = [
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

  // private _prefix: string;
  private _settings: Settings;
  private _questions: Question[];
  private currentQuestion: Question;
  private originalQuestion: Question[];

  /**
   * The constructor used to create a Disquirer object.
   * @param questions The questions to ask.
   * @param settings
   */
  public constructor(questions: Question[], settings?: Settings) {
    // this._prefix = prefix;
    // Create default settings object if absent
    this._settings = settings
      ? settings
      : ({
          invalidAnswerMessage: "Not a valid answer.",
          invalidAnswerDeletionTime: 5000,
          invalidReactionMessage: "You didn't add a valid reaction.",
          invalidReactionDeletionTime: 5000
        } as Settings);

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

  /**
   * Creates a prompt and returns the an answer array when done with asking all questions.
   * This is probably the method you're gonna use.
   * @param channel
   * @param target
   * @returns promise - Resolves with an array of answers. Rejects with an error.
   */
  public createPrompt = async (channel: TextChannel | DMChannel, target: User): Promise<Answer[]> => {
    return new Asker([...this._questions], this._settings, channel, target).ask();
  };
}
