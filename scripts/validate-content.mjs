import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(readFileSync(join(root, 'content/catalog.json'), 'utf8'));
const sourcesRaw = readFileSync(join(root, 'SOURCES.md'), 'utf8');
const sources = sourcesRaw.replace(/^> /gm, '');
const errors = [];

function fail(message) {
  errors.push(message);
}

const seen = new Set();
for (const section of catalog.sections) {
  if (seen.has(section.id)) fail(`duplicate section ${section.id}`);
  seen.add(section.id);
  const readyUnits = section.units.filter((unit) => unit.status === 'ready');
  if (!readyUnits.length) continue;
  if (!section.file) fail(`${section.id} has ready units but no file`);
  const pack = JSON.parse(readFileSync(join(root, 'content', section.file), 'utf8'));
  for (const unit of section.units) {
    if (unit.status === 'soon') {
      if (unit.lessons?.length) fail(`${unit.id} is soon but has lessons`);
      continue;
    }
    if (unit.status !== 'ready') fail(`${unit.id} has unknown status`);
    for (const lesson of unit.lessons) {
      const key = `${unit.id}/${lesson.id}`;
      const block = pack.lessons[key];
      if (!block) {
        fail(`missing exercises for ${section.id}/${key}`);
        continue;
      }
      const count = block.exercises.length;
      if (count < 8 || count > 12) fail(`${key} has ${count} exercises`);
      for (const exercise of block.exercises) {
        checkExercise(`${section.id}/${key}/${exercise.id}`, exercise);
      }
    }
  }
}

function checkExercise(id, exercise) {
  const feedback = exercise.feedback;
  if (!feedback?.kind || !feedback.note) fail(`${id} feedback incomplete`);
  if (!['choice', 'match', 'fill', 'quote'].includes(exercise.type)) fail(`${id} bad type`);
  if (feedback?.kind === 'quote') {
    if (!feedback.quote || !feedback.citation) fail(`${id} quote feedback missing quote or citation`);
    if (feedback.quote && !sources.includes(feedback.quote)) fail(`${id} quote not in SOURCES.md`);
    if (feedback.citation && !sources.includes(feedback.citation)) fail(`${id} citation not in SOURCES.md`);
  }
  if (exercise.type === 'quote') {
    if (!exercise.quote || !sources.includes(exercise.quote)) fail(`${id} quote stem not in SOURCES.md`);
    if (!exercise.choices.some((choice) => choice.id === exercise.answer)) fail(`${id} answer missing`);
  }
  if (exercise.type === 'choice') {
    if (!exercise.choices.some((choice) => choice.id === exercise.answer)) fail(`${id} answer missing`);
  }
  if (exercise.type === 'match' && exercise.pairs.length < 3) fail(`${id} match too small`);
  if (exercise.type === 'fill' && exercise.mode === 'sentence') {
    const ids = new Set(exercise.tokens.map((token) => token.id));
    if (!exercise.answer.every((tokenId) => ids.has(tokenId))) fail(`${id} sentence answer id missing`);
  }
  if (exercise.type === 'fill' && exercise.mode === 'blanks') {
    const blanks = exercise.parts.filter((part) => part.type === 'blank');
    if (!blanks.length) fail(`${id} has no blanks`);
    for (const blank of blanks) {
      if (!exercise.bank.some((word) => word.toLowerCase() === blank.answer.toLowerCase())) {
        fail(`${id} bank missing ${blank.answer}`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('content ok');
