import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registry = [];

const C = {
  preface: 'Ayn Rand, "Preface," For the New Intellectual, viii',
  about: 'Ayn Rand, "About the Author," Atlas Shrugged',
  intro: 'Ayn Rand, "Introducing Objectivism," The Objectivist Newsletter, August 1962, 35',
  g124: "Ayn Rand, Galt's Speech, For the New Intellectual, 124",
  g125: "Ayn Rand, Galt's Speech, For the New Intellectual, 125",
  g126: "Ayn Rand, Galt's Speech, For the New Intellectual, 126",
  g152: "Ayn Rand, Galt's Speech, For the New Intellectual, 152",
  g155: "Ayn Rand, Galt's Speech, For the New Intellectual, 155",
  g156: "Ayn Rand, Galt's Speech, For the New Intellectual, 156",
  ax: 'Ayn Rand, "Axiomatic Concepts," Introduction to Objectivist Epistemology, 55',
  con: 'Ayn Rand, "Concepts of Consciousness," Introduction to Objectivist Epistemology, 37',
  cog: 'Ayn Rand, "Cognition and Measurement," Introduction to Objectivist Epistemology, 5',
  fore: 'Ayn Rand, "Foreword to the First Edition," Introduction to Objectivist Epistemology, 4',
  peik109: 'Leonard Peikoff, "The Analytic-Synthetic Dichotomy," Introduction to Objectivist Epistemology, 109',
  omin: 'Leonard Peikoff, The Ominous Parallels, 303',
  vos: 'Ayn Rand, "The Objectivist Ethics," The Virtue of Selfishness, 20',
  kant: 'Ayn Rand, "Kant Versus Sullivan," Philosophy: Who Needs It, 90',
  pwni: 'Ayn Rand, "Philosophy: Who Needs It," Philosophy: Who Needs It, 5',
  play: 'Ayn Rand, interview with Alvin Toffler, Playboy, March 1964',
  left: 'Ayn Rand, "The Left: Old and New," Return of the Primitive: The Anti-Industrial Revolution, 162',
};

function q(quote, note, citation) {
  registry.push({ quote, citation });
  return { kind: 'quote', quote, note, citation };
}
function para(note, citation = '') {
  return { kind: 'paraphrase', note, citation };
}
function choice(id, prompt, pairs, answer, feedback) {
  return {
    id, type: 'choice', prompt, answer, feedback,
    choices: pairs.map(([cid, text]) => ({ id: cid, text })),
  };
}
function match(id, prompt, pairs, feedback) {
  return {
    id, type: 'match', prompt, feedback,
    pairs: pairs.map(([pid, left, right]) => ({ id: pid, left, right })),
  };
}
function blanks(id, prompt, parts, bank, feedback) {
  return { id, type: 'fill', mode: 'blanks', prompt, parts, bank, feedback };
}
function sentence(id, prompt, words, answerIds, extra, feedback) {
  const tokens = [
    ...words.map((text, index) => ({ id: `t${index + 1}`, text })),
    ...extra.map((text, index) => ({ id: `d${index + 1}`, text })),
  ];
  return {
    id, type: 'fill', mode: 'sentence', prompt, tokens,
    answer: answerIds, feedback,
  };
}
function quoteEx(id, prompt, quote, citation, correct, wrongs, note) {
  registry.push({ quote, citation });
  return {
    id, type: 'quote', prompt, quote,
    answer: correct[0],
    choices: [correct, ...wrongs].map(([cid, text]) => ({ id: cid, text })),
    feedback: { kind: 'quote', quote, note, citation },
  };
}

const galtBook = ['ftni', "For the New Intellectual (Galt's speech, from Atlas Shrugged)"];
const novels = [
  ['fh', 'The Fountainhead'],
  ['an', 'Anthem'],
  ['wl', 'We the Living'],
];

const oneFoot = '1. Metaphysics: Objective Reality\n2. Epistemology: Reason\n3. Ethics: Self-interest\n4. Politics: Capitalism';
const plainFoot = '1. "Nature, to be commanded, must be obeyed" or "Wishing won\'t make it so."\n2. "You can\'t eat your cake and have it, too."\n3. "Man is an end in himself."\n4. "Give me liberty or give me death."';

