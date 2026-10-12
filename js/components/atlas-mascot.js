import { adopt } from '../shared-styles.js';
import { reducedMotion } from '../motion.js';

/**
 * <atlas-mascot state="idle|thinking|encourage|cheer|celebrate" size="sm|md|lg">
 *
 * Atlas is hand-built inline SVG so the page has no animation runtime.
 * Looping motion is CSS (breathing, blink, globe bob, spin). One-shot hops,
 * nods, and the hoist use the Web Animations API.
 *
 * To swap in a Rive or Lottie file later, replace the SVG inside .stage and
 * keep driving the same `state` attribute. Do not change the attribute names.
 */
const ART = `
<svg class="atlas" viewBox="0 0 260 340" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bronze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F7F7F5"/>
      <stop offset="42%" stop-color="#A8C4CF"/>
      <stop offset="100%" stop-color="#477B8E"/>
    </linearGradient>
    <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#A8C4CF"/>
    </linearGradient>
    <filter id="globeGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <style>
      .arm { fill: none; stroke: url(#bronze); stroke-width: 16; stroke-linecap: round; }
      .hand, .fist, .leg { fill: url(#bronze); stroke: #2A4E5A; stroke-width: 1; }
      .head, .ear { fill: url(#face); stroke: #2A4E5A; stroke-width: 1.2; }
      .boot { fill: #A8C4CF; stroke: #2A4E5A; stroke-width: 1.2; }
      .tunic { fill: #2A4E5A; stroke: #A8C4CF; stroke-width: 2; }
      .hem, .boot-line, .band { fill: none; stroke: #A8C4CF; stroke-width: 3; stroke-linecap: round; }
      .belt { fill: #477B8E; }
      .eye { fill: #020202; }
      .catch { fill: #F7F7F5; }
      .lid { fill: #C5D5DC; }
      .cheek { fill: #477B8E; opacity: 0.35; }
      .mouth, .brow { fill: none; stroke: #2A4E5A; stroke-width: 2.3; stroke-linecap: round; }
      .gem { fill: #F7F7F5; stroke: #2A4E5A; stroke-width: 0.6; }
      .shadow { fill: #000; opacity: 0.28; }
      .motion { fill: none; stroke: #A8C4CF; stroke-width: 2.2; stroke-linecap: round; opacity: 0.75; }
      .rays line { stroke: #C5D5DC; stroke-width: 3; stroke-linecap: round; }
    </style>
    <symbol id="globe" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="#F7F7F5"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#2A4E5A" stroke-width="3.5"/>
      <ellipse cx="50" cy="50" rx="18" ry="46" fill="none" stroke="#477B8E" stroke-width="1.6"/>
      <ellipse cx="50" cy="50" rx="46" ry="15" fill="none" stroke="#477B8E" stroke-width="1.4"/>
      <path d="M8 50h84M50 6v88" stroke="#376270" stroke-width="1.1" opacity="0.7"/>
      <path d="M30 30c8-7 18-3 20 6 1 8-7 13-15 11-8-2-12-9-5-17z" fill="#376270"/>
      <path d="M58 46c9 0 14 7 10 14-5 6-15 4-18-3-2-5 2-11 8-11z" fill="#477B8E"/>
      <path d="M36 64c6 1 11 7 7 12-4 4-12 1-14-4-1-4 3-8 7-8z" fill="#2A4E5A"/>
    </symbol>
  </defs>

  <g class="pose pose-idle">
    <g class="bob">
      <ellipse class="shadow" cx="130" cy="318" rx="52" ry="8"/>
      <g class="globe-bob" filter="url(#globeGlow)">
        <use href="#globe" x="80" y="6" width="100" height="100"/>
      </g>
      <path class="arm" d="M102 186 C74 150 74 112 98 96"/>
      <path class="arm" d="M158 186 C186 150 186 112 162 96"/>
      <circle class="hand" cx="98" cy="96" r="10"/>
      <circle class="hand" cx="162" cy="96" r="10"/>
      ${body(130, 156, 'smile')}
    </g>
  </g>

  <g class="pose pose-thinking">
    <ellipse class="shadow" cx="130" cy="318" rx="52" ry="8"/>
    <g class="think-sway">
      <g class="globe-spin" filter="url(#globeGlow)">
        <use href="#globe" x="78" y="8" width="96" height="96"/>
      </g>
      <path class="arm" d="M100 186 C70 148 72 114 96 98"/>
      <circle class="hand" cx="96" cy="98" r="10"/>
      ${body(130, 158, 'think', { tilt: true })}
    </g>
  </g>

  <g class="pose pose-encourage">
    <ellipse class="shadow" cx="130" cy="318" rx="52" ry="8"/>
    <g class="nod">
      <g filter="url(#globeGlow)">
        <use href="#globe" x="70" y="10" width="96" height="96"/>
      </g>
      <path class="arm" d="M98 186 C68 150 70 116 90 100"/>
      <circle class="hand" cx="90" cy="100" r="10"/>
      <path class="arm" d="M162 184 C188 196 184 214 176 206"/>
      <g class="thumb" transform="translate(162,178) rotate(-8)">
        <rect x="0" y="4" width="28" height="34" rx="11" fill="url(#bronze)" stroke="#2A4E5A" stroke-width="1.4"/>
        <rect x="16" y="-14" width="13" height="26" rx="6" fill="url(#bronze)" stroke="#2A4E5A" stroke-width="1.4"/>
      </g>
      ${body(124, 158, 'grin')}
    </g>
  </g>

  <g class="pose pose-cheer">
    <ellipse class="shadow" cx="130" cy="322" rx="40" ry="6"/>
    <g class="hop">
      <g class="motion">
        <path d="M86 300 q10 8 0 14" />
        <path d="M174 300 q-10 8 0 14" />
      </g>
      <g filter="url(#globeGlow)">
        <use href="#globe" x="78" y="4" width="96" height="96"/>
      </g>
      <path class="arm" d="M100 176 C72 140 74 108 96 90"/>
      <circle class="hand" cx="96" cy="90" r="10"/>
      <path class="arm" d="M160 176 C196 150 198 132 184 124"/>
      <circle class="fist" cx="184" cy="122" r="13"/>
      ${body(128, 150, 'grin', { jumping: true })}
    </g>
  </g>

  <g class="pose pose-celebrate">
    <ellipse class="shadow" cx="130" cy="318" rx="54" ry="8"/>
    <g class="hoist">
      <g transform="translate(130,58)">
        <g class="rays">${rays()}</g>
      </g>
      <g class="globe-hoist" filter="url(#globeGlow)">
        <use href="#globe" x="78" y="8" width="104" height="104"/>
      </g>
      <path class="arm" d="M104 184 C70 120 62 78 96 62"/>
      <path class="arm" d="M156 184 C190 120 198 78 164 62"/>
      <circle class="hand" cx="96" cy="64" r="10"/>
      <circle class="hand" cx="164" cy="64" r="10"/>
      ${body(130, 168, 'grin')}
    </g>
  </g>
</svg>
`;

