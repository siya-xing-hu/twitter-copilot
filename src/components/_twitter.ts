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

export async function ttTwitterInit(): Promise<void> {
  execObserver(async () => {
    await ttTwitterPost();
    await ttTwitterReply();
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
