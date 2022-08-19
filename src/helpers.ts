export function getElementsByText(str: string, tag: string) {
  return Array.prototype.slice.call(
    document.getElementsByTagName(tag),
  ).filter((el) => el.textContent.trim() === str.trim());
}

export function waitForElement(selector: string) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      resolve(document.querySelector(selector));
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
