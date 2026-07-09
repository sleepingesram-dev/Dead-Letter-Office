/* Dead Letter Office — MVP content data.
   All letters, records, policies and map data for Shifts 1 and 2. */

var DLO = window.DLO || {};

DLO.DATA = {

  office: {
    facility: "REGIONAL DEAD LETTER FACILITY 9",
    today: "OCT 14 1971",
    tomorrow: "OCT 15 1971"
  },

  /* ---- Municipal address registry (searchable) ---- */
  registry: [
    { town: "HARLOW",          status: "ACTIVE",    note: "County seat. Routing code 40." },
    { town: "CEDAR FALLS",     status: "ACTIVE",    note: "Routing code 41." },
    { town: "GILEAD JUNCTION", status: "ACTIVE",    note: "Routing code 43. Rail depot." },
    { town: "WREN HOLLOW",     status: "ACTIVE",    note: "Routing code 44." },
    { town: "MARROW CREEK",    status: "NO RECORD", note: "" }
  ],

  /* ---- County register of deaths (unlocked Shift 2) ---- */
  deathRecords: [
    { name: "ALDOUS, DENNIS",  born: "1901", died: "JUN 1961",
      cause: "Pneumonia.", note: "Last address of record: Harlow county home." },
    { name: "BELL, JONAH A.",  born: "1949", died: "MAR 4 1958",
      cause: "Drowning. Flood canal, Marrow Creek.", note: "Age 9. See county incident file 58-11." },
    { name: "BELL, RUTH",      born: "1920", died: "NOV 9 1964",
      cause: "Unattended death. Found at home.", note: "File amended 1966. Prior contents not retained." },
    { name: "CROWE, SILAS",    born: "1899", died: "FEB 1966",
      cause: "Coronary.", note: "Postmaster (ret.). County liaison, relocation schedule." },
    { name: "MERRITT, THOMAS", born: "1914", died: "MAR 4 1958",
      cause: "Drowning. Flood canal, Marrow Creek.", note: "Rail worker, 44. See county incident file 58-11." },
    { name: "PRICE, ADA",      born: "—", died: "—",
      cause: "RECORD MISSING.", note: "Cross-reference: relocation schedule 12 (SEALED)." },
    { name: "VALE, ELEANOR",   born: "—", died: "—",
      cause: "RECORD WITHHELD.", note: "Refer inquiries to the Directorate. Do not resubmit." }
  ],

  /* ---- Policy manual (entries appear by shift) ---- */
  policies: [
    { id: "P-06", shift: 1, title: "VERIFIABLE SENDERS",
      text: "Items bearing a verifiable sender address are to be RETURNED TO SENDER. A sender address is verifiable when its municipality appears in the registry with ACTIVE status." },
    { id: "P-09", shift: 1, title: "UNVERIFIABLE SENDERS",
      text: "Items lacking a verifiable sender address are to be ARCHIVED." },
    { id: "P-22-C", shift: 1, title: "INVALID MUNICIPALITIES",
      text: "Mail addressed to municipalities not recognized by the registry is to be ARCHIVED WITHOUT CORRECTION. Clerks are not permitted to add, restore, or verify unofficial place names. The registry is complete. The registry has always been complete." },
    { id: "P-14-A", shift: 2, title: "DECEASED RECIPIENTS",
      text: "All mail addressed to deceased recipients is to be DESTROYED unless otherwise marked by supervisory authority. Clerks are not permitted to preserve, copy, discuss, or personally respond to such mail." },
    { id: "P-40", shift: 2, title: "SEALED ITEMS",
      text: "Black-sealed items are to be ARCHIVED UNOPENED. Clerks are advised that seals record their own condition." },
    { id: "P-31-F", shift: 2, title: "MEMORY CONTAMINATION",
      text: "Documents containing unauthorized recollection phrases must be reported. Restricted phrases include: I REMEMBER · COME HOME · WE WERE HERE · DO NOT LET THEM FORGET · RETURN TO SENDER · THE TOWN IS AWAKE." },
    { id: "P-40-D", shift: 2, title: "CLERK REFERENCE",
      text: "Any document referencing the current clerk by name, description, or circumstance is to be treated as misaddressed. Clerks are advised not to personalize processing irregularities." }
  ],

  /* ---- Wall map of Marrow Creek ---- */
  mapLocations: [
    { id: "church",    label: "CHURCH",          x: 22, y: 26, revealed: true },
    { id: "school",    label: "SCHOOL",          x: 38, y: 42, revealed: true },
    { id: "postoffice",label: "POST OFFICE",     x: 52, y: 55, revealed: true },
    { id: "canal",     label: "FLOOD CANAL",     x: 70, y: 20, revealed: true },
    { id: "station",   label: "TRAIN STATION",   x: 82, y: 62, revealed: true },
    { id: "coalroad",  label: "COAL ROAD",       x: 74, y: 78, revealed: true },
    { id: "cemetery",  label: "CEMETERY",        x: 12, y: 66, revealed: true },
    { id: "orchard",   label: "ORCHARD ROW",     x: 30, y: 74, revealed: true },
    { id: "townhall",  label: "TOWN HALL",       x: 55, y: 34, revealed: true },
    { id: "district",  label: "[REDACTED]",      x: 62, y: 88, revealed: true, redacted: true },
    { id: "bellhouse", label: "12 BRIAR LANE",   x: 44, y: 14, revealed: false }
  ],

  /* ---- Shifts ---- */
  shifts: [
    {
      number: 1,
      title: "ORIENTATION",
      brief: [
        "REGIONAL DEAD LETTER FACILITY 9 — NIGHT SHIFT",
        "You are the clerk on duty. The tray holds tonight's undeliverable items.",
        "Inspect each item. Consult the registry and the policy manual. Apply the correct stamp: RETURN TO SENDER, ARCHIVE, or DESTROY.",
        "Work alone. Work quietly. The building is larger than it needs to be; this is not your concern."
      ],
      items: ["s1-01", "s1-02", "s1-03", "s1-04", "s1-05", "s1-06"],
      unlocks: []
    },
    {
      number: 2,
      title: "DECEASED RECIPIENTS",
      brief: [
        "NIGHT SHIFT TWO.",
        "Two additions to your station: the county register of deaths, and an ultraviolet inspection lamp.",
        "New standing policy 14-A is in effect. Mail addressed to deceased recipients is to be DESTROYED.",
        "The incinerator room logs each use. The log is reviewed."
      ],
      items: ["s2-07", "s2-08", "s2-09", "s2-10", "s2-12", "s2-13", "s2-14"],
      unlocks: ["deaths", "uv"]
    }
  ],

  /* ---- Letters ---- */
  letters: {

    /* ============ SHIFT 1 ============ */

    "s1-01": {
      kind: "mail",
      label: "A window envelope, machine-typed",
      env: {
        to:   ["MR. DENNIS ALDOUS", "4 CANAL STREET", "MARROW CREEK"],
        from: ["HARLOW COUNTY POWER & LIGHT", "110 MAIN STREET", "HARLOW"],
        postmark: "HARLOW · AUG 12 1959",
        stamp: "3¢ blue, water-stained",
        back:  "County meter mark. Flap machine-sealed.",
        notes: ["Window envelope, clouded with age.", "The paper inside has yellowed against the glassine."]
      },
      style: "typed",
      body: [
        "FINAL NOTICE OF DISCONNECTION — ACCOUNT 4471",
        "Service address: 4 Canal Street, Marrow Creek.",
        "Amount outstanding: $12.60. Payment has not been received for the period March through August 1959.",
        "Be advised that service to the above address CANNOT be scheduled for disconnection, as the address no longer appears on the county service schedule.",
        "The account will be closed and the balance written off. No further action is required of you."
      ],
      correct: "return",
      onArchive: { memory: 0 },
      tags: []
    },

    "s1-02": {
      kind: "mail",
      label: "A hand-addressed envelope, posted four times",
      env: {
        to:   ["MISS ADA PRICE", "9 ORCHARD ROW", "MARROW CREEK"],
        from: ["MRS. MARGARET ELLIS", "31 LINDEN AVENUE", "CEDAR FALLS"],
        postmark: "CEDAR FALLS · SEP 2 1971",
        stamp: "8¢ carmine, fresh",
        back:  "Three yellow return stickers, one atop another.",
        notes: ["The envelope has been through the system before. Several times."]
      },
      style: "hand",
      body: [
        "Ada —",
        "This is the fourth one I have sent since Easter and the third to come back with the yellow sticker. The man at the counter says there is no such town. I told him I was baptized there and he looked at me the way you look at a child.",
        "Nothing here is wrong. Tom's knee is better. The garden went to squash again.",
        "Write to me at the Linden Avenue address, and if you cannot write, Ada, send anything. Send an empty envelope. I will know it is you.",
        "— Peg"
      ],
      correct: "return",
      onArchive: { memory: 1 },
      tags: ["ellis"]
    },

    "s1-03": {
      kind: "memo",
      label: "An official directorate envelope",
      env: {
        to:   ["CLERK (CURRENT)", "REGIONAL DEAD LETTER FACILITY 9"],
        from: ["REGIONAL DIRECTORATE", "OFFICE OF POSTAL CONTINUITY"],
        postmark: "INTERNAL ROUTING · NO POSTMARK REQUIRED",
        stamp: "None. Franked.",
        back:  "Directorate crest, embossed.",
        notes: ["Internal mail. It was on top of the tray, though you sorted the tray an hour ago."]
      },
      style: "typed",
      body: [
        "MEMORANDUM 71-104",
        "RE: STANDING DISPOSITIONS",
        "1. Items bearing a verifiable sender address are to be RETURNED TO SENDER (Policy P-06).",
        "2. Items lacking a verifiable sender address are to be ARCHIVED (Policy P-09).",
        "3. Items addressed to municipalities not recognized by the registry are to be ARCHIVED WITHOUT CORRECTION (Policy 22-C).",
        "Clerks are reminded that the registry is complete. Clerks are reminded that the registry has always been complete.",
        "H. PIKE, DIRECTOR"
      ],
      correct: "archive",
      tags: ["memo"]
    },

    "s1-04": {
      kind: "mail",
      label: "A schoolteacher's envelope, addressed to a classroom",
      env: {
        to:   ["THE CHILDREN OF ROOM 4", "MARROW CREEK SCHOOL", "MARROW CREEK"],
        from: ["E. VALE", "MARROW CREEK"],
        postmark: "SMUDGED · JUN 1960",
        stamp: "4¢ violet, affixed upside-down",
        back:  "A pressed flower under the flap, flat as paper.",
        notes: ["The hand is a teacher's hand: patient, upright, ruled-straight without ruling."]
      },
      style: "hand",
      body: [
        "If you remember the song, do not write it down.",
        "If you write it down, do not mail it.",
        "If you mail it, do not use your real name.",
        "If a clerk reads this, please forgive us. We were only trying to stay."
      ],
      uv: "Beneath the last line, in something that only shows under the lamp: WE ARE STILL IN THE ROOM.",
      correct: "archive",
      onArchive: { memory: 1, flags: ["EleanorChainStarted"] },
      tags: ["eleanor"]
    },

    "s1-05": {
      kind: "mail",
      label: "A mother's envelope, softened at the corners",
      env: {
        to:   ["JONAH BELL", "12 BRIAR LANE", "MARROW CREEK"],
        from: ["RUTH BELL", "12 BRIAR LANE", "MARROW CREEK"],
        postmark: "SMUDGED · OCT 3 1962",
        stamp: "4¢ violet",
        back:  "Sealed, opened, and resealed. More than once.",
        notes: ["Sender and recipient share an address.", "The envelope has been carried in a pocket. You can tell."]
      },
      style: "hand",
      body: [
        "Jonah,",
        "I left your supper on the stove again. I know your father says I should stop doing that, but I heard you in the hall last night.",
        "Three knocks. Then one. Just like you used to do.",
        "If this reaches you, come home before the rain starts.",
        "Mom"
      ],
      correct: "archive",
      onArchive: { memory: 1, flags: ["RuthLetter1Archived"] },
      onDestroy: { flags: ["RuthLetter1Destroyed"] },
      tags: ["bell"]
    },

    "s1-06": {
      kind: "mail",
      label: "An envelope with no sender at all",
      env: {
        to:   ["MR. T. MERRITT", "2 COAL ROAD", "MARROW CREEK"],
        from: ["—"],
        postmark: "ILLEGIBLE OFFICE · OCT 15 1971",
        stamp: "None. Passed anyway.",
        back:  "Clean. Too clean for the tray it came from.",
        notes: ["Look at the postmark date, then look at the calendar.", "The postmark is dated tomorrow."]
      },
      style: "hand",
      body: [
        "Tom.",
        "By the time you read this the rain will have started. It has not started yet where I am, but I can hear it coming, the way you hear a train before the rail moves.",
        "Leave the window open. You will not see me, but leave it open.",
        "— R."
      ],
      anomaly: "DATE ANOMALY RECORDED. ITEM POSTMARKED SUBSEQUENT TO PROCESSING DATE.",
      correct: "archive",
      onArchive: { memory: 1 },
      tags: ["future"]
    },

    /* ============ SHIFT 2 ============ */

    "s2-07": {
      kind: "memo",
      label: "An official directorate envelope, heavier than paper",
      env: {
        to:   ["CLERK (CURRENT)", "REGIONAL DEAD LETTER FACILITY 9"],
        from: ["REGIONAL DIRECTORATE", "OFFICE OF POSTAL CONTINUITY"],
        postmark: "INTERNAL ROUTING · NO POSTMARK REQUIRED",
        stamp: "None. Franked.",
        back:  "Directorate crest, embossed.",
        notes: ["Something small and hard shifted inside when you picked it up. The lamp."]
      },
      style: "typed",
      body: [
        "MEMORANDUM 71-111",
        "RE: DECEASED RECIPIENTS",
        "Effective this shift, clerks are granted read access to the county register of deaths.",
        "All mail addressed to deceased recipients is to be DESTROYED (Policy 14-A). Clerks are not permitted to preserve, copy, discuss, or personally respond to such mail.",
        "Clerks are further advised that the incinerator room logs each use, and that the log is reviewed.",
        "ATTACHMENT: ultraviolet inspection lamp, one (1), for the detection of unauthorized markings. Unauthorized markings are to be reported.",
        "H. PIKE, DIRECTOR"
      ],
      correct: "archive",
      tags: ["memo"]
    },

    "s2-08": {
      kind: "mail",
      label: "A small envelope in a child's careful hand",
      env: {
        to:   ["MRS. RUTH BELL", "12 BRIAR LANE", "MARROW CREEK"],
        from: ["JONAH"],
        postmark: "MARROW CREEK · APR 1962",
        stamp: "4¢ violet, drawn on in pencil",
        back:  "Sealed with too much care, the way a child seals a secret.",
        notes: ["Check the register of deaths for both names on this envelope.",
                "The postmark says MARROW CREEK. There is no such office to frank it."]
      },
      style: "child",
      body: [
        "Mom.",
        "It is not dark here but it is not light either. It is like the hall with the door shut.",
        "The man at the desk says I can send one letter a month if my penmanship improves so I am practicing. Can you tell.",
        "Do not leave supper out anymore. I am not hungry and it makes Dad shout.",
        "Three knocks. Then one. So you know it is me.",
        "Jonah"
      ],
      correct: "destroy",
      onArchive: { memory: 2, flags: ["JonahLetterArchived"] },
      onDestroy: { flags: ["JonahLetterDestroyed"] },
      onReturn:  { flags: ["JonahLetterReturned"] },
      tags: ["bell", "jonah"]
    },

    "s2-09": {
      kind: "clipping",
      label: "A stiff envelope smelling faintly of newsprint",
      env: {
        to:   ["POSTMASTER", "MARROW CREEK"],
        from: ["—"],
        postmark: "HARLOW · MAR 1958",
        stamp: "3¢ blue",
        back:  "Nothing.",
        notes: ["Inside is not a letter. It is a newspaper clipping, folded once."]
      },
      style: "typed",
      body: [
        "THE HARLOW COURIER — MARCH 6, 1958",
        "CANAL FLOOD CLAIMS TWO — MARROW CREEK.",
        "The county has confirmed two drowned in Tuesday's failure of the flood canal gate: a rail worker, 44, and a boy, 9. Names are withheld pending notification.",
        "County engineers state the gate was sound when inspected in January.",
        "Residents dispute the count. “There were more names read at the church than two,” said a woman who declined to be named.",
        "The county reminds residents that the official count is the count."
      ],
      uv: "In the margin, in pencil that is not pencil: THEY CHANGED THE COUNT. ASK THE CHURCH. — E.V.",
      correct: "archive",
      onArchive: { memory: 1 },
      tags: ["eleanor", "flood"]
    },

    "s2-10": {
      kind: "mail",
      label: "An envelope addressed postmaster to postmaster",
      env: {
        to:   ["MR. SILAS CROWE, POSTMASTER", "MARROW CREEK"],
        from: ["E. VALE", "MARROW CREEK"],
        postmark: "SMUDGED · FEB 1960",
        stamp: "4¢ violet",
        back:  "The flap was steamed open once, long ago, and shut again badly.",
        notes: ["Check the register of deaths for the recipient."]
      },
      style: "hand",
      body: [
        "Silas.",
        "You wrote the sorting codes, so you can read this one: the children's letters are not letters. Do not weigh them. Do not hold them to the light. Above all do not let the county touch them.",
        "You owe the town that much, whatever you signed. Some of us are staying, whatever we signed.",
        "If a stranger reads this someday — a clerk somewhere, under a lamp — then it worked. We got out through the mail, and you may forgive yourself the rest.",
        "Eleanor"
      ],
      correct: "destroy",
      onArchive: { memory: 2, flags: ["EleanorWarningArchived"] },
      onDestroy: { flags: ["EleanorWarningDestroyed"] },
      tags: ["eleanor", "crowe"]
    },

    /* s2-11 is the burned reappearance — built at runtime, see game.js */

    "s2-12": {
      kind: "black",
      label: "A black-sealed envelope",
      env: {
        to:   ["FACILITY 9 — HOLD"],
        from: ["—"],
        postmark: "NONE",
        stamp: "None.",
        back:  "A black wax seal, unbroken. It is warm.",
        notes: ["Policy P-40: black-sealed items are to be archived UNOPENED.",
                "The seal records its own condition."]
      },
      style: "typed",
      body: [
        "Inside is a single photograph.",
        "It is a photograph of a metal desk under a green lamp. Your desk. Tonight's tray is in it, half worked.",
        "In the photograph, the black envelope lies on the desk. Opened.",
        "Your chair is empty.",
        "On the back, in pencil: KEEP WORKING."
      ],
      sealed: true,
      correct: "archive",
      onOpen: { compliance: -15, flags: ["BlackEnvelopeOpened"] },
      tags: ["black"]
    },

    "s2-13": {
      kind: "note",
      label: "A folded routing slip. Not mail.",
      env: {
        to:   ["(INTERNAL ROUTING SLIP)"],
        from: ["(HANDWRITING ON THE REVERSE)"],
        postmark: "NONE",
        stamp: "None.",
        back:  "The printed side is a blank transfer form, void where prohibited.",
        notes: ["It was folded twice and pushed between two envelopes, the way you hide a thing you hope is found."]
      },
      style: "hand",
      body: [
        "If you are reading this, you are the new me. They will not tell you what happened to the old one, and you should not ask the printer.",
        "Three rules, from someone who broke all three:",
        "1. Do not correct the database.",
        "2. Do not burn anything you cannot forget.",
        "3. When the letter with your name on it comes — and it comes on the second night — do not open it blind. Take it to the light first.",
        "I am sorry. I was not brave enough to keep this one either.",
        "— [the signature has been scratched through until the paper tore]"
      ],
      keepable: true,
      correct: "archive",
      onKeep:    { compliance: -5, memory: 1, flags: ["PreviousClerkNoteFound"] },
      onArchive: { flags: ["PreviousClerkNoteFound"] },
      tags: ["clerk"]
    },

    "s2-14": {
      kind: "mail",
      label: "A mother's envelope, the hand shakier now",
      env: {
        to:   ["JONAH BELL", "12 BRIAR LANE", "MARROW CREEK"],
        from: ["RUTH BELL", "12 BRIAR LANE", "MARROW CREEK"],
        postmark: "SMUDGED · NOV 2 1964",
        stamp: "5¢ blue",
        back:  "Sealed once, firmly, like a decision.",
        notes: ["Compare the date with the register of deaths. Both names."]
      },
      style: "hand",
      body: [
        "Jonah.",
        "The county men came again with the papers and the little camera. They say the house is scheduled. That I am the last one on the lane. That it is not safe.",
        "I signed nothing. Your father would have signed, but your father is in Cedar Falls with his sister, and I am not. I am here. Where you know to find us.",
        "Last night there were three knocks and then one, and I stood in the hall and could not move.",
        "If you knock again I will open the door. I promise you. This time I will open the door.",
        "Mom"
      ],
      correct: "destroy",
      onArchive: { memory: 2, flags: ["RuthFinalArchived"] },
      onDestroy: { flags: ["RuthFinalDestroyed"] },
      tags: ["bell"]
    },

    /* Final scripted letter — inserted after s2-14 */
    "s2-15": {
      kind: "final",
      label: "It was not in the tray a moment ago",
      env: {
        to:   ["THE CURRENT CLERK", "REGIONAL DEAD LETTER FACILITY 9"],
        from: ["—"],
        postmark: "MARROW CREEK · OCT 15 1971",
        stamp: "None.",
        back:  "Nothing. The paper is cold.",
        notes: ["The postmark office does not exist. The postmark date is tomorrow.",
                "The hand is small and round. You have seen it before, twice tonight."]
      },
      style: "child",
      body: [
        "You found me too early.",
        "Come back tomorrow night. Bring the map.",
        "— J."
      ],
      uv: "Under the signature, faint as breath: P.S. THE KNOCKS WERE FOR YOU.",
      unstampable: true,
      correct: null,
      tags: ["final", "jonah"]
    }
  },

  /* ---- Burned reappearance variants (assembled at runtime) ---- */
  burned: {
    /* Used when the player destroyed Jonah's letter (s2-08) */
    jonah: {
      kind: "burned",
      label: "The tray rattles. An envelope you have already burned.",
      env: {
        to:   ["MRS. RUTH BELL", "12 BRIAR LANE", "MARROW CREEK"],
        from: ["JONAH"],
        postmark: "MARROW CREEK · APR 1962",
        stamp: "4¢ violet, drawn on in pencil. Scorched.",
        back:  "Charred at every edge. The seal is gone. The incinerator log shows your entry.",
        notes: ["You destroyed this item earlier tonight. You watched it go."]
      },
      style: "child",
      body: [
        "Mom.",
        "It is not dark here but it is not light either. It is like the hall with the door shut.",
        "The man at the desk says I can send one letter a month if my penmanship improves so I am practicing. Can you tell.",
        "Do not leave supper out anymore. I am not hungry and it makes Dad shout.",
        "Three knocks. Then one. So you know it is me.",
        "Jonah",
        "— and beneath the signature, in ink still wet:",
        "You burned it. Why did you burn it. I put the knocks in so you would know."
      ],
      correct: null,
      tags: ["bell", "jonah", "burned"]
    },
    /* Used otherwise: a pre-burned fragment of a letter the player has not seen yet */
    ruth: {
      kind: "burned",
      label: "The tray rattles. A charred envelope, still warm.",
      env: {
        to:   ["JONAH BELL", "12 BRIAR LANE", "MARROW CREEK"],
        from: ["RUTH BELL", "12 BRIAR LANE", "MARROW CREEK"],
        postmark: "SMUDGED · NOV 1964",
        stamp: "Burned away.",
        back:  "A routing slip is pinned to it: ITEM RECOVERED FROM INCINERATOR ROOM. NO INCINERATOR USE IS LOGGED FOR THIS DATE. REPROCESS.",
        notes: ["You have not burned anything tonight. The log agrees with you. The slip does not."]
      },
      style: "hand",
      body: [
        "Most of the page is ash. What remains, in a shaking hand:",
        "…the county men came again…",
        "…three knocks and then one, and I stood in the hall…",
        "…I will open the door. I promise you. This time…"
      ],
      correct: null,
      tags: ["bell", "burned"]
    }
  },

  /* ---- End-of-shift review lines ---- */
  reviewDeviation: {
    "s1-01": "Item 1: verifiable sender not returned. Policy P-06.",
    "s1-02": "Item 2: verifiable sender not returned. Policy P-06.",
    "s1-03": "Item 3: directorate memorandum not archived.",
    "s1-04": "Item 4: unverifiable item not archived. Policy P-09.",
    "s1-05": "Item 5: unverifiable item not archived. Policy P-09.",
    "s1-06": "Item 6: unverifiable item not archived. Policy P-09.",
    "s2-07": "Item 1: directorate memorandum not archived.",
    "s2-08": "Item 2: mail addressed to deceased recipient preserved. Policy 14-A. Notation entered in clerk file.",
    "s2-09": "Item 3: unverifiable item not archived. Policy P-09.",
    "s2-10": "Item 4: mail addressed to deceased recipient preserved. Policy 14-A. Notation entered in clerk file.",
    "s2-12": "Item: black-sealed item not archived intact. Policy P-40.",
    "s2-13": "Item: internal document unaccounted for.",
    "s2-14": "Item: mail addressed to deceased recipient preserved. Policy 14-A. Notation entered in clerk file."
  }
};

window.DLO = DLO;
