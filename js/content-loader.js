import { BASE_PATH } from './config.js';

export function contentUrl(file) {
  if (BASE_PATH) {
    const base = BASE_PATH.endsWith('/') ? BASE_PATH : `${BASE_PATH}/`;
    return `${base}content/${file}`;
  }
  return new URL(`../content/${file}`, import.meta.url).href;
}

async function fetchJson(file) {
  const response = await fetch(contentUrl(file));
  if (!response.ok) throw new Error(`Could not load ${file} (${response.status})`);
  return response.json();
}

/** Lazy loader. The catalog is the tower; a section file is fetched when a lesson opens. */
export class ContentLoader {
  constructor() {
    this._catalog = null;
    this._sections = new Map();
  }

  async catalog() {
    if (!this._catalog) this._catalog = await fetchJson('catalog.json');
    return this._catalog;
  }

  async section(file) {
    if (!this._sections.has(file)) this._sections.set(file, fetchJson(file));
    return this._sections.get(file);
  }
}
