import "./popup.css";
import { retry } from "./utils/common";
import { execNotionTranslate, execTranslate } from "./components/translate";
import { ttProductHuntInit } from "./components/_producthunt";
import { translateConfig, ttTwitterInit } from "./components/_twitter";

chrome.storage.local.get().then(({ xTranslate }) => {
  translateConfig.xTranslate = xTranslate == "TRUE";
});

chrome.runtime.onMessage.addListener((request, _sender) => {
  console.log("content-script.ts: onMessage", request);
  if (request.type === "config-update") {
    chrome.storage.local.get().then(({ xTranslate }) => {
      translateConfig.xTranslate = xTranslate == "TRUE";
    });
  }
  if (request.type === "twitter-url") {
    retry(ttTwitterInit, 1, 15);
  }
  if (request.type === "producthunt-url") {
    retry(ttProductHuntInit, 1, 15);
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
      if (window.location.hostname.includes("notion.site")) {
        await execNotionTranslate(currentClientX, currentClientY);
      } else {
        await execTranslate(currentClientX, currentClientY);
      }
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
