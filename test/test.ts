import test from "ava-ts";
import { Client, RichEmbed, TextChannel } from "discord.js";
import * as dotenv from "dotenv";
import { Disquirer, Question } from "../src";
import { Asker } from "../src/Asker";
import { Settings } from "../src/interfaces/Settings";

dotenv.config();

const bot = new Client();
bot.login(process.env.TOKEN);

// Horrible code but works. :shrug:
let promiseResolve;
let promiseReject;

const promise = new Promise<void>((resolve, reject) => {
  promiseResolve = resolve;
  promiseReject = reject;
});

bot.once("ready", async () => {
  promiseResolve();
});

let disq: Disquirer;

test("Check if object is creatable.", t => {
  t.truthy(
    (disq = new Disquirer(
      [
        { text: "Does this work?", possibleAnswers: ["yes", "no"], reactionMethod: "reaction" },
        { text: "Are you sure?", possibleAnswers: ["I really am", "Not really no."], reactionMethod: "reaction" },
        { text: "Guess it works, could you confirm?", possibleAnswers: ["y", "n"], reactionMethod: "text" },
        {
          possibleAnswers: ["Okay", "Sure", "No Way"],
          reactionMethod: "reaction",
          style: "bracket",
          text: "Just once more?"
        },
        { text: "Really sure?", possibleAnswers: ["Yes.."], reactionMethod: "text", style: "newLine" },
        {
          possibleAnswerRequired: true,
          possibleAnswers: ["Finally", "Good job"],
          text: "Seriously, last question. Possible answers required here."
        },
        { text: "Possible answers not required here.", possibleAnswers: ["Got it"], possibleAnswerRequired: false }
      ] as Question[],
      {
        invalidReactionMessage: "Invalid reaction.",
        invalidAnswerMessage: "Invalid answer."
      } as Settings
    ))
  );
});

test("Check the possible answers for brackets style.", t => {
  t.is(Asker.getPossibleAnswers(true, { text: "Are you good?", possibleAnswers: ["Y", "n"] } as Question), "[Y/n]");
});

test("Check the default values with no Settings object.", t => {
  t.deepEqual(new Disquirer(null).settings, {
    invalidAnswerMessage: "Not a valid answer.",
    invalidAnswerDeletionTime: 5000,
    invalidReactionMessage: "You didn't add a valid reaction.",
    invalidReactionDeletionTime: 5000
  } as Settings);
});

test("Check the default values with only invalidAnswerMessage.", t => {
  t.deepEqual(new Disquirer(null, { invalidAnswerMessage: "a" } as Settings).settings, {
    invalidAnswerMessage: "a",
    invalidAnswerDeletionTime: 5000,
    invalidReactionMessage: "You didn't add a valid reaction.",
    invalidReactionDeletionTime: 5000
  } as Settings);
});

test("Check the default values with only invalidAnswerDeletionTime and previous.", t => {
  t.deepEqual(new Disquirer(null, { invalidAnswerMessage: "a", invalidAnswerDeletionTime: 10 } as Settings).settings, {
    invalidAnswerMessage: "a",
    invalidAnswerDeletionTime: 10,
    invalidReactionMessage: "You didn't add a valid reaction.",
    invalidReactionDeletionTime: 5000
  } as Settings);
});

test("Check the default values with only invalidReactionMessage and previous.", t => {
  t.deepEqual(
    new Disquirer(null, {
      invalidAnswerMessage: "a",
      invalidAnswerDeletionTime: 10,
      invalidReactionMessage: "b"
    } as Settings).settings,
    {
      invalidAnswerMessage: "a",
      invalidAnswerDeletionTime: 10,
      invalidReactionMessage: "b",
      invalidReactionDeletionTime: 5000
    } as Settings
  );
});

test("Check the default values with only invalidReaction and previous.", t => {
  t.deepEqual(
    new Disquirer(null, {
      invalidAnswerMessage: "a",
      invalidAnswerDeletionTime: 10,
      invalidReactionMessage: "b",
      invalidReactionDeletionTime: 20
    } as Settings).settings,
    {
      invalidAnswerMessage: "a",
      invalidAnswerDeletionTime: 10,
      invalidReactionMessage: "b",
      invalidReactionDeletionTime: 20
    } as Settings
  );
});

test("Test prompt.", async t => {
  await promise;
  const answers = await disq.createPrompt(
    ((await bot.users.get(process.env.USER_ID).createDM()) as unknown) as TextChannel,
    bot.users.get(process.env.USER_ID)
  );
  t.truthy(answers);
});

test("Test prompt with filter: length = 1.", async t => {
  const answers = await new Disquirer([
    {
      text: "Would you respond with text of a length of 1?",
      reactionMethod: "text",
      possibleAnswerRequired: false,
      filter: answer => answer.response.length === 1
    }
  ] as Question[]).createPrompt(bot.users.get(process.env.USER_ID).dmChannel, bot.users.get(process.env.USER_ID));
  t.truthy(answers);
});

test("Test prompt with embed.", async t => {
  const answers = await new Disquirer([
    {
      text: new RichEmbed().setDescription("Hello").addField("Gamer", "Yes"),
      reactionMethod: "reaction",
      possibleAnswers: ["Ok"]
    }
  ] as Question[]).createPrompt(
    ((await bot.users.get(process.env.USER_ID).createDM()) as unknown) as TextChannel,
    bot.users.get(process.env.USER_ID)
  );
  t.truthy(answers);
});

test("Test prompt with single question, bracket style with reaction.", async t => {
  const answers = await new Disquirer([
    { text: "Testing one question.", reactionMethod: "reaction", possibleAnswers: ["Ok"] }
  ] as Question[]).createPrompt(
    ((await bot.users.get(process.env.USER_ID).createDM()) as unknown) as TextChannel,
    bot.users.get(process.env.USER_ID)
  );
  t.truthy(answers);
});
