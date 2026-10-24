import { readFileSync, writeFileSync } from 'node:fs';

// Stored-order rebalance. Idempotent: a second run leaves the files unchanged.
// Choice and quote items place the correct option at index n % 4.
// Blank banks place answer words off a fixed rotation so they are not all at index 0.
// Sentence token lists weave distractors into the answer tokens so the answer is not a stored prefix.
// Match pairs stay as pairs; both columns are shuffled at render.

const files = process.argv.slice(2);
const targets = files.length
  ? files
  : [
      'content/metaphysics.json',
      'content/epistemology.json',
      'content/ethics.json',
      'content/politics.json',
      'content/aesthetics.json',
      'content/human-nature.json',
      'content/integration.json',
    ];

function placeAnswerAt(choices, answerId, index) {
  const correct = choices.find((choice) => choice.id === answerId);
  const rest = choices.filter((choice) => choice.id !== answerId);
  const next = [...rest];
  next.splice(index, 0, correct);
  return next;
}

function rebalanceBank(bank, answers, salt) {
  const answerKeys = new Set(answers.map((word) => word.toLowerCase()));
  const keptAnswers = [];
  const distractors = [];
  const seen = new Set();
  for (const word of bank) {
    const key = word.toLowerCase();
    if (answerKeys.has(key) && !seen.has(key)) {
      keptAnswers.push(word);
      seen.add(key);
    } else {
      distractors.push(word);
    }
  }
  const slots = new Array(bank.length);
  for (let i = 0; i < keptAnswers.length; i += 1) {
    let pos = (salt + i * 2) % slots.length;
    while (slots[pos]) pos = (pos + 1) % slots.length;
    slots[pos] = keptAnswers[i];
  }
  let distractor = 0;
  for (let i = 0; i < slots.length; i += 1) {
    if (!slots[i]) slots[i] = distractors[distractor++];
  }
  return slots;
}

function weaveTokens(tokens, answerIds, salt) {
  const byId = new Map(tokens.map((token) => [token.id, token]));
  const answerTokens = answerIds.map((id) => byId.get(id));
  const answerSet = new Set(answerIds);
  const extras = tokens.filter((token) => !answerSet.has(token.id));
  const total = answerTokens.length + extras.length;
  const positions = new Set();
  for (let i = 0; i < extras.length; i += 1) {
    const base = Math.round(((i + 1) * total) / (extras.length + 1));
    let pos = (salt + base) % total;
    while (positions.has(pos)) pos = (pos + 1) % total;
    positions.add(pos);
  }
  const answerIsPrefix = () => {
    const draft = new Array(total);
    const ordered = [...positions].sort((a, b) => a - b);
    ordered.forEach((pos, index) => {
      draft[pos] = extras[index];
    });
    let cursor = 0;
    for (let i = 0; i < total; i += 1) {
      if (!draft[i]) draft[i] = answerTokens[cursor++];
    }
    return answerIds.every((id, index) => draft[index]?.id === id);
  };
  if (answerIsPrefix()) {
    positions.delete([...positions].sort((a, b) => a - b)[0]);
    let pos = 1 % total;
    while (positions.has(pos)) pos = (pos + 1) % total;
    positions.add(pos);
  }
  const ordered = [...positions].sort((a, b) => a - b);
  const result = new Array(total);
  ordered.forEach((pos, index) => {
    result[pos] = extras[index];
  });
  let cursor = 0;
  for (let i = 0; i < total; i += 1) {
    if (!result[i]) result[i] = answerTokens[cursor++];
  }
  return result;
}

const choiceQuote = { 0: 0, 1: 0, 2: 0, 3: 0 };
const blankIndex = {};
let sentencePrefix = 0;
let sentenceOther = 0;

for (const file of targets) {
  const pack = JSON.parse(readFileSync(file, 'utf8'));
  let choiceN = 0;
  let blankN = 0;
  let sentenceN = 0;
  for (const block of Object.values(pack.lessons)) {
    for (const exercise of block.exercises) {
      if (exercise.type === 'choice' || exercise.type === 'quote') {
        exercise.choices = placeAnswerAt(exercise.choices, exercise.answer, choiceN % 4);
        choiceN += 1;
        const index = exercise.choices.findIndex((choice) => choice.id === exercise.answer);
        choiceQuote[index] += 1;
      }
      if (exercise.type === 'fill' && exercise.mode === 'blanks') {
        const answers = exercise.parts.filter((part) => part.type === 'blank').map((part) => part.answer);
        exercise.bank = rebalanceBank(exercise.bank, answers, blankN % exercise.bank.length);
        blankN += 1;
        for (const answer of answers) {
          const index = exercise.bank.findIndex((word) => word.toLowerCase() === answer.toLowerCase());
          blankIndex[index] = (blankIndex[index] || 0) + 1;
        }
      }
      if (exercise.type === 'fill' && exercise.mode === 'sentence') {
        exercise.tokens = weaveTokens(exercise.tokens, exercise.answer, sentenceN);
        sentenceN += 1;
        const prefix = exercise.answer.every((id, index) => exercise.tokens[index]?.id === id);
        if (prefix) sentencePrefix += 1;
        else sentenceOther += 1;
      }
    }
  }
  writeFileSync(file, `${JSON.stringify(pack, null, 2)}\n`);
}

console.log(JSON.stringify({ choiceQuote, blankIndex, sentencePrefix, sentenceOther }, null, 2));
