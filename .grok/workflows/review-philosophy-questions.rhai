let meta = #{
    name: "review-philosophy-questions",
    description: "Review every Atlas Ladder lesson in parallel and replace trivia drills with questions that teach the philosophy",
    when_to_use: "When lesson questions drift into dates, editions, or other recall trivia. One agent per lesson, then one merge.",
    phases: [
        #{ title: "Review", detail: "one agent per lesson" },
        #{ title: "Merge", detail: "write kept rewrites back and validate" },
    ],
};

let report_schema = #{
    "type": "object",
    "required": ["changed", "replaced"],
    "properties": #{
        "changed": #{ "type": "boolean" },
        "path": #{ "type": "string" },
        "replaced": #{ "type": "integer" },
        "notes": #{ "type": "string" },
    },
};

let lessons = [
    #{ file: "metaphysics.json", section: "metaphysics", unit: "axioms", lesson: "where-it-starts", title: "Where philosophy starts", objective: "Name Objectivism, the one-foot branches, and the three axiomatic concepts." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "axioms", lesson: "existence-exists", title: "Existence exists", objective: "Hold the first axiom: something is, and it does not depend on a wish." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "axioms", lesson: "identity", title: "A is A", objective: "To exist is to be something. A contradiction is an error in thinking, not a feature of reality." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "axioms", lesson: "consciousness", title: "Consciousness", objective: "Consciousness perceives what exists. Awareness with no object cancels itself." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "axioms", lesson: "three-together", title: "One set of axioms", objective: "Hold the three formulas together, and see why causality and primacy come next." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "primacy", lesson: "independent", title: "Independent of consciousness", objective: "State that the universe exists whether or not anyone is aware of it." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "primacy", lesson: "apprehends", title: "Consciousness apprehends", objective: "Say what consciousness does: it takes in what exists. It does not create it." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "primacy", lesson: "no-decree", title: "It does not decree", objective: "Reject the idea that wishing, believing, or agreeing can rewrite what exists." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "primacy", lesson: "two-claims", title: "Two opposite claims", objective: "Tell primacy of existence apart from the claim that consciousness comes first and sets the facts." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "primacy", lesson: "hold-it", title: "Hold the unit", objective: "Put the three lines together: independent existence, apprehension, and no decree." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "causality", lesson: "identity-applied", title: "Identity applied to action", objective: "State the law of causality as the law of identity applied to action, not as a second rule beside identity." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "causality", lesson: "entities-that-act", title: "The entities that act", objective: "Locate the cause in the nature of the entities that act, not in a push with no thing behind it." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "causality", lesson: "no-contradiction", title: "No action against its nature", objective: "Hold that a thing cannot act in contradiction to its nature, while still allowing action that fits what it is." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "causality", lesson: "not-a-rival", title: "Not a rival law", objective: "Reject substitutes that treat causality as chance, decree, or a second axiom that can break identity." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "causality", lesson: "fuller-floor", title: "The fuller floor", objective: "Connect the short formula to the longer clause and treat them as one statement, fuller than the preview." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "given", lesson: "facts-that-are", title: "Facts that are", objective: "Name a metaphysically given fact as something that is, not something a person decided to create." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "given", lesson: "brought-by-choice", title: "Brought into existence by choice", objective: "Identify facts that exist because human choice brought them into existence." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "given", lesson: "not-a-vote", title: "Not up for a vote", objective: "See that a metaphysically given fact is not settled by a vote, a poll, or a majority." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "given", lesson: "wish-versus-fact", title: "A wish is not the given", objective: "Separate wanting a fact to be otherwise from the metaphysically given fact itself." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "given", lesson: "hold-both-sides", title: "Hold both sides", objective: "Sort mixed cases by keeping facts that are on one side and facts that choice brings into existence on the other." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "volition", lesson: "primary-choice", title: "The primary choice", objective: "Name the primary act of volition: the choice to focus the mind or not to focus it." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "volition", lesson: "effort-first", title: "Focus before content", objective: "Separate the effort of focus from later choices about what to think, say, or do." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "volition", lesson: "axiom-of-will", title: "Volition is axiomatic", objective: "Explain why volition is axiomatic: an attempt to deny the choice already uses it." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "volition", lesson: "after-the-given", title: "After the metaphysically given", objective: "Place volition after the metaphysically given: what is given is not chosen, and choice is what can add man-made facts." },
    #{ file: "metaphysics.json", section: "metaphysics", unit: "volition", lesson: "hold-the-unit", title: "Given, then the axiom", objective: "Hold the unit in one order: the metaphysically given, the primary choice to focus or not, and volition as axiomatic." },
    #{ file: "epistemology.json", section: "epistemology", unit: "senses", lesson: "direct-contact", title: "The only direct contact", objective: "The senses provide the material. Reason integrates it. Emotions do not replace either." },
    #{ file: "epistemology.json", section: "epistemology", unit: "senses", lesson: "percepts", title: "Percepts are the given", objective: "You are aware of entities, not of free-floating sensations stored one by one." },
    #{ file: "epistemology.json", section: "epistemology", unit: "senses", lesson: "do-not-invent", title: "The senses do not invent", objective: "The organs have no volition to distort. The mind still has to identify what they give." },
    #{ file: "epistemology.json", section: "epistemology", unit: "senses", lesson: "stolen-concept", title: "The stolen concept", objective: "An attack on the senses that uses sensory evidence has stolen its own base." },
    #{ file: "epistemology.json", section: "epistemology", unit: "senses", lesson: "holding-it", title: "From percept to reason", objective: "Put the unit in one order: material, percept, identification, truth." },
    #{ file: "epistemology.json", section: "epistemology", unit: "concepts", lesson: "differentiation", title: "Set the group apart", objective: "Isolate units by what they share with each other and how they differ from a wider background." },
    #{ file: "epistemology.json", section: "epistemology", unit: "concepts", lesson: "integration", title: "Unite the units", objective: "Integrate the isolated units into one new mental entity, the concept." },
    #{ file: "epistemology.json", section: "epistemology", unit: "concepts", lesson: "measurable", title: "Same characteristic, different measure", objective: "Treat similarity as the same characteristic possessed in different measure, so the process is mathematical." },
    #{ file: "epistemology.json", section: "epistemology", unit: "concepts", lesson: "omission", title: "Omit the particular measurements", objective: "Form the concept by retaining the characteristic and omitting the particular measurements." },
    #{ file: "epistemology.json", section: "epistemology", unit: "concepts", lesson: "whole-process", title: "One mathematical process", objective: "Run differentiation, integration, and measurement-omission as one ordered process that yields a concept." },
    #{ file: "epistemology.json", section: "epistemology", unit: "definitions", lesson: "last-step", title: "The last step", objective: "Place a definition after concept-formation: the units are integrated first, and the definition then states what kind they are." },
    #{ file: "epistemology.json", section: "epistemology", unit: "definitions", lesson: "genus-differentia", title: "Genus and differentia", objective: "Build a definition from a genus, the wider group, and a differentia, the characteristic that sets these units apart inside that group." },
    #{ file: "epistemology.json", section: "epistemology", unit: "definitions", lesson: "fundamental", title: "The fundamental characteristic", objective: "Select the fundamental distinguishing characteristic, the one that explains the others, rather than a surface mark." },
    #{ file: "epistemology.json", section: "epistemology", unit: "definitions", lesson: "hierarchy", title: "A hierarchy, not a pile", objective: "Treat concepts as a hierarchy in which later concepts rest on earlier ones, not as a flat pile of labels." },
    #{ file: "epistemology.json", section: "epistemology", unit: "definitions", lesson: "context-and-order", title: "Context and the same units", objective: "See that a definition states the fundamentals in the order of one's knowledge, and can be restated when that knowledge deepens without dropping the units." },
    #{ file: "epistemology.json", section: "epistemology", unit: "objectivity", lesson: "adherence", title: "Adherence to reality", objective: "State objectivity as a chosen adherence to the facts, not as neutrality and not as a mind that writes reality." },
    #{ file: "epistemology.json", section: "epistemology", unit: "objectivity", lesson: "method-of-logic", title: "The method of logic", objective: "Identify logic as the method of objectivity: non-contradictory identification of the facts." },
    #{ file: "epistemology.json", section: "epistemology", unit: "objectivity", lesson: "chosen-focus", title: "A choice to adhere", objective: "Separate what is given in awareness from the choice to adhere to it by logic." },
    #{ file: "epistemology.json", section: "epistemology", unit: "objectivity", lesson: "contextual", title: "Knowledge in context", objective: "Treat a conclusion as holding in the context of the evidence that supports it, and treat context-dropping as a failure of objectivity." },
    #{ file: "epistemology.json", section: "epistemology", unit: "objectivity", lesson: "hierarchical", title: "Knowledge in an order", objective: "Treat knowledge as hierarchical: later conclusions rest on earlier ones and cannot replace the base they depend on." },
    #{ file: "epistemology.json", section: "epistemology", unit: "reason-rivals", lesson: "only-means", title: "The only means of knowledge", objective: "Reason is the only means of knowledge and the only standard of truth." },
    #{ file: "epistemology.json", section: "epistemology", unit: "reason-rivals", lesson: "mysticism", title: "Mysticism", objective: "Mysticism claims a way of knowing that bypasses reason, such as faith, revelation, or feeling used as proof." },
    #{ file: "epistemology.json", section: "epistemology", unit: "reason-rivals", lesson: "skepticism", title: "Skepticism", objective: "Skepticism denies that knowledge is possible, and so denies that reason succeeds." },
    #{ file: "epistemology.json", section: "epistemology", unit: "reason-rivals", lesson: "the-cost", title: "What rejecting reason licenses", objective: "Rejecting reason means acting with no regard for the facts, or against them." },
    #{ file: "epistemology.json", section: "epistemology", unit: "reason-rivals", lesson: "tell-apart", title: "Three answers about knowledge", objective: "Sort reason, mysticism, and skepticism by what each says about whether and how you can know." },
    #{ file: "epistemology.json", section: "epistemology", unit: "certainty", lesson: "no-evidence", title: "A claim with nothing behind it", objective: "Recognize an arbitrary assertion as a claim offered with no evidence and no tie to the facts you know." },
    #{ file: "epistemology.json", section: "epistemology", unit: "certainty", lesson: "no-truth-value", title: "Neither true nor false", objective: "Treat the arbitrary as cognitively empty: it is neither true nor false, so it is set aside instead of weighed as a candidate." },
    #{ file: "epistemology.json", section: "epistemology", unit: "certainty", lesson: "burden", title: "Who must offer evidence", objective: "Place the burden of proof on the person who asserts, and refuse the demand to disprove a claim that was never supported." },
    #{ file: "epistemology.json", section: "epistemology", unit: "certainty", lesson: "context", title: "Certainty inside a context", objective: "Explain certainty as knowing that, inside a given context of evidence, nothing warrants doubt, without claiming to know every fact outside that context." },
    #{ file: "epistemology.json", section: "epistemology", unit: "certainty", lesson: "possibility", title: "Possibility is not a shrug", objective: "Separate a genuine possibility, which some evidence supports, from an arbitrary maybe that cannot undercut contextual certainty." },
    #{ file: "human-nature.json", section: "human-nature", unit: "rational-animal", lesson: "living-goals", title: "Life aims at itself", objective: "See a living organism as an entity whose actions are directed at keeping itself alive." },
    #{ file: "human-nature.json", section: "human-nature", unit: "rational-animal", lesson: "no-code", title: "No built-in survival code", objective: "Contrast automatic living action in plants and animals with the fact that a human being has no innate program for how to survive." },
    #{ file: "human-nature.json", section: "human-nature", unit: "rational-animal", lesson: "reason-means", title: "Reason is the means", objective: "Identify reason as the human means of survival: the faculty that identifies and integrates what the senses provide." },
    #{ file: "human-nature.json", section: "human-nature", unit: "rational-animal", lesson: "must-use", title: "Reason has to be used", objective: "Hold that reason does not run by itself: surviving by it takes the choice to think and to act on what you know." },
    #{ file: "human-nature.json", section: "human-nature", unit: "rational-animal", lesson: "one-picture", title: "One picture of the rational animal", objective: "Put the unit in one order: a goal-directed organism, no innate survival code, and reason as the means you must use." },
    #{ file: "human-nature.json", section: "human-nature", unit: "mind-body", lesson: "false-war", title: "The war that is not there", objective: "Name the false picture: a ghostly mind at war with a mechanical body." },
    #{ file: "human-nature.json", section: "human-nature", unit: "mind-body", lesson: "one-individual", title: "One individual", objective: "Hold mind and body as aspects of one individual, not two rivals sharing a life." },
    #{ file: "human-nature.json", section: "human-nature", unit: "mind-body", lesson: "reason-attribute", title: "Reason belongs to the person", objective: "Place reason as an attribute of the individual, not of a spirit world or a crowd." },
    #{ file: "human-nature.json", section: "human-nature", unit: "mind-body", lesson: "no-ghost", title: "No ghostly mind", objective: "Deny that the mind is a disembodied ghost occupying a body." },
    #{ file: "human-nature.json", section: "human-nature", unit: "mind-body", lesson: "no-machine", title: "No mechanical body", objective: "Deny that the body is a mindless machine the mind must conquer." },
    #{ file: "human-nature.json", section: "human-nature", unit: "emotions", lesson: "products-of-ideas", title: "Products of ideas", objective: "See an emotion as a consequence of a value-judgment you already hold, not as a first fact about the world." },
    #{ file: "human-nature.json", section: "human-nature", unit: "emotions", lesson: "estimate-not-facts", title: "An estimate, not the facts", objective: "Distinguish what a feeling reports — your estimate of the facts — from what it does not report: the facts themselves." },
    #{ file: "human-nature.json", section: "human-nature", unit: "emotions", lesson: "not-a-tool", title: "Not a tool that discovers facts", objective: "Reject the claim that emotions are tools of cognition — means that discover facts." },
    #{ file: "human-nature.json", section: "human-nature", unit: "emotions", lesson: "judgment-first", title: "The judgment comes first", objective: "Trace the order: idea and value-judgment, then emotion. The feeling does not come first and then invent the judgment." },
    #{ file: "human-nature.json", section: "human-nature", unit: "emotions", lesson: "when-they-clash", title: "When feeling and fact clash", objective: "When a feeling and a fact conflict, re-check the value-judgment instead of treating the feeling as evidence." },
    #{ file: "human-nature.json", section: "human-nature", unit: "character", lesson: "self-you-build", title: "The self you build", objective: "Name character as the self you build, not a finished self you are handed." },
    #{ file: "human-nature.json", section: "human-nature", unit: "character", lesson: "choices-you-automate", title: "Choices you automate", objective: "Show that character is formed when choices are repeated until they run as a standing policy." },
    #{ file: "human-nature.json", section: "human-nature", unit: "character", lesson: "later-floor", title: "A later floor", objective: "Place character after volition: a later floor, not the base of the ladder." },
    #{ file: "human-nature.json", section: "human-nature", unit: "character", lesson: "not-a-substitute", title: "Not a substitute", objective: "Show that an automated character does not stand in for the choice you still have." },
    #{ file: "human-nature.json", section: "human-nature", unit: "character", lesson: "will-then-character", title: "Will, then character", objective: "Hold the unit in one order: free will first, then the self those choices make automatic." },
    #{ file: "ethics.json", section: "ethics", unit: "why-morality", lesson: "code-of-values", title: "A code of values", objective: "Name morality as a code of values that guides choices and actions, not a mood or a slogan." },
    #{ file: "ethics.json", section: "ethics", unit: "why-morality", lesson: "life-requires-it", title: "Why human life requires it", objective: "Explain why a being who must choose needs a code of values, while a life of automatic action does not." },
    #{ file: "ethics.json", section: "ethics", unit: "why-morality", lesson: "not-a-decoration", title: "Not a decoration", objective: "Reject the idea that morality is an optional ornament, a luxury, or something added only after life is secure." },
    #{ file: "ethics.json", section: "ethics", unit: "why-morality", lesson: "without-a-code", title: "Without a code", objective: "See that without a code, choices have no standard, so action drifts by whim and is not a policy for living." },
    #{ file: "ethics.json", section: "ethics", unit: "why-morality", lesson: "hold-the-reason", title: "The reason, held together", objective: "State the full claim: man needs morality because a code of values is required to choose the actions human life depends on, and that need is not decorative." },
    #{ file: "ethics.json", section: "ethics", unit: "life-standard", lesson: "root-of-value", title: "Why Value Needs Life", objective: "Recognize that the idea of value depends on a living being that can gain or lose its existence." },
    #{ file: "ethics.json", section: "ethics", unit: "life-standard", lesson: "life-or-death", title: "The Alternative That Makes Good and Evil", objective: "Explain that good and evil arise only where the alternative is life or death." },
    #{ file: "ethics.json", section: "ethics", unit: "life-standard", lesson: "not-whim", title: "Not a Whim or a Command", objective: "Reject whim, crowd opinion, and a supernatural command as the root of value." },
    #{ file: "ethics.json", section: "ethics", unit: "life-standard", lesson: "own-life", title: "One's Own Life as the Standard", objective: "Identify one's own life as the standard used to judge moral good and evil for oneself." },
    #{ file: "ethics.json", section: "ethics", unit: "life-standard", lesson: "for-or-against", title: "For or Against That Life", objective: "Judge an action as morally good when it sustains one's own life and as morally evil when it works against that life." },
    #{ file: "ethics.json", section: "ethics", unit: "cardinal", lesson: "name-the-three", title: "Name the three", objective: "Name reason, purpose, and self-esteem as the three cardinal values, and say what cardinal means." },
    #{ file: "ethics.json", section: "ethics", unit: "cardinal", lesson: "reason-first", title: "Reason as a value", objective: "Explain reason as the cardinal value that makes knowledge and chosen action possible." },
    #{ file: "ethics.json", section: "ethics", unit: "cardinal", lesson: "chosen-purpose", title: "Purpose", objective: "Explain purpose as a chosen central goal that ranks a person's other values." },
    #{ file: "ethics.json", section: "ethics", unit: "cardinal", lesson: "earned-esteem", title: "Self-esteem", objective: "Explain self-esteem as the earned conviction that one is competent to think and worthy of living." },
    #{ file: "ethics.json", section: "ethics", unit: "cardinal", lesson: "one-set", title: "One set", objective: "Hold reason, purpose, and self-esteem as one set, and see how each depends on the other two." },
    #{ file: "ethics.json", section: "ethics", unit: "virtues", lesson: "the-seven", title: "Name the seven", objective: "Name the seven virtues in the unit’s order and keep them as one code." },
    #{ file: "ethics.json", section: "ethics", unit: "virtues", lesson: "rationality", title: "Rationality first", objective: "Treat rationality as the virtue of using reason to know the facts and to choose." },
    #{ file: "ethics.json", section: "ethics", unit: "virtues", lesson: "independence-integrity", title: "Independence and integrity", objective: "Separate thinking for yourself from acting on the judgment you have reached." },
    #{ file: "ethics.json", section: "ethics", unit: "virtues", lesson: "honesty-justice", title: "Honesty and justice", objective: "Contrast refusing to fake reality with judging people by the facts of what they do." },
    #{ file: "ethics.json", section: "ethics", unit: "virtues", lesson: "work-and-pride", title: "Productiveness and pride", objective: "Connect making values with the moral ambition to be worthy of your own life." },
    #{ file: "ethics.json", section: "ethics", unit: "happiness", lesson: "emotional-state", title: "An Emotional State", objective: "Identify happiness as an emotional state, not a possession, a rule, or a mood you invent." },
    #{ file: "ethics.json", section: "ethics", unit: "happiness", lesson: "follows-values", title: "What It Follows From", objective: "Connect the emotional state of happiness to values that have been achieved." },
    #{ file: "ethics.json", section: "ethics", unit: "happiness", lesson: "order-of-cause", title: "Achievement Comes First", objective: "Keep the order straight: the value is achieved, and the emotional state follows." },
    #{ file: "ethics.json", section: "ethics", unit: "happiness", lesson: "not-a-whim", title: "Not a Whim", objective: "Separate happiness from a whim, a feeling with no tie to achieved values." },
    #{ file: "ethics.json", section: "ethics", unit: "happiness", lesson: "whole-definition", title: "The Whole Definition", objective: "State the full idea in one piece: the emotional state that follows achieved values, and not a whim." },
    #{ file: "ethics.json", section: "ethics", unit: "egoism", lesson: "own-beneficiary", title: "Who the action is for", objective: "Name the individual himself as the proper beneficiary of his own action." },
    #{ file: "ethics.json", section: "ethics", unit: "egoism", lesson: "live-for-others", title: "The demand to live for others", objective: "Identify the moral demand this unit rejects: that a person live for others." },
    #{ file: "ethics.json", section: "ethics", unit: "egoism", lesson: "what-altruism-asks", title: "What altruism asks", objective: "Describe altruism, in this contrast, as the code that makes others the beneficiary of one’s action." },
    #{ file: "ethics.json", section: "ethics", unit: "egoism", lesson: "action-and-gain", title: "Action and its proper gain", objective: "Connect a concrete action to the person who properly gains from it, and reject handing that gain away as a duty." },
    #{ file: "ethics.json", section: "ethics", unit: "egoism", lesson: "hold-the-contrast", title: "Hold the contrast", objective: "Keep egoism and the rejected demand distinct when the wording changes." },
    #{ file: "politics.json", section: "politics", unit: "rights", lesson: "what-a-right-is", title: "What a right is", objective: "Identify a right as a principle that sanctions a person's freedom of action." },
    #{ file: "politics.json", section: "politics", unit: "rights", lesson: "social-context", title: "A social context", objective: "Place rights among people, not in a person's dealings with nature or with himself alone." },
    #{ file: "politics.json", section: "politics", unit: "rights", lesson: "freedom-of-action", title: "Freedom of action", objective: "Distinguish the freedom a right sanctions from a claim on other people's effort or goods." },
    #{ file: "politics.json", section: "politics", unit: "rights", lesson: "not-a-permission", title: "Not a permission", objective: "Contrast a right with a permission or privilege that others can grant or withdraw." },
    #{ file: "politics.json", section: "politics", unit: "rights", lesson: "rights-as-principles", title: "Rights as principles", objective: "Treat rights as moral principles that set a standard, not as wishes, customs, or majority votes." },
    #{ file: "politics.json", section: "politics", unit: "force", lesson: "what-counts", title: "What physical force is", objective: "Name physical force as compulsion against a person’s body or property, not as a strong opinion." },
    #{ file: "politics.json", section: "politics", unit: "force", lesson: "who-starts", title: "Who starts it", objective: "Separate the person who starts force from the person who uses force only to stop it." },
    #{ file: "politics.json", section: "politics", unit: "force", lesson: "why-basic", title: "Why it is basic", objective: "Explain why starting force is the basic political evil: it replaces the victim’s judgment with compulsion." },
    #{ file: "politics.json", section: "politics", unit: "force", lesson: "fraud-threats", title: "Fraud and threats", objective: "Treat fraud and a credible threat of force as ways of starting force, not as clever exceptions." },
    #{ file: "politics.json", section: "politics", unit: "force", lesson: "not-force", title: "What is not a start of force", objective: "Keep refusal, competition, error, and unwelcome speech outside the idea of starting force." },
    #{ file: "politics.json", section: "politics", unit: "government", lesson: "an-agent", title: "An agent, not a master", objective: "Identify government as an agent that acts for people, not as an owner of their lives." },
    #{ file: "politics.json", section: "politics", unit: "government", lesson: "protects-rights", title: "The job: protect rights", objective: "State the purpose of government as the protection of individual rights, and reject substitute purposes." },
    #{ file: "politics.json", section: "politics", unit: "government", lesson: "retaliatory-only", title: "Only retaliatory force", objective: "Limit the force government may use to retaliation against those who have started force." },
    #{ file: "politics.json", section: "politics", unit: "government", lesson: "three-functions", title: "Police, courts, defense", objective: "Place police, law courts, and armed defense inside the job of protecting rights by retaliatory force." },
    #{ file: "politics.json", section: "politics", unit: "government", lesson: "the-line", title: "Where the role stops", objective: "Apply the whole unit: an agent that protects rights and stops where retaliatory force stops." },
    #{ file: "politics.json", section: "politics", unit: "capitalism", lesson: "name-the-system", title: "Name the system", objective: "Identify laissez-faire capitalism as the political system this unit defends." },
    #{ file: "politics.json", section: "politics", unit: "capitalism", lesson: "follows-from-rights", title: "It follows from rights", objective: "Explain that the case for laissez-faire capitalism starts from individual rights." },
    #{ file: "politics.json", section: "politics", unit: "capitalism", lesson: "not-a-preference", title: "Not a brute preference", objective: "Reject the idea that capitalism is only a taste for markets or a growth trick." },
    #{ file: "politics.json", section: "politics", unit: "capitalism", lesson: "what-laissez-means", title: "What laissez-faire rules out", objective: "State what laissez-faire rules out: running the economy and handing out special favors." },
    #{ file: "politics.json", section: "politics", unit: "capitalism", lesson: "one-chain", title: "One chain", objective: "Hold one order: each person is an end, rights follow, and laissez-faire capitalism is the system that respects those rights." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "selective", lesson: "what-art-is", title: "What Art Is", objective: "State the definition of art as a selective re-creation of reality according to metaphysical value-judgments." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "selective", lesson: "what-selective-means", title: "What Selective Means", objective: "Explain that the artist includes, omits, and stresses aspects of reality rather than recording everything." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "selective", lesson: "recreation-not-copy", title: "Re-creation, Not a Dump or a Fantasy", objective: "Distinguish a re-creation of reality from an unselective record and from a presentation cut off from reality." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "selective", lesson: "metaphysical-judgments", title: "Metaphysical Value-Judgments", objective: "Identify metaphysical value-judgments as the artist’s fundamental appraisal of man and existence, and as the standard of selection." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "selective", lesson: "one-claim", title: "One Claim, Three Parts", objective: "Apply the full definition, keeping selection, re-creation of reality, and metaphysical value-judgments together." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "sense-of-life", lesson: "what-it-names", title: "What the phrase names", objective: "Name a sense of life as a pre-conceptual, emotional appraisal, and reject the usual substitutes." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "sense-of-life", lesson: "appraisal-of-man", title: "An appraisal of man", objective: "Identify man as one object of the appraisal: what kind of being one takes a human being to be." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "sense-of-life", lesson: "appraisal-of-existence", title: "An appraisal of existence", objective: "Identify existence as the other object: an emotional estimate of the world a human being faces." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "sense-of-life", lesson: "before-philosophy", title: "Before a stated philosophy", objective: "Hold that the appraisal is in place before it is translated into explicit ideas, without treating the feeling as a proof." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "sense-of-life", lesson: "emotional-whole", title: "The emotional whole", objective: "Assemble the full definition: an emotional appraisal that is pre-conceptual and aimed at both man and existence." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "romanticism", lesson: "where-schools-sit", title: "Where a school sits", objective: "Locate Romanticism as a school inside esthetics, named by its view of man, not by a feeling." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "romanticism", lesson: "volition-premise", title: "The premise of volition", objective: "State the premise that defines Romanticism: man can choose." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "romanticism", lesson: "against-denial", title: "Against the denial of choice", objective: "Tell Romanticism from the school that presents man as determined." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "romanticism", lesson: "not-a-mood", title: "Not a mood", objective: "Separate Romanticism from the popular mix-up with emotion, mysticism, or escape from facts." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "romanticism", lesson: "place-in-esthetics", title: "What the premise makes visible", objective: "Connect the volitional premise to purposeful action in art, and to why the school belongs in her esthetics." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "judgment", lesson: "two-questions", title: "Two different questions", objective: "Separate an esthetic judgment of a work from a philosophical agreement with its ideas." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "judgment", lesson: "what-it-does", title: "What the work does as art", objective: "Judge by the selective re-creation the work actually presents, not by a slogan placed beside it." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "judgment", lesson: "skill-and-view", title: "Skill is not a vote", objective: "See that artistic skill and agreement with a philosophy can come apart in either direction." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "judgment", lesson: "theme-and-means", title: "Theme through the means", objective: "Ask whether the theme is carried by the work’s own means, rather than by a lecture standing in for the art." },
    #{ file: "aesthetics.json", section: "aesthetics", unit: "judgment", lesson: "one-standard", title: "One standard, applied", objective: "Apply the same esthetic standard to works you welcome and works you oppose." },
    #{ file: "integration.json", section: "integration", unit: "whole", lesson: "one-system", title: "One view, not a pile", objective: "Tell an integrated philosophy from a pile of separate claims." },
    #{ file: "integration.json", section: "integration", unit: "whole", lesson: "chain-order", title: "The chain has an order", objective: "See that later ideas rest on earlier ones, so the order is part of the philosophy." },
    #{ file: "integration.json", section: "integration", unit: "whole", lesson: "pulled-middle", title: "Pulled out of the middle", objective: "Spot an idea that has been cut away from the premises that support it." },
    #{ file: "integration.json", section: "integration", unit: "whole", lesson: "cannot-validate", title: "Nothing left to check", objective: "Explain why a middle idea, taken alone, cannot be validated." },
    #{ file: "integration.json", section: "integration", unit: "whole", lesson: "cannot-use", title: "Nothing left to apply", objective: "Explain why that same detached idea cannot guide a concrete choice." },
    #{ file: "integration.json", section: "integration", unit: "applying", lesson: "not-a-script", title: "Not a script", objective: "Tell a principle from a script: a principle names the kind of choice that is right, and a script pretends the moves are already listed." },
    #{ file: "integration.json", section: "integration", unit: "applying", lesson: "this-choice", title: "This choice", objective: "Apply a principle to the facts of this situation instead of letting a slogan stand in for those facts." },
    #{ file: "integration.json", section: "integration", unit: "applying", lesson: "facts-change", title: "When the facts change", objective: "See that one principle can call for different concrete actions when the facts of the case change." },
    #{ file: "integration.json", section: "integration", unit: "applying", lesson: "you-judge", title: "You still judge", objective: "Use the philosophy as a standard for your thinking, not as a substitute that decides the case in your place." },
    #{ file: "integration.json", section: "integration", unit: "applying", lesson: "life-not-ritual", title: "A life, not a ritual", objective: "Hold the principles across ordinary choices without turning practice into ceremony, costume, or a checklist of gestures." },
];

