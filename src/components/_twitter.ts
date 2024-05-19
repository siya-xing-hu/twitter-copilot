import { ButtonTag, MessageType, setInputText } from "../utils/common";
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
  execObserver(async () => {
    await ttTwitterPost();
    await ttTwitterReply();

    if (translateConfig.xTranslate) {
      await ttTwitterTranslate();
    }
  });
}

async function ttTwitterPost(): Promise<void> {
  const mainWrapper = document.querySelector(
    "main[role=main] div[data-testid=primaryColumn]",
  );
  const tweetTextareaWrapper = mainWrapper?.querySelector(
    "div[data-testid=tweetTextarea_0]",
  ) as HTMLElement | null;
  const toolBarParentWrapper = mainWrapper?.querySelector(
    "div[data-testid=toolBar]",
  );

  if (!toolBarParentWrapper || !tweetTextareaWrapper) {
    return;
  }

  // 添加翻译按钮响应事件
  if (toolBarParentWrapper.getAttribute("tt-button-is-done") === "true") {
    return;
  }

  const buttonList: ButtonData[] = [
    {
      tag: ButtonTag.Generate,
      text: "✨ Generate",
      params: { data: { tweetTextareaWrapper } },
      handler: generateHandle,
    },
    {
      tag: ButtonTag.Translate,
      text: "🌎 Translate",
      params: { data: { tweetTextareaWrapper } },
      handler: generateHandle,
    },
  ];

  createButtonContainer(
    toolBarParentWrapper as HTMLElement,
    ButtonLocationEnum.Previous,
    buttonList,
  );
}

async function ttTwitterReply(): Promise<void> {
  const dialogWrapper = document.querySelector("div[role=dialog]");
  const tweetTextareaWrapper = dialogWrapper?.querySelector(
    "div[data-testid=tweetTextarea_0]",
  ) as HTMLElement | null;
  const toolBarParentWrapper = dialogWrapper?.querySelector(
    "div[data-testid=toolBar]",
  );

  if (!toolBarParentWrapper || !tweetTextareaWrapper) {
    return;
  }

  if (toolBarParentWrapper.getAttribute("tt-button-is-done") === "true") {
    return;
  }

  const replayTweetTextWrapper = dialogWrapper?.querySelector(
    "div[data-testid=tweetText",
  ) as HTMLElement;

  const buttonList: ButtonData[] = [];
  if (replayTweetTextWrapper) {
    // reply
    const replayContent = replayTweetTextWrapper.textContent || "";
    if (replayContent === "") {
      return;
    }
    buttonList.push(
      {
        tag: ButtonTag.Approval,
        text: "👍 Approval",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: ButtonTag.Disapproval,
        text: "👎 Disapproval",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: ButtonTag.Support,
        text: "🫶 Support",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: ButtonTag.Joke,
        text: "🔥 Joke",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: ButtonTag.Idea,
        text: "💡 Idea",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: ButtonTag.Question,
        text: "❓ Question",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: ButtonTag.Translate,
        text: "🌎 Translate",
        params: { data: { tweetTextareaWrapper } },
        handler: generateHandle,
      },
    );
  } else {
    // post
    buttonList.push(
      {
        tag: ButtonTag.Generate,
        text: "✨ Generate",
        params: { data: { tweetTextareaWrapper } },
        handler: generateHandle,
      },
      {
        tag: ButtonTag.Translate,
        text: "🌎 Translate",
        params: { data: { tweetTextareaWrapper } },
        handler: generateHandle,
      },
    );
  }

  createButtonContainer(
    toolBarParentWrapper as HTMLElement,
    ButtonLocationEnum.Previous,
    buttonList,
  );
}

async function generateHandle(
  tag: ButtonTag,
  params: HandlerParams,
): Promise<void> {
  const { tweetTextareaWrapper, replayContent } = params.data;
  if (!tweetTextareaWrapper) {
    return;
  }

  let needDialog = false;
  if ([ButtonTag.Generate, ButtonTag.Translate].includes(tag)) {
    needDialog = true;
  }

  let sourceContent = replayContent || tweetTextareaWrapper.textContent || "";
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
        !textContent || textContent.startsWith("http") ||
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
