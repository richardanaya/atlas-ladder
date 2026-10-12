import { adopt } from '../shared-styles.js';
import { Celebration } from '../celebration.js';
import { escapeHtml } from '../dom.js';
import { reducedMotion } from '../motion.js';

export class LessonCompleteElement extends HTMLElement {
  constructor() {
    super();
    this._stats = null;
    this.celebration = new Celebration();
  }

  set stats(value) {
    this._stats = value;
    if (this.shadowRoot?.querySelector('.done')) this._fill();
  }

  async connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    await adopt(this.shadowRoot);
    if (!this.isConnected) return;
    const root = document.createElement('div');
    root.className = 'done';
    root.innerHTML = `
      <div class="confetti-layer"></div>
      <div class="sun"></div>
      <p class="kicker">Floor cleared</p>
      <h2>The globe stays up</h2>
      <atlas-mascot state="celebrate" size="lg"></atlas-mascot>
      <p class="xp-pop">+0 XP</p>
      <div class="level-burst" hidden>
        <span class="ring"></span>
        <p></p>
      </div>
      <ul class="stats"></ul>
      <button type="button" class="continue">Back to the tower</button>
    `;
    this.shadowRoot.append(root);
    root.querySelector('.continue').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('continue', { bubbles: true, composed: true }));
    });
    if (this._stats) this._fill();
  }

  _fill() {
    const stats = this._stats;
    const root = this.shadowRoot.querySelector('.done');
    if (!root || !stats) return;
    const perfect = stats.perfect ? 'Perfect floor' : `${stats.correct} of ${stats.total} correct`;
    const seconds = Math.max(1, Math.round((stats.elapsedMs || 0) / 1000));
    root.querySelector('.stats').innerHTML = `
      <li><span>Accuracy</span><strong>${escapeHtml(perfect)}</strong></li>
      <li><span>Hearts left</span><strong>${escapeHtml(String(stats.heartsLeft))}</strong></li>
      <li><span>Streak</span><strong>${escapeHtml(String(stats.streak))} day${stats.streak === 1 ? '' : 's'}</strong></li>
      <li><span>Time</span><strong>${escapeHtml(String(seconds))}s</strong></li>
    `;
    const xp = root.querySelector('.xp-pop');
    this.celebration.tick(0, stats.xpGained, (value) => {
      xp.textContent = stats.already && stats.xpGained === 0 ? 'Practice round' : `+${value} XP`;
    });
    this.celebration.confetti(root.querySelector('.confetti-layer'));
    if (stats.levelUp) {
      const burst = root.querySelector('.level-burst');
      burst.hidden = false;
      burst.querySelector('p').textContent = `Level ${stats.level}`;
      if (reducedMotion()) burst.querySelector('.ring').style.animation = 'none';
    }
  }
}

customElements.define('lesson-complete', LessonCompleteElement);
