/**
 * Drop-in image plates for the dark-gold theme.
 *
 * Put a file at the path below and reload. The matching CSS drawing stays
 * until the file loads, and it stays as the fallback if the file is missing
 * or fails. Animations stay in CSS (and on the Atlas SVG).
 *
 *   assets/backgrounds/tower.png        full-bleed tower backdrop
 *   assets/backgrounds/lesson.png       full-bleed lesson backdrop
 *   assets/backgrounds/celebrate.png    lesson-complete backdrop
 *   assets/backgrounds/card.png         interior texture of the question card
 *   assets/mascot/idle.png              transparent portrait, one per pose
 *   assets/mascot/thinking.png
 *   assets/mascot/encourage.png
 *   assets/mascot/cheer.png
 *   assets/mascot/celebrate.png
 *   assets/floors/done.png              square medallion, transparent ground
 *   assets/floors/current.png
 *   assets/floors/locked.png
 *   assets/floors/soon.png
 *   assets/sections/<section-id>.png    line icon, square, transparent
 *   assets/icons/streak.png
 *   assets/icons/streak-lit.png
 *   assets/icons/xp.png                 small emblem drawn inside the XP ring
 *   assets/icons/heart.png
 *   assets/icons/heart-empty.png
 *   assets/ornaments/corner.png         top-left corner; the page mirrors it
 *   assets/ornaments/sunburst.png       rays behind Atlas
 *   assets/celebration/cleared.png      replaces the CSS sun on a cleared floor
 *
 * Section ids: metaphysics, epistemology, human-nature, ethics, politics,
 * aesthetics, integration.
 *
 * Backgrounds are CSS variables (--image-bg-tower and the rest in tokens.css).
 * The XP ring stroke stays SVG so the arc can show real progress.
 */

const BASE = new URL('../assets/', import.meta.url);

const THEME_PLATES = [
  ['--image-bg-tower', 'backgrounds/tower.png', 'plate-bg-tower'],
  ['--image-bg-lesson', 'backgrounds/lesson.png', 'plate-bg-lesson'],
  ['--image-bg-celebrate', 'backgrounds/celebrate.png', 'plate-bg-celebrate'],
  ['--image-bg-card', 'backgrounds/card.png', 'plate-bg-card'],
  ['--image-ornament-corner', 'ornaments/corner.png', 'plate-ornament-corner'],
  ['--image-sunburst', 'ornaments/sunburst.png', 'plate-sunburst'],
];

const probes = new Map();

export function slotUrl(slot) {
  return new URL(slot, BASE).href;
}

/** Resolves true when the plate exists and decodes. Cached per slot. */
export function whenSlot(slot) {
  if (!slot) return Promise.resolve(false);
  if (!probes.has(slot)) {
    probes.set(slot, new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = slotUrl(slot);
    }));
  }
  return probes.get(slot);
}

/**
 * Show every [data-slot] image under root when its file loads.
 * data-slot is a path relative to assets/, for example "floors/done.png".
 * An SVG plate is a group containing <image>. An HTML plate is an <img>.
 */
export function applySlots(root) {
  if (!root) return;
  for (const node of root.querySelectorAll('[data-slot]')) {
    const slot = node.dataset.slot;
    whenSlot(slot).then((ok) => {
      if (!node.isConnected) return;
      if (!ok) {
        node.remove();
        return;
      }
      const url = slotUrl(slot);
      if (node instanceof HTMLImageElement) {
        node.addEventListener('load', () => node.classList.add('is-ready'), { once: true });
        node.decoding = 'async';
        node.src = url;
        if (node.complete && node.naturalWidth > 0) node.classList.add('is-ready');
        return;
      }
      const image = node.querySelector('image') || node;
      const mark = () => node.classList.add('is-ready');
      image.addEventListener('load', mark, { once: true });
      image.setAttribute('href', url);
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', url);
    });
  }
}

/** Point the background variables at plates that actually loaded. */
export function applyThemePlates() {
  const root = document.documentElement;
  for (const [prop, slot, flag] of THEME_PLATES) {
    whenSlot(slot).then((ok) => {
      if (!ok) return;
      root.style.setProperty(prop, `url("${slotUrl(slot)}")`);
      root.classList.add(flag);
    });
  }
}
