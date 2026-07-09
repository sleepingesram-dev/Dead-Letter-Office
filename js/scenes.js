/* Dead Letter Office — point-and-click rooms.
   Each room is one painted scene (assets/scenes/<id>.png). Hotspot positions
   are percentages of the frame, matching the concept screenshots. If a scene
   image is missing, a plain painted-dark fallback is shown instead. */

var DLO = window.DLO || {};

DLO.ROOMS = {

  office: {
    name: "MAIN OFFICE",
    hotspots: [
      { id: "filecab",      x: 23.5, y: 44.8, label: "Filing cabinet",      act: "goto:filing" },
      { id: "wallmap",      x: 57.2, y: 44.9, label: "Wall map",            act: "panel:map" },
      { id: "recdrawer",    x: 71.7, y: 59.6, label: "Records drawer",      act: "panel:registry" },
      { id: "desk",         x: 47.0, y: 65.0, label: "Sorting desk",        act: "work" },
      { id: "newspaper",    x: 46.0, y: 79.0, label: "Newspaper",           act: "panel:news" },
      { id: "rulesposter",  x: 30.5, y: 25.8, label: "Office rules",        act: "panel:policy" },
      { id: "clock",        x: 71.8, y: 16.8, label: "Wall clock",          act: "flavor:clock" },
      { id: "fan",          x: 72.5, y: 37.5, label: "Desk fan",            act: "flavor:fan" },
      { id: "dispatch",     x: 64.5, y: 32.0, label: "Dispatch note",       act: "flavor:dispatch" },
      { id: "basementdoor", x: 85.0, y: 29.0, label: "Basement door",       act: "basementdoor" },
      { id: "mapnote",      x: 53.0, y: 18.8, label: "A pin on the map",    act: "flavor:mapnote" },
      { id: "outbox",       x: 90.5, y: 76.6, label: "Outbox",              act: "flavor:outbox" }
    ]
  },

  filing: {
    name: "FILING ROOM",
    hotspots: [
      { id: "codenote",     x: 11.6, y: 46.3, label: "Pinned note",         act: "codenote" },
      { id: "folderdrawer", x: 16.3, y: 69.5, label: "Open drawer",         act: "panel:deaths" },
      { id: "shelfbox",     x: 55.8, y: 51.6, label: "Archive boxes",       act: "flavor:filingboxes" },
      { id: "keys",         x: 82.3, y: 39.9, label: "Keys on a hook",      act: "keys" },
      { id: "bellbox",      x: 68.9, y: 66.9, label: "Bell family box",     act: "bellbox" },
      { id: "deskbook",     x: 84.4, y: 85.4, label: "Duty ledger",         act: "flavor:deskbook" }
    ]
  },

  archive: {
    name: "ARCHIVE ROOM",
    hotspots: [
      { id: "box1944",      x: 14.7, y: 53.0, label: "Marrow Creek, 1944",  act: "flavor:archiveboxes" },
      { id: "topbox",       x: 66.5, y: 43.4, label: "Marrow Creek, 1937–1945", act: "flavor:archivetop" },
      { id: "photo",        x: 77.2, y: 39.7, label: "Pinned photograph",   act: "photo" },
      { id: "mapsdrawer",   x: 60.3, y: 61.7, label: "Maps A–F",            act: "panel:map" },
      { id: "matchledger",  x: 75.1, y: 79.3, label: "Match ledger",        act: "panel:archive" },
      { id: "rightshelf",   x: 91.2, y: 52.5, label: "Letter bundles",      act: "flavor:bundles" }
    ]
  },

  incinerator: {
    name: "INCINERATOR ROOM",
    hotspots: [
      { id: "warnposter",   x: 26.9, y: 42.7, label: "Warning poster",      act: "flavor:warnposter" },
      { id: "evidence",     x: 7.6,  y: 37.8, label: "Evidence boxes",      act: "flavor:evidence" },
      { id: "furnace",      x: 41.6, y: 46.9, label: "Furnace door",        act: "burn" },
      { id: "lever",        x: 64.0, y: 55.3, label: "Feed lever",          act: "burn" },
      { id: "ashbin",       x: 36.2, y: 68.8, label: "Ash bin",             act: "flavor:ashbin" },
      { id: "tableletters", x: 74.0, y: 61.5, label: "Letter on the table", act: "takeback" },
      { id: "blackenv",     x: 80.0, y: 69.2, label: "Black envelope",      act: "flavor:blackenv" }
    ]
  },

  breakroom: {
    name: "BREAK ROOM",
    hotspots: [
      { id: "board",        x: 56.9, y: 28.7, label: "Notice board",        act: "panel:policy" },
      { id: "locker",       x: 27.5, y: 37.1, label: "Lockers",             act: "flavor:locker" },
      { id: "radio",        x: 59.8, y: 45.9, label: "Radio",               act: "radio" },
      { id: "vending",      x: 9.3,  y: 61.2, label: "Vending machine",     act: "flavor:vending" },
      { id: "tablepaper",   x: 43.0, y: 66.0, label: "Newspaper",           act: "panel:news" },
      { id: "mug",          x: 52.3, y: 63.4, label: "Coffee mug",          act: "flavor:mug" },
      { id: "reminder",     x: 80.4, y: 40.7, label: "Reminder",            act: "flavor:reminder" },
      { id: "outbox2",      x: 79.0, y: 79.0, label: "Outbox",              act: "flavor:outbox" }
    ]
  },

  supervisor: {
    name: "SUPERVISOR'S OFFICE",
    hotspots: [
      { id: "portrait",     x: 46.6, y: 21.6, label: "Portrait",            act: "portrait" },
      { id: "suplamp",      x: 22.5, y: 45.3, label: "Desk lamp",           act: "flavor:suplamp" },
      { id: "phone",        x: 31.2, y: 60.9, label: "Telephone",           act: "phone" },
      { id: "clerkfolder",  x: 26.6, y: 76.3, label: "Previous clerk's file", act: "clerkfolder" },
      { id: "safe",         x: 65.0, y: 46.6, label: "Safe",                act: "safe" },
      { id: "deskkey",      x: 53.0, y: 75.5, label: "Small key",           act: "flavor:deskkey" },
      { id: "clipboard",    x: 71.0, y: 67.0, label: "Clipboard",           act: "flavor:clipboard" },
      { id: "lockeddrawer", x: 80.0, y: 89.6, label: "Locked drawer",       act: "flavor:lockeddrawer" }
    ]
  },

  basement: {
    name: "BASEMENT ARCHIVE",
    hotspots: [
      { id: "bags",         x: 18.8, y: 45.0, label: "Unclaimed sacks",     act: "flavor:bags" },
      { id: "drawing",      x: 8.4,  y: 62.7, label: "Child's drawing",     act: "drawing" },
      { id: "bledger",      x: 31.2, y: 76.7, label: "The ledger",          act: "bledger" },
      { id: "gate",         x: 60.3, y: 47.1, label: "Restricted gate",     act: "flavor:gate" },
      { id: "valve",        x: 90.5, y: 47.8, label: "Valve wheel",         act: "flavor:valve" },
      { id: "crate",        x: 96.3, y: 77.8, label: "Sealed crate",        act: "flavor:crate" }
    ]
  }
};

