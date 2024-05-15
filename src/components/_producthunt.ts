import {
  ButtonData,
  ButtonLocationEnum,
  createButtonContainer,
  HandlerParams,
} from "./button";

// export async function ttMainInit(): Promise<void> {
//   const $formWrapper = document.querySelector(
//     "main form[data-test=comment-form]",
//   );

//   if (!$formWrapper) {
//     throw new Error("main is not loaded");
//   }

//   // 添加翻译按钮响应事件
//   if ($toolBarParentWrapper.getAttribute("tt-button-is-done") === "true") {
//     return;
//   }

//   const buttonList: ButtonData[] = [
//     {
//       tag: "Create",
//       text: "✨ Create",
//       handler: () => {
//         console.log("Create");
//       },
//     },
//     {
//       tag: "Polish",
//       text: "🍭 Polish",
//       handler: () => {
//         console.log("Polish");
//       },
//     },
//   ];

//   createButtonContainer($toolBarParentWrapper, buttonList);
// }

export async function ttProductHuntReply(): Promise<void> {
  const formWrapper = document.querySelector(
    "main form[data-test=comment-form]",
  );

  const submitButtonWrapper = formWrapper?.querySelector(
    "button[data-test=form-submit-button]",
  ) as HTMLElement | null;

  if (!formWrapper || !submitButtonWrapper) {
    console.error("form is not loaded");
    return;
  }

  const targetWrapper = submitButtonWrapper.parentElement?.parentElement;
  if (!targetWrapper) {
    return;
  }

  if (targetWrapper.getAttribute("tt-button-is-done") === "true") {
    return;
  }

  const buttonList: ButtonData[] = [
    {
      tag: "Create",
      text: "✨ Create",
      params: { data: targetWrapper },
      handler: replyHandle,
    },
    {
      tag: "Polish",
      text: "🍭 Polish",
      params: { data: targetWrapper },
      handler: replyHandle,
    },
  ];

  createButtonContainer(targetWrapper, ButtonLocationEnum.Previous, buttonList);

  // // 添加内容生成按钮
  // const $xersButtons = createElement(
  //   $replayTweetTextWrapper ? template.replyButtons : template.postButtons,
  // );

  // if ($toolBarParentWrapper.firstChild) {
  //   $toolBarParentWrapper.insertBefore(
  //     $xersButtons.cloneNode(true),
  //     $toolBarParentWrapper.firstChild,
  //   );
  // } else {
  //   $toolBarParentWrapper.appendChild($xersButtons.cloneNode(true));
  // }
  // $toolBarParentWrapper.setAttribute("xers-button-is-done", "true");

  // if ($replayTweetTextWrapper) {
  //   // reply
  //   return await reply(
  //     $toolBarParentWrapper,
  //     $tweetTextareaWrapper,
  //     $replayTweetTextWrapper,
  //   );
  // } else {
  //   // post
  //   return await post($toolBarParentWrapper, $tweetTextareaWrapper);
  // }
}

async function replyHandle(data: HandlerParams): Promise<void> {
  console.log("replyHandle", data);
}
