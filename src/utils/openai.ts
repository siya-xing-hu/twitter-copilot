export async function openaiCreate(
  messageData: any,
  jsonFormate: boolean = true,
): Promise<any> {
  const OPENAI_API_KEY = globalThis.config?.openaiApiKey;
  const OPENAI_ORGANIZATION = globalThis.config?.openaiOrganization;
  const OPENAI_CHAT_MODEL = globalThis.config?.openaiChatModel;

  if (!OPENAI_API_KEY || !OPENAI_ORGANIZATION || !OPENAI_CHAT_MODEL) {
    return "openai config error!";
  }

  const reqBody = {
    model: OPENAI_CHAT_MODEL,
    messages: messageData,
    response_format: {},
  };
  if (jsonFormate) {
    reqBody.response_format = { type: "json_object" };
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Organization": OPENAI_ORGANIZATION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  });
  const jsonData = await response.json();
  console.log(`openai result: ${JSON.stringify(jsonData)}`);
  return jsonData.choices[0].message.content;
}
