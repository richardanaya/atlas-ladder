let pending;

async function loadCss() {
  if (!pending) {
    pending = fetch(new URL('../css/components.css', import.meta.url)).then((response) => {
      if (!response.ok) throw new Error('Could not load component styles');
      return response.text();
    });
  }
  return pending;
}

let sheetPromise;

function sharedSheet(css) {
  if (!sheetPromise) {
    sheetPromise = (async () => {
      if ('CSSStyleSheet' in globalThis && 'replaceSync' in CSSStyleSheet.prototype) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        return sheet;
      }
      return null;
    })();
  }
  return sheetPromise;
}

/** Adopt the shared component sheet into a shadow root, with a style-tag fallback. */
export async function adopt(shadow) {
  const css = await loadCss();
  const sheet = await sharedSheet(css);
  if (sheet && 'adoptedStyleSheets' in shadow) {
    shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
    return;
  }
  const style = document.createElement('style');
  style.textContent = css;
  shadow.append(style);
}
