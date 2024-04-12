// 定义模板对象的接口
interface Template {
  fromDiv: string;
  translateButton: string;
  loading: string;
  postButtons: string;
  replyButtons: string;
  // postTextContent: string; // 如果您需要使用它，只需取消注释
}

const template: Template = {
  fromDiv: `<div class="tt-translator-result-container">
              <div class="tt-translator-result-header">
                由<a target="_blank" role="link" data-focusable="true" class="tt-translator-result-supporter" rel="noopener noreferrer"> <img src="${
    chrome.runtime.getURL(
      `static/images/{0}_logo.png`,
    )
  }" /> </a><span class="tt-translator-result-switch" role="button">翻译自 {1}</span>
              </div>
              <div class="tt-translator-result">{2}</div>
            </div>`,
  translateButton:
    '<div class="tt-translator-button" role="button"><span class="tt-translator-content">翻译推文</span></div>',
  loading:
    '<div class="tt-translator-loading-container"><svg class="tt-translator-loading" viewBox="0 0 32 32"><circle class="tt-translator-loading-background" cx="16" cy="16" fill="none" r="14" stroke-width="4" style="stroke: #1da1f2; opacity: 0.2;"></circle><circle class="tt-translator-loading-front" cx="16" cy="16" fill="none" r="14" stroke-width="4" style="stroke: #1da1f2; stroke-dasharray: 80; stroke-dashoffset: 60;"></circle></svg></div>',
  postButtons:
    `<div id="tt-post-buttons" class="post-buttons" style="display: flex; flex-wrap: wrap; align-items: center; height: 100%; margin-top: 8px;">
      <div class="tt-post-btn-style">✨ Create</div>
      <div class="tt-post-btn-style">🍭 Polish</div>
    </div>`,
  replyButtons:
    `<div id="tt-post-buttons" class="post-buttons" style="display: flex; flex-wrap: wrap; align-items: center; height: 100%; margin-top: 8px;">
    <div class="tt-post-btn-style" style="padding: 3px 12px;">👍</div>
    <div class="tt-post-btn-style" style="padding: 3px 12px;">👎</div>
    <div class="tt-post-btn-style">🫶 Support</div>
    <div class="tt-post-btn-style">🔥 Joke</div>
    <div class="tt-post-btn-style">💡 Idea</div>
    <div class="tt-post-btn-style">❓ Question</div>
    <div class="tt-post-btn-style">◑ Translate</div>
  </div>`,
  // postTextContent:
  //   '<span data-text="true">{0}</span>',
};

export default template;
