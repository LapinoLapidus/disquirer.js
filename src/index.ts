import { Message, MessageCollector, MessageReaction, ReactionCollector, TextChannel, User } from "discord.js";
import { toWords } from "number-to-words";
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
  private static reactionNumbers = [
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

  //private _prefix: string;
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
    //this._prefix = prefix;
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
   * Adds corresponding reactions for a single question.
   * @param msg
   * @param question
   */
  public addReactions = async (msg: Message, question: Question): Promise<void> => {
    let promiseReject;
    const prom = new Promise<void>((resolve, reject) => {
      promiseReject = reject;
    });
    let count = 0;
    for (const ignored of question.possibleAnswers) {
      await msg.react(Disquirer.reactionNumbers[count]).catch(e => promiseReject(e));
      count++;
    }
    return prom;
  };

  /**
   * Get the reactions (unicode) for a given question.
   * @param question
   */
  public getReactions = (question: Question): string[] => {
    let count = 0;
    const reactions = [];
    for (const ignored of question.possibleAnswers) {
      reactions.push(Disquirer.reactionNumbers[count]);
      count++;
    }
    return reactions;
  };

  /**
   * Creates a prompt and returns the an answer array when done with asking all questions.
   * This is probably the method you're gonna use.
   * @param channel
   * @param target
   * @returns promise - Resolves with an array of answers. Rejects with an error.
   */
  public createPrompt = async (channel: TextChannel, target: User): Promise<Answer[]> => {
    // TODO: move to askQuestion function.
    this._questions = this.originalQuestion;
    const question = this.getQuestionToSend();

    // const questionsText: string[] = this._questions.map(question => question.text);
    // Create a suffix for the message so the questions are in a clear format.
    const possibleAnswers = this.getPossibleAnswers(question.style === "bracket", question);
    if (!possibleAnswers) {
      return Promise.reject("Please do not add more than 9 answers to the possibleAnswers array.");
    }

    const message = (await channel.send(question.text + possibleAnswers)) as Message;
    question.reactionMethod === "reaction" ? this.addReactions(message, question) : "";
    const collector: ReactionCollector | MessageCollector =
      question.reactionMethod === "reaction"
        ? message.createReactionCollector((reaction, user: User) => user.id === target.id)
        : channel.createMessageCollector((collectedMsg: Message) => collectedMsg.author.id === target.id);

    let promiseResolve;
    let promiseReject;

    const prom = new Promise<Message[] | MessageReaction[]>((resolve, reject) => {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    const answers: Answer[] = [];
    collector.on("collect", async (element: MessageReaction | Message, coll: MessageCollector | ReactionCollector) => {
      this.controllerHandler(channel, target, element, answers, promiseResolve, question, coll);
    });
    await prom;
    return Promise.resolve(answers);
  };

  /**
   * Returns possible answers for a question, if possible.
   * @param bracketStyle Whether to use the bracket style [Y/n] for the possible answers or newLine (false).
   * @param question The question to get the possible answers for.
   */
  public getPossibleAnswers = (bracketStyle: boolean, question: Question): string => {
    // TODO: add prefix
    let suffix: string;
    if (bracketStyle) {
      suffix = "[";
      question.possibleAnswers.forEach(answer => (suffix += `/${answer}`));
      // Remove the trailing slash.
      suffix = suffix.replace("/", "");
      suffix += "]";
    } else {
      suffix = "\n";
      let count = 0;
      question.possibleAnswers.forEach(answer => {
        if (count > 9) {
          return undefined;
        }
        // if (!question.prefix) {
        if (question.reactionMethod === "reaction") {
          suffix += `${count === 0 ? "" : "\n"}:${toWords(count)}:: ${answer}`;
        } else {
          suffix += `${count === 0 ? "" : "\n"}${count}: ${answer}`;
        }
        // }
        count++;
      });
    }

    return suffix;
  };

  private askQuestion = async (
    channel: TextChannel,
    target: User,
    answers: Answer[],
    promiseResolve
  ): Promise<void> => {
    const question = this.getQuestionToSend();
    const message = (await channel.send(
      question.text + this.getPossibleAnswers(question.style === "bracket", question)
    )) as Message;
    question.reactionMethod === "reaction" ? this.addReactions(message, question) : "";

    const collector: ReactionCollector | MessageCollector =
      question.reactionMethod === "reaction"
        ? message.createReactionCollector((reaction, user: User) => user.id === target.id)
        : channel.createMessageCollector((collectedMsg: Message) => collectedMsg.author.id === target.id);
    collector.on("collect", async (element: MessageReaction | Message, coll: MessageCollector | ReactionCollector) => {
      this.controllerHandler(channel, target, element, answers, promiseResolve, question, coll);
    });

    return Promise.resolve();
  };

  private controllerHandler = (
    channel: TextChannel,
    target: User,
    element,
    answers: Answer[],
    promiseResolve,
    question: Question,
    collector: MessageCollector | ReactionCollector
  ) => {
    // Check if reaction or message, and execute the corresponding function.
    const answer: Answer | null =
      element instanceof MessageReaction
        ? this.handleReactionEvent(element as MessageReaction, question)
        : this.handleMessageEvent(element as Message, question);
    answers.push(answer);
    //
    collector.removeAllListeners();

    if (this._questions.length !== 0) {
      return this.askQuestion(channel, target, answers, promiseResolve);
    }
    promiseResolve(answers);
  };

  private handleReactionEvent = (reaction: MessageReaction, question: Question): Answer | null => {
    // Checks if reaction is valid.
    if (!this.getReactions(question).includes(reaction.emoji.name)) {
      const msg: Promise<Message> = reaction.message.channel.send(this._settings.invalidReactionMessage) as Promise<
        Message
      >;
      msg.then(m => m.delete(this._settings.invalidReactionDeletionTime));
      // Adds the unfinished question back to the array.
      this._questions.unshift(question);
      return null;
    }
    return {
      response: question.possibleAnswers[reaction.emoji.name[0]],
      responseId: Number(reaction.emoji.name[0]),
      userAnswer: reaction
    } as Answer;
  };

  /**
   * Handler for the message event.
   * @param msg
   * @param question
   */
  private handleMessageEvent = (msg: Message, question: Question): Answer | null => {
    const possibleAnswers = question.possibleAnswers.map(answer => answer.toLocaleLowerCase());

    // Defaults possibleAnswerRequired to true.
    question.possibleAnswerRequired === undefined
      ? (question.possibleAnswerRequired = true)
      : (question.possibleAnswerRequired = question.possibleAnswerRequired);
    if (question.possibleAnswerRequired && !possibleAnswers.includes(msg.content.toLocaleLowerCase())) {
      // Checks if user maybe answered with a key (i.e. 0) instead of a value (i.e. yes).
      if (!isNaN(parseInt(msg.content, 10)) && question.possibleAnswers[Number(msg.content)]) {
        return {
          response: possibleAnswers[Number(msg.content)],
          responseId: Number(msg.content),
          userAnswer: msg
        } as Answer;
      } else {
        msg.channel
          .send(this._settings.invalidAnswerMessage)
          .then((m: Message) => m.delete(this._settings.invalidAnswerDeletionTime));
        // Adds the unfinished question back to the array.
        this._questions.unshift(question);
        return;
      }
    }

    return {
      response: msg.content,
      responseId: Number(
        Object.keys(possibleAnswers).find(key => possibleAnswers[key] === msg.content.toLocaleLowerCase())
      ),
      userAnswer: msg
    } as Answer;
  };

  /**
   * Shifts a question from the questions array, and returns it.
   */
  private getQuestionToSend = (): Question => {
    this.currentQuestion = this._questions.shift();
    return this.currentQuestion;
  };
}
