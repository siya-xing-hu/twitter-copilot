import {
  ButtonTag,
  isContent,
  MessageType,
  setInputText,
} from "../utils/common";
import { generateContent } from "./util/sendBackground";
import {
  ButtonData,
  ButtonLocationEnum,
  createButtonContainer,
  HandlerParams,
} from "./button";
import { createDialogContainer } from "./dialog";
import { execObserver } from "./util/mutationObserver";
import { translateContent } from "./translate";

export const translateConfig = {
  xTranslate: false,
};

export async function ttTwitterInit(): Promise<void> {
  execObserver(document.body, async () => {
    return await ttTwitterPost();
  });

  execObserver(document.body, async () => {
    return await ttTwitterReply();
  });

  execObserver(document.body, async () => {
    return await ttTwitterDM();
  });

  execObserver(document.body, async () => {
    return await ttTwitterDM2();
  });

  if (translateConfig.xTranslate) {
    execObserver(document.body, async () => {
      if (translateConfig.xTranslate) {
        await ttTwitterTranslate();
        return false;
      }
      return false;
    });
  }
}

async function ttTwitterPost(): Promise<boolean> {
  const mainWrapper = document.querySelector(
    "main[role=main] div[data-testid=primaryColumn]",
  );
  const tweetTextareaWrapper = mainWrapper?.querySelector(
    "div[data-testid=tweetTextarea_0]",
  ) as HTMLElement;
  const toolBarParentWrapper = mainWrapper?.querySelector(
    "div[data-testid=toolBar]",
  );

  if (!toolBarParentWrapper || !tweetTextareaWrapper) {
    return false;
  }

  // 添加翻译按钮响应事件
  if (toolBarParentWrapper.getAttribute("tt-button-is-done") === "true") {
    return false;
  }

  const buttonList: ButtonData[] = [
    {
      disabled: false,
      tag: ButtonTag.Generate,
      text: "✨ Generate",
      params: { data: { mainWrapper } },
      handler: generateHandle,
    },
    {
      disabled: false,
      tag: ButtonTag.Translate,
      text: "🌎 Translate",
      params: { data: { mainWrapper } },
      handler: generateHandle,
    },
  ];

  createButtonContainer(
    toolBarParentWrapper as HTMLElement,
    ButtonLocationEnum.Previous,
    buttonList,
  );

  return true;
}

