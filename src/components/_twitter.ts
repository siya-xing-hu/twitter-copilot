// import { ButtonData, createButtonContainer, ButtonLocationEnum } from "./button";

// export async function ttMainInit(): Promise<void> {
//   const $mainWrapper = document.querySelector(
//     "main[role=main] div[data-testid=primaryColumn]",
//   );
//   const $tweetTextareaWrapper = $mainWrapper?.querySelector(
//     "div[data-testid=tweetTextarea_0]",
//   ) as HTMLElement | null;
//   const $toolBarParentWrapper = $mainWrapper?.querySelector(
//     "div[data-testid=toolBar]",
//   )?.parentElement;

//   if (!$toolBarParentWrapper || !$tweetTextareaWrapper) {
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

//   createButtonContainer($toolBarParentWrapper, ButtonLocationEnum.Previous, buttonList);
// }
