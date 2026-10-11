import { adopt } from '../shared-styles.js';
import { escapeHtml } from '../dom.js';
import { currentLessonKey, isLessonUnlocked, lessonKey } from '../progress-rules.js';

const POSES = ['idle', 'thinking', 'encourage', 'cheer', 'celebrate'];

export class SkillTreeElement extends HTMLElement {
  constructor() {
    super();
    this._model = null;
    this._timer = 0;
  }

  set model(value) {
    this._model = value;
    if (this.shadowRoot?.querySelector('.tower')) this._render();
  }

  async connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    await adopt(this.shadowRoot);
    if (!this.isConnected) return;
    if (!this.shadowRoot.querySelector('.tower')) {
      const tower = document.createElement('div');
      tower.className = 'tower';
      this.shadowRoot.append(tower);
      this.shadowRoot.addEventListener('click', (event) => this._onClick(event));
    }
    this._render();
  }

  disconnectedCallback() {
    clearInterval(this._timer);
  }

  _render() {
    const tower = this.shadowRoot.querySelector('.tower');
    if (!tower || !this._model) return;
    const { catalog, completed, fresh = [] } = this._model;
    const freshSet = new Set(fresh);
    const current = currentLessonKey(catalog, completed);
    const sections = catalog.sections.map((section) => this._section(section, completed, current, freshSet)).join('');
    tower.innerHTML = `
      ${this._entrance()}
      ${sections}
      <footer class="crown">
        <div class="sun"></div>
        <p>The upper floors are still on the drawing board.</p>
      </footer>
    `;
    const focus = tower.querySelector('.is-fresh') || tower.querySelector('.is-current') || tower.querySelector('.entrance');
    this.style.visibility = 'hidden';
    requestAnimationFrame(() => {
      focus?.scrollIntoView({ block: 'center' });
      this.style.visibility = 'visible';
    });
  }

  _entrance() {
    const buttons = POSES.map((pose) => `
      <button type="button" data-pose="${pose}">${pose}</button>
    `).join('');
    return `
      <section class="entrance">
        <p class="eyebrow">A study tower</p>
        <h1>Atlas Ladder</h1>
        <p class="lede">Objectivism, one floor at a time. Atlas carries the globe. You carry the questions.</p>
        <atlas-mascot state="idle" size="lg"></atlas-mascot>
        <p class="pose-name" data-pose-name>Idle</p>
        <div class="pose-row">${buttons}</div>
        <button type="button" class="play-poses">Play the five poses</button>
        <p class="footnote">Short quotations are cited. Anything labeled Paraphrase is our wording, not Rand’s or Peikoff’s.</p>
      </section>
    `;
  }

  _section(section, completed, current, freshSet) {
    let lessonCount = 0;
    const chunks = [];
    for (const unit of section.units) {
      if (unit.status === 'ready') {
        chunks.push(`<p class="unit-name">${escapeHtml(unit.title)}</p>`);
        unit.lessons.forEach((lesson, index) => {
          const key = lessonKey(section.id, unit.id, lesson.id);
          const done = Boolean(completed[key]);
          const unlocked = isLessonUnlocked(this._model.catalog, completed, key);
          const state = done ? 'done' : unlocked ? 'open' : 'locked';
          const side = lessonCount % 2 === 0 ? 'left' : 'right';
          const currentClass = key === current ? ' is-current' : '';
          const freshClass = freshSet.has(key) ? ' is-fresh' : '';
          const num = String(index + 1).padStart(2, '0');
          chunks.push(`
            <div class="floor ${side}${currentClass}${freshClass}">
              <button type="button" class="node" data-lesson data-state="${state}"
                data-section="${escapeHtml(section.id)}" data-unit="${escapeHtml(unit.id)}" data-lesson-id="${escapeHtml(lesson.id)}"
                ${key === current ? 'aria-current="step"' : ''}>
                <span class="octo"><span class="octo-face">${done ? '✓' : state === 'locked' ? '–' : num}</span></span>
                <span class="floor-label">${escapeHtml(lesson.title)}</span>
              </button>
            </div>
          `);
          lessonCount += 1;
        });
      } else {
        chunks.push(`
          <article class="soon">
            <span class="octo dim"><span class="octo-face">···</span></span>
            <div>
              <p class="soon-kicker">Coming soon</p>
              <h3>${escapeHtml(unit.title)}</h3>
              <p>${escapeHtml(unit.summary || '')}</p>
            </div>
          </article>
        `);
      }
    }
    return `
      <section class="stage" data-accent="${escapeHtml(section.accent || 'gold')}">
        <div class="section-stack">
          <header class="plaque">
            <p class="plaque-kicker">${escapeHtml(section.opar || '')}</p>
            <h2>${escapeHtml(section.title)}</h2>
            <p>${escapeHtml(section.summary || '')}</p>
          </header>
          ${chunks.join('')}
        </div>
      </section>
    `;
  }

  _onClick(event) {
    const pose = event.target.closest('[data-pose]');
    if (pose) {
      clearInterval(this._timer);
      this._setPose(pose.dataset.pose);
      return;
    }
    if (event.target.closest('.play-poses')) {
      this._cycle();
      return;
    }
    const button = event.target.closest('[data-lesson]');
    if (!button) return;
    if (button.dataset.state === 'locked') {
      this._toast('Finish the open floor below this one.');
      return;
    }
    this.dispatchEvent(new CustomEvent('open-lesson', {
      bubbles: true,
      composed: true,
      detail: {
        sectionId: button.dataset.section,
        unitId: button.dataset.unit,
        lessonId: button.dataset.lessonId,
      },
    }));
  }

  _setPose(state) {
    const mascot = this.shadowRoot.querySelector('atlas-mascot');
    const label = this.shadowRoot.querySelector('[data-pose-name]');
    mascot?.setAttribute('state', state);
    if (label) label.textContent = state.charAt(0).toUpperCase() + state.slice(1);
    this.shadowRoot.querySelectorAll('[data-pose]').forEach((button) => {
      button.classList.toggle('is-on', button.dataset.pose === state);
    });
  }

  _cycle() {
    clearInterval(this._timer);
    let index = 0;
    this._setPose(POSES[0]);
    this._timer = setInterval(() => {
      index = (index + 1) % POSES.length;
      this._setPose(POSES[index]);
    }, 1500);
  }

  _toast(text) {
    let toast = this.shadowRoot.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('p');
      toast.className = 'toast';
      this.shadowRoot.append(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  }
}

customElements.define('skill-tree', SkillTreeElement);