async function ttTwitterReply(): Promise<boolean> {
  const mainWrapper = document.querySelector("div[role=dialog]");
  const tweetTextareaWrapper = mainWrapper?.querySelector(
    "div[data-testid=tweetTextarea_0]",
  ) as HTMLElement | null;
  const toolBarParentWrapper = mainWrapper?.querySelector(
    "div[data-testid=toolBar]",
  );

  if (!toolBarParentWrapper || !tweetTextareaWrapper) {
    return false;
  }

  if (toolBarParentWrapper.getAttribute("tt-button-is-done") === "true") {
    return false;
  }

  const replayTweetTextWrapper = mainWrapper?.querySelector(
    "div[data-testid=tweetText",
  ) as HTMLElement;

  const buttonList: ButtonData[] = [];
  if (replayTweetTextWrapper) {
    // reply
    const replayContent = replayTweetTextWrapper.textContent || "";
    if (replayContent === "") {
      return false;
    }
    buttonList.push(
      {
        disabled: false,
        tag: ButtonTag.Approval,
        text: "👍 Approval",
        params: { data: { mainWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        disabled: false,
        tag: ButtonTag.Disapproval,
        text: "👎 Disapproval",
        params: { data: { mainWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        disabled: false,
        tag: ButtonTag.Support,
        text: "🫶 Support",
        params: { data: { mainWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        disabled: false,
        tag: ButtonTag.Joke,
        text: "🔥 Joke",
        params: { data: { mainWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        disabled: false,
        tag: ButtonTag.Idea,
        text: "💡 Idea",
        params: { data: { mainWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        disabled: false,
        tag: ButtonTag.Question,
        text: "❓ Question",
        params: { data: { mainWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        disabled: false,
        tag: ButtonTag.Translate,
        text: "🌎 Translate",
        params: { data: { mainWrapper } },
        handler: generateHandle,
      },
    );
  } else {
    // post
    buttonList.push(
      {
        disabled: false,
        tag: ButtonTag.Generate,
        text: "✨ Generate",
        params: { data: { mainWrapper } },
        handler: generateHandle,
      },
      {
        disabled: false,
        tag: ButtonTag.Translate,
        text: "🌎 Translate",
        params: { data: { mainWrapper } },
        handler: generateHandle,
      },
    );
  }

  createButtonContainer(
    toolBarParentWrapper as HTMLElement,
    ButtonLocationEnum.Previous,
    buttonList,
  );

  return true;
}

async function ttTwitterDM(): Promise<boolean> {
  const dmWrapper = document.querySelector(
    "main[role=main] aside[role=complementary] button[data-testid=dmComposerSendButton]",
  );

  if (!dmWrapper) {
    return false;
  }

  // 添加翻译按钮响应事件
  if (
    dmWrapper.getAttribute("tt-button-is-done") === "true" ||
    dmWrapper.parentElement?.parentElement?.querySelector(
      "div[tt-button-is-done]",
    )
  ) {
    return true;
  }

  const buttonList: ButtonData[] = [
    {
      disabled: false,
      tag: ButtonTag.Translate,
      text: "🌎 Translate",
      params: { data: { dmWrapper } },
      handler: dmGenerateHandle,
    },
  ];

  createButtonContainer(
    dmWrapper.parentElement as HTMLElement,
    ButtonLocationEnum.Previous,
    buttonList,
  );

  return true;
}

async function ttTwitterDM2(): Promise<boolean> {
  const dmWrapper = document.querySelector(
    "div[id=react-root] div[data-testid=DMDrawer] aside[role=complementary] button[data-testid=dmComposerSendButton]",
  );

  if (!dmWrapper) {
    return false;
  }

  // 添加翻译按钮响应事件
  if (
    dmWrapper.getAttribute("tt-button-is-done") === "true" ||
    dmWrapper.parentElement?.parentElement?.querySelector(
      "div[tt-button-is-done]",
    )
  ) {
    return true;
  }

  const buttonList: ButtonData[] = [
    {
      disabled: false,
      tag: ButtonTag.Translate,
      text: "🌎 Translate",
      params: { data: { dmWrapper } },
      handler: dmGenerateHandle,
    },
  ];

  createButtonContainer(
    dmWrapper.parentElement as HTMLElement,
    ButtonLocationEnum.Previous,
    buttonList,
  );

  return true;
}

async function generateHandle(
  tag: ButtonTag,
  params: HandlerParams,
): Promise<void> {
  console.log("generateHandle", tag, params);
  const { mainWrapper, replayContent } = params.data;
  if (!mainWrapper) {
    return;
  }

  const tweetTextareaWrapper = mainWrapper.querySelector(
    "div[data-testid=tweetTextarea_0]",
  ) as HTMLElement;

  if (!tweetTextareaWrapper) {
    return;
  }

  let needDialog = false;
  if ([ButtonTag.Generate, ButtonTag.Translate].includes(tag)) {
    needDialog = true;
  }

  let sourceContent = replayContent || tweetTextareaWrapper.textContent || "";
  if (sourceContent === "") {
    return;
  }
  const generateText = await generateContent(
    sourceContent,
    tag,
    MessageType.AIGenerate,
  );

  if (needDialog) {
    createDialogContainer(
      generateText,
      () => {
        // 确认按钮的回调
        setInputText(tweetTextareaWrapper, generateText);
      },
      () => {
        // 取消按钮的回调
        console.log("Operation cancelled.");
      },
    );
  } else {
    setInputText(tweetTextareaWrapper, generateText);
  }
}

async function dmGenerateHandle(
  tag: ButtonTag,
  params: HandlerParams,
): Promise<void> {
  console.log("dmGenerateHandle", tag, params);
  const { dmWrapper } = params.data;
  if (!dmWrapper) {
    return;
  }

  const dmTextareaWrapper = dmWrapper.parentElement.querySelector(
    "div[data-testid=dmComposerTextInput]",
  ) as HTMLElement;

  if (!dmTextareaWrapper) {
    return;
  }
  const sourceContent = dmTextareaWrapper.textContent || "";
  if (sourceContent === "") {
    return;
  }
  const generateText = await generateContent(
    sourceContent,
    tag,
    MessageType.AIGenerate,
  );

  createDialogContainer(
    generateText,
    () => {
      // 确认按钮的回调
      setInputText(dmTextareaWrapper, generateText);
    },
    () => {
      // 取消按钮的回调
      console.log("Operation cancelled.");
    },
  );
}

async function ttTwitterTranslate(): Promise<void> {
  const mainWrapper = document.querySelector(
    "main[role=main] div[data-testid=primaryColumn]",
  );
  const ariaLabelWrapper = mainWrapper?.querySelector(
    "section[role=region] div[aria-label]",
  ) as HTMLElement | null;
  if (!ariaLabelWrapper) {
    return;
  }

  let tweetWrapperList = [
    ...ariaLabelWrapper.querySelectorAll(
      `div[aria-label] article[role=article]:not([tabindex="-1"]) div[lang]:not([data-has-translator=true]):not([lang^=zh])`,
    ),
  ];

  if (!tweetWrapperList.length) return;

  tweetWrapperList.forEach((tweetWrapper) => {
    tweetWrapper.setAttribute("data-has-translator", "true");

    // 获取 tweetWrapper 子节点的所有 span 元素
    const spanContentWrapper = [...tweetWrapper.querySelectorAll("span")];

    // 将 span 元素遍历，过滤出非表情的文本元素，将文本内容依次替换成 “你好”
    spanContentWrapper.forEach((span) => {
      // 如果 span 元素还有子节点，过滤
      const textContent = span.textContent;
      if (
        !textContent || !isContent(textContent) ||
        textContent.startsWith("http") ||
        textContent.startsWith("https") || textContent.startsWith("@") ||
        textContent.startsWith("#")
      ) {
        return;
      }
      // 翻译
      translateContent(textContent).then((translatedText) => {
        span.textContent = translatedText || textContent;
      });
    });
  });
}
