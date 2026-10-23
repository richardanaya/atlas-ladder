import { adopt } from '../shared-styles.js';
import { escapeHtml } from '../dom.js';
import { applySlots } from '../assets.js';
import { currentLessonKey, isLessonUnlocked, lessonKey } from '../progress-rules.js';

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.2 9.2 16.5 19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.8 14.7 9l6.6.5-5 4.2 1.6 6.4L12 16.8 6.1 20.1 7.7 13.7 2.7 9.5 9.3 9Z"/></svg>';
const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="10.5" width="12" height="9" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.4 10.5V8.2a3.6 3.6 0 0 1 7.2 0v2.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

function medallion(slot, face, extra = '') {
  const name = extra ? `octo ${extra}` : 'octo';
  return `<span class="${name}"><img class="medallion slot" data-slot="${slot}" alt=""><span class="octo-face">${face}</span></span>`;
}

export class SkillTreeElement extends HTMLElement {
  constructor() {
    super();
    this._model = null;
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
      </footer>
    `;
    applySlots(tower);
    const focus = tower.querySelector('.is-fresh') || tower.querySelector('.is-current');
    this.style.visibility = 'hidden';
    requestAnimationFrame(() => {
      if (focus) {
        const top = focus.getBoundingClientRect().top + window.scrollY;
        if (top > window.innerHeight * 0.85) focus.scrollIntoView({ block: 'center' });
        else window.scrollTo(0, 0);
      }
      this.style.visibility = 'visible';
    });
  }

  _entrance() {
    return `
      <section class="entrance">
        <p class="eyebrow">Study tower</p>
        <atlas-mascot state="idle" size="lg"></atlas-mascot>
      </section>
    `;
  }

  _section(section, completed, current, freshSet) {
    const chunks = [];
    for (const unit of section.units) {
      if (unit.status === 'ready') {
        const floors = [];
        unit.lessons.forEach((lesson, index) => {
          const key = lessonKey(section.id, unit.id, lesson.id);
          const done = Boolean(completed[key]);
          const unlocked = isLessonUnlocked(this._model.catalog, completed, key);
          const state = done ? 'done' : unlocked ? 'open' : 'locked';
          const isCurrent = key === current;
          const currentClass = isCurrent ? ' is-current' : '';
          const freshClass = freshSet.has(key) ? ' is-fresh' : '';
          const num = String(index + 1).padStart(2, '0');
          const status = isCurrent ? 'Learning' : done ? 'Done' : 'Locked';
          const slot = done ? 'floors/done.png' : state === 'locked' ? 'floors/locked.png' : 'floors/current.png';
          const face = done ? CHECK : state === 'locked' ? LOCK : isCurrent ? STAR : num;
          floors.push(`
            <div class="floor${currentClass}${freshClass}">
              <button type="button" class="node" data-lesson data-state="${state}"
                data-section="${escapeHtml(section.id)}" data-unit="${escapeHtml(unit.id)}" data-lesson-id="${escapeHtml(lesson.id)}"
                aria-label="${escapeHtml(lesson.title)}. ${status}"
                ${isCurrent ? 'aria-current="step"' : ''}
                ${state === 'locked' ? 'aria-disabled="true"' : ''}>
                ${medallion(slot, face)}
                <span class="status">${status}</span>
                <span class="floor-label">${escapeHtml(lesson.title)}</span>
              </button>
            </div>
          `);
        });
        chunks.push(`<p class="unit-name">${escapeHtml(unit.title)}</p>`);
        chunks.push(`<div class="floors">${floors.join('')}</div>`);
      } else {
        chunks.push(`
          <article class="soon">
            ${medallion('floors/soon.png', '···', 'dim')}
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
      <section class="stage" data-section-id="${escapeHtml(section.id)}" data-accent="${escapeHtml(section.accent || 'gold')}">
        <div class="section-stack">
          <header class="plaque">
            <h2>${escapeHtml(section.title)}</h2>
            <p>${escapeHtml(section.summary || '')}</p>
          </header>
          ${chunks.join('')}
        </div>
      </section>
    `;
  }

  _onClick(event) {
    const button = event.target.closest('[data-lesson]');
    if (!button) return;
    if (button.dataset.state === 'locked') {
      this._toast('Finish the open floor above this one.');
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

  _toast(text) {
    let toast = document.querySelector('#ladder-toast');
    if (!toast) {
      toast = document.createElement('p');
      toast.id = 'ladder-toast';
      toast.setAttribute('role', 'status');
      document.body.append(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
}

customElements.define('skill-tree', SkillTreeElement);