function rays() {
  let out = '';
  for (let i = 0; i < 12; i += 1) {
    out += `<line x1="0" y1="62" x2="0" y2="78" transform="rotate(${i * 30})" />`;
  }
  return out;
}

function face(kind) {
  const mouth = {
    smile: 'M116 168 Q130 178 144 168',
    think: 'M118 170 Q130 168 142 172',
    grin: 'M112 166 Q130 184 148 166',
  }[kind];
  const brows = kind === 'think'
    ? '<path class="brow" d="M108 140 Q118 132 128 140"/><path class="brow" d="M136 136 Q146 130 156 138"/>'
    : '<path class="brow" d="M108 142 Q118 136 128 142"/><path class="brow" d="M134 142 Q144 136 154 142"/>';
  return `
    <ellipse class="ear" cx="96" cy="156" rx="7" ry="10"/>
    <ellipse class="ear" cx="164" cy="156" rx="7" ry="10"/>
    <circle class="head" cx="130" cy="156" r="34"/>
    <path class="band" d="M100 146 H160"/>
    <circle class="gem" cx="130" cy="146" r="3.2"/>
    ${brows}
    <ellipse class="eye" cx="118" cy="156" rx="4.6" ry="5.6"/>
    <ellipse class="eye" cx="144" cy="156" rx="4.6" ry="5.6"/>
    <ellipse class="catch" cx="119.5" cy="154.2" rx="1.3" ry="1.3"/>
    <ellipse class="catch" cx="145.5" cy="154.2" rx="1.3" ry="1.3"/>
    <ellipse class="lid" cx="118" cy="156" rx="6" ry="6.4"/>
    <ellipse class="lid" cx="144" cy="156" rx="6" ry="6.4"/>
    <ellipse class="cheek" cx="108" cy="166" rx="5" ry="3"/>
    <ellipse class="cheek" cx="152" cy="166" rx="5" ry="3"/>
    <path class="mouth" d="${mouth}"/>
  `;
}

