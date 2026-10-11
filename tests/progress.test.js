import test from 'node:test';
import assert from 'node:assert/strict';
import { nextStreak, previousDay, isLessonUnlocked, readyLessons, xpAward, levelFor } from '../js/progress-rules.js';

const catalog = {
  sections: [
    {
      id: 'metaphysics',
      units: [
        { id: 'axioms', status: 'ready', lessons: [{ id: 'a' }, { id: 'b' }] },
        { id: 'primacy', status: 'soon' },
      ],
    },
    {
      id: 'epistemology',
      units: [
        { id: 'senses', status: 'ready', lessons: [{ id: 'c' }] },
      ],
    },
  ],
};

test('coming-soon units do not gate the next ready lesson', () => {
  const lessons = readyLessons(catalog).map((entry) => entry.key);
  assert.deepEqual(lessons, [
    'metaphysics/axioms/a',
    'metaphysics/axioms/b',
    'epistemology/senses/c',
  ]);
  const done = { 'metaphysics/axioms/a': {}, 'metaphysics/axioms/b': {} };
  assert.equal(isLessonUnlocked(catalog, {}, 'metaphysics/axioms/a'), true);
  assert.equal(isLessonUnlocked(catalog, {}, 'metaphysics/axioms/b'), false);
  assert.equal(isLessonUnlocked(catalog, done, 'epistemology/senses/c'), true);
  assert.equal(isLessonUnlocked(catalog, { 'metaphysics/axioms/a': {} }, 'epistemology/senses/c'), false);
});

test('streak advances once per new local day', () => {
  assert.equal(nextStreak(0, null, '2026-10-11'), 1);
  assert.equal(nextStreak(1, '2026-10-11', '2026-10-11'), 1);
  assert.equal(nextStreak(3, '2026-10-10', '2026-10-11'), 4);
  assert.equal(nextStreak(3, '2026-10-08', '2026-10-11'), 1);
  assert.equal(previousDay('2026-03-01'), '2026-02-28');
});

test('xp is awarded once and a perfect floor adds the bonus', () => {
  assert.equal(xpAward({ correct: 10, total: 10, already: false }), 10 * 12 + 20);
  assert.equal(xpAward({ correct: 8, total: 10, already: false }), 96);
  assert.equal(xpAward({ correct: 10, total: 10, already: true }), 0);
  assert.equal(levelFor(0), 1);
  assert.equal(levelFor(80), 2);
  assert.equal(levelFor(79), 1);
});
