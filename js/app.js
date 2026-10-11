import { CONFIG } from './config.js';
import { ContentLoader } from './content-loader.js';
import { ProgressStore } from './progress-store.js';
import { SoundManager } from './sound-manager.js';
import { Router } from './router.js';
import { isLessonUnlocked, lessonKey, levelFor, readyLessons, todayISO, xpAward } from './progress-rules.js';

export class App {
  constructor({ main }) {
    this.main = main;
    this.store = new ProgressStore();
    this.sound = new SoundManager(this.store);
    this.loader = new ContentLoader();
    this.router = new Router();
    this.catalog = null;
    this.fresh = [];
  }

  async start() {
    this._bindChrome();
    this._renderChrome();
    try {
      this.catalog = await this.loader.catalog();
    } catch (error) {
      this._setMode('lesson');
      this.main.innerHTML = `<p class="load-error">The tower files did not load. Serve this folder over HTTP, then reload. ${error.message}</p>`;
      return;
    }
    this.router.onChange(() => this._route());
    this.router.start();
  }

  _bindChrome() {
    document.querySelector('#home').addEventListener('click', () => this.router.go('/'));
    document.querySelector('#mute').addEventListener('click', () => {
      const muted = this.sound.toggle();
      this._renderMute(muted);
    });
    const dialog = document.querySelector('#reset-dialog');
    document.querySelector('#reset').addEventListener('click', () => dialog.showModal());
    dialog.addEventListener('close', () => {
      if (dialog.returnValue !== 'reset') return;
      this.store.reset();
      this.fresh = [];
      this._renderChrome();
      this.router.go('/');
    });
    document.querySelector('#sources-link').addEventListener('click', () => this.router.go('/sources'));
  }

  _renderChrome() {
    const xp = document.querySelector('#xp');
    const streak = document.querySelector('#streak');
    xp.xp = this.store.xp;
    streak.count = this.store.streak;
    if (this.store.state.lastActiveDate === todayISO() && this.store.streak > 0) streak.setAttribute('lit', '');
    else streak.removeAttribute('lit');
    this._renderMute(this.store.muted);
  }

  _renderMute(muted) {
    const button = document.querySelector('#mute');
    button.setAttribute('aria-pressed', muted ? 'true' : 'false');
    button.setAttribute('aria-label', muted ? 'Unmute sounds' : 'Mute sounds');
    button.textContent = muted ? 'Muted' : 'Sound';
  }

  _setMode(mode) {
    document.body.classList.toggle('is-lesson', mode === 'lesson' || mode === 'sources');
    document.body.classList.toggle('is-celebrate', mode === 'celebrate');
    document.body.classList.toggle('is-tower', mode === 'tower');
  }

  async _route() {
    const path = this.router.path;
    if (path === '/sources') return this._showSources();
    const match = path.match(/^\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (match) return this._showLesson(match[1], match[2], match[3]);
    return this._showTree();
  }

  _showTree() {
    this._setMode('tower');
    this._renderChrome();
    const tree = document.createElement('skill-tree');
    this.main.replaceChildren(tree);
    tree.model = {
      catalog: this.catalog,
      completed: this.store.state.completed,
      fresh: this.fresh,
    };
    this.fresh = [];
    tree.addEventListener('open-lesson', (event) => {
      const { sectionId, unitId, lessonId } = event.detail;
      this.router.go(`/lesson/${sectionId}/${unitId}/${lessonId}`);
    });
  }

  async _showLesson(sectionId, unitId, lessonId) {
    const key = lessonKey(sectionId, unitId, lessonId);
    if (!isLessonUnlocked(this.catalog, this.store.state.completed, key)) {
      this.router.go('/');
      return;
    }
    const section = this.catalog.sections.find((item) => item.id === sectionId);
    const unit = section?.units.find((item) => item.id === unitId);
    const lesson = unit?.lessons?.find((item) => item.id === lessonId);
    if (!section?.file || !lesson) {
      this.router.go('/');
      return;
    }
    this._setMode('lesson');
    const player = document.createElement('lesson-player');
    this.main.replaceChildren(player);
    player.sound = this.sound;
    try {
      const pack = await this.loader.section(section.file);
      const block = pack.lessons[`${unitId}/${lessonId}`];
      if (!block) throw new Error('That floor has no questions yet.');
      player.session = {
        sectionTitle: section.title,
        unitTitle: unit.title,
        title: lesson.title,
        objective: lesson.objective,
        exercises: block.exercises,
      };
    } catch (error) {
      this.main.innerHTML = `<p class="load-error">${error.message}</p>`;
      return;
    }
    player.addEventListener('exit', () => this.router.go('/'));
    player.addEventListener('finished', (event) => this._onFinished(key, event.detail));
  }

  _onFinished(key, detail) {
    const already = this.store.isComplete(key);
    const before = levelFor(this.store.xp);
    const gained = xpAward({ correct: detail.correct, total: detail.total, already });
    const saved = this.store.completeLesson({
      key,
      correct: detail.correct,
      total: detail.total,
      xpAwarded: gained,
    });
    const after = levelFor(this.store.xp);
    const list = readyLessons(this.catalog);
    const index = list.findIndex((entry) => entry.key === key);
    const next = list[index + 1];
    this.fresh = !already && next ? [next.key] : [];
    this._setMode('celebrate');
    this._renderChrome();
    const screen = document.createElement('lesson-complete');
    this.main.replaceChildren(screen);
    screen.stats = {
      ...detail,
      xpGained: saved.gained,
      streak: saved.streak,
      level: after,
      levelUp: after > before,
      perfect: detail.correct === detail.total,
      already,
    };
    this.sound.play('complete');
    if (after > before) setTimeout(() => this.sound.play('level'), 650);
    screen.addEventListener('continue', () => this.router.go('/'));
  }

  async _showSources() {
    this._setMode('sources');
    const url = new URL('../SOURCES.md', import.meta.url);
    let text = 'Sources could not be loaded.';
    try {
      const response = await fetch(url);
      if (response.ok) text = await response.text();
    } catch {
      /* keep fallback */
    }
    this.main.innerHTML = `
      <article class="sources">
        <button type="button" class="text-btn" id="sources-back">Back to the tower</button>
        ${renderSources(text)}
      </article>
    `;
    this.main.querySelector('#sources-back').addEventListener('click', () => this.router.go('/'));
  }
}

function renderSources(markdown) {
  const escape = (value) => value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));
  const inline = (value) => escape(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
  const html = [];
  let quote = [];
  const flush = () => {
    if (!quote.length) return;
    html.push(`<blockquote><p>${quote.map(inline).join('<br>')}</p></blockquote>`);
    quote = [];
  };
  for (const line of markdown.split('\n')) {
    if (line.startsWith('>')) {
      quote.push(line.replace(/^>\s?/, ''));
      continue;
    }
    flush();
    if (line.startsWith('# ')) html.push(`<h1>${inline(line.slice(2))}</h1>`);
    else if (line.startsWith('## ')) html.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.trim()) html.push(`<p>${inline(line)}</p>`);
  }
  flush();
  return html.join('');
}
