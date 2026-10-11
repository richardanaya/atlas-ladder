import { CONFIG } from './config.js';
import { ContentLoader } from './content-loader.js';
import { ProgressStore } from './progress-store.js';
import { SoundManager } from './sound-manager.js';
import { Router } from './router.js';
import { escapeHtml } from './dom.js';
import { currentLessonKey, isLessonUnlocked, lessonKey, levelFor, readyLessons, todayISO, xpAward } from './progress-rules.js';

export class App {
  constructor({ main }) {
    this.main = main;
    this.store = new ProgressStore();
    this.sound = new SoundManager(this.store);
    this.loader = new ContentLoader();
    this.router = new Router();
    this.catalog = null;
    this.fresh = [];
    this._sideTimer = 0;
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
    this._wideQuery.addEventListener('change', () => this._placeChrome());
    document.querySelector('#rail').addEventListener('click', (event) => {
      const button = event.target.closest('[data-section]');
      if (!button) return;
      this._scrollToSection(button.dataset.section);
    });
    document.querySelector('#side-poses').addEventListener('click', (event) => {
      const pose = event.target.closest('[data-pose]');
      if (!pose) return;
      clearInterval(this._sideTimer);
      this._setSidePose(pose.dataset.pose);
    });
    document.querySelector('#side-play').addEventListener('click', () => this._cycleSidePose());
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
    rail.innerHTML = this.catalog.sections.map((section, index) => {
      const ready = section.units.filter((unit) => unit.status === 'ready').length;
      const meta = ready ? `${ready} unit${ready === 1 ? '' : 's'} open` : 'Coming soon';
      const on = section.id === currentSection ? ' is-on' : '';
      return `<button type="button" data-section="${escapeHtml(section.id)}" class="rail-btn${on}">
        <span class="rail-index">${String(index + 1).padStart(2, '0')}</span>
        <span class="rail-copy"><span class="rail-title">${escapeHtml(section.title)}</span><span class="rail-meta">${meta}</span></span>
      </button>`;
    }).join('');
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
    const items = lessons.map((lesson) => {
      const key = lessonKey(section.id, unit.id, lesson.id);
      const state = completed[key] ? 'done' : key === current ? 'now' : 'wait';
      return `<li data-state="${state}">${escapeHtml(lesson.title)}</li>`;
    }).join('');
    box.innerHTML = `
      <p class="dossier-kicker">${escapeHtml(section?.title || '')}</p>
      <h2>${escapeHtml(unit?.title || '')}</h2>
      <p class="dossier-count">${lessons.length ? `${done} of ${lessons.length} floors` : 'Coming soon'}</p>
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

  _setSidePose(state) {
    const mascot = document.querySelector('#side-atlas');
    const label = document.querySelector('#side-pose');
    mascot?.setAttribute('state', state);
    if (label) label.textContent = state.charAt(0).toUpperCase() + state.slice(1);
    document.querySelectorAll('#side-poses [data-pose]').forEach((button) => {
      button.classList.toggle('is-on', button.dataset.pose === state);
    });
  }

  _cycleSidePose() {
    const poses = ['idle', 'thinking', 'encourage', 'cheer', 'celebrate'];
    clearInterval(this._sideTimer);
    let index = 0;
    this._setSidePose(poses[0]);
    this._sideTimer = setInterval(() => {
      index = (index + 1) % poses.length;
      this._setSidePose(poses[index]);
    }, 1500);
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
    if (mode !== 'tower') clearInterval(this._sideTimer);
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