phase("Review");
let jobs = [];
for item in lessons {
    let key = item.unit + "/" + item.lesson;
    let sidecar = "/home/wizard/repos/objectivist-duolingo/content/philosophy-pass/" + item.section + "--" + item.unit + "--" + item.lesson + ".json";
    let prompt = "You edit one Atlas Ladder lesson in /home/wizard/repos/objectivist-duolingo. ";
    prompt += "Use read_file on content/" + item.file + " and on scripts/validate-content.mjs and on SOURCES.md. ";
    prompt += "Lesson key inside that JSON is \"" + key + "\". ";
    prompt += "Catalog title: " + item.title + ". Objective: " + item.objective + ". ";
    prompt += "Judge every exercise by whether a student who answers it has learned the philosophy. ";
    prompt += "Replace an exercise when the thing being tested is trivia: a date, a page, an edition, a preface numeral, which printing said a sentence, a biographical fact, or the bare name of a book or essay when the idea is not what is practiced. ";
    prompt += "Keep an exercise when it trains a distinction, a principle, a definition, or an application, even if the feedback cites a book. ";
    prompt += "A citation may stay. The prompt itself has to teach the idea. ";
    prompt += "Rewrite only the trivia items. Leave every other exercise unchanged, including its id. ";
    prompt += "Stay inside this lesson objective. Do not import a different branch of the philosophy. ";
    prompt += "Keep the same exercise count, between 8 and 12, and the same ids. Types must stay choice, match, fill, or quote. ";
    prompt += "Feedback still needs kind and note. If kind is quote, quote and citation must be exact substrings of SOURCES.md. Do not invent quotations. ";
    prompt += "Prefer a choice, match, or fill that states the idea in the student's own recognition, reusing a quote from this lesson when you need quote feedback. ";
    prompt += "If nothing is trivia, do not write a file. Return changed false, path empty, replaced 0, and a one-line notes. ";
    prompt += "If you replace any, write " + sidecar + " as JSON with sectionFile, key, and exercises (the full array). ";
    prompt += "sectionFile is " + item.file + " and key is " + key + ". ";
    prompt += "Return changed true, that path, replaced as the count you rewrote, and notes naming which ids changed and why in one sentence.";
    jobs.push(#{
        prompt: prompt,
        label: "lesson:" + item.section + "/" + key,
        capability_mode: "read-write",
        output_schema: report_schema,
    });
}
let results = parallel(jobs);

