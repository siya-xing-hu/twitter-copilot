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
          "content":
            '你是一个内容翻译器，请将我给你的内容翻译成美式本地英文，JSON 格式输出，输出格式： {"result": ""}',
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

const TEMPLATES = [{
  template: `
    [Topic] 101:

    - Don't [Tip 1 negation], [Tip 1] 
    - Don't [Tip 2 negation], [Tip 2] 
    - Don't [Tip 3 negation], [Tip 3] 
    ...
    - Don't [Tip N negation], [Tip N]
  `,
  content_structure: `
    Topic: {Topic}
    - {Tip}
    - {Tip}
    - {Tip}
    ...
  `,
}, {
  template: `
    [Count of topics] [Topic] Hacks to [Achieve Outcome]
    1. [Hack 1]
    2. [Hack 2]
    3. [Hack 3]
    ...
    N. [Hack N]
  `,
  content_structure: `
    Topic: {Topic}

    Desired outcome: {Achieve Outcome}
    
    {Hack 1}
    {Hack 2}
    {Hack 3}
    ...
    {Hack N}
  `,
}];
