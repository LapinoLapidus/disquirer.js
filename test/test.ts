import test from "ava-ts";
import { Client, TextChannel } from "discord.js";
import * as dotenv from "dotenv";
import { Disquirer, Question } from "../src";

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
    (disq = new Disquirer([
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
    ] as Question[]))
  );
});

test("Check the possible answers for brackets style.", t => {
  t.is(disq.getPossibleAnswers(true, { text: "Are you good?", possibleAnswers: ["Y", "n"] } as Question), "[Y/n]");
});

test("Test prompt.", async t => {
  await promise;
  const answers = await disq.createPrompt(
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
