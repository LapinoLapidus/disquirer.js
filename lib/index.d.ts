import { Message, TextChannel, User } from "discord.js";
import { Answer } from "./interfaces/Answer";
import { Question } from "./interfaces/Question";
import { Settings } from "./interfaces/Settings";
export { Question } from "./interfaces/Question";
export { Answer } from "./interfaces/Answer";
export { Settings } from "./interfaces/Settings";
export declare class Disquirer {
    get questions(): Question[];
    set questions(value: Question[]);
    get settings(): Settings;
    private static reactionNumbers;
    private _settings;
    private _questions;
    private currentQuestion;
    private originalQuestion;
    /**
     * The constructor used to create a Disquirer object.
     * @param questions The questions to ask.
     * @param settings
     */
    constructor(questions: Question[], settings?: Settings);
    /**
     * Adds corresponding reactions for a single question.
     * @param msg
     * @param question
     */
    addReactions: (msg: Message, question: Question) => Promise<void>;
    /**
     * Get the reactions (unicode) for a given question.
     * @param question
     */
    getReactions: (question: Question) => string[];
    /**
     * Creates a prompt and returns the an answer array when done with asking all questions.
     * This is probably the method you're gonna use.
     * @param channel
     * @param target
     * @returns promise - Resolves with an array of answers. Rejects with an error.
     */
    createPrompt: (channel: TextChannel, target: User) => Promise<Answer[]>;
    /**
     * Returns possible answers for a question, if possible.
     * @param bracketStyle Whether to use the bracket style [Y/n] for the possible answers or newLine (false).
     * @param question The question to get the possible answers for.
     */
    getPossibleAnswers: (bracketStyle: boolean, question: Question) => string;
    private askQuestion;
    private controllerHandler;
    private handleReactionEvent;
    /**
     * Handler for the message event.
     * @param msg
     * @param question
     */
    private handleMessageEvent;
    /**
     * Shifts a question from the questions array, and returns it.
     */
    private getQuestionToSend;
}
