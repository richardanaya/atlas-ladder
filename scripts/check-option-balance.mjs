import { readFileSync } from 'node:fs';

const file = process.argv[2];
const limit = Number(process.argv[3] || 8);
if (!file) {
  console.error('usage: node scripts/check-option-balance.mjs content/<section>.json [maxGap]');
  process.exit(1);
}

const pack = JSON.parse(readFileSync(file, 'utf8'));
const hits = [];

function length(value) {
  return [...String(value)].length;
}

for (const [key, block] of Object.entries(pack.lessons)) {
  for (const exercise of block.exercises) {
    if (exercise.type !== 'choice' && exercise.type !== 'quote') continue;
    const correct = exercise.choices.find((choice) => choice.id === exercise.answer);
    const others = exercise.choices.filter((choice) => choice.id !== exercise.answer);
    const gap = length(correct.text) - Math.max(...others.map((choice) => length(choice.text)));
    if (gap > limit) {
      hits.push({ key, id: exercise.id, gap, correct: correct.text, others: others.map((choice) => choice.text) });
    }
  }
}

hits.sort((a, b) => b.gap - a.gap);
for (const hit of hits) {
  console.log(`${hit.gap}\t${hit.key}/${hit.id}`);
  console.log(`  * ${hit.correct}`);
  for (const other of hit.others) console.log(`  - ${other}`);
}
console.log(`${hits.length} choices are longer than the longest distractor by more than ${limit}`);
process.exit(hits.length ? 1 : 0);
