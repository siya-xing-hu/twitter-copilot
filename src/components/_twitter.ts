import { setInputText } from "../utils/common";
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

  // "✨ Create": "根据内容摘要丰富内容",
  //       "🍭 Polish": "根据内容进行优化排版，纠错",

  const buttonList: ButtonData[] = [
    {
      tag: "Create",
      text: "✨ Create",
      params: { data: { tweetTextareaWrapper } },
      handler: generateHandle,
    },
    {
      tag: "Polish",
      text: "🍭 Polish",
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

    // "👍": "Express approval",
    //       "👎": "Express disapproval",
    //       "🫶 Support": "Express support",
    //       "🔥 Joke": "Humor style",
    //       "💡 Idea": "Give a good opinion",
    //       "❓ Question": "Ask a question",
    //       "◑ Translate": "Translate",

    buttonList.push(
      {
        tag: "approval",
        text: "👍",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: "disapproval",
        text: "👎",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: "Support",
        text: "🫶 Support",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: "Joke",
        text: "🔥 Joke",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: "Idea",
        text: "💡 Idea",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: "Question",
        text: "❓ Question",
        params: { data: { tweetTextareaWrapper, replayContent } },
        handler: generateHandle,
      },
      {
        tag: "Translate",
        text: "◑ Translate",
        params: { data: { tweetTextareaWrapper } },
        handler: generateHandle,
      },
    );
  } else {
    // post

    // "✨ Create": "根据内容摘要丰富内容",
    //       "🍭 Polish": "根据内容进行优化排版，纠错",

    buttonList.push(
      {
        tag: "Create",
        text: "✨ Create",
        params: { data: { tweetTextareaWrapper } },
        handler: generateHandle,
      },
      {
        tag: "Polish",
        text: "🍭 Polish",
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
  tag: string,
  params: HandlerParams,
): Promise<void> {
  console.log("tag: ", tag, "postHandle: ", params);
  const { tweetTextareaWrapper, replayContent } = params.data;
  if (!tweetTextareaWrapper) {
    return;
  }

  let sourceContent = replayContent || tweetTextareaWrapper.textContent || "";
  let needDialog = false;
  let type = "ai-reply";
  if (["Create", "Polish", "Translate"].includes(tag)) {
    console.log("tag: ", tag);
    type = "ai-post";
    needDialog = true;
  }

  const generateText = await generateContent(sourceContent, tag, type);

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
