import openConfig from "../config/openai-config";

// export async function openaiCreate(
//   messageData: any,
//   jsonFormate: boolean = true,
// ): Promise<any> {
//   if (!gptClient) {
//     return "openai config error!";
//   }

//   const response = await gptClient.chat.completions.create({
//     model: openConfig.openaiChatModel,
//     messages: messageData,
//     response_format: jsonFormate ? { type: "json_object" } : {},
//   });

//   return response.choices[0].message.content;
// }

export async function openaiCreate(
  messageData: any,
  jsonFormat: boolean = true,
): Promise<any> {
  if (!openConfig.openaiApiKey || !openConfig.openaiChatModel) {
    throw new Error("OpenAI config error!");
  }

  const reqBody = {
    model: openConfig.openaiChatModel,
    messages: messageData,
    response_format: jsonFormat ? { type: "json_object" } : {},
  };

  const headers: HeadersInit = {
    "Authorization": `Bearer ${openConfig.openaiApiKey}`,
    "Content-Type": "application/json",
  };

  if (openConfig.openaiOrganization) {
    headers["Openai-Organization"] = openConfig.openaiOrganization;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(reqBody),
  });

  const jsonData = await response.json();
  console.log(`openai result: ${JSON.stringify(jsonData)}`);
  return jsonData.choices[0].message.content;
}
