let meta = #{
    name: "author-epistemology-upper",
    description: "Write two new upper floors for Epistemology and append them above the units already on the tower",
    when_to_use: "Add the next Epistemology floors. Leaves every unit already in the catalog untouched.",
    phases: [
        #{ title: "Author", detail: "one agent per new Epistemology floor" },
        #{ title: "Wire", detail: "append the new units and validate" },
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

// New floors only. These unit ids are not in content/catalog.json.
let units = [
    #{ section: "epistemology", file: "epistemology.json", unit: "logic", title: "Logic", summary: "Logic as the art of non-contradictory identification." },
    #{ section: "epistemology", file: "epistemology.json", unit: "context", title: "Context and Hierarchy", summary: "Knowledge is contextual and hierarchical. A concept used with no context is floating." },
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
    prompt += "Do not reteach a unit that is already in content/catalog.json for this section. ";
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
let wire_prompt = "Append new Atlas Ladder floors for one section. Workspace: /home/wizard/repos/objectivist-duolingo. ";
wire_prompt += "Section id: epistemology. Section file: content/epistemology.json. ";
wire_prompt += "Allowed new unit ids, in this order: logic, context. ";
wire_prompt += "Read only content/drafts/epistemology--<unitId>.json for those ids. ";
wire_prompt += "Skip a draft whose unitId is not in that allowed list, whose sectionId is not epistemology, or whose unitId already exists anywhere in content/catalog.json. ";
wire_prompt += "For each kept draft: merge lessons into content/epistemology.json as { id: sectionId, lessons: { '<unitId>/<lessonId>': { exercises } } } without dropping or rewriting lessons already in that file. ";
wire_prompt += "Append the unit to the end of that section's units array in content/catalog.json with status ready and lessons as { id, title, objective } and no exercises. ";
wire_prompt += "Do not change any unit that was already in the catalog. Do not reorder existing units. ";
wire_prompt += "Append each draft sources entry to SOURCES.md only when quote and citation are already absent. Do not invent citations. ";
wire_prompt += "Do not run scripts/author-content.mjs. It regenerates built section files and would wipe hand-written JSON. ";
wire_prompt += "Run: node scripts/validate-content.mjs. Fix only the new units until it prints content ok. Do not weaken the validator. ";
wire_prompt += "If a draft is missing or invalid, leave that unit off the catalog. Report which units were appended and which were skipped.";
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
