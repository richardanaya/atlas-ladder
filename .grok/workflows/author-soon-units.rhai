let meta = #{
    name: "author-soon-units",
    description: "Write lesson content for every coming-soon unit, one unit per agent, then wire the drafts into the tower",
    when_to_use: "Fill Atlas Ladder units whose catalog status is soon. Parallel authors, then one wire step.",
    phases: [
        #{ title: "Author", detail: "one agent per coming-soon unit" },
        #{ title: "Wire", detail: "merge drafts, mark units ready, validate" },
    ],
};

let report_schema = #{
    "type": "object",
    "required": ["file", "lessonCount", "exerciseCount"],
    "properties": #{
        "file": #{ "type": "string" },
        "lessonCount": #{ "type": "integer" },
        "exerciseCount": #{ "type": "integer" },
    },
};

// Fixed list from content/catalog.json units with status "soon". Agents do not pick the list.
let units = [
    #{ section: "metaphysics", file: "metaphysics.json", unit: "primacy", title: "Primacy of Existence", summary: "The universe exists independent of consciousness. Consciousness apprehends. It does not decree." },
    #{ section: "metaphysics", file: "metaphysics.json", unit: "causality", title: "Causality as a Corollary of Identity", summary: "The law of causality as the law of identity applied to action. A fuller floor than the preview you just climbed." },
    #{ section: "metaphysics", file: "metaphysics.json", unit: "given", title: "The Metaphysically Given", summary: "Facts that are, as against facts that human choice brings into existence. What is given is not up for a vote." },
    #{ section: "metaphysics", file: "metaphysics.json", unit: "volition", title: "Volition", summary: "The primary choice to focus or not, and volition as axiomatic. This ladder places it after the metaphysically given." },
    #{ section: "epistemology", file: "epistemology.json", unit: "concepts", title: "Concept-Formation and Measurement-Omission", summary: "Differentiation, integration, and concepts as a mathematical process of measurement-omission." },
    #{ section: "epistemology", file: "epistemology.json", unit: "definitions", title: "Definitions and the Hierarchy", summary: "Definition as the last step of concept-formation, and concepts as a hierarchy rather than a pile." },
    #{ section: "epistemology", file: "epistemology.json", unit: "objectivity", title: "Objectivity", summary: "Volitional adherence to reality by the method of logic. Knowledge as contextual and hierarchical." },
    #{ section: "epistemology", file: "epistemology.json", unit: "reason-rivals", title: "Reason, Mysticism, and Skepticism", summary: "Reason as the only means of knowledge, and mysticism and skepticism as denials of it." },
    #{ section: "epistemology", file: "epistemology.json", unit: "certainty", title: "Certainty and the Arbitrary", summary: "The arbitrary as neither true nor false, and certainty as contextual." },
    #{ section: "human-nature", file: "human-nature.json", unit: "rational-animal", title: "Man as a Rational Animal", summary: "Living organisms as goal-directed, and reason as the human means of survival." },
    #{ section: "human-nature", file: "human-nature.json", unit: "mind-body", title: "Mind and Body", summary: "No war between a ghostly mind and a mechanical body. Reason is an attribute of the individual." },
    #{ section: "human-nature", file: "human-nature.json", unit: "emotions", title: "Emotions as Products of Ideas", summary: "Emotions as consequences of value-judgments, not as tools that discover facts." },
    #{ section: "human-nature", file: "human-nature.json", unit: "character", title: "Free Will and Character", summary: "Character as the self you build by the choices you automate. A later floor, not a substitute for volition." },
    #{ section: "ethics", file: "ethics.json", unit: "why-morality", title: "Why Man Needs Morality", summary: "Why a code of values is a requirement of human life, not a decoration." },
    #{ section: "ethics", file: "ethics.json", unit: "life-standard", title: "Life as the Standard", summary: "Life as the root of value, and one's own life as the standard of moral value." },
    #{ section: "ethics", file: "ethics.json", unit: "cardinal", title: "The Three Cardinal Values", summary: "Reason, purpose, and self-esteem." },
    #{ section: "ethics", file: "ethics.json", unit: "virtues", title: "The Seven Virtues", summary: "Rationality, independence, integrity, honesty, justice, productiveness, and pride." },
    #{ section: "ethics", file: "ethics.json", unit: "happiness", title: "Happiness", summary: "Happiness as the emotional state that follows from achieved values, not as a whim." },
    #{ section: "ethics", file: "ethics.json", unit: "egoism", title: "Egoism and Altruism", summary: "The individual as the proper beneficiary of his own action, against the demand that he live for others." },
    #{ section: "politics", file: "politics.json", unit: "rights", title: "Individual Rights", summary: "Rights as principles that sanction freedom of action in a social context." },
    #{ section: "politics", file: "politics.json", unit: "force", title: "The Initiation of Force", summary: "Why starting the use of physical force is the basic political evil." },
    #{ section: "politics", file: "politics.json", unit: "government", title: "Government's Proper Role", summary: "Government as an agent that protects rights, limited to retaliatory force." },
    #{ section: "politics", file: "politics.json", unit: "capitalism", title: "Capitalism and Its Moral Basis", summary: "Laissez-faire capitalism as the system that follows from rights, not as a brute economic preference." },
    #{ section: "aesthetics", file: "aesthetics.json", unit: "selective", title: "Art as Selective Re-creation", summary: "Art as a selective re-creation of reality according to metaphysical value-judgments." },
    #{ section: "aesthetics", file: "aesthetics.json", unit: "sense-of-life", title: "Sense of Life", summary: "A sense of life as a pre-conceptual, emotional appraisal of man and of existence." },
    #{ section: "aesthetics", file: "aesthetics.json", unit: "romanticism", title: "Romanticism", summary: "Romanticism as the school committed to volition, and its place in Rand's esthetics." },
    #{ section: "aesthetics", file: "aesthetics.json", unit: "judgment", title: "Esthetic Judgment", summary: "How to judge a work by what it does as art, which is not the same as agreeing with its philosophy." },
    #{ section: "integration", file: "integration.json", unit: "whole", title: "The Philosophy as a Whole", summary: "Why an idea pulled out of the middle cannot be validated or used." },
    #{ section: "integration", file: "integration.json", unit: "applying", title: "Applying It", summary: "Holding the principles in concrete choices, without turning the philosophy into a script." },
];

