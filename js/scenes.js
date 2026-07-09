/* Dead Letter Office — point-and-click rooms.
   Each room is one painted scene (assets/scenes/<id>.png). Hotspot positions
   are percentages of the frame, matching the concept screenshots. If a scene
   image is missing, a plain painted-dark fallback is shown instead. */

var DLO = window.DLO || {};

DLO.ROOMS = {

  office: {
    name: "MAIN OFFICE",
    hotspots: [
      { id: "filecab",      x: 26.5, y: 44.5, label: "Filing cabinet",      act: "goto:filing" },
      { id: "wallmap",      x: 56.0, y: 44.5, label: "Wall map",            act: "panel:map" },
      { id: "recdrawer",    x: 69.5, y: 59.5, label: "Records drawer",      act: "panel:registry" },
      { id: "desk",         x: 47.0, y: 65.0, label: "Sorting desk",        act: "work" },
      { id: "newspaper",    x: 46.0, y: 79.0, label: "Newspaper",           act: "panel:news" },
      { id: "rulesposter",  x: 31.0, y: 26.0, label: "Office rules",        act: "panel:policy" },
      { id: "clock",        x: 70.5, y: 17.0, label: "Wall clock",          act: "flavor:clock" },
      { id: "fan",          x: 69.5, y: 38.0, label: "Desk fan",            act: "flavor:fan" },
      { id: "dispatch",     x: 64.5, y: 32.0, label: "Dispatch note",       act: "flavor:dispatch" },
      { id: "basementdoor", x: 83.0, y: 30.0, label: "Basement door",       act: "basementdoor" },
      { id: "outbox",       x: 86.5, y: 76.0, label: "Outbox",              act: "flavor:outbox" }
    ]
  },

  filing: {
    name: "FILING ROOM",
    hotspots: [
      { id: "codenote",     x: 15.4, y: 46.0, label: "Pinned note",         act: "codenote" },
      { id: "folderdrawer", x: 19.6, y: 69.6, label: "Open drawer",         act: "panel:deaths" },
      { id: "shelfbox",     x: 54.9, y: 51.6, label: "Archive boxes",       act: "flavor:filingboxes" },
      { id: "keys",         x: 79.0, y: 40.0, label: "Keys on a hook",      act: "keys" },
      { id: "bellbox",      x: 67.0, y: 67.0, label: "Bell family box",     act: "bellbox" }
    ]
  },

  archive: {
    name: "ARCHIVE ROOM",
    hotspots: [
      { id: "box1944",      x: 18.2, y: 53.0, label: "Marrow Creek, 1944",  act: "flavor:archiveboxes" },
      { id: "topbox",       x: 64.6, y: 43.4, label: "Marrow Creek, 1937–1945", act: "flavor:archivetop" },
      { id: "photo",        x: 74.3, y: 39.6, label: "Pinned photograph",   act: "photo" },
      { id: "mapsdrawer",   x: 59.0, y: 61.8, label: "Maps A–F",            act: "panel:map" },
      { id: "matchledger",  x: 72.5, y: 79.3, label: "Match ledger",        act: "panel:archive" },
      { id: "rightshelf",   x: 87.0, y: 52.5, label: "Letter bundles",      act: "flavor:bundles" }
    ]
  },

  incinerator: {
    name: "INCINERATOR ROOM",
    hotspots: [
      { id: "warnposter",   x: 29.0, y: 42.7, label: "Warning poster",      act: "flavor:warnposter" },
      { id: "furnace",      x: 42.3, y: 46.9, label: "Furnace door",        act: "burn" },
      { id: "lever",        x: 62.4, y: 55.3, label: "Feed lever",          act: "burn" },
      { id: "ashbin",       x: 37.4, y: 68.9, label: "Ash bin",             act: "flavor:ashbin" },
      { id: "tableletters", x: 71.0, y: 60.5, label: "Letter on the table", act: "takeback" },
      { id: "blackenv",     x: 76.6, y: 69.3, label: "Black envelope",      act: "flavor:blackenv" }
    ]
  },

  breakroom: {
    name: "BREAK ROOM",
    hotspots: [
      { id: "board",        x: 56.0, y: 28.6, label: "Notice board",        act: "panel:policy" },
      { id: "locker",       x: 29.6, y: 37.2, label: "Lockers",             act: "flavor:locker" },
      { id: "radio",        x: 58.3, y: 45.9, label: "Radio",               act: "radio" },
      { id: "vending",      x: 13.2, y: 61.1, label: "Vending machine",     act: "flavor:vending" },
      { id: "tablepaper",   x: 43.0, y: 66.0, label: "Newspaper",           act: "panel:news" },
      { id: "mug",          x: 51.6, y: 63.5, label: "Coffee mug",          act: "flavor:mug" },
      { id: "reminder",     x: 77.3, y: 40.7, label: "Reminder",            act: "flavor:reminder" },
      { id: "outbox2",      x: 79.0, y: 79.0, label: "Outbox",              act: "flavor:outbox" }
    ]
  },

  supervisor: {
    name: "SUPERVISOR'S OFFICE",
    hotspots: [
      { id: "portrait",     x: 46.6, y: 21.6, label: "Portrait",            act: "portrait" },
      { id: "suplamp",      x: 25.1, y: 45.4, label: "Desk lamp",           act: "flavor:suplamp" },
      { id: "phone",        x: 32.9, y: 61.0, label: "Telephone",           act: "phone" },
      { id: "clerkfolder",  x: 29.0, y: 76.2, label: "Previous clerk's file", act: "clerkfolder" },
      { id: "safe",         x: 63.9, y: 46.6, label: "Safe",                act: "safe" },
      { id: "deskkey",      x: 53.0, y: 75.5, label: "Small key",           act: "flavor:deskkey" },
      { id: "clipboard",    x: 71.0, y: 67.0, label: "Clipboard",           act: "flavor:clipboard" },
      { id: "lockeddrawer", x: 79.2, y: 89.6, label: "Locked drawer",       act: "flavor:lockeddrawer" }
    ]
  },

  basement: {
    name: "BASEMENT ARCHIVE",
    hotspots: [
      { id: "bags",         x: 21.8, y: 45.0, label: "Unclaimed sacks",     act: "flavor:bags" },
      { id: "drawing",      x: 12.5, y: 62.7, label: "Child's drawing",     act: "drawing" },
      { id: "bledger",      x: 32.9, y: 76.6, label: "The ledger",          act: "bledger" },
      { id: "gate",         x: 59.0, y: 47.1, label: "Restricted gate",     act: "flavor:gate" },
      { id: "valve",        x: 86.2, y: 47.8, label: "Valve wheel",         act: "flavor:valve" },
      { id: "crate",        x: 91.8, y: 77.8, label: "Sealed crate",        act: "flavor:crate" }
    ]
  }
};

/* One-line responses for background objects. */
DLO.FLAVOR = {
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
