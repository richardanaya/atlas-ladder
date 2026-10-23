import { CONFIG } from './config.js';
import { ContentLoader } from './content-loader.js';
import { ProgressStore } from './progress-store.js';
import { SoundManager } from './sound-manager.js';
import { Router } from './router.js';
import { escapeHtml } from './dom.js';
import { applySlots } from './assets.js';
import { currentLessonKey, isLessonUnlocked, lessonKey, levelFor, readyLessons, todayISO, xpAward } from './progress-rules.js';

const SECTION_ICONS = {
  metaphysics: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.5 27.5 16 16 28.5 4.5 16Z"/><path d="M16 9.5 22 16 16 22.5 10 16Z"/></svg>',
  epistemology: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3.5 16S8.5 8.5 16 8.5 28.5 16 28.5 16 23.5 23.5 16 23.5 3.5 16 3.5 16Z"/><circle cx="16" cy="16" r="3.2"/></svg>',
  'human-nature': '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="11" r="4.2"/><path d="M7.5 26.5c1.4-5 4.4-7.2 8.5-7.2s7.1 2.2 8.5 7.2"/></svg>',
  ethics: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 25c1.8-7.2 5.2-13 10-15.2C20.8 12 24.2 17.8 26 25"/><path d="M16 9.8V25M11 14.2c1.6 2 3.3 3.6 5 4.6M21 14.2c-1.6 2-3.3 3.6-5 4.6"/></svg>',
  politics: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 5.5v17M7 26.5h18M9.5 10.5h13"/><path d="M9.5 10.5 6 18h7l-3.5-7.5Zm13 0L19 18h7l-3.5-7.5Z"/></svg>',
  aesthetics: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5.5 9.5c3.4 1.8 6.2 1.8 10.5 0 4.3 1.8 7.1 1.8 10.5 0v14c-3.4 1.8-6.2 1.8-10.5 0-4.3 1.8-7.1 1.8-10.5 0Z"/><path d="M16 9.5v14"/></svg>',
  integration: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12.5" cy="16" r="6.2"/><circle cx="19.5" cy="16" r="6.2"/></svg>',
};

function sectionIcon(id) {
  return SECTION_ICONS[id] || SECTION_ICONS.integration;
}

export class App {
  constructor({ main }) {
    this.main = main;
    this.store = new ProgressStore();
    this.sound = new SoundManager(this.store);
    this.loader = new ContentLoader();
    this.router = new Router();
    this.catalog = null;
    this.fresh = [];
    this._wideQuery = window.matchMedia('(min-width: 1024px)');
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
    const goHome = () => this.router.go('/');
    document.querySelector('#home').addEventListener('click', goHome);
    document.querySelector('#brand-home').addEventListener('click', goHome);
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
    this._wideQuery.addEventListener('change', () => this._placeChrome());
    document.querySelector('#rail').addEventListener('click', (event) => {
      const button = event.target.closest('[data-section]');
      if (!button) return;
      this._scrollToSection(button.dataset.section);
    });
  }

  _renderChrome() {
    const xp = document.querySelector('#xp');
    const streak = document.querySelector('#streak');
    xp.xp = this.store.xp;
    streak.count = this.store.streak;
    if (this.store.state.lastActiveDate === todayISO() && this.store.streak > 0) streak.setAttribute('lit', '');
    else streak.removeAttribute('lit');
    this._renderMute(this.store.muted);
    this._renderDossier();
  }

  _placeChrome() {
    const wide = this._wideQuery.matches && document.body.classList.contains('is-tower');
    document.body.classList.toggle('is-wide', wide);
    const streak = document.querySelector('#streak');
    const xp = document.querySelector('#xp');
    const meters = document.querySelector('#dossier-meters');
    const mute = document.querySelector('#mute');
    if (wide) meters.append(streak, xp);
    else mute.before(streak, xp);
    if (wide) {
      this._renderRail();
      this._renderDossier();
    }
  }

  _renderRail() {
    if (!this.catalog) return;
    const current = currentLessonKey(this.catalog, this.store.state.completed);
    const currentSection = current ? current.split('/')[0] : this.catalog.sections[0]?.id;
    const rail = document.querySelector('#rail');
    rail.innerHTML = `<p class="panel-kicker">Sections</p>${this.catalog.sections.map((section) => {
      const ready = section.units.filter((unit) => unit.status === 'ready').length;
      const meta = ready ? `${ready} unit${ready === 1 ? '' : 's'} open` : 'Coming soon';
      const on = section.id === currentSection ? ' is-on' : '';
      return `<button type="button" data-section="${escapeHtml(section.id)}" class="rail-btn${on}">
        <span class="rail-icon"><img class="slot" data-slot="sections/${escapeHtml(section.id)}.png" alt="">${sectionIcon(section.id)}</span>
        <span class="rail-copy"><span class="rail-title">${escapeHtml(section.title)}</span><span class="rail-meta">${meta}</span></span>
      </button>`;
    }).join('')}`;
    applySlots(rail);
  }

  _renderDossier() {
    const box = document.querySelector('#dossier-unit');
    if (!box || !this.catalog) return;
    const completed = this.store.state.completed;
    const current = currentLessonKey(this.catalog, completed);
    let section = this.catalog.sections[0];
    let unit = section?.units[0];
    if (current) {
      const [sectionId, unitId] = current.split('/');
      section = this.catalog.sections.find((item) => item.id === sectionId) || section;
      unit = section.units.find((item) => item.id === unitId) || section.units.find((item) => item.status === 'ready') || unit;
    }
    const lessons = unit?.lessons || [];
    const done = lessons.filter((lesson) => completed[lessonKey(section.id, unit.id, lesson.id)]).length;
    const ratio = lessons.length ? done / lessons.length : 0;
    const items = lessons.map((lesson) => {
      const key = lessonKey(section.id, unit.id, lesson.id);
      const state = completed[key] ? 'done' : key === current ? 'now' : 'wait';
      const tag = state === 'now' ? 'Learning' : state === 'done' ? 'Done' : 'Locked';
      return `<li data-state="${state}"><span class="climb-tag">${tag}</span>${escapeHtml(lesson.title)}</li>`;
    }).join('');
    const count = lessons.length ? `${done} of ${lessons.length} floors` : 'Coming soon';
    box.innerHTML = `
      <p class="dossier-kicker">${escapeHtml(section?.title || '')}</p>
      ${lessons.length ? `<div class="unit-track" role="progressbar" aria-valuemin="0" aria-valuemax="${lessons.length}" aria-valuenow="${done}" aria-label="${escapeHtml(count)}"><span class="unit-fill" style="transform:scaleX(${ratio})"></span></div>` : ''}
      <h2>${escapeHtml(unit?.title || '')}</h2>
      <p class="dossier-count">${count}</p>
      ${items ? `<ul>${items}</ul>` : ''}
    `;
  }

  _scrollToSection(id) {
    const tree = this.main.querySelector('skill-tree');
    const node = tree?.shadowRoot?.querySelector(`[data-section-id="${id}"]`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.querySelectorAll('.rail-btn').forEach((button) => {
      button.classList.toggle('is-on', button.dataset.section === id);
    });
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
    this._placeChrome();
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