function body(x, headY, expression, options = {}) {
  const { tilt = false, jumping = false } = options;
  const dx = x - 130;
  const dy = headY - 156;
  const legs = jumping
    ? `
      <g transform="translate(${dx} ${dy})">
        <rect class="leg" x="104" y="236" width="18" height="34" rx="8" transform="rotate(16 113 250)"/>
        <rect class="leg" x="140" y="232" width="18" height="36" rx="8" transform="rotate(-20 149 248)"/>
        <rect class="boot" x="96" y="262" width="30" height="16" rx="4" transform="rotate(12 110 270)"/>
        <rect class="boot" x="142" y="258" width="30" height="16" rx="4" transform="rotate(-16 156 266)"/>
      </g>`
    : `
      <g transform="translate(${dx} ${dy})">
        <rect class="leg" x="106" y="246" width="18" height="42" rx="8"/>
        <rect class="leg" x="136" y="246" width="18" height="42" rx="8"/>
        <rect class="boot" x="98" y="282" width="32" height="18" rx="4"/>
        <rect class="boot" x="130" y="282" width="32" height="18" rx="4"/>
        <path class="boot-line" d="M100 290 H128 M132 290 H160"/>
      </g>`;
  return `
    <g transform="translate(${dx} ${dy})">
      <path class="tunic" d="M98 188 H162 L176 246 H84 Z"/>
      <path class="hem" d="M86 240 H174"/>
      <rect class="belt" x="96" y="228" width="68" height="11" rx="2"/>
      <g class="sun" transform="translate(130 210)">
        <circle r="7" fill="none" stroke="#A8C4CF" stroke-width="1.3"/>
        <path d="M0-11V-7M0 7V11M-11 0H-7M7 0H11M-7-7l3 3M7 7l-3-3M7-7l-3 3M-7 7l3-3" fill="none" stroke="#A8C4CF" stroke-width="1.2"/>
      </g>
      ${tilt ? '' : face(expression)}
    </g>
    ${tilt ? `
      <g transform="translate(${dx} ${dy})">
        <g class="head-tilt">
          <path class="arm" d="M${160 - dx} ${186 - dy} C${196 - dx} ${174 - dy} ${184 - dx} ${154 - dy} ${146 - dx} ${164 - dy}"/>
          <circle class="hand" cx="${144 - dx}" cy="${166 - dy}" r="10"/>
          ${face(expression)}
        </g>
      </g>` : ''}
    ${legs}
  `;
}

export class AtlasMascotElement extends HTMLElement {
  static get observedAttributes() {
    return ['state', 'size'];
  }

  constructor() {
    super();
    this._built = false;
  }

  async connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    await adopt(this.shadowRoot);
    if (!this.isConnected) return;
    if (!this._built) {
      const root = document.createElement('div');
      root.className = 'stage';
      root.innerHTML = ART;
      this.shadowRoot.append(root);
      this._built = true;
    }
    if (!this.getAttribute('state')) this.setAttribute('state', 'idle');
    this._syncLabel();
  }

  attributeChangedCallback(name, oldValue, value) {
    if (name === 'state') {
      this._syncLabel();
      if (oldValue && oldValue !== value) this._accent(value);
    }
  }

  _syncLabel() {
    const state = this.getAttribute('state') || 'idle';
    this.setAttribute('aria-label', `Atlas, ${state}`);
  }

  _accent(state) {
    if (!this.shadowRoot || reducedMotion()) return;
    const pose = this.shadowRoot.querySelector(`.pose-${state}`);
    if (!pose) return;
    if (state === 'cheer') {
      const hop = pose.querySelector('.hop');
      hop?.animate(
        [
          { transform: 'translateY(0)' },
          { transform: 'translateY(-22px)' },
          { transform: 'translateY(0)' },
          { transform: 'translateY(-10px)' },
          { transform: 'translateY(0)' },
        ],
        { duration: 620, easing: 'ease-out' },
      );
    } else if (state === 'encourage') {
      const nod = pose.querySelector('.nod');
      nod?.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(7deg)' },
          { transform: 'rotate(-2deg)' },
          { transform: 'rotate(0deg)' },
        ],
        { duration: 560, easing: 'ease-in-out' },
      );
    } else if (state === 'celebrate') {
      const globe = pose.querySelector('.globe-hoist');
      globe?.animate(
        [
          { transform: 'translateY(10px)' },
          { transform: 'translateY(-16px)' },
          { transform: 'translateY(-8px)' },
        ],
        { duration: 700, easing: 'ease-out', fill: 'forwards' },
      );
    }
  }
}

customElements.define('atlas-mascot', AtlasMascotElement);
