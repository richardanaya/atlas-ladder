import { adopt } from '../shared-styles.js';
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
        <span class="lvl"></span>
        <span class="track" aria-hidden="true"><span class="fill"></span></span>
        <span class="num"></span>
      `;
      this.shadowRoot.append(wrap);
    }
    const xp = this.xp;
    const level = levelFor(xp);
    const into = xpIntoLevel(xp);
    const ratio = into / CONFIG.xpPerLevel;
    const root = this.shadowRoot;
    root.querySelector('.lvl').textContent = String(level);
    root.querySelector('.num').textContent = `${xp} XP`;
    root.querySelector('.fill').style.transform = `scaleX(${ratio})`;
    this.setAttribute('aria-label', `Level ${level}, ${xp} XP`);
  }
}

customElements.define('xp-bar', XpBarElement);
