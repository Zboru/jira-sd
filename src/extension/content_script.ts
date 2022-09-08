/**
 * This block of code is needed to make the ES6 import work properly
 */
(async () => {
  const src = chrome.runtime.getURL('dist/assets/js/main.js');
  await import(src);
})();
