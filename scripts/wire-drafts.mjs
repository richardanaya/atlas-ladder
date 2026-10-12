import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = join(root, 'content/catalog.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
let sources = readFileSync(join(root, 'SOURCES.md'), 'utf8');

const unitIndex = new Map();
for (const section of catalog.sections) {
  for (const unit of section.units) {
    unitIndex.set(unit.id, { section, unit });
  }
}

function strippedSources() {
  return sources.replace(/^> /gm, '');
}

function exerciseErrors(id, exercise) {
  const errors = [];
  const fail = (message) => errors.push(message);
  const feedback = exercise.feedback;
  const body = strippedSources();
  if (!feedback?.kind || !feedback.note) fail(`${id} feedback incomplete`);
  if (!['choice', 'match', 'fill', 'quote'].includes(exercise.type)) fail(`${id} bad type`);
  if (feedback?.kind === 'quote') {
    if (!feedback.quote || !feedback.citation) fail(`${id} quote feedback missing quote or citation`);
    if (feedback.quote && !body.includes(feedback.quote)) fail(`${id} quote not in SOURCES.md`);
    if (feedback.citation && !body.includes(feedback.citation)) fail(`${id} citation not in SOURCES.md`);
  }
  if (exercise.type === 'quote') {
    if (!exercise.quote || !body.includes(exercise.quote)) fail(`${id} quote stem not in SOURCES.md`);
    if (!exercise.choices?.some((choice) => choice.id === exercise.answer)) fail(`${id} answer missing`);
  }
  if (exercise.type === 'choice') {
    if (!exercise.choices?.some((choice) => choice.id === exercise.answer)) fail(`${id} answer missing`);
  }
  if (exercise.type === 'match' && !(exercise.pairs?.length >= 3)) fail(`${id} match too small`);
  if (exercise.type === 'fill' && exercise.mode === 'sentence') {
    const ids = new Set((exercise.tokens || []).map((token) => token.id));
    if (!exercise.answer?.every((tokenId) => ids.has(tokenId))) fail(`${id} sentence answer id missing`);
  }
  if (exercise.type === 'fill' && exercise.mode === 'blanks') {
    const blanks = (exercise.parts || []).filter((part) => part.type === 'blank');
    if (!blanks.length) fail(`${id} has no blanks`);
    for (const blank of blanks) {
      if (!(exercise.bank || []).some((word) => word.toLowerCase() === blank.answer.toLowerCase())) {
        fail(`${id} bank missing ${blank.answer}`);
      }
    }
  }
  return errors;
}

function draftErrors(draft) {
  const errors = [];
  if (!Array.isArray(draft.lessons) || !draft.lessons.length) errors.push(`${draft.unitId} has no lessons`);
  for (const lesson of draft.lessons || []) {
    const key = `${draft.unitId}/${lesson.id}`;
    const count = lesson.exercises?.length || 0;
    if (count < 8 || count > 12) errors.push(`${key} has ${count} exercises`);
    for (const exercise of lesson.exercises || []) {
      try {
        errors.push(...exerciseErrors(`${draft.sectionId}/${key}/${exercise.id}`, exercise));
      } catch (error) {
        errors.push(`${key}/${exercise?.id} ${error.message}`);
      }
    }
  }
  return errors;
}

const files = readdirSync(join(root, 'content/drafts')).filter((name) => name.endsWith('.json')).sort();
const kept = [];
const skipped = [];

for (const file of files) {
  const draft = JSON.parse(readFileSync(join(root, 'content/drafts', file), 'utf8'));
  const hit = unitIndex.get(draft.unitId);
  if (!hit || hit.unit.status !== 'soon' || hit.section.id !== draft.sectionId) {
    skipped.push({ file, reason: 'not a soon unit in that section' });
    continue;
  }
  const problems = draftErrors(draft);
  if (problems.length) {
    skipped.push({ file, reason: problems });
    continue;
  }
  kept.push({ draft, section: hit.section, unit: hit.unit });
}

const packs = new Map();
function loadPack(sectionFile, sectionId) {
  if (packs.has(sectionFile)) return packs.get(sectionFile);
  const path = join(root, 'content', sectionFile);
  let pack;
  try {
    pack = JSON.parse(readFileSync(path, 'utf8'));
    if (!pack.lessons || typeof pack.lessons !== 'object') pack.lessons = {};
  } catch {
    pack = { id: sectionId, lessons: {} };
  }
  pack.id = sectionId;
  packs.set(sectionFile, pack);
  return pack;
}

for (const item of kept) {
  const { draft, section, unit } = item;
  const pack = loadPack(draft.sectionFile, draft.sectionId);
  unit.lessons = draft.lessons.map((lesson) => {
    pack.lessons[`${draft.unitId}/${lesson.id}`] = { exercises: lesson.exercises };
    return { id: lesson.id, title: lesson.title, objective: lesson.objective };
  });
  unit.status = 'ready';
  if (section.file == null) section.file = draft.sectionFile;
}

for (const [sectionFile, pack] of packs) {
  writeFileSync(join(root, 'content', sectionFile), `${JSON.stringify(pack, null, 2)}\n`);
}
writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

for (const item of kept) {
  for (const entry of item.draft.sources || []) {
    if (!entry?.quote || !entry?.citation) continue;
    const body = strippedSources();
    if (!body.includes(entry.quote) && !body.includes(entry.citation)) {
      if (!sources.endsWith('\n')) sources += '\n';
      sources += `\n## ${entry.citation}\n\n> ${entry.quote}\n`;
    }
  }
}
writeFileSync(join(root, 'SOURCES.md'), sources);