const lessonsMeta = {
  'axioms/where-it-starts': [
    choice('m1e1', 'What name did Ayn Rand choose for her philosophy?', [
      ['o', 'Objectivism'], ['e', 'Existentialism'], ['p', 'Pragmatism'], ['l', 'Logical positivism'],
    ], 'o', q(
      'The name I have chosen for my philosophy is Objectivism.',
      'She states the name at the opening of that preface.',
      C.preface,
    )),
    quoteEx('m1e2', 'Which work is the citation for this sentence?',
      'The name I have chosen for my philosophy is Objectivism.',
      C.preface,
      ['pre', 'For the New Intellectual, Preface'],
      [['fh', 'The Fountainhead'], ['an', 'Anthem'], ['rm', 'The Romantic Manifesto']],
      'The sentence is the preface’s statement of the name, not a line from the novels.'),
    choice('m1e3', 'In the 1962 “on one foot” summary, what does she put beside Metaphysics?', [
      ['or', 'Objective Reality'], ['rs', 'Rational self-interest'], ['cap', 'Laissez-faire capitalism'], ['rr', 'Romantic Realism'],
    ], 'or', q(oneFoot, 'Those four labels are the whole of the one-foot list. Esthetics is not in it.', C.intro)),
    match('m1e4', 'Match each branch to its one-foot label.', [
      ['meta', 'Metaphysics', 'Objective Reality'],
      ['epi', 'Epistemology', 'Reason'],
      ['eth', 'Ethics', 'Self-interest'],
      ['pol', 'Politics', 'Capitalism'],
    ], q(oneFoot, 'Keep the four pairings in that order. The summary stops at politics.', C.intro)),
    blanks('m1e5', 'Complete the one-foot line for metaphysics.', [
      { type: 'text', text: 'Metaphysics: ' },
      { type: 'blank', id: 'b1', answer: 'Objective' },
      { type: 'text', text: ' Reality' },
    ], ['Objective', 'Subjective', 'Collective', 'Divine'], q(oneFoot, 'The word she uses is Objective, not a social or supernatural substitute.', C.intro)),
    choice('m1e6', 'How many branches does the 1962 one-foot summary name?', [
      ['4', 'Four'], ['5', 'Five'], ['3', 'Three'], ['7', 'Seven'],
    ], '4', q(
      oneFoot,
      'The summary names metaphysics, epistemology, ethics, and politics. Esthetics is not on that list.',
      C.intro,
    )),
    choice('m1e7', 'Which are the first and primary axiomatic concepts?', [
      ['eic', 'Existence, identity, and consciousness'],
      ['mbs', 'Mind, body, and spirit'],
      ['tas', 'Thesis, antithesis, and synthesis'],
      ['fhc', 'Faith, hope, and charity'],
    ], 'eic', q(
      'The first and primary axiomatic concepts are "existence," "identity" (which is a corollary of "existence") and "consciousness."',
      'Identity is named as a corollary of existence, not as a separate kind of stuff.',
      C.ax,
    )),
    match('m1e8', 'Match each formula to the axiom it states.', [
      ['ex', 'Existence exists', 'Existence'],
      ['aa', 'A is A', 'Identity'],
      ['cc', 'Consciousness is conscious', 'Consciousness'],
    ], q(
      'Existence exists—Consciousness is conscious—A is A.',
      'Rand says axiomatic concepts can be stated only in that repetitive form.',
      C.ax,
    )),
    sentence('m1e9', 'Build the three formulas in the order Rand lists them.',
      ['Existence exists', 'Consciousness is conscious', 'A is A'],
      ['t1', 't2', 't3'],
      ['Wishing won\'t'],
      q('Existence exists—Consciousness is conscious—A is A.', 'The order in that sentence is existence, then consciousness, then identity.', C.ax)),
    choice('m1e10', 'On Rand’s account, an axiom defeats its opponents because they must do what?', [
      ['use', 'Accept it and use it in any attempt to deny it'],
      ['vote', 'Wait until a majority accepts it'],
      ['pref', 'Treat it as an arbitrary preference'],
      ['exp', 'Leave it to experts'],
    ], 'use', q(
      'An axiom is a proposition that defeats its opponents by the fact that they have to accept it and use it in the process of any attempt to deny it.',
      'Denial is still an act of consciousness about something that exists.',
      C.g155,
    )),
  ],
  'axioms/existence-exists': [
    choice('m2e1', 'In this philosophy, what does “Existence exists” rule in?', [
      ['is', 'There is something. Reality is.'],
      ['idea', 'Only ideas exist'],
      ['conv', 'Existence is a linguistic convention'],
      ['perc', 'Reality exists only while it is perceived'],
    ], 'is', q(
      'Existence exists—and the act of grasping that statement implies two corollary axioms: that something exists which one perceives and that one exists possessing consciousness, consciousness being the faculty of perceiving that which exists.',
      'The sentence starts from the fact that something is, and then names what grasping that fact already uses.',
      C.g124,
    )),
    blanks('m2e2', 'Complete the axiom.', [
      { type: 'text', text: 'Existence ' },
      { type: 'blank', id: 'b1', answer: 'exists' },
    ], ['exists', 'wishes', 'depends', 'votes'], q('Existence exists—Consciousness is conscious—A is A.', 'The first formula is two words: Existence exists.', C.ax)),
    quoteEx('m2e3', 'The Lexicon cites this opening from Galt’s speech in which book?',
      'Existence exists—and the act of grasping that statement implies two corollary axioms: that something exists which one perceives and that one exists possessing consciousness, consciousness being the faculty of perceiving that which exists.',
      C.g124, galtBook, novels,
      'The speech was written for Atlas Shrugged and is reprinted in For the New Intellectual. The page number used here is from that reprint.'),
    choice('m2e4', 'What does Rand say about a consciousness with nothing to be conscious of?', [
      ['con', 'It is a contradiction in terms'],
      ['ok', 'It is the primary axiom'],
      ['goal', 'It is the goal of knowledge'],
      ['fine', 'It is a higher form of awareness'],
    ], 'con', q(
      'A consciousness with nothing to be conscious of is a contradiction in terms.',
      'Awareness with no object is not a special case of awareness. The concept cancels itself.',
      C.g124,
    )),
    choice('m2e5', 'Peikoff calls existence which of these?', [
      ['pri', 'A self-sufficient primary'],
      ['sup', 'A product of a supernatural dimension'],
      ['word', 'A convention of language'],
      ['add', 'An attribute added to things later'],
    ], 'pri', q(
      'Existence is a self-sufficient primary.',
      'He adds that there is nothing antecedent to existence and no alternative to it. That further sentence is his, in the same essay. The line above is the one to hold.',
      C.peik109,
    )),
    match('m2e6', 'Match the item to the description used in these texts.', [
      ['ex', 'Existence', 'A self-sufficient primary'],
      ['co', 'Consciousness', 'The faculty of perceiving that which exists'],
      ['id', 'Identity', 'A corollary of existence'],
    ], para(
      'Three different lines are being matched, so this banner is a paraphrase rather than one quotation. Peikoff calls existence a self-sufficient primary. Galt calls consciousness the faculty of perceiving that which exists. Rand calls identity a corollary of existence. Each of those wordings is quoted on its own floor.',
      C.ax,
    )),
    sentence('m2e7', 'Build Peikoff’s sentence.',
      ['Existence', 'is', 'a', 'self-sufficient', 'primary'],
      ['t1', 't2', 't3', 't4', 't5'],
      ['derivative'],
      q('Existence is a self-sufficient primary.', 'Nothing in that sentence makes existence a product of something prior.', C.peik109)),
    choice('m2e8', 'Why does this philosophy refuse the demand to prove that existence exists from outside existence?', [
      ['pre', 'Any proof already uses something that exists and a consciousness aware of it'],
      ['ban', 'Textbooks forbid the proof'],
      ['mys', 'Only mystics are allowed to prove axioms'],
      ['fic', 'Existence is a useful fiction'],
    ], 'pre', para(
      'Galt’s answer is that the demand asks you to prove existence by means of non-existence, and consciousness by means of unconsciousness. The wording here is ours. His statement of what an axiom is, and of the two corollaries, is quoted in the other questions of this floor.',
      C.g155,
    )),
    choice('m2e9', 'In the one-foot summary, which plain-language line does she attach to metaphysics?', [
      ['w', "Wishing won't make it so."],
      ['e', 'Man is an end in himself.'],
      ['l', 'Give me liberty or give me death.'],
      ['c', "You can't eat your cake and have it, too."],
    ], 'w', q(
      plainFoot,
      'She also offers Francis Bacon’s “Nature, to be commanded, must be obeyed” for the same branch. Item 2 is her plain language for epistemology, item 3 for ethics, item 4 for politics. The Bacon and Henry lines are familiar sayings she uses, not sentences she originated.',
      C.intro,
    )),
    choice('m2e10', '“Reality exists as an objective absolute” means facts are independent of what?', [
      ['f', "Man's feelings, wishes, hopes or fears"],
      ['l', 'The law of identity'],
      ['m', 'Measurement'],
      ['c', 'Causality'],
    ], 'f', q(
      "Reality exists as an objective absolute—facts are facts, independent of man's feelings, wishes, hopes or fears.",
      'That is her first numbered statement of Objectivism in the same essay as the one-foot list.',
      C.intro,
    )),
  ],
  'axioms/identity': [
    choice('m3e1', 'On Rand’s statement, to exist is to what?', [
      ['some', 'Be something, of a specific nature'],
      ['any', 'Be anything one wishes'],
      ['void', 'Be a formless void'],
      ['thot', 'Be only a thought'],
    ], 'some', q(
      'To exist is to be something, as distinguished from the nothing of nonexistence, it is to be an entity of a specific nature made of specific attributes.',
      'Existence and identity are not two layers, a bare “that” plus a later “what.”',
      C.g124,
    )),
    blanks('m3e2', 'Complete the formula.', [
      { type: 'text', text: 'A is ' },
      { type: 'blank', id: 'b1', answer: 'A' },
    ], ['A', 'B', 'not-A', 'whatever'], q('A is A. A thing is itself.', 'The second sentence is her plain restatement of the same formula.', C.g125)),
    quoteEx('m3e3', 'Where does the Lexicon cite “A is A. A thing is itself.”?',
      'A is A. A thing is itself.',
      C.g125, galtBook,
      [['fh', 'The Fountainhead'], ['pwni', 'Philosophy: Who Needs It'], ['rm', 'The Romantic Manifesto']],
      'She attributes the formula’s ancestry to Aristotle and says she is completing it. The completion is the next question.'),
    choice('m3e4', 'Which situation does she use to state the law of identity?', [
      ['leaf', 'A leaf cannot be a stone at the same time'],
      ['grow', 'A leaf cannot change color over a season'],
      ['side', 'A leaf cannot be green on one side'],
      ['two', 'There cannot be two leaves'],
    ], 'leaf', q(
      'A leaf cannot be a stone at the same time, it cannot be all red and all green at the same time, it cannot freeze and burn at the same time.',
      'The law rules out being and not-being in the same respect at the same time. Change across time is a different fact. She discusses change elsewhere. This question uses only the leaf sentence.',
      C.g125,
    )),
    match('m3e5', 'Match the line to the role she gives it.', [
      ['aa', 'A is A', 'The law of identity'],
      ['ei', 'Existence is Identity', 'Her completion of A is A'],
      ['th', 'A thing is itself', 'The plain restatement'],
      ['ck', 'You cannot have your cake and eat it, too', 'Her simpler wording in Galt’s speech'],
    ], q(
      'You cannot have your cake and eat it, too.',
      'In Galt’s speech that sentence is the simpler statement of identity. Do not confuse it with the one-foot line for epistemology in the 1962 essay, which reverses the word order: eat your cake and have it. Both wordings are quoted in the sources list.',
      C.g125,
    )),
    choice('m3e6', '“Existence is Identity” means which of these?', [
      ['is', 'To be is to be something specific'],
      ['feel', 'Existence is a feeling about identity'],
      ['lang', 'Identity is invented by language, and existence is not'],
      ['mind', 'Only minds have identity'],
    ], 'is', q(
      'Existence is Identity, Consciousness is Identification.',
      'The second half names consciousness as the act of identifying, not as the maker of identity.',
      C.g124,
    )),
    sentence('m3e7', 'Build the completion of the formula.',
      ['Existence', 'is', 'Identity'],
      ['t1', 't2', 't3'],
      ['Wish', 'Society'],
      q('Existence is Identity, Consciousness is Identification.', 'This floor stops at the first half. Consciousness is the next floor.', C.g124)),
    choice('m3e8', 'When your thinking arrives at a contradiction, where is the error?', [
      ['err', 'Reality contains no contradictions. A contradiction is an error in thinking.'],
      ['real', 'Contradictions are real features of nature'],
      ['game', 'Logic is a game unrelated to facts'],
      ['both', 'Some entities both are and are not, in the same respect'],
    ], 'err', q(
      "To arrive at a contradiction is to confess an error in one's thinking; to maintain a contradiction is to abdicate one's mind and to evict oneself from the realm of reality.",
      'The error the sentence names is in one’s thinking. Maintaining it, she says in the same breath, throws you out of reality. Reality is not what contains the break.',
      C.g125,
    )),
    choice('m3e9', 'In Introduction to Objectivist Epistemology, identity is described as what?', [
      ['cor', 'A corollary of existence'],
      ['uni', 'A separate universe'],
      ['opt', 'An optional assumption'],
      ['pol', 'A political slogan'],
    ], 'cor', q(
      'The first and primary axiomatic concepts are "existence," "identity" (which is a corollary of "existence") and "consciousness."',
      'A corollary here means a restatement of the same primary fact, not a later discovery.',
      C.ax,
    )),
    quoteEx('m3e10', 'In Galt’s speech, this simpler line states the law of identity. Which citation fits?',
      'You cannot have your cake and eat it, too.',
      C.g125, galtBook,
      [['ton', 'The Objectivist Newsletter, as the epistemology slogan'], ['fh', 'The Fountainhead'], ['an', 'Anthem']],
      'The newsletter’s epistemology slogan reverses the order: eat your cake and have it. This question uses the Galt wording, with have before eat. Both are quoted in the sources list.'),
  ],
  'axioms/consciousness': [
    choice('m4e1', 'Which definition does Rand give?', [
      ['fac', 'The faculty of awareness: the faculty of perceiving that which exists'],
      ['cre', 'The creator of existence'],
      ['soc', 'A social agreement'],
      ['ill', 'An illusion produced by language'],
    ], 'fac', q(
      'Consciousness is the faculty of awareness—the faculty of perceiving that which exists.',
      'Perception here is of what exists. The definition does not say consciousness produces its object.',
      C.con,
    )),
    quoteEx('m4e2', 'Which work contains this definition?',
      'Consciousness is the faculty of awareness—the faculty of perceiving that which exists.',
      C.con,
      ['itoe', 'Introduction to Objectivist Epistemology, “Concepts of Consciousness”'],
      novels,
      'Galt also calls consciousness the faculty of perceiving that which exists. This full sentence, which adds faculty of awareness, is the ITOE wording.'),
    choice('m4e3', 'A consciousness conscious of nothing but itself is, in Galt’s speech:', [
      ['con', 'A contradiction in terms'],
      ['ax', 'The primary axiom'],
      ['goal', 'The goal of introspection'],
      ['pri', 'The primacy of existence'],
    ], 'con', q(
      'A consciousness conscious of nothing but itself is a contradiction in terms.',
      'Before it could identify itself as consciousness, it had to be conscious of something. That next clause is in the same paragraph.',
      C.g124,
    )),
    choice('m4e4', '“Awareness is awareness of something” is there to rule out which idea?', [
      ['none', 'A contentless state of consciousness'],
      ['ext', 'Awareness of an external world'],
      ['act', 'Awareness as an active process'],
      ['man', 'Human awareness in particular'],
    ], 'none', q(
      'Awareness is awareness of something.',
      'In the same essay she says a content-less state of consciousness is a contradiction in terms. This question uses the shorter sentence as the one to remember.',
      C.con,
    )),
    match('m4e5', 'Match the formula to the job it does.', [
      ['ex', 'Existence exists', 'Something is'],
      ['cc', 'Consciousness is conscious', 'Awareness is awareness'],
      ['aa', 'A is A', 'What is, is what it is'],
      ['ci', 'Consciousness is Identification', 'Awareness identifies what exists'],
    ], q(
      'Existence is Identity, Consciousness is Identification.',
      'The four lines are two pairs: the repetitive axioms, and her completion of them.',
      C.g124,
    )),
    blanks('m4e6', 'Complete the formula.', [
      { type: 'text', text: 'Existence is Identity, Consciousness is ' },
      { type: 'blank', id: 'b1', answer: 'Identification' },
    ], ['Identification', 'Creation', 'Whim', 'Neutrality'], q(
      'Existence is Identity, Consciousness is Identification.',
      'Identification is the act. It is not a license to decide what the object is.',
      C.g124,
    )),
    sentence('m4e7', 'Build the sentence.',
      ['Awareness', 'is', 'awareness', 'of', 'something'],
      ['t1', 't2', 't3', 't4', 't5'],
      ['nothing'],
      q('Awareness is awareness of something.', 'The word “something” is the whole point of the sentence.', C.con)),
    choice('m4e8', 'Grasping the statement that existence exists implies two corollary axioms. They are:', [
      ['two', 'Something exists which one perceives, and one exists possessing consciousness'],
      ['soc', 'Society exists, and the state is sovereign'],
      ['god', 'God exists, and faith is knowledge'],
      ['mat', 'Matter exists, and mind does not'],
    ], 'two', q(
      'Existence exists—and the act of grasping that statement implies two corollary axioms: that something exists which one perceives and that one exists possessing consciousness, consciousness being the faculty of perceiving that which exists.',
      'The two corollaries are inside the act of grasping the first axiom. They are not extra assumptions added later.',
      C.g124,
    )),
    choice('m4e9', 'On the conceptual level, Rand says the process of awareness is:', [
      ['vol', 'Psychological, conscious, and volitional'],
      ['auto', 'Automatic and infallible'],
      ['tribe', 'Dictated by the tribe'],
      ['imp', 'Impossible'],
    ], 'vol', q(
      'On the higher, conceptual level, the process is psychological, conscious and volitional.',
      'She contrasts this with the perceptual level, which she says is automatic and non-volitional. Volition as a full topic is a later floor.',
      C.con,
    )),
    choice('m4e10', 'Which line is a fair reading of why you cannot stand outside existence and consciousness to prove them?', [
      ['act', 'The proof would already be an act of consciousness about something that exists'],
      ['book', 'Because a sacred text has not authorized it'],
      ['exp', 'Because only specialists perceive axioms'],
      ['fic', 'Because existence is a useful fiction'],
    ], 'act', para(
      'This is our compression of Galt’s challenge to the person who demands that the axioms be proved from outside them. His image is a zero gaining knowledge about a zero. We are not quoting that image here.',
      C.g155,
    )),
  ],
  'axioms/three-together': [
    choice('m5e1', 'Which trio is the one Rand states?', [
      ['ok', 'Existence exists. Consciousness is conscious. A is A.'],
      ['bad', 'Existence depends. Consciousness creates. A is B.'],
      ['no', 'Nothing exists. Consciousness is empty. A is not-A.'],
      ['txt', 'Reality is a text. Consciousness is a byproduct. A is optional.'],
    ], 'ok', q('Existence exists—Consciousness is conscious—A is A.', 'Hold them as one set. Each names a fact the others already use.', C.ax)),
    match('m5e2', 'Match each axiom to the fact it names.', [
      ['ex', 'Existence', 'Something is'],
      ['id', 'Identity', 'It is something specific'],
      ['co', 'Consciousness', 'You are aware of it'],
    ], para(
      'The match uses our labels for the three facts. The formulas themselves are Rand’s: Existence exists, A is A, Consciousness is conscious.',
      C.ax,
    )),
    choice('m5e3', 'The only philosophical debt Rand says she can acknowledge is to whom?', [
      ['ar', 'Aristotle'],
      ['pl', 'Plato'],
      ['ka', 'Kant'],
      ['he', 'Hegel'],
    ], 'ar', q(
      'The only philosophical debt I can acknowledge is to Aristotle.',
      'She immediately says she disagrees with a great many parts of his system, and that his laws of logic and his account of the means of knowledge are the debt that matters. That next sentence is in the same note. This question asks only for the name.',
      C.about,
    )),
    quoteEx('m5e4', 'Which work contains “The only philosophical debt I can acknowledge is to Aristotle.”?',
      'The only philosophical debt I can acknowledge is to Aristotle.',
      C.about,
      ['as', 'Atlas Shrugged, “About the Author”'],
      [['fh', 'The Fountainhead'], ['an', 'Anthem'], ['itoe', 'Introduction to Objectivist Epistemology']],
      'It is in the author note at the end of Atlas Shrugged, the same note that states her philosophy in essence.'),
    choice('m5e5', 'She defines logic as the art of what?', [
      ['nc', 'Non-contradictory identification'],
      ['sc', 'Social consensus'],
      ['in', 'Innate ideas with no connection to percepts'],
      ['fa', 'Faith'],
    ], 'nc', q(
      'Logic is the art of non-contradictory identification.',
      'In the same passage she says logic rests on the axiom that existence exists, and that all thinking is a process of identification and integration.',
      C.g125,
    )),
    sentence('m5e6', 'Build her definition of logic.',
      ['Logic', 'is', 'the', 'art', 'of', 'non-contradictory', 'identification'],
      ['t1', 't2', 't3', 't4', 't5', 't6', 't7'],
      ['whim'],
      q('Logic is the art of non-contradictory identification.', 'Every word is doing work. Non-contradictory names the standard. Identification names the goal.', C.g125)),
    choice('m5e7', 'Peikoff’s line on the function of consciousness is which of these?', [
      ['app', 'Not to create reality, but to apprehend it'],
      ['dec', 'To decree what the facts are'],
      ['rep', 'To replace identity'],
      ['opt', 'Optional for knowledge'],
    ], 'app', q(
      'The function of consciousness is not to create reality, but to apprehend it.',
      'That is the bridge to the next floor, primacy of existence, which is still being built. This question only asks you to hold the sentence.',
      C.omin,
    )),
    choice('m5e8', 'Galt says the law of causality is the law of identity applied to what?', [
      ['act', 'Action'],
      ['law', 'Legislation'],
      ['mood', 'Mood'],
      ['vote', 'Voting'],
    ], 'act', q(
      'The law of causality is the law of identity applied to action.',
      'Causality as its own floor comes later. The sentence already tells you the dependence: causality is not a break from identity.',
      C.g152,
    )),
    choice('m5e9', 'Which clause states the same point about action?', [
      ['nat', 'A thing cannot act in contradiction to its nature'],
      ['any', 'A thing can act as any nature one prefers'],
      ['none', 'Actions have no natures'],
      ['mind', 'Only minds are causes'],
    ], 'nat', q(
      'The nature of an action is caused and determined by the nature of the entities that act; a thing cannot act in contradiction to its nature.',
      'The cause is the nature of the entities that act. The sentence does not say a free-floating event pushes them.',
      C.g152,
    )),
    choice('m5e10', 'On this ladder, metaphysics is the study of what?', [
      ['uni', 'What exists, and what it is to exist'],
      ['art', 'How to judge a painting’s brushwork only'],
      ['law', 'How to draft a constitution'],
      ['mood', 'How to name a feeling'],
    ], 'uni', para(
      'Our wording. Metaphysics, here, is the study of existence as such: that things are, and that they are something. The quotations for existence, identity, and consciousness are on the floors below this one.',
    )),
  ],
};

