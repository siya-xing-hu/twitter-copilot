// 配置对象
const openConfig = {
  openaiApiKey: "",
  openaiOrganization: "",
  openaiChatModel: "gpt-3.5-turbo",
};

export default openConfig;

// 初始化 OpenAI 函数
export async function initOpenAI() {
  try {
    // 从 chrome.storage.local 获取数据
    const { openaiApiKey, openaiOrganization, openaiChatModel } = await chrome
      .storage.local.get([
        "openaiApiKey",
        "openaiOrganization",
        "openaiChatModel",
      ]);

    // 更新配置对象
    if (openaiApiKey) openConfig.openaiApiKey = openaiApiKey;
    if (openaiOrganization) openConfig.openaiOrganization = openaiOrganization;
    if (openaiChatModel) openConfig.openaiChatModel = openaiChatModel;

    console.log("OpenAI configuration initialized:", openConfig);
  } catch (error) {
    console.error("Error initializing OpenAI:", error);
  }
}
