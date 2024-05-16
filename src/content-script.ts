import "./popup.css";
import { retry } from "./utils/common";
import { execTranslate } from "./components/translate";
import { ttProductHuntReply } from "./components/_producthunt";
import { ttTwitterPost, ttTwitterReply } from "./components/_twitter";

chrome.runtime.onMessage.addListener((request, _sender) => {
  if (request.type === "twitter-url") {
    retry(ttTwitterPost, 1, 15);
    retry(ttTwitterReply, 1, 15);
  }
  if (request.type === "producthunt-url") {
    retry(ttProductHuntReply, 1, 15);
  }
});

let currentClientX = 0;
let currentClientY = 0;
let isTranslating = false;
let ctrlKey = false;
let eventKey = "";

// 监听鼠标悬停事件
document.addEventListener("mouseover", (event) => {
  currentClientX = event.clientX;
  currentClientY = event.clientY;
});

// 监听抬起事件
document.addEventListener("keyup", async (event) => {
  if (
    ctrlKey && eventKey === "Control" && currentClientX && currentClientY
  ) {
    if (isTranslating) {
      return;
    }
    try {
      isTranslating = true;
      await execTranslate(currentClientX, currentClientY);
    } catch (error) {
      console.error(error);
    } finally {
      isTranslating = false;
    }
  }
  ctrlKey = false;
  eventKey = "";
});

// 监听按下事件
document.addEventListener("keydown", async (event) => {
  ctrlKey = event.ctrlKey;
  eventKey = event.key;
});