const lessonsEpi = {
  'senses/direct-contact': [
    choice('e1e1', 'Rand says man’s only direct cognitive contact with reality is:', [
      ['s', 'His senses'],
      ['t', 'Tradition'],
      ['l', 'Logic with no observation'],
      ['r', 'Revelation'],
    ], 's', q(
      "Man's senses are his only direct cognitive contact with reality and, therefore, his only source of information.",
      'The second half of that sentence calls the senses his only source of information. Later integration still starts from that contact.',
      C.kant,
    )),
    quoteEx('e1e2', 'Which essay is the citation for that sentence?',
      "Man's senses are his only direct cognitive contact with reality and, therefore, his only source of information.",
      C.kant,
      ['pwni', 'Philosophy: Who Needs It, “Kant Versus Sullivan”'],
      [['as', 'Atlas Shrugged'], ['fh', 'The Fountainhead'], ['vos', 'The Virtue of Selfishness']],
      'The sentence is in the Kant essay, not in the novels.'),
    choice('e1e3', 'Without sensory evidence, she says, there can be no:', [
      ['c', 'Concepts'],
      ['s', 'Suns'],
      ['r', 'Rocks'],
      ['e', 'Entities'],
    ], 'c', q(
      'Without sensory evidence, there can be no concepts; without concepts, there can be no language; without language, there can be no knowledge and no science.',
      'The chain runs evidence, concepts, language, knowledge. It does not say the senses hand you finished science.',
      C.kant,
    )),
    blanks('e1e4', 'Complete the sentence.', [
      { type: 'text', text: "Man's senses are his only direct cognitive contact with " },
      { type: 'blank', id: 'b1', answer: 'reality' },
    ], ['reality', 'society', 'scripture', 'chance'], q(
      "Man's senses are his only direct cognitive contact with reality and, therefore, his only source of information.",
      'The missing word is reality, not a social or sacred substitute.',
      C.kant,
    )),
    choice('e1e5', 'She defines reason as the faculty that does what with sensory material?', [
      ['id', 'Identifies and integrates it'],
      ['ig', 'Ignores it in favor of innate ideas'],
      ['re', 'Replaces it with revelation'],
      ['vo', 'Votes on it'],
    ], 'id', q(
      "Reason is the faculty that identifies and integrates the material provided by man's senses.",
      'Reason is not a rival of the senses. It is what you do with what they provide.',
      C.vos,
    )),
    match('e1e6', 'Match each item to the job these texts give it.', [
      ['se', 'Senses', 'Provide the material of knowledge'],
      ['re', 'Reason', 'Identify and integrate that material'],
      ['lo', 'Logic', 'Non-contradictory identification'],
      ['em', 'Emotions', 'Not tools of cognition'],
    ], q(
      'Emotions are not tools of cognition.',
      'The senses, reason, and logic lines are quoted on this floor and the metaphysics floors. The emotion line is from the 1964 interview.',
      C.play,
    )),
    quoteEx('e1e7', '“Emotions are not tools of cognition.” Which source is the citation?',
      'Emotions are not tools of cognition.',
      C.play,
      ['pb', 'Playboy interview, March 1964'],
      [['vos', 'The Virtue of Selfishness'], ['as', 'Atlas Shrugged'], ['pwni', 'Philosophy: Who Needs It']],
      'The same interview says what you feel tells you nothing about the facts. It tells you something about your estimate of the facts.'),
    sentence('e1e8', 'Build the interview sentence.',
      ['Emotions', 'are', 'not', 'tools', 'of', 'cognition'],
      ['t1', 't2', 't3', 't4', 't5', 't6'],
      ['guides'],
      q(
        'What you feel tells you nothing about the facts; it merely tells you something about your estimate of the facts.',
        'The sentence you built is the shorter line from the same answer. Feelings register your estimate. They do not inspect the facts for you.',
        C.play,
      )),
  ],
  'senses/percepts': [
    choice('e2e1', 'In Introduction to Objectivist Epistemology, a percept is:', [
      ['p', 'A group of sensations automatically retained and integrated by the brain'],
      ['w', 'A word chosen by convention'],
      ['i', 'An innate idea'],
      ['g', 'A guess about an unknowable object'],
    ], 'p', q(
      'A percept is a group of sensations automatically retained and integrated by the brain of a living organism.',
      'A closely related sentence in The Virtue of Selfishness uses the word perception. This exact sentence, which begins with the words A percept is, is the ITOE wording.',
      C.cog,
    )),
    quoteEx('e2e2', 'This exact sentence begins with the words A percept is. Which work is the citation?',
      'A percept is a group of sensations automatically retained and integrated by the brain of a living organism.',
      C.cog,
      ['itoe', 'Introduction to Objectivist Epistemology'],
      [['vos', 'The Virtue of Selfishness'], ['as', 'Atlas Shrugged'], ['an', 'Anthem']],
      'The Virtue of Selfishness uses the word perception and then continues a related sentence. If you chose that book, you were near the right family of texts. This wording is ITOE page 5.'),
    choice('e2e3', 'Epistemologically, she says the base of man’s knowledge is:', [
      ['per', 'The perceptual stage'],
      ['sen', 'Isolated sensations retained as such'],
      ['inn', 'Innate propositions'],
      ['txt', 'Texts'],
    ], 'per', q(
      "Although, chronologically, man's consciousness develops in three stages: the stage of sensations, the perceptual, the conceptual—epistemologically, the base of all of man's knowledge is the perceptual stage.",
      'Chronological order and epistemological base are not the same claim. The base, she says, is the perceptual stage.',
      C.cog,
    )),
    choice('e2e4', 'What does she say are the given, the self-evident?', [
      ['per', 'Percepts, not sensations'],
      ['sen', 'Sensations, not percepts'],
      ['con', 'Concepts, with no percepts under them'],
      ['wor', 'Words, before any awareness'],
    ], 'per', q(
      'Percepts, not sensations, are the given, the self-evident.',
      'She also says sensations as such are not retained in memory, and that man is not able to experience a pure isolated sensation.',
      C.cog,
    )),
    blanks('e2e5', 'Complete the sentence.', [
      { type: 'text', text: 'Percepts, not sensations, are the ' },
      { type: 'blank', id: 'b1', answer: 'given' },
      { type: 'text', text: ', the self-evident.' },
    ], ['given', 'optional', 'invented', 'hidden'], q(
      'Percepts, not sensations, are the given, the self-evident.',
      '“Given” here means the base you are aware of, not a gift from a second world.',
      C.cog,
    )),
    match('e2e6', 'Match the item to the point made in “Cognition and Measurement.”', [
      ['sen', 'Sensation', 'Not retained in man’s memory as such'],
      ['per', 'Percept', 'The form in which man grasps sensory evidence'],
      ['con', 'Concept', 'A later, volitional level of awareness'],
    ], q(
      'It is in the form of percepts that man grasps the evidence of his senses and apprehends reality.',
      'The concept line in the match is our label for the contrast she draws: the conceptual level comes after, and on that level the process is volitional. The percept sentence is the quotation.',
      C.cog,
    )),
    sentence('e2e7', 'Build the sentence.',
      ['Percepts', 'not', 'sensations', 'are', 'the', 'given'],
      ['t1', 't2', 't3', 't4', 't5', 't6'],
      ['optional'],
      q('Percepts, not sensations, are the given, the self-evident.', 'The bank omits the comma and the second clause. The order of the six words is the claim.', C.cog)),
    choice('e2e8', 'She says man is not able to experience which of these?', [
      ['iso', 'A pure isolated sensation'],
      ['ent', 'An entity'],
      ['per', 'A percept'],
      ['day', 'The daylight'],
    ], 'iso', q(
      "Sensations, as such, are not retained in man's memory, nor is man able to experience a pure isolated sensation.",
      'Discriminated awareness, she says, begins on the level of percepts. The knowledge that sensations are components of percepts is a later scientific discovery, not the form in which you are aware.',
      C.cog,
    )),
  ],
  'senses/do-not-invent': [
    choice('e3e1', 'In Galt’s speech, the organs of perception are physical and have no power to do which of these?', [
      ['inv', 'Invent or distort'],
      ['see', 'Respond to entities'],
      ['act', 'Act at all'],
      ['exi', 'Exist'],
    ], 'inv', q(
      'his organs of perception are physical and have no volition, no power to invent or to distort',
      'This is a contiguous excerpt from a longer sentence. The speech is arguing that the organs do not invent their object. The mind still has to identify what they provide.',
      C.g156,
    )),
    choice('e3e2', 'The same passage says his senses cannot do what?', [
      ['dec', 'Deceive him'],
      ['rep', 'Report entities'],
      ['dif', 'Differ from one another'],
      ['exi', 'Exist in a body'],
    ], 'dec', q(
      'His senses cannot deceive him',
      'Excerpt. The surrounding argument says the evidence is absolute and the mind must learn to understand it. A misidentification is a failure of that later work, not a lie told by the eye.',
      C.g156,
    )),
    quoteEx('e3e3', '“His senses cannot deceive him” is an excerpt from which speech?',
      'His senses cannot deceive him',
      C.g156, galtBook,
      [['fh', 'The Fountainhead'], ['pwni', 'Philosophy: Who Needs It'], ['rm', 'The Romantic Manifesto']],
      'Page 156 in the For the New Intellectual reprint. The line is an excerpt, not a full sentence by itself.'),
    blanks('e3e4', 'Complete the excerpt.', [
      { type: 'text', text: 'His senses cannot ' },
      { type: 'blank', id: 'b1', answer: 'deceive' },
      { type: 'text', text: ' him' },
    ], ['deceive', 'obey', 'create', 'replace'], q('His senses cannot deceive him', 'The verb is deceive. The excerpt does not say the senses cannot err in the sense that your conclusions cannot err.', C.g156)),
    choice('e3e5', 'Which reading fits the passage?', [
      ['mat', 'The senses give material. The mind must identify it.'],
      ['fin', 'The senses hand him finished scientific knowledge'],
      ['gui', 'The senses are guilty until proved innocent'],
      ['for', 'If a percept can be misread, the sense organ forged the object'],
    ], 'mat', q(
      'the evidence they give him is an absolute, but his mind must learn to understand it',
      'Excerpt. “Absolute” names the evidence. “Must learn” names the work still to be done. Both halves are required.',
      C.g156,
    )),
    match('e3e6', 'Match the item to the point in this passage.', [
      ['org', 'Sense organs', 'No volition to invent or distort'],
      ['min', 'Mind', 'Must learn to understand the evidence'],
      ['obj', 'Physical objects', 'Cannot act without causes'],
    ], q(
      'physical objects cannot act without causes',
      'Another contiguous excerpt from the same sentence. The three match-lines are three excerpts, not one continuous quotation.',
      C.g156,
    )),
    sentence('e3e7', 'Build the excerpt in order.',
      ['His', 'senses', 'cannot', 'deceive', 'him'],
      ['t1', 't2', 't3', 't4', 't5'],
      ['invent'],
      q('His senses cannot deceive him', 'Five words, in that order. It is an excerpt.', C.g156)),
    choice('e3e8', 'Which claim does the passage make about physical objects?', [
      ['cau', 'They cannot act without causes'],
      ['non', 'They act without causes'],
      ['min', 'They are ideas in a mind'],
      ['opt', 'Their action is optional'],
    ], 'cau', q(
      'physical objects cannot act without causes',
      'Excerpt from the same speech. It sits next to the claim that the sense organs themselves are physical.',
      C.g156,
    )),
  ],
  'senses/stolen-concept': [
    choice('e4e1', 'Rand says arguments that attack the senses are variants of which fallacy?', [
      ['st', 'The stolen concept'],
      ['ad', 'Appeal to authority'],
      ['eq', 'Equivocation on a word’s spelling'],
      ['ci', 'Appeal to the city'],
    ], 'st', q(
      'The arguments of those who attack the senses are merely variants of the fallacy of the "stolen concept."',
      'The foreword names the fallacy. It does not, in this sentence, spell out every form the attack can take.',
      C.fore,
    )),
    quoteEx('e4e2', 'Which work contains that sentence about the stolen concept?',
      'The arguments of those who attack the senses are merely variants of the fallacy of the "stolen concept."',
      C.fore,
      ['itoe', 'Introduction to Objectivist Epistemology, foreword'],
      [['as', 'Atlas Shrugged'], ['fh', 'The Fountainhead'], ['rm', 'The Romantic Manifesto']],
      'It is in the foreword to the first edition, page 4 in the citation used by the Lexicon.'),
    choice('e4e3', 'Galt’s challenge to someone who rejects sensory perception is to:', [
      ['pr', 'Try to prove the rejection without using data gained by sensory perception'],
      ['vo', 'Take a vote'],
      ['hi', 'Hide the senses and keep the conclusion'],
      ['in', 'Start from innate ideas that mention no percepts'],
    ], 'pr', q(
      'Let the witch doctor who does not choose to accept the validity of sensory perception, try to prove it without using the data he obtained by sensory perception.',
      'The sentence opens with the words Let the witch doctor. That is Galt’s phrase. The challenge is the logical point: the denial still uses the data it denies.',
      C.g155,
    )),
    sentence('e4e4', 'Build the excerpt you already used.',
      ['His', 'senses', 'cannot', 'deceive', 'him'],
      ['t1', 't2', 't3', 't4', 't5'],
      ['replace'],
      q('His senses cannot deceive him', 'Same excerpt as the previous floor. Repetition is the point of a ladder.', C.g156)),
    choice('e4e5', 'Why does the challenge matter?', [
      ['use', 'A denial of the senses still uses sensory evidence to state the denial'],
      ['pol', 'Because politics requires it'],
      ['old', 'Because older books said so, and that is enough'],
      ['hid', 'Because the senses are hidden and therefore guilty'],
    ], 'use', para(
      'Our wording of the trap: you cannot claim the senses are invalid without relying on sensory evidence to make and check the claim. Galt’s version is the sentence quoted on this floor that begins Let the witch doctor.',
      C.g155,
    )),
    match('e4e6', 'Match the idea to the role it plays in this floor.', [
      ['st', 'Stolen concept', 'Using a conclusion while denying what it rests on'],
      ['se', 'Sensory evidence', 'The base the denial still uses'],
      ['pr', 'The challenge', 'Prove the denial without that data'],
    ], para(
      'Stolen concept is Rand’s name, quoted in the foreword in that form. The two glosses beside it in the match are ours: the fallacy is relying on what you deny, and the challenge is to do without the data.',
      C.fore,
    )),
    choice('e4e7', 'Which conclusion does this floor license?', [
      ['pre', 'You cannot throw out the senses and keep a proof that uses them'],
      ['bad', 'The senses are guilty because people sometimes misidentify'],
      ['inn', 'Knowledge starts from innate sentences'],
      ['no', 'If two people disagree, neither perceived anything'],
    ], 'pre', para(
      'Disagreement and misidentification happen at the conceptual level, where the process is volitional and fallible. That does not convert the sense organs into inventors. The quotations for the organs, the percept, and the stolen concept are on this unit’s earlier questions.',
      C.con,
    )),
    choice('e4e8', 'The next epistemology topic on this ladder, after the validity of the senses, is:', [
      ['cf', 'Concept-formation, which is marked coming soon'],
      ['cap', 'The moral basis of capitalism'],
      ['rom', 'Romanticism in art'],
      ['tax', 'A theory of tax rates'],
    ], 'cf', para(
      'Concept-formation is the next epistemology floor on this tower, and it is not written yet. Rand’s bridge, already quoted, is that without sensory evidence there can be no concepts.',
      C.kant,
    )),
  ],
  'senses/holding-it': [
    choice('e5e1', 'Which order matches the texts in this unit?', [
      ['ok', 'Senses provide material. Percepts are the given. Reason identifies and integrates.'],
      ['bad', 'Reason invents material. The senses vote on it. Percepts are optional.'],
      ['inn', 'Innate ideas come first. Percepts decorate them.'],
      ['emo', 'Emotions report the facts. The senses illustrate the emotions.'],
    ], 'ok', q(
      "Reason is the faculty that identifies and integrates the material provided by man's senses.",
      'Put the percept under that sentence: percepts, not isolated sensations, are the given form of the material.',
      C.vos,
    )),
    match('e5e2', 'Match the sentence to its source.', [
      ['se', "Man's only direct cognitive contact", 'Philosophy: Who Needs It'],
      ['pe', 'Percepts, not sensations, are the given', 'Introduction to Objectivist Epistemology'],
      ['em', 'Emotions are not tools of cognition', 'Playboy interview, March 1964'],
      ['de', 'His senses cannot deceive him', "Galt's speech"],
    ], para(
      'Each line is quoted in full on an earlier floor of this unit. This match asks only for the source, so the left column is a short tag rather than a fresh quotation.',
      '',
    )),
    blanks('e5e3', 'Complete the definition of reason.', [
      { type: 'text', text: 'Reason is the faculty that identifies and integrates the material provided by man\'s ' },
      { type: 'blank', id: 'b1', answer: 'senses' },
    ], ['senses', 'feelings', 'ancestors', 'rulers'], q(
      "Reason is the faculty that identifies and integrates the material provided by man's senses.",
      'The last word is senses. Substituting feelings would make reason a rationalizer of emotion, which the interview denies.',
      C.vos,
    )),
    quoteEx('e5e4', 'Which citation fits this standard of truth?',
      "Truth is the recognition of reality; reason, man's only means of knowledge, is his only standard of truth.",
      C.g126, galtBook,
      [['fh', 'The Fountainhead'], ['rm', 'The Romantic Manifesto'], ['an', 'Anthem']],
      'Truth is tied to reality, and the standard named in the sentence is reason, not feeling and not a vote.'),
    choice('e5e5', '“Reason is man’s only means of grasping reality and of acquiring knowledge” implies which consequence, in the same sentence?', [
      ['rej', 'Rejecting reason means acting regardless of, or against, the facts'],
      ['ok', 'Rejecting reason leaves the facts untouched and the action rational'],
      ['emo', 'Emotion then becomes the means of knowledge'],
      ['soc', 'Society becomes the means of knowledge'],
    ], 'rej', q(
      "Reason is man's only means of grasping reality and of acquiring knowledge—and, therefore, the rejection of reason means that men should act regardless of and/or in contradiction to the facts of reality.",
      'The “therefore” is part of the sentence. It is a consequence she draws, not a separate slogan.',
      C.left,
    )),
    sentence('e5e6', 'Build the shorter truth sentence’s opening.',
      ['Truth', 'is', 'the', 'recognition', 'of', 'reality'],
      ['t1', 't2', 't3', 't4', 't5', 't6'],
      ['feeling'],
      q(
        "Truth is the recognition of reality; reason, man's only means of knowledge, is his only standard of truth.",
        'You built the opening clause. The sentence goes on to name reason as the only standard.',
        C.g126,
      )),
    choice('e5e7', 'A philosophic system, in the West Point lecture, is:', [
      ['int', 'An integrated view of existence'],
      ['bag', 'A grab bag of isolated tips'],
      ['mood', 'A mood'],
      ['law', 'A statute'],
    ], 'int', q(
      'A philosophic system is an integrated view of existence.',
      'The sentence defines a philosophic system as one view, not a pile of tips. This floor only asks for that definition.',
      C.pwni,
    )),
    choice('e5e8', 'Which mistake does this unit treat as a stolen-concept move?', [
      ['atk', 'Attacking the senses while using sensory evidence to make the attack'],
      ['see', 'Reporting what you see'],
      ['int', 'Integrating two percepts'],
      ['nam', 'Naming an entity'],
    ], 'atk', q(
      'The arguments of those who attack the senses are merely variants of the fallacy of the "stolen concept."',
      'You can now say what is stolen: the evidential base the argument still stands on.',
      C.fore,
    )),
  ],
};

