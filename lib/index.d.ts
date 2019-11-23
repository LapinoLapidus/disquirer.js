import { TextChannel, User } from "discord.js";
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
    static reactionNumbers: string[];
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
     * Creates a prompt and returns the an answer array when done with asking all questions.
     * This is probably the method you're gonna use.
     * @param channel
     * @param target
     * @returns promise - Resolves with an array of answers. Rejects with an error.
     */
    createPrompt: (channel: TextChannel, target: User) => Promise<Answer[]>;
}