phase("Author");
let jobs = [];
for u in units {
    let prompt = "Write one Atlas Ladder unit. Workspace root: /home/wizard/repos/objectivist-duolingo. ";
    prompt += "Read content/catalog.json, scripts/validate-content.mjs, and one lesson of each exercise type in content/metaphysics.json before you write. ";
    prompt += "The validator is the schema. If README.md disagrees with a live exercise or the validator, follow the validator and the live exercise. ";
    prompt += "Your only output file is content/drafts/" + u.section + "--" + u.unit + ".json. ";
    prompt += "Create the drafts directory if needed. Do not edit catalog.json, SOURCES.md, section JSON files, scripts, or any other draft. ";
    prompt += "Section id: " + u.section + ". Section file name: " + u.file + ". Unit id: " + u.unit + ". ";
    prompt += "Unit title: " + u.title + ". Unit summary: " + u.summary + ". ";
    prompt += "JSON shape: { sectionId, sectionFile, unitId, title, summary, lessons, sources }. ";
    prompt += "lessons is an array of exactly 5 objects: { id, title, objective, exercises }. ";
    prompt += "Lesson ids are short kebab-case slugs unique inside this unit. ";
    prompt += "Each lesson has 8 to 12 exercises. Mix choice, match, fill blanks, and fill sentence. ";
    prompt += "choice: id, type choice, prompt, answer (a choice id), choices [{id,text}] with 4 choices, feedback. ";
    prompt += "match: id, type match, prompt, pairs [{id,left,right}] length at least 3, feedback. No answer field. ";
    prompt += "fill blanks: id, type fill, mode blanks, prompt, parts (text parts and blank parts {type,id,answer}), bank (strings that include every blank answer), feedback. ";
    prompt += "fill sentence: id, type fill, mode sentence, prompt, tokens [{id,text}] including distractors, answer (array of token ids), feedback. ";
    prompt += "feedback is { kind, note } and kind is paraphrase, unless you copy a quotation that already appears verbatim in SOURCES.md. ";
    prompt += "A quote exercise or quote feedback also needs quote and citation copied from SOURCES.md, character for character. Do not invent quotations, page numbers, or citations. ";
    prompt += "Paraphrase notes are your wording of the unit's ideas. Do not wrap invented sentences in quotation marks. ";
    prompt += "Teach only this unit's title and summary, in plain study-app language. Five distinct lesson objectives, not five copies of one drill. ";
    prompt += "sources is an array of { quote, citation } for every quote you copied from SOURCES.md. Use an empty array if you used only paraphrase. ";
    prompt += "Write the file, then re-read it and count lessons and exercises. ";
    prompt += "Return file (the repo-relative path), lessonCount, and exerciseCount.";
    jobs.push(#{
        prompt: prompt,
        label: "author:" + u.section + "/" + u.unit,
        capability_mode: "read-write",
        output_schema: report_schema,
    });
}
let results = parallel(jobs);

let authored = 0;
let failed = 0;
for r in results {
    if r != () && r.success && r.output.file != () && r.output.file != "" {
        authored += 1;
    } else {
        failed += 1;
    }
}
log(authored.to_string() + " drafts reported, " + failed.to_string() + " author slots failed");

phase("Wire");
let wire_prompt = "Wire Atlas Ladder drafts into the live tower. Workspace: /home/wizard/repos/objectivist-duolingo. ";
wire_prompt += "Read every content/drafts/*.json file. Ignore a draft whose unitId is not a catalog unit with status soon, or whose sectionId does not match that unit's section. ";
wire_prompt += "For each kept draft: create or update content/<sectionFile> as { id: sectionId, lessons: { '<unitId>/<lessonId>': { exercises } } }, merging into an existing lessons object without dropping lessons already there. ";
wire_prompt += "In content/catalog.json set that unit's status to ready and add lessons as { id, title, objective } with no exercises. Set the section file field to sectionFile if it is null. ";
wire_prompt += "Append each draft sources entry to SOURCES.md only when quote and citation are already absent. Do not invent citations. ";
wire_prompt += "Do not run scripts/author-content.mjs. It regenerates the two built section files and would wipe hand-written JSON. ";
wire_prompt += "Run: node scripts/validate-content.mjs. Fix the drafts' integration until it prints content ok. Do not weaken the validator. ";
wire_prompt += "Leave units with no valid draft as status soon. Report which units became ready and which stayed soon.";
let wire = agent(wire_prompt, #{ label: "wire", capability_mode: "read-write" });

let wire_ok = wire != () && wire.success;
let summary = authored.to_string() + " of " + units.len().to_string() + " units reported a draft";
if wire_ok {
    summary += ". Wire step finished.";
} else {
    summary += ". Wire step failed.";
}
if wire_ok {
    complete(#{ summary: summary, authored: authored, failed: failed, wire: wire.output });
} else {
    complete(#{ summary: summary, authored: authored, failed: failed, wire: () });
}