const catalog = {
  title: 'Atlas Ladder',
  basedOn: 'Ayn Rand’s philosophy, organized by topic. Short quotations are from her own works and are listed in SOURCES.md.',
  sections: [
    {
      id: 'metaphysics',
      title: 'Metaphysics',
      accent: 'gold',
      summary: 'What exists, and what it is to exist. Volition is the top floor of this section, after the axioms, primacy, causality, and the metaphysically given.',
      file: 'metaphysics.json',
      units: [
        {
          id: 'axioms',
          title: 'Existence, Identity, Consciousness',
          status: 'ready',
          summary: 'The three axioms and the formulas that state them.',
          lessons: [
            { id: 'where-it-starts', title: 'Where philosophy starts', objective: 'Name Objectivism, the one-foot branches, and the three axiomatic concepts.' },
            { id: 'existence-exists', title: 'Existence exists', objective: 'Hold the first axiom: something is, and it does not depend on a wish.' },
            { id: 'identity', title: 'A is A', objective: 'To exist is to be something. A contradiction is an error in thinking, not a feature of reality.' },
            { id: 'consciousness', title: 'Consciousness', objective: 'Consciousness perceives what exists. Awareness with no object cancels itself.' },
            { id: 'three-together', title: 'One set of axioms', objective: 'Hold the three formulas together, and see why causality and primacy come next.' },
          ],
        },
        { id: 'primacy', title: 'Primacy of Existence', status: 'soon', summary: 'The universe exists independent of consciousness. Consciousness apprehends. It does not decree.' },
        { id: 'causality', title: 'Causality as a Corollary of Identity', status: 'soon', summary: 'The law of causality as the law of identity applied to action. A fuller floor than the preview you just climbed.' },
        { id: 'given', title: 'The Metaphysically Given', status: 'soon', summary: 'Facts that are, as against facts that human choice brings into existence. What is given is not up for a vote.' },
        { id: 'volition', title: 'Volition', status: 'soon', summary: 'The primary choice to focus or not, and volition as axiomatic. This ladder places it after the metaphysically given.' },
      ],
    },
    {
      id: 'epistemology',
      title: 'Epistemology',
      accent: 'copper',
      summary: 'How you know. This section starts with the senses. Volition is on the metaphysics ladder.',
      file: 'epistemology.json',
      units: [
        {
          id: 'senses',
          title: 'The Validity of the Senses',
          status: 'ready',
          summary: 'The senses as your only direct contact, percepts as the given, and the stolen-concept trap in attacking them.',
          lessons: [
            { id: 'direct-contact', title: 'The only direct contact', objective: 'The senses provide the material. Reason integrates it. Emotions do not replace either.' },
            { id: 'percepts', title: 'Percepts are the given', objective: 'You are aware of entities, not of free-floating sensations stored one by one.' },
            { id: 'do-not-invent', title: 'The senses do not invent', objective: 'The organs have no volition to distort. The mind still has to identify what they give.' },
            { id: 'stolen-concept', title: 'The stolen concept', objective: 'An attack on the senses that uses sensory evidence has stolen its own base.' },
            { id: 'holding-it', title: 'From percept to reason', objective: 'Put the unit in one order: material, percept, identification, truth.' },
          ],
        },
        { id: 'concepts', title: 'Concept-Formation and Measurement-Omission', status: 'soon', summary: 'Differentiation, integration, and concepts as a mathematical process of measurement-omission.' },
        { id: 'definitions', title: 'Definitions and the Hierarchy', status: 'soon', summary: 'Definition as the last step of concept-formation, and concepts as a hierarchy rather than a pile.' },
        { id: 'objectivity', title: 'Objectivity', status: 'soon', summary: 'Volitional adherence to reality by the method of logic. Knowledge as contextual and hierarchical.' },
        { id: 'reason-rivals', title: 'Reason, Mysticism, and Skepticism', status: 'soon', summary: 'Reason as the only means of knowledge, and mysticism and skepticism as denials of it.' },
        { id: 'certainty', title: 'Certainty and the Arbitrary', status: 'soon', summary: 'The arbitrary as neither true nor false, and certainty as contextual.' },
      ],
    },
    {
      id: 'human-nature',
      title: 'Human Nature',
      accent: 'gold',
      summary: 'What kind of organism a human being is, once metaphysics and epistemology are in place.',
      file: null,
      units: [
        { id: 'rational-animal', title: 'Man as a Rational Animal', status: 'soon', summary: 'Living organisms as goal-directed, and reason as the human means of survival.' },
        { id: 'mind-body', title: 'Mind and Body', status: 'soon', summary: 'No war between a ghostly mind and a mechanical body. Reason is an attribute of the individual.' },
        { id: 'emotions', title: 'Emotions as Products of Ideas', status: 'soon', summary: 'Emotions as consequences of value-judgments, not as tools that discover facts.' },
        { id: 'character', title: 'Free Will and Character', status: 'soon', summary: 'Character as the self you build by the choices you automate. A later floor, not a substitute for volition.' },
      ],
    },
    {
      id: 'ethics',
      title: 'Ethics',
      accent: 'copper',
      summary: 'The code that guides choices, once you know what you are and how you know.',
      file: null,
      units: [
        { id: 'why-morality', title: 'Why Man Needs Morality', status: 'soon', summary: 'Why a code of values is a requirement of human life, not a decoration.' },
        { id: 'life-standard', title: 'Life as the Standard', status: 'soon', summary: 'Life as the root of value, and one’s own life as the standard of moral value.' },
        { id: 'cardinal', title: 'The Three Cardinal Values', status: 'soon', summary: 'Reason, purpose, and self-esteem.' },
        { id: 'virtues', title: 'The Seven Virtues', status: 'soon', summary: 'Rationality, independence, integrity, honesty, justice, productiveness, and pride.' },
        { id: 'happiness', title: 'Happiness', status: 'soon', summary: 'Happiness as the emotional state that follows from achieved values, not as a whim.' },
        { id: 'egoism', title: 'Egoism and Altruism', status: 'soon', summary: 'The individual as the proper beneficiary of his own action, against the demand that he live for others.' },
      ],
    },
    {
      id: 'politics',
      title: 'Politics',
      accent: 'gold',
      summary: 'The social principles that follow when each person is an end in himself.',
      file: null,
      units: [
        { id: 'rights', title: 'Individual Rights', status: 'soon', summary: 'Rights as principles that sanction freedom of action in a social context.' },
        { id: 'force', title: 'The Initiation of Force', status: 'soon', summary: 'Why starting the use of physical force is the basic political evil.' },
        { id: 'government', title: 'Government’s Proper Role', status: 'soon', summary: 'Government as an agent that protects rights, limited to retaliatory force.' },
        { id: 'capitalism', title: 'Capitalism and Its Moral Basis', status: 'soon', summary: 'Laissez-faire capitalism as the system that follows from rights, not as a brute economic preference.' },
      ],
    },
    {
      id: 'aesthetics',
      title: 'Aesthetics',
      accent: 'copper',
      summary: 'Art as a need of a conceptual consciousness, and the standards for judging it.',
      file: null,
      units: [
        { id: 'selective', title: 'Art as Selective Re-creation', status: 'soon', summary: 'Art as a selective re-creation of reality according to metaphysical value-judgments.' },
        { id: 'sense-of-life', title: 'Sense of Life', status: 'soon', summary: 'A sense of life as a pre-conceptual, emotional appraisal of man and of existence.' },
        { id: 'romanticism', title: 'Romanticism', status: 'soon', summary: 'Romanticism as the school committed to volition, and its place in Rand’s esthetics.' },
        { id: 'judgment', title: 'Esthetic Judgment', status: 'soon', summary: 'How to judge a work by what it does as art, which is not the same as agreeing with its philosophy.' },
      ],
    },
    {
      id: 'integration',
      title: 'Integration',
      accent: 'gold',
      summary: 'The philosophy as one whole, and what it asks of a life.',
      file: null,
      units: [
        { id: 'whole', title: 'The Philosophy as a Whole', status: 'soon', summary: 'Why an idea pulled out of the middle cannot be validated or used.' },
        { id: 'applying', title: 'Applying It', status: 'soon', summary: 'Holding the principles in concrete choices, without turning the philosophy into a script.' },
      ],
    },
  ],
};

