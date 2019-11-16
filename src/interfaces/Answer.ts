import { Message, MessageReaction } from "discord.js";

export interface Answer {
  /**
   * The response that the user gave to the question.
   */
  response: string;
  /**
   * Is NaN when possibleAnswerRequired = false in the Question interface and when an exact possible answer isn't given.
   */
  responseId: number;
  /**
   * Either the MessageReaction or the Message, depending on whether the reactionMethod = "reaction" or "text".
   */
  userAnswer: Message | MessageReaction;
}
