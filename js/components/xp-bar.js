import { adopt } from '../shared-styles.js';
import { applySlots } from '../assets.js';
import { CONFIG } from '../config.js';
import { levelFor, xpIntoLevel } from '../progress-rules.js';

export class XpBarElement extends HTMLElement {
  static get observedAttributes() {
    return ['xp'];
  }

  set xp(value) {
    this.setAttribute('xp', String(Math.max(0, Number(value) || 0)));
  }

  get xp() {
    return Number(this.getAttribute('xp') || 0);
  }

  async connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    await adopt(this.shadowRoot);
    if (!this.isConnected) return;
    this._render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this._render();
  }

  _render() {
    if (!this.shadowRoot.querySelector('.xp')) {
      this.shadowRoot.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'xp';
      wrap.innerHTML = `
        <div class="ring-wrap">
          <img class="slot xp-plate" data-slot="icons/xp.png" alt="">
          <svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle class="ring-track" cx="60" cy="60" r="46"></circle>
            <circle class="ring-value" cx="60" cy="60" r="46"></circle>
          </svg>
        </div>
        <span class="num"></span>
        <span class="lvl"></span>
      `;
      this.shadowRoot.append(wrap);
      applySlots(wrap);
    }
    const xp = this.xp;
    const level = levelFor(xp);
    const into = xpIntoLevel(xp);
    const ratio = into / CONFIG.xpPerLevel;
    const root = this.shadowRoot;
    const ring = root.querySelector('.ring-value');
    const radius = 46;
    const circ = 2 * Math.PI * radius;
    ring.style.strokeDasharray = String(circ);
    ring.style.strokeDashoffset = String(circ * (1 - ratio));
    ring.setAttribute('stroke-linecap', ratio > 0.03 ? 'round' : 'butt');
    root.querySelector('.lvl').textContent = `Level ${level}`;
    root.querySelector('.num').textContent = `${xp} XP`;
    this.setAttribute('aria-label', `Level ${level}, ${xp} XP`);
  }
}

customElements.define('xp-bar', XpBarElement);
