export interface Settings {
    /**
     * The message to send when a valid answer isn't given.
     * @default Not a valid answer.
     */
    invalidAnswerMessage: string;
    /**
     * The time to wait (in ms) before the message is deleted.
     * @default 5000
     */
    invalidAnswerDeletionTime: number;
    /**
     * The message to send when a valid reaction isn't given.
     * @default You didn't add a valid reaction.
     */
    invalidReactionMessage: string;
    /**
     * The time to wait (in ms) before the message is deleted.
     * @default 5000
     */
    invalidReactionDeletionTime: number;
}