/* One-line responses for background objects. */
DLO.FLAVOR = {
  mapnote:      "A pin without a label, high on the map. The hole beneath it has been pinned and re-pinned, as if the place keeps moving.",
  deskbook:     "A duty ledger, open to tonight. The last entry trails off mid-word. The word was going to be a name.",
  evidence:     "Boxes stenciled EVIDENCE, stacked out of the furnace's reach. Evidence of what is not stenciled.",
  clock:        "The clock reads a time. You check your watch. They disagree, politely.",
  fan:          "The fan turns its head toward you, then away, then toward you.",
  dispatch:     "DISPATCH: 3:00 AM. Nothing has ever been dispatched at 3:00 AM. The note stays up.",
  outbox:       "The outbox is empty. It empties itself. You have never seen it happen.",
  filingboxes:  "Boxes of town records, filed by a system you are still learning. The system may also be learning you.",
  archiveboxes: "MARROW CREEK, 1944. The tape has been cut and re-taped. More than once.",
  archivetop:   "MARROW CREEK, 1937–1945. Heavier than paper should be.",
  bundles:      "Letter bundles tied with string. The knots are all the same knot.",
  warnposter:   "WARNING: DO NOT BURN EVIDENCE. CONSULT OFFICE PROCEDURES. The procedures do not define evidence.",
  ashbin:       "The ash bin. Fine grey ash, and one corner of an envelope that did not finish.",
  blackenv:     "A black envelope lies on the sorting table. It was not carried down here. It is not warm. It is not cold either.",
  locker:       "Four lockers. Three have names scraped off. The fourth has yours, which is strange, because you never told them.",
  vending:      "SNACKS & DRINKS. The mechanism hums. Row C holds the same candy bar it has held for years. It is watching its expiry date go by.",
  mug:          "The coffee is cold. It was cold when you got here. It has always been cold.",
  reminder:     "Reminder: report all mailroom irregularities. Thank you.",
  suplamp:      "The lamp is on. Nobody works in this room. The lamp is on.",
  deskkey:      "A small brass key on the blotter. It fits nothing in this room. You leave it where somebody wanted it found.",
  clipboard:    "An inspection form, signed weekly, same signature, for thirty years. The pen strokes never vary.",
  lockeddrawer: "The drawer is locked. Something inside it shifts a half-second after you stop trying.",
  bags:         "UNCLAIMED. 1942. 1947. 1952. 1959. 1963. 1967. 1970. Sacks of mail, each one a year that kept writing.",
  gate:         "ARCHIVE RESTRICTED — AUTHORIZED PERSONNEL ONLY. Beyond the bars, shelves go back further than the building does.",
  valve:        "The wheel turns forever without tightening. Somewhere in the walls, water agrees to wait.",
  crate:        "FRAGILE. DO NOT OPEN. The wax seal is warm."
};

window.DLO = DLO;
