import { adopt } from '../shared-styles.js';
import { escapeHtml } from '../dom.js';
import { applySlots } from '../assets.js';
import { CONFIG } from '../config.js';

const TAGS = {
  choice: 'exercise-choice',
  match: 'exercise-match',
  fill: 'exercise-fill',
  quote: 'exercise-quote',
};

export class LessonPlayerElement extends HTMLElement {
  constructor() {
    super();
    this._session = null;
    this.sound = null;
    this._index = -1;
    this._hearts = CONFIG.hearts;
    this._correct = 0;
    this._ready = false;
    this._bannerOpen = false;
    this._started = 0;
    this._exercise = null;
  }

  set session(value) {
    this._session = value;
    this._index = -1;
    this._hearts = CONFIG.hearts;
    this._correct = 0;
    this._ready = false;
    this._bannerOpen = false;
    this._started = 0;
    if (this.shadowRoot?.querySelector('.lp')) this._showIntro();
  }

  async connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    await adopt(this.shadowRoot);
    if (!this.isConnected) return;
    const root = document.createElement('div');
    root.className = 'lp';
    root.innerHTML = `
      <div class="lp-top">
        <button type="button" class="text-btn" data-exit aria-label="Exit">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
        </button>
        <div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Lesson progress"><span></span></div>
        <div class="hearts" aria-live="polite"></div>
      </div>
      <div class="lp-layout">
        <div class="lp-hero">
          <atlas-mascot size="lg" state="idle"></atlas-mascot>
        </div>
        <div class="lp-main">
          <p class="kicker"></p>
          <div class="stage"></div>
          <div class="actions"><button type="button" class="check" disabled>Check</button></div>
        </div>
      </div>
      <div class="banner" role="status" aria-live="polite">
        <atlas-mascot size="sm" state="cheer"></atlas-mascot>
        <div class="banner-copy">
          <p class="verdict"></p>
          <p class="badge"></p>
          <blockquote class="quoted" hidden></blockquote>
          <p class="note"></p>
          <p class="cite"></p>
        </div>
        <button type="button" class="continue">Continue</button>
      </div>
    `;
    this.shadowRoot.append(root);
    root.querySelector('[data-exit]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('exit', { bubbles: true, composed: true }));
    });
    root.querySelector('.check').addEventListener('click', () => this._check());
    root.querySelector('.continue').addEventListener('click', () => this._continue());
    this.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      if (this._bannerOpen) this._continue();
      else if (this._ready) this._check();
    });
    if (this._session) this._showIntro();
  }

  _mascot() {
    return this.shadowRoot.querySelector('.lp-hero atlas-mascot');
  }

  _showIntro() {
    const session = this._session;
    this._paintHearts();
    this._paintTrack();
    this.shadowRoot.querySelector('.kicker').textContent = `${session.sectionTitle} · ${session.unitTitle}`;
    this._mascot()?.setAttribute('state', 'idle');
    this.shadowRoot.querySelector('.stage').innerHTML = `
      <article class="intro">
        <h2>${escapeHtml(session.title)}</h2>
        <p>${escapeHtml(session.objective)}</p>
        <p class="meta">${session.exercises.length} questions · ${CONFIG.hearts} hearts · up to ${session.exercises.length * CONFIG.xpPerCorrect + CONFIG.perfectBonus} XP</p>
      </article>
    `;
    const check = this.shadowRoot.querySelector('.check');
    check.hidden = false;
    check.disabled = false;
    check.textContent = 'Begin';
    this._ready = true;
    this._closeBanner();
  }

  _showExercise() {
    const exercise = this._session.exercises[this._index];
    const tag = TAGS[exercise.type];
    const stage = this.shadowRoot.querySelector('.stage');
    stage.innerHTML = '';
    stage.classList.remove('shake');
    const node = document.createElement(tag);
    node.data = exercise;
    stage.append(node);
    this._exercise = node;
    this._ready = false;
    node.addEventListener('exercise-change', (event) => {
      this._ready = Boolean(event.detail.ready);
      this.shadowRoot.querySelector('.check').disabled = !this._ready;
    });
    const check = this.shadowRoot.querySelector('.check');
    check.hidden = false;
    check.disabled = true;
    check.textContent = 'Check';
    this.shadowRoot.querySelector('.kicker').textContent = this._session.title;
    this._mascot()?.setAttribute('state', 'thinking');
    this._paintTrack();
    this._closeBanner();
  }

  _check() {
    if (!this._ready) return;
    if (this._index < 0) {
      this._index = 0;
      this._started = Date.now();
      this._showExercise();
      return;
    }
    const result = this._exercise?.grade();
    if (!result) return;
    this._ready = false;
    if (result.correct) {
      this._correct += 1;
      this.sound?.play('correct');
      this._mascot()?.setAttribute('state', 'cheer');
    } else {
      this._hearts -= 1;
      this.sound?.play('incorrect');
      this._mascot()?.setAttribute('state', 'encourage');
      const stage = this.shadowRoot.querySelector('.stage');
      stage.classList.remove('shake');
      void stage.offsetWidth;
      stage.classList.add('shake');
    }
    this._paintHearts();
    this._openBanner(result);
  }

  _openBanner(result) {
    const banner = this.shadowRoot.querySelector('.banner');
    const feedback = result.feedback || {};
    banner.dataset.result = result.correct ? 'correct' : 'wrong';
    banner.querySelector('.verdict').textContent = result.correct ? 'Correct' : 'Not quite';
    banner.querySelector('atlas-mascot').setAttribute('state', result.correct ? 'cheer' : 'encourage');
    const badge = banner.querySelector('.badge');
    const quoted = banner.querySelector('.quoted');
    const note = banner.querySelector('.note');
    const cite = banner.querySelector('.cite');
    badge.textContent = feedback.kind === 'quote' ? 'Quoted' : 'Paraphrase';
    if (feedback.kind === 'quote' && feedback.quote) {
      quoted.hidden = false;
      quoted.textContent = feedback.quote;
    } else {
      quoted.hidden = true;
      quoted.textContent = '';
    }
    note.textContent = feedback.note || '';
    cite.textContent = feedback.citation || '';
    banner.classList.add('open');
    this._bannerOpen = true;
    this.shadowRoot.querySelector('.actions').hidden = true;
    const cont = banner.querySelector('.continue');
    cont.textContent = this._hearts <= 0 ? 'See where you stand' : 'Continue';
  }

  _closeBanner() {
    const banner = this.shadowRoot.querySelector('.banner');
    banner.classList.remove('open');
    this._bannerOpen = false;
    this.shadowRoot.querySelector('.actions').hidden = false;
  }

  _continue() {
    if (!this._bannerOpen) return;
    if (this._hearts <= 0) {
      this._showFail();
      return;
    }
    this._index += 1;
    if (this._index >= this._session.exercises.length) {
      this._finish();
      return;
    }
    this._showExercise();
  }

  _showFail() {
    this._closeBanner();
    this.shadowRoot.querySelector('.actions').hidden = true;
    this._mascot()?.setAttribute('state', 'encourage');
    this.shadowRoot.querySelector('.stage').innerHTML = `
      <article class="intro">
        <h2>Out of hearts</h2>
        <p>A wrong answer costs a heart. This floor stays where it is. Start it again whenever you want. Nothing was saved.</p>
        <button type="button" class="check" data-retry>Try this floor again</button>
      </article>
    `;
    this.shadowRoot.querySelector('[data-retry]').addEventListener('click', () => {
      this.session = this._session;
    });
  }

  _finish() {
    this.dispatchEvent(new CustomEvent('finished', {
      bubbles: true,
      composed: true,
      detail: {
        correct: this._correct,
        total: this._session.exercises.length,
        heartsLeft: this._hearts,
        elapsedMs: Date.now() - this._started,
      },
    }));
  }

  _paintHearts() {
    const wrap = this.shadowRoot.querySelector('.hearts');
    if (!wrap) return;
    const bits = [];
    for (let i = 0; i < CONFIG.hearts; i += 1) {
      const on = i < this._hearts;
      const slot = on ? 'icons/heart.png' : 'icons/heart-empty.png';
      bits.push(`<span class="heart-slot"><img class="slot" data-slot="${slot}" alt=""><svg class="heart ${on ? 'is-on' : ''}" viewBox="0 0 24 22" aria-hidden="true"><path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"/></svg></span>`);
    }
    wrap.innerHTML = bits.join('');
    wrap.setAttribute('aria-label', `${this._hearts} hearts left`);
    applySlots(wrap);
  }

  _paintTrack() {
    const track = this.shadowRoot.querySelector('.track');
    const fill = track?.querySelector('span');
    if (!fill || !this._session) return;
    const total = this._session.exercises.length;
    const step = this._index < 0 ? 0 : (this._index + 1) / total;
    fill.style.transform = `scaleX(${step})`;
    track.setAttribute('aria-valuenow', String(Math.round(step * 100)));
  }
}

customElements.define('lesson-player', LessonPlayerElement);
