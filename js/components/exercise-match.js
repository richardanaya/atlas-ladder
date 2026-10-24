import { escapeHtml, shuffle } from '../dom.js';
import { ExerciseElement } from '../exercise-element.js';

/**
 * Match pairs by dragging a tile onto its partner, or by tapping one side and then the other.
 */
export class ExerciseMatchElement extends ExerciseElement {
  resetState() {
    this._pairs = new Map();
    this._selected = null;
    this._drag = null;
  }

  isReady() {
    return this.data?.pairs && this._pairs.size === this.data.pairs.length;
  }

  evaluate() {
    const correct = this.data.pairs.every((pair) => this._pairs.get(pair.id) === pair.id);
    return { correct, feedback: this.data.feedback };
  }

  mark(result) {
    this.shadowRoot.querySelectorAll('[data-chip]').forEach((chip) => {
      const side = chip.dataset.side;
      const id = chip.dataset.id;
      let ok = false;
      if (side === 'left') ok = this._pairs.get(id) === id;
      else ok = [...this._pairs.entries()].some(([left, right]) => right === id && left === id);
      chip.classList.add(ok ? 'is-correct' : 'is-wrong');
      if (!result.correct && !ok) chip.classList.add('is-miss');
    });
  }

  render() {
    if (!this.data) return;
    const left = shuffle(this.data.pairs.map((pair) => ({ id: pair.id, text: pair.left })));
    const right = shuffle(this.data.pairs.map((pair) => ({ id: pair.id, text: pair.right })));
    const chip = (item, side) => `
      <button type="button" class="chip" data-chip data-side="${side}" data-id="${escapeHtml(item.id)}">
        ${escapeHtml(item.text)}
      </button>`;
    const board = this.mount(`
      <p class="prompt">${escapeHtml(this.data.prompt)}</p>
      <p class="hint">Drag a tile to its match, or tap one side and then the other.</p>
      <div class="match">
        <div class="col">${left.map((item) => chip(item, 'left')).join('')}</div>
        <div class="col">${right.map((item) => chip(item, 'right')).join('')}</div>
      </div>
    `);
    board.addEventListener('pointerdown', (event) => this._down(event));
    board.addEventListener('pointermove', (event) => this._move(event));
    board.addEventListener('pointerup', (event) => this._up(event));
    board.addEventListener('pointercancel', (event) => this._up(event));
  }

  _chipAt(x, y) {
    const stack = this.shadowRoot.elementsFromPoint?.(x, y) || document.elementsFromPoint(x, y);
    for (const node of stack) {
      const chip = node.closest?.('[data-chip]');
      if (chip && this.shadowRoot.contains(chip)) return chip;
    }
    return null;
  }

  _down(event) {
    const chip = event.target.closest('[data-chip]');
    if (!chip || this._locked) return;
    if (event.cancelable) event.preventDefault();
    chip.setPointerCapture?.(event.pointerId);
    const rect = chip.getBoundingClientRect();
    this._drag = {
      id: event.pointerId,
      chip,
      x: event.clientX,
      y: event.clientY,
      originX: rect.left,
      originY: rect.top,
      width: rect.width,
      dragging: false,
      ghost: null,
    };
  }

  _move(event) {
    const drag = this._drag;
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.dragging && Math.hypot(dx, dy) > 8) {
      drag.dragging = true;
      const ghost = drag.chip.cloneNode(true);
      ghost.classList.add('ghost');
      ghost.style.left = `${drag.originX}px`;
      ghost.style.top = `${drag.originY}px`;
      ghost.style.width = `${drag.width}px`;
      this.shadowRoot.append(ghost);
      drag.ghost = ghost;
      drag.chip.classList.add('is-ghosted');
    }
    if (drag.ghost) drag.ghost.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  _up(event) {
    const drag = this._drag;
    if (!drag || event.pointerId !== drag.id) return;
    const target = drag.dragging ? this._chipAt(event.clientX, event.clientY) : null;
    drag.ghost?.remove();
    drag.chip.classList.remove('is-ghosted');
    this._drag = null;
    if (drag.dragging) {
      if (target && target.dataset.side !== drag.chip.dataset.side) this._pair(drag.chip, target);
      return;
    }
    this._tap(drag.chip);
  }

  _tap(chip) {
    if (this._selected && this._selected.dataset.side !== chip.dataset.side) {
      this._pair(this._selected, chip);
      this._selected = null;
      this._paint();
      return;
    }
    if (this._selected === chip) {
      this._selected = null;
    } else {
      this._selected = chip;
    }
    this._paint();
  }

  _pair(a, b) {
    const left = a.dataset.side === 'left' ? a : b;
    const right = a.dataset.side === 'right' ? a : b;
    const leftId = left.dataset.id;
    const rightId = right.dataset.id;
    for (const [existingLeft, existingRight] of [...this._pairs.entries()]) {
      if (existingLeft === leftId || existingRight === rightId) this._pairs.delete(existingLeft);
    }
    this._pairs.set(leftId, rightId);
    this._selected = null;
    this._paint();
    this.notify();
  }

  _paint() {
    this.shadowRoot.querySelectorAll('[data-chip]').forEach((chip) => {
      const id = chip.dataset.id;
      const side = chip.dataset.side;
      const paired = side === 'left'
        ? this._pairs.has(id)
        : [...this._pairs.values()].includes(id);
      chip.classList.toggle('is-paired', paired);
      chip.classList.toggle('is-selected', chip === this._selected);
    });
  }
}

customElements.define('exercise-match', ExerciseMatchElement);
