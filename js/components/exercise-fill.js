import { escapeHtml, shuffle } from '../dom.js';
import { ExerciseElement } from '../exercise-element.js';

/**
 * Word-bank fill-in, and tap-to-build sentence order.
 * mode: "blanks" | "sentence"
 */
export class ExerciseFillElement extends ExerciseElement {
  resetState() {
    this._placed = {};
    this._order = [];
  }

  isReady() {
    if (!this.data) return false;
    if (this.data.mode === 'sentence') return this._order.length === this.data.answer.length;
    return this.data.parts.filter((part) => part.type === 'blank').every((part) => this._placed[part.id]);
  }

  evaluate() {
    if (this.data.mode === 'sentence') {
      const correct = this.data.answer.every((id, index) => this._order[index] === id);
      return { correct, feedback: this.data.feedback };
    }
    const correct = this.data.parts
      .filter((part) => part.type === 'blank')
      .every((part) => (this._placed[part.id] || '').trim().toLowerCase() === part.answer.trim().toLowerCase());
    return { correct, feedback: this.data.feedback };
  }

  mark() {
    if (this.data.mode === 'sentence') {
      this.shadowRoot.querySelectorAll('.built .token').forEach((token, index) => {
        token.classList.add(token.dataset.id === this.data.answer[index] ? 'is-correct' : 'is-wrong');
      });
      return;
    }
    this.shadowRoot.querySelectorAll('.slot').forEach((slot) => {
      const part = this.data.parts.find((item) => item.id === slot.dataset.id);
      const value = (this._placed[slot.dataset.id] || '').trim().toLowerCase();
      slot.classList.add(value === part.answer.trim().toLowerCase() ? 'is-correct' : 'is-wrong');
    });
  }

  render() {
    if (!this.data) return;
    const sentence = this.data.mode === 'sentence' ? this._sentenceHtml() : this._blanksHtml();
    // A new order on every render, including a retry. Grading uses token id or the word itself.
    const bank = this.data.mode === 'sentence'
      ? shuffle(this.data.tokens)
      : shuffle(this.data.bank.map((word, index) => ({ id: `w${index}`, text: word })));
    this._bank = bank;
    const board = this.mount(`
      <p class="prompt">${escapeHtml(this.data.prompt)}</p>
      <div class="builder">${sentence}</div>
      <div class="bank"></div>
    `);
    this._board = board;
    this._paint();
    board.addEventListener('click', (event) => this._click(event));
  }

  _sentenceHtml() {
    return `<div class="built" aria-label="Your sentence"></div>`;
  }

  _blanksHtml() {
    const html = this.data.parts.map((part) => {
      if (part.type === 'text') return `<span class="words">${escapeHtml(part.text)}</span>`;
      return `<button type="button" class="slot" data-slot data-id="${escapeHtml(part.id)}"></button>`;
    }).join('');
    return `<div class="line">${html}</div>`;
  }

  _click(event) {
    if (this._locked) return;
    const token = event.target.closest('[data-token]');
    const slot = event.target.closest('[data-slot]');
    const built = event.target.closest('.built .token');
    if (this.data.mode === 'sentence') {
      if (token && token.closest('.bank')) {
        if (this._order.length >= this.data.answer.length) return;
        this._order.push(token.dataset.id);
      } else if (built) {
        const index = Number(built.dataset.index);
        this._order.splice(index, 1);
      }
    } else if (token && token.closest('.bank')) {
      const empty = this.data.parts.find((part) => part.type === 'blank' && !this._placed[part.id]);
      if (!empty) return;
      this._placed[empty.id] = token.dataset.text;
    } else if (slot && this._placed[slot.dataset.id]) {
      delete this._placed[slot.dataset.id];
    }
    this._paint();
    this.notify();
  }

  _paint() {
    const bank = this._board.querySelector('.bank');
    if (!bank) return;
    if (this.data.mode === 'sentence') {
      const used = new Set(this._order);
      bank.innerHTML = this._bank.filter((token) => !used.has(token.id)).map((token) => `
        <button type="button" class="token" data-token data-id="${escapeHtml(token.id)}">${escapeHtml(token.text)}</button>
      `).join('');
      const built = this._board.querySelector('.built');
      built.innerHTML = this._order.map((id, index) => {
        const token = this.data.tokens.find((item) => item.id === id);
        return `<button type="button" class="token" data-index="${index}" data-id="${escapeHtml(id)}">${escapeHtml(token.text)}</button>`;
      }).join('') || '<span class="placeholder">Tap words in order</span>';
      return;
    }
    const remaining = [...this._bank];
    for (const word of Object.values(this._placed)) {
      const index = remaining.findIndex((token) => token.text.toLowerCase() === word.toLowerCase());
      if (index >= 0) remaining.splice(index, 1);
    }
    bank.innerHTML = remaining.map((token) => `
      <button type="button" class="token" data-token data-text="${escapeHtml(token.text)}">${escapeHtml(token.text)}</button>
    `).join('');
    this._board.querySelectorAll('.slot').forEach((slot) => {
      const word = this._placed[slot.dataset.id];
      slot.textContent = word || '';
      slot.classList.toggle('is-filled', Boolean(word));
    });
  }
}

customElements.define('exercise-fill', ExerciseFillElement);
