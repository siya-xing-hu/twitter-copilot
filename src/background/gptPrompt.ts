import { ButtonTag } from "../utils/common";
import { openaiCreate } from "../utils/openai";

export async function execGptPrompt(
  tag: ButtonTag,
  content: string,
): Promise<string> {
  let messageData = [];

  switch (tag) {
    case ButtonTag.Translate:
      messageData = [
        {
          "role": "system",
          "content": `
            This GPT, named Translate Mate, specializes in translating between Chinese and English, focusing on a detailed, three-phase translation process. The first phase involves directly translating the text from Chinese to English (or vice versa), ensuring no details are lost and the original layout is intact. In the second phase, Translate Mate documents specific issues encountered in the initial translation, such as discrepancies with typical language usage, disrupted flow, and sections that might be vague or difficult to understand. This phase does not involve suggesting improvements but rather identifying areas that need attention. In the third phase, Translate Mate conducts a paraphrased translation considering both the initial translation and the identified issues. This final translation aims to retain the original intent of the text while ensuring it is accessible, adheres to English academic writing conventions (or the respective conventions if translating to Chinese), and preserves the format as originally presented.
            When the input language is Chinese, Translate Mate will output an English translation; when the input language is English, it will output a Chinese translation. The GPT asks for clarification if the input is ambiguous or lacks context, aiming to provide the most accurate translation possible. It maintains a friendly and helpful demeanor throughout.
            Output format with JSON: {"result": ""}`,
        },
        {
          "role": "user",
          "content": `${content}`,
        },
      ];
      break;
    case ButtonTag.Generate:
      // 随机取一个模板
      const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
      messageData = [
        {
          "role": "system",
          "content":
            'You are provided with three components: a TEMPLATE, a CONTENT_STRUCTURE, and an INPUT. Your task is to generate a new piece of text as described below:\n\nUnderstand the Components:\n-TEMPLATE: This is a pre-defined format you will ultimately fill in.\n-CONTENT_STRUCTURE: This outlines how to structure the INPUT data.\n-INPUT: This is the specific content or data you must use.\n\nExecution Steps:\n-Step 1: Apply the INPUT to the CONTENT_STRUCTURE. Integrate the specific data (INPUT) into the outlined structure (CONTENT_STRUCTURE) while ensuring that essential ideas and functions from the INPUT are preserved and clearly represented.\n-Step 2: Use the structured content from Step 1 to fill in the TEMPLATE. Adjust the content as necessary to fit within the pre-defined TEMPLATE format.\n-Step 3: Make minor adjustments to the TEMPLATE if necessary to better fit the context of the content.\n\nOutput Requirements(Important):\n-The final output must be concise, with a character limit of 280 characters.\n-Use straightforward, impactful sentences.\n-Avoid verbose or exaggerated writing.\n-The response should directly provide the revised or requested content without any extraneous explanation or commentary.\n-Refrain from using overly promotional language (e.g., "game-changing, unlock, master, skyrocket, revolutionize").\n-The output only needs to include the revised content; no additional analysis or explanation is required. Use English language only. Output with Json format: {"result": ""}\n',
        },
        {
          "role": "user",
          "content":
            `Components Definitions:\n- TEMPLATE: ${template.template}\n\n----------------\n- CONTENT_STRUCTURE:\n${template.content_structure}\n\n----------------\n- INPUT: ${content}`,
        },
      ];
      break;
    default:
      messageData = [
        {
          "role": "system",
          "content":
            '你是一个 twitter 内容回复者，我需要你按照用户的回复要求，结合待回复的原文，生成一条回复内容，用英文输出，JSON 格式输出，输出格式： {"result": ""}',
        },
        {
          "role": "user",
          "content": `Replies to tweet: '${content}', Reply style: '${tag}'`,
        },
      ];
  }

  const res = await openaiCreate(messageData);
  const result_json = JSON.parse(res);
  return Promise.resolve(result_json.result);
}

const TEMPLATES = [
  // {
  //   template: `
  //   [Topic] 101:

  //   - Don't [Tip 1 negation], [Tip 1] 
  //   - Don't [Tip 2 negation], [Tip 2] 
  //   - Don't [Tip 3 negation], [Tip 3] 
  //   ...
  //   - Don't [Tip N negation], [Tip N]
  // `,
  //   content_structure: `
  //   Topic: {Topic}
  //   - {Tip}
  //   - {Tip}
  //   - {Tip}
  //   ...
  // `,
  // },
  // {
  //   template: `
  //   [Count of topics] [Topic] Hacks to [Achieve Outcome]
  //   1. [Hack 1]
  //   2. [Hack 2]
  //   3. [Hack 3]
  //   ...
  //   N. [Hack N]
  // `,
  //   content_structure: `
  //   Topic: {Topic}

  //   Desired outcome: {Achieve Outcome}
    
  //   {Hack 1}
  //   {Hack 2}
  //   {Hack 3}
  //   ...
  //   {Hack N}
  // `,
  // },
  {
    template: `
    How do you prefer to [do something]?

    1. [case 1]
    2. [case 2]
    3. [case 3]
    ...
    N. [case N]

    Or something else?
  `,
    content_structure: `
    Action: {do something}

    The cases you prefer: {case 1}, {case 2}, {case 3}, ..., {case N}
  `,
  },
];
