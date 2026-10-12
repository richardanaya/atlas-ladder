import { adopt } from '../shared-styles.js';
import { escapeHtml } from '../dom.js';
import { currentLessonKey, isLessonUnlocked, lessonKey } from '../progress-rules.js';

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
    const focus = tower.querySelector('.is-fresh') || tower.querySelector('.is-current') || tower.querySelector('.entrance');
    this.style.visibility = 'hidden';
    requestAnimationFrame(() => {
      focus?.scrollIntoView({ block: 'center' });
      this.style.visibility = 'visible';
    });
  }

  _entrance() {
    return `
      <section class="entrance">
        <atlas-mascot state="idle" size="lg"></atlas-mascot>
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
          const isCurrent = key === current;
          const side = lessonCount % 2 === 0 ? 'left' : 'right';
          const currentClass = isCurrent ? ' is-current' : '';
          const freshClass = freshSet.has(key) ? ' is-fresh' : '';
          const num = String(index + 1).padStart(2, '0');
          const status = isCurrent ? 'Learning' : done ? 'Done' : 'Locked';
          const face = done ? '✓' : state === 'locked' ? '' : num;
          chunks.push(`
            <div class="floor ${side}${currentClass}${freshClass}">
              <button type="button" class="node" data-lesson data-state="${state}"
                data-section="${escapeHtml(section.id)}" data-unit="${escapeHtml(unit.id)}" data-lesson-id="${escapeHtml(lesson.id)}"
                aria-label="${escapeHtml(lesson.title)}. ${status}"
                ${isCurrent ? 'aria-current="step"' : ''}
                ${state === 'locked' ? 'aria-disabled="true"' : ''}>
                <span class="octo"><span class="octo-face">${face}</span></span>
                <span class="status">${status}</span>
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
