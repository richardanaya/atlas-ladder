import { adopt } from './shared-styles.js';

/**
 * Base class for exercise custom elements.
 * Subclasses render a board, report readiness, and grade once.
 *
 * Tap-to-build sentence exercises are a mode of exercise-fill, not a separate tag.
 * The element names are exercise-choice, exercise-match, exercise-fill, and exercise-quote.
 */
export class ExerciseElement extends HTMLElement {
  constructor() {
    super();
    this._data = null;
    this._locked = false;
    this._readyStyles = false;
    this._result = null;
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
    this._locked = false;
    this._result = null;
    this.resetState();
    if (this._readyStyles) this.render();
  }

  async connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    await adopt(this.shadowRoot);
    if (!this.isConnected) return;
    this._readyStyles = true;
    this.render();
  }

  resetState() {}

  render() {}

  isReady() {
    return false;
  }

  evaluate() {
    return { correct: false, feedback: this._data?.feedback || null };
  }

  mark() {}

  lock() {
    this._locked = true;
    this.shadowRoot?.querySelector('.board')?.classList.add('is-locked');
  }

  grade() {
    if (this._locked && this._result) return this._result;
    this._result = this.evaluate();
    this.lock();
    this.mark(this._result);
    return this._result;
  }

  notify() {
    this.dispatchEvent(new CustomEvent('exercise-change', {
      bubbles: true,
      composed: true,
      detail: { ready: this.isReady() },
    }));
  }

  /** Replace the board markup without touching adopted stylesheets. */
  mount(html) {
    let board = this.shadowRoot.querySelector(':scope > .board');
    if (!board) {
      board = document.createElement('div');
      board.className = 'board';
      this.shadowRoot.append(board);
    }
    board.classList.toggle('is-locked', this._locked);
    board.innerHTML = html;
    return board;
  }
}
