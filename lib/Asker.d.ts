import { DMChannel, Message, TextChannel, User } from "discord.js";
import { Answer } from "./interfaces/Answer";
import { Question } from "./interfaces/Question";
import { Settings } from "./interfaces/Settings";
export declare class Asker {
    /**
     * Returns possible answers for a question, if possible.
     * @param bracketStyle Whether to use the bracket style [Y/n] for the possible answers or newLine (false).
     * @param question The question to get the possible answers for.
     */
    static getPossibleAnswers: (bracketStyle: boolean, question: Question) => string;
    private settings;
    private questions;
    private channel;
    private target;
    private currentQuestion;
    constructor(questions: Question[], settings: Settings, channel: TextChannel | DMChannel, target: User);
    ask: () => Promise<Answer[]>;
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
     * Shifts a question from the questions array, and returns it.
     */
    private getQuestionToSend;
    private handleReactionEvent;
    /**
     * Handler for the message event.
     * @param msg
     * @param question
     */
    private handleMessageEvent;
    private controllerHandler;
    private askQuestion;
}