function pack(id, lessons) {
  const wrapped = {};
  for (const [key, exercises] of Object.entries(lessons)) wrapped[key] = { exercises };
  return { id, lessons: wrapped };
}

writeFileSync(join(root, 'content/catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
writeFileSync(join(root, 'content/metaphysics.json'), `${JSON.stringify(pack('metaphysics', lessonsMeta), null, 2)}\n`);
writeFileSync(join(root, 'content/epistemology.json'), `${JSON.stringify(pack('epistemology', lessonsEpi), null, 2)}\n`);

const byCite = new Map();
for (const item of registry) {
  if (!byCite.has(item.citation)) byCite.set(item.citation, []);
  const list = byCite.get(item.citation);
  if (!list.includes(item.quote)) list.push(item.quote);
}

const lines = [];
lines.push('# Sources');
lines.push('');
lines.push('Atlas Ladder quotes only short passages, for study and criticism. Each quotation below is copied as a contiguous wording checked against the Ayn Rand Lexicon (aynrandlexicon.com). If a line is an excerpt from a longer sentence, the entry says so. A few lines are from essays published with Rand’s epistemological work, or from The Ominous Parallels, and the citation names that source.');
lines.push('');
lines.push('Page numbers for Galt’s speech follow *For the New Intellectual*, the pagination the Lexicon uses. The speech was written for *Atlas Shrugged* and is reprinted there.');
lines.push('');
lines.push('Paraphrases in the app are labeled **Paraphrase** on the answer banner. They are not quotations and are not listed here.');
lines.push('');
lines.push('The one-foot summary uses two familiar sayings as plain language. “Nature, to be commanded, must be obeyed” is Francis Bacon’s. “Give me liberty or give me death” is Patrick Henry’s. Rand offers them as translations of her branches. She did not originate them.');
lines.push('');
lines.push('Do not treat this file as a license to copy the books. Read the works.');
lines.push('');

for (const [citation, quotes] of byCite) {
  lines.push(`## ${citation}`);
  lines.push('');
  for (const quote of quotes) {
    lines.push('> ' + quote.replace(/\n/g, '\n> '));
    lines.push('');
  }
}

writeFileSync(join(root, 'SOURCES.md'), `${lines.join('\n')}\n`);
console.log(`quotes ${registry.length}, citations ${byCite.size}`);
