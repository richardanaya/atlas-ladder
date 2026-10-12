import { adopt } from '../shared-styles.js';

const FLAME = `
<svg viewBox="0 0 36 46" aria-hidden="true">
  <path class="outer" d="M18 2c4 8 12 12 11 22-1 10-8 16-11 16S7 34 7 24C6 14 14 10 18 2z"/>
  <path class="inner" d="M18 16c2 5 6 7 5 12-1 5-4 8-5 8s-4-3-5-8c-1-5 3-7 5-12z"/>
</svg>
`;

export class StreakFlameElement extends HTMLElement {
  static get observedAttributes() {
    return ['count', 'lit'];
  }

  set count(value) {
    this.setAttribute('count', String(Math.max(0, Number(value) || 0)));
  }

  async connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    await adopt(this.shadowRoot);
    if (!this.isConnected) return;
    this._render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot?.querySelector) this._render();
  }

  _render() {
    if (!this.shadowRoot.querySelector('.flame')) {
      const wrap = document.createElement('div');
      wrap.className = 'flame';
      wrap.innerHTML = `${FLAME}<span class="count"></span>`;
      this.shadowRoot.append(wrap);
    }
    const count = this.getAttribute('count') || '0';
    this.shadowRoot.querySelector('.count').textContent = count;
    const lit = this.hasAttribute('lit') && Number(count) > 0;
    this.shadowRoot.querySelector('.flame').classList.toggle('is-lit', lit);
    this.setAttribute('aria-label', lit ? `${count} day streak` : `${count} day streak, not yet active today`);
  }
}

customElements.define('streak-flame', StreakFlameElement);
