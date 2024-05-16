import { setInputText } from "../utils/common";
import { generateContent } from "./util/sendBackground";
import {
  ButtonData,
  ButtonLocationEnum,
  createButtonContainer,
  HandlerParams,
} from "./button";
import { createDialogContainer } from "./dialog";

export async function ttTwitterPost(): Promise<void> {
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

  const sourceContent = tweetTextareaWrapper.textContent || "";
  if (sourceContent === "") {
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
      params: { data: { tweetTextareaWrapper, sourceContent } },
      handler: generateHandle,
    },
    {
      tag: "Polish",
      text: "🍭 Polish",
      params: { data: { tweetTextareaWrapper, sourceContent } },
      handler: generateHandle,
    },
  ];

  createButtonContainer(
    toolBarParentWrapper as HTMLElement,
    ButtonLocationEnum.Previous,
    buttonList,
  );
}

export async function ttTwitterReply(): Promise<void> {
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

  // 添加翻译按钮响应事件
  if (toolBarParentWrapper.getAttribute("tt-button-is-done") === "true") {
    return;
  }

  const replayTweetTextWrapper = dialogWrapper?.querySelector(
    "div[data-testid=tweetText",
  ) as HTMLElement;

  const buttonList: ButtonData[] = [];
  if (replayTweetTextWrapper) {
    // reply
    const sourceContent = replayTweetTextWrapper.textContent || "";
    if (sourceContent === "") {
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
        params: { data: { tweetTextareaWrapper, sourceContent } },
        handler: generateHandle,
      },
      {
        tag: "disapproval",
        text: "👎",
        params: { data: { tweetTextareaWrapper, sourceContent } },
        handler: generateHandle,
      },
      {
        tag: "Support",
        text: "🫶 Support",
        params: { data: { tweetTextareaWrapper, sourceContent } },
        handler: generateHandle,
      },
      {
        tag: "Joke",
        text: "🔥 Joke",
        params: { data: { tweetTextareaWrapper, sourceContent } },
        handler: generateHandle,
      },
      {
        tag: "Idea",
        text: "💡 ",
        params: { data: { tweetTextareaWrapper, sourceContent } },
        handler: generateHandle,
      },
      {
        tag: "Question",
        text: "❓ Question",
        params: { data: { tweetTextareaWrapper, sourceContent } },
        handler: generateHandle,
      },
      {
        tag: "Translate",
        text: "◑ Translate",
        params: { data: { tweetTextareaWrapper, sourceContent } },
        handler: generateHandle,
      },
    );
  } else {
    // post
    const sourceContent = tweetTextareaWrapper.textContent || "";
    if (sourceContent === "") {
      return;
    }

    // "✨ Create": "根据内容摘要丰富内容",
    //       "🍭 Polish": "根据内容进行优化排版，纠错",

    const buttonList: ButtonData[] = [
      {
        tag: "Create",
        text: "✨ Create",
        params: { data: { tweetTextareaWrapper, sourceContent } },
        handler: generateHandle,
      },
      {
        tag: "Polish",
        text: "🍭 Polish",
        params: { data: { tweetTextareaWrapper, sourceContent } },
        handler: generateHandle,
      },
    ];
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
  const { tweetTextareaWrapper, sourceContent } = params.data;
  if (!tweetTextareaWrapper || sourceContent === "") {
    return;
  }

  let needDialog = true;
  let type = "ai-post";
  if (tag in ["Reply"]) {
    type = "ai-reply";
    needDialog = false;
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
