# Disquirer.js

### Purpose
This library creates an interactive experience between a user and a Discord bot. 
You could compare the front-end of it to something like [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/)
![disquirer.js](https://i.imgur.com/cKdPh9Q.gif)
### Installation
NPM: `npm install LapinoLapidus/disquirer.js`.

### Usage
Create a new Disquirer object.
```typescript
import { Disquirer } from "disquirer.js";
import { Question } from "disquirer.js";

// Pass an array of questions as argument
const disquirer = new Disquirer([{}] as Question[])

// TEXT_CHANNEL is an object of type TextChannel, USER is an object of type User from discord.js. 
const answers = await disquirer.createPrompt(TEXT_CHANNEL, USER);
```
Disquirer#createPrompt returns a Promise containing an array of [Answer](https://lapinolapidus.github.io/disquirer.js-docs/interfaces/_interfaces_answer_.answer.html)s.
Documentation for the Question and Answer interfaces can be found [here for Answer](https://lapinolapidus.github.io/disquirer.js-docs/interfaces/_interfaces_answer_.answer.html) and [here for question](https://lapinolapidus.github.io/disquirer.js-docs/interfaces/_interfaces_question_.question.html)
For more examples, please refer to the [test file](test/test.ts),
### TODO: 
- Input validation: (length, type, ..).

### Tests
To run tests, fill in the required values in `.env`. To get this file, simply move `.env.example` to `.env`. Tests run in Discord and thus require user interaction there.

### Documentation
Documentation can be found [here](https://lapinolapidus.github.io/disquirer.js-docs/index.html).

### Contributing
Feel free to contribute to the project, the code's a bit messy though but you can change that. To start, fork this, make your changes, and make a pull request.
Please use prettier to format your code (should be automatically run on commit.)
Found a bug? Report it as an issue.

### Credits
The [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/) project for the original idea.

### License
MIT License