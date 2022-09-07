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

export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function uniqFromArrays(arr1: any[], arr2: any[]): any[] {
  const unique1 = arr1.filter((o) => arr2.indexOf(o) === -1);
  const unique2 = arr2.filter((o) => arr1.indexOf(o) === -1);
  return unique1.concat(unique2);
}