let paths = [];
let replaced = 0;
let seen = 0;
for r in results {
    seen += 1;
    if r != () && r.success && r.output != () && r.output.changed == true {
        if type_of(r.output.path) == "string" && r.output.path != "" {
            paths.push(r.output.path);
        }
        if type_of(r.output.replaced) == "integer" {
            replaced += r.output.replaced;
        }
    }
}
log(paths.len().to_string() + " lessons flagged, " + replaced.to_string() + " exercises marked, of " + seen.to_string());

if paths.len() == 0 {
    complete(#{ summary: "No trivia rewrites.", lessons: seen, files: 0, replaced: 0 });
}

phase("Merge");
let merge_prompt = "Merge philosophy-pass sidecars into Atlas Ladder content at /home/wizard/repos/objectivist-duolingo. ";
merge_prompt += "Read each JSON file in this list and, for that sectionFile, replace lessons[key].exercises with the sidecar exercises array. Do not touch other lessons. ";
merge_prompt += "Files: ";
for p in paths {
    merge_prompt += p;
    merge_prompt += " ";
}
merge_prompt += "Then run: node scripts/validate-content.mjs from that repo. ";
merge_prompt += "If validation fails, restore the failing exercise from the original content file using git show HEAD:content/<file> for that lesson key only, and validate again until it passes. ";
merge_prompt += "Leave the sidecar files in place. Return how many lesson keys you updated.";
let merged = agent(merge_prompt, #{ label: "merge", capability_mode: "execute" });
let note = "merge failed";
if merged != () && merged.success {
    note = "merged";
}
complete(#{
    summary: paths.len().to_string() + " lessons rewritten, " + replaced.to_string() + " exercises, " + note,
    lessons: seen,
    files: paths.len(),
    replaced: replaced,
});
