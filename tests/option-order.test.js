import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.customElements = dom.window.customElements;
globalThis.ShadowRoot = dom.window.ShadowRoot;
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);

const { ExerciseChoiceElement } = await import('../js/components/exercise-choice.js');
const { ExerciseQuoteElement } = await import('../js/components/exercise-quote.js');
const { ExerciseMatchElement } = await import('../js/components/exercise-match.js');
const { ExerciseFillElement } = await import('../js/components/exercise-fill.js');

function mount(Element, data) {
  const el = new Element();
  el.attachShadow({ mode: 'open' });
  el._data = structuredClone(data);
  el.resetState();
  el.render();
  return el;
}

const choice = {
  id: 'q1',
  type: 'choice',
  prompt: 'Which claim follows?',
  answer: 'right',
  choices: [
    { id: 'right', text: 'Existence is independent of awareness' },
    { id: 'ideal', text: 'Only ideas exist' },
    { id: 'perc', text: 'To be is to be perceived' },
    { id: 'wish', text: 'A wish is enough to make it so' },
  ],
  feedback: { kind: 'paraphrase', note: 'The fact does not wait on a perceiver.' },
};

test('a rendered choice puts the correct answer in every position', () => {
  const seen = new Set();
  for (let n = 0; n < 400; n += 1) {
    const el = mount(ExerciseChoiceElement, choice);
    const buttons = [...el.shadowRoot.querySelectorAll('.option')];
    assert.equal(buttons.length, 4);
    const index = buttons.findIndex((button) => button.dataset.id === choice.answer);
    assert.notEqual(index, -1);
    seen.add(index);

    buttons.forEach((button) => {
      el._selected = button.dataset.id;
      assert.equal(el.evaluate().correct, button.dataset.id === choice.answer);
    });

    el._selected = buttons.find((button) => button.dataset.id !== choice.answer).dataset.id;
    el.mark(el.evaluate());
    const marked = [...el.shadowRoot.querySelectorAll('.option')];
    const correctButton = marked.find((button) => button.classList.contains('is-correct'));
    assert.equal(correctButton.dataset.id, choice.answer);
    assert.equal(marked.findIndex((button) => button.classList.contains('is-correct')), index);
  }
  assert.deepEqual([...seen].sort(), [0, 1, 2, 3]);
});

test('a rendered quote check puts the correct answer in every position', () => {
  const quote = {
    ...choice,
    type: 'quote',
    quote: 'Existence exists.',
    feedback: { kind: 'quote', quote: 'Existence exists.', citation: 'Example', note: 'Something is.' },
  };
  const seen = new Set();
  for (let n = 0; n < 400; n += 1) {
    const el = mount(ExerciseQuoteElement, quote);
    const buttons = [...el.shadowRoot.querySelectorAll('.option')];
    const index = buttons.findIndex((button) => button.dataset.id === quote.answer);
    seen.add(index);
    el._selected = buttons[index].dataset.id;
    assert.equal(el.evaluate().correct, true);
    el.mark(el.evaluate());
    assert.equal(el.shadowRoot.querySelector('.is-correct').dataset.id, quote.answer);
  }
  assert.deepEqual([...seen].sort(), [0, 1, 2, 3]);
});

test('match columns reshuffle while pairing still follows identity', () => {
  const data = {
    type: 'match',
    prompt: 'Match each claim.',
    pairs: [
      { id: 'a', left: 'Existence', right: 'Something is' },
      { id: 'b', left: 'Identity', right: 'A thing is itself' },
      { id: 'c', left: 'Consciousness', right: 'Awareness of what is' },
    ],
    feedback: { kind: 'paraphrase', note: 'Three facts.' },
  };
  const leftSeen = [new Set(), new Set(), new Set()];
  const rightSeen = [new Set(), new Set(), new Set()];
  for (let n = 0; n < 200; n += 1) {
    const el = mount(ExerciseMatchElement, data);
    const left = [...el.shadowRoot.querySelectorAll('[data-side="left"]')];
    const right = [...el.shadowRoot.querySelectorAll('[data-side="right"]')];
    left.forEach((chip, index) => leftSeen[index].add(chip.dataset.id));
    right.forEach((chip, index) => rightSeen[index].add(chip.dataset.id));
    for (const pair of data.pairs) el._pairs.set(pair.id, pair.id);
    assert.equal(el.evaluate().correct, true);
    el._pairs.set('a', 'b');
    assert.equal(el.evaluate().correct, false);
  }
  for (const seen of [...leftSeen, ...rightSeen]) {
    assert.deepEqual([...seen].sort(), ['a', 'b', 'c']);
  }
});

test('tap-to-build banks reshuffle and grade the token identity', () => {
  const data = {
    type: 'fill',
    mode: 'sentence',
    prompt: 'Build the claim.',
    tokens: [
      { id: 't1', text: 'Existence' },
      { id: 't2', text: 'is' },
      { id: 't3', text: 'identity' },
      { id: 'd1', text: 'a wish' },
      { id: 'd2', text: 'optional' },
    ],
    answer: ['t1', 't2', 't3'],
    feedback: { kind: 'paraphrase', note: 'To be is to be something.' },
  };
  const seen = [new Set(), new Set(), new Set(), new Set(), new Set()];
  for (let n = 0; n < 200; n += 1) {
    const el = mount(ExerciseFillElement, data);
    const tokens = [...el.shadowRoot.querySelectorAll('.bank .token')];
    assert.equal(tokens.length, 5);
    tokens.forEach((token, index) => seen[index].add(token.dataset.id));
    el._order = ['t1', 't2', 't3'];
    assert.equal(el.evaluate().correct, true);
    el._order = ['d1', 't2', 't3'];
    assert.equal(el.evaluate().correct, false);
  }
  for (const slot of seen) assert.equal(slot.size, 5);
});
