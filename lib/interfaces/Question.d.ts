import { RichEmbed } from "discord.js";
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
     * The datatype which will be checked when the question is answered.
     */
    dataType?: string;
    /**
     * If datatype is `number`, then it will be checked if it's bigger than or equal to the length.
     * If datatype is `string`, then it will compare the string length to see if it's bigger than or equal to the length.
     */
    length?: number;
}
