import {
  DMChannel,
  Message,
  MessageCollector,
  MessageReaction,
  ReactionCollector,
  RichEmbed,
  TextChannel,
  User
} from "discord.js";
import { Disquirer } from "./index";
import { Answer } from "./interfaces/Answer";
import { Question } from "./interfaces/Question";
import { Settings } from "./interfaces/Settings";

export class Asker {
  /**
   * Returns possible answers for a question, if possible.
   * @param bracketStyle Whether to use the bracket style [Y/n] for the possible answers or newLine (false).
   * @param question The question to get the possible answers for.
   */
  public static getPossibleAnswers = (bracketStyle: boolean, question: Question): string => {
    // TODO: add prefix
    let suffix: string;
    if (!question.possibleAnswers) {
      return "";
    }
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
  private settings: Settings;
  private questions: Question[];
  private channel: TextChannel | DMChannel;
  private target: User;
  private currentQuestion: Question;

  constructor(questions: Question[], settings: Settings, channel: TextChannel | DMChannel, target: User) {
    this.settings = settings;
    this.questions = questions;
    this.channel = channel;
    this.target = target;
  }

  public ask = async (): Promise<Answer[]> => {
    const question = this.getQuestionToSend();

    // const questionsText: string[] = this._questions.map(question => question.text);
    // Create a suffix for the message so the questions are in a clear format.
    if (question.possibleAnswers && question.possibleAnswers.length > 9) {
      return Promise.reject("Please do not add more than 9 possible answers to the possibleAnswers array.");
    }

    const message = (await this.channel.send(
      question.text instanceof RichEmbed
        ? question.text
        : question.text +
            (question.possibleAnswers ? Asker.getPossibleAnswers(question.style === "bracket", question) : "")
    )) as Message;
    question.reactionMethod === "reaction" ? this.addReactions(message, question) : "";
    const collector: ReactionCollector | MessageCollector =
      question.reactionMethod === "reaction"
        ? message.createReactionCollector((reaction, user: User) => user.id === this.target.id)
        : this.channel.createMessageCollector((collectedMsg: Message) => collectedMsg.author.id === this.target.id);

    let promiseResolve;
    let promiseReject;

    const prom = new Promise<Message[] | MessageReaction[]>((resolve, reject) => {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    const answers: Answer[] = [];
    collector.on("collect", async (element: MessageReaction | Message, coll: MessageCollector | ReactionCollector) => {
      this.controllerHandler(this.channel, this.target, element, answers, promiseResolve, question, coll);
    });
    await prom;
    return Promise.resolve(answers);
  };

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
   * Shifts a question from the questions array, and returns it.
   */
  private getQuestionToSend = (): Question => {
    this.currentQuestion = this.questions.shift();
    return this.currentQuestion;
  };
  private handleReactionEvent = (reaction: MessageReaction, question: Question): Answer | null => {
    // Checks if reaction is valid.
    if (!this.getReactions(question).includes(reaction.emoji.name)) {
      const msg: Promise<Message> = reaction.message.channel.send(this.settings.invalidReactionMessage) as Promise<
        Message
      >;
      msg.then(m => m.delete(this.settings.invalidReactionDeletionTime));
      // Adds the unfinished question back to the array.
      this.questions.unshift(question);
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
  private handleMessageEvent = async (msg: Message, question: Question): Promise<Answer | null> => {
    const possibleAnswers = question.possibleAnswers
      ? question.possibleAnswers.map(answer => answer.toLocaleLowerCase())
      : [];

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
          .send(this.settings.invalidAnswerMessage)
          .then((m: Message) => m.delete(this.settings.invalidAnswerDeletionTime));
        // Adds the unfinished question back to the array.
        this.questions.unshift(question);
        return;
      }
    }

    const filterPassed = this.currentQuestion.filter
      ? await this.currentQuestion.filter({
          response:
            possibleAnswers[Number(msg.content)] === undefined ? msg.content : possibleAnswers[Number(msg.content)],
          responseId: Number(msg.content),
          userAnswer: msg
        } as Answer)
      : true;
    if (filterPassed) {
      return {
        response: msg.content,
        responseId: Number(
          Object.keys(possibleAnswers).find(key => possibleAnswers[key] === msg.content.toLocaleLowerCase())
        ),
        userAnswer: msg
      } as Answer;
    }
    msg.channel
      .send(this.settings.invalidAnswerMessage)
      .then((m: Message) => m.delete(this.settings.invalidAnswerDeletionTime));
    // Adds the unfinished question back to the array.
    this.questions.unshift(question);
    return;
  };

  private controllerHandler = async (
    channel: TextChannel | DMChannel,
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
        : await this.handleMessageEvent(element as Message, question);
    answers.push(answer);
    //
    collector.removeAllListeners();

    if (this.questions.length !== 0) {
      return this.askQuestion(channel, target, answers, promiseResolve);
    }
    promiseResolve(answers);
  };
  private askQuestion = async (
    channel: TextChannel | DMChannel,
    target: User,
    answers: Answer[],
    promiseResolve
  ): Promise<void> => {
    const question = this.getQuestionToSend();
    const message = (await channel.send(
      question.text instanceof RichEmbed
        ? question.text
        : question.text +
            (question.possibleAnswers ? Asker.getPossibleAnswers(question.style === "bracket", question) : "")
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
}
const toWords = (num: number): string => {
  switch (num) {
    case 0:
      return "zero";
    case 1:
      return "one";
    case 2:
      return "two";
    case 3:
      return "three";
    case 4:
      return "four";
    case 5:
      return "five";
    case 6:
      return "six";
    case 7:
      return "seven";
    case 8:
      return "eight";
    case 9:
      return "nine";
  }
};
