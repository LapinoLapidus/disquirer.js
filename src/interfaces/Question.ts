import { RichEmbed } from "discord.js";
import { Answer } from "./Answer";

export interface Question {
  /**
   * The question.
   */
  text: RichEmbed | string;
  /**
   * An array of possible answers for the question.
   * Required for a question with reaction for reactionMethod.
   * When using reactionMethod = "reaction", put a reaction here.
   */
  possibleAnswers?: string[];
  /**
   * The style to display the answers.
   * For example: bracket:
   * Do you want to.. [Y/n]
   * For example: newLine:
   * Do you want to..
   * 0: Y
   * 1: n
   */
  /**
   * Makes it possible for the user to deviate from possible answers and send their own text.
   * Whether or not a possible answer is required.
   * Only has effect when using reactionMethod = "text"
   * @default true
   */
  possibleAnswerRequired?: boolean;
  /**
   * Sets the style to either "bracket" or "newLine".
   * Bracket: [Y/n]
   * Newline:
   * 1: a
   * 2: b
   * 3: c
   */
  style: "bracket" | "newLine";
  /**
   * Whether you want the user to type out their response (text) or click on an emoji (reaction).
   */
  reactionMethod: "text" | "reaction";
  /**
   * Filter the answer to check if it fits your criteria.
   *
   * If you return `true`, the answer is accepted.<br />
   * If you return `false`, the question gets asked again until there is a sufficient answer.
   *
   * Example that checks if length of the answer is equal to 1:
   *
   * ```(answer) => answer.response.length === 1```
   *
   */
  filter: (answer: Answer) => boolean;
}
