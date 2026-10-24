import { escapeHtml, shuffle } from '../dom.js';
import { ExerciseElement } from '../exercise-element.js';

export class ExerciseQuoteElement extends ExerciseElement {
  resetState() {
    this._selected = null;
  }

  isReady() {
    return Boolean(this._selected);
  }

  evaluate() {
    return {
      correct: this._selected === this.data.answer,
      feedback: this.data.feedback,
    };
  }

  mark(result) {
    this.shadowRoot.querySelectorAll('.option').forEach((button) => {
      const id = button.dataset.id;
      if (id === this.data.answer) button.classList.add('is-correct');
      else if (id === this._selected && !result.correct) button.classList.add('is-wrong');
    });
  }

  render() {
    if (!this.data) return;
    const choices = shuffle(this.data.choices).map((choice) => `
      <button type="button" class="option" data-id="${escapeHtml(choice.id)}" aria-pressed="false">
        <span>${escapeHtml(choice.text)}</span>
      </button>
    `).join('');
    const board = this.mount(`
      <p class="prompt">${escapeHtml(this.data.prompt)}</p>
      <blockquote>${escapeHtml(this.data.quote)}</blockquote>
      <div class="options">${choices}</div>
    `);
    board.querySelector('.options').addEventListener('click', (event) => {
      const button = event.target.closest('.option');
      if (!button || this._locked) return;
      this._selected = button.dataset.id;
      board.querySelectorAll('.option').forEach((item) => {
        const on = item === button;
        item.classList.toggle('is-selected', on);
        item.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      this.notify();
    });
  }
}

customElements.define('exercise-quote', ExerciseQuoteElement);
