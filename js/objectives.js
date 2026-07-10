/* Contextual objective presentation for the painted room interface. */
(function () {
  "use strict";

  var SAVE_KEY = "dlo_save_v2";
  var lastSignature = "";

  function readSave() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || "{}") || {};
    } catch (err) {
      return {};
    }
  }

  function esc(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  }

  function line(text, done, optional) {
    return {
      text: text,
      done: !!done,
      optional: !!optional
    };
  }

  function deskObjective(save, app) {
    var hasTray = !!app.querySelector(".tray-item, [data-act='take']");
    var hasEnvelope = !!app.querySelector(".envelope");
    var hasLetter = !!app.querySelector(".letter-wrap, .paper.l-hand, .paper.l-typed, .paper.l-child");
    var hasWorksheet = !!app.querySelector(".worksheet");
    var consultedRegistry = !!(save.consulted && save.consulted.registry);
    var consultedDeaths = !!(save.consulted && save.consulted.deaths);
    var shift = Number(save.shiftIdx || 0) + 1;

    if (hasTray) {
      return {
        title: "PROCESS RECEIVED LETTERS",
        note: "Take the next item from the incoming tray.",
        lines: [line("Check the new mail", false)]
      };
    }

    if (hasEnvelope) {
      var flipped = !!save.flipped || !!app.querySelector(".env-face.back");
      return {
        title: "INSPECT THE ENVELOPE",
        note: "The outside of a letter is part of the record.",
        lines: [
          line("Read the front", true),
          line("Inspect the reverse", flipped),
          line("View the contents", false)
        ]
      };
    }

    if (hasLetter || hasWorksheet) {
      var checks = [line("Read the letter", true), line("Verify the sender", consultedRegistry)];
      if (shift >= 2) checks.push(line("Check the recipient records", consultedDeaths));
      checks.push(line("Choose a disposition", false));
      return {
        title: "DECIDE ITS DISPOSITION",
        note: "Policy gives an answer. It does not make the choice.",
        lines: checks
      };
    }

    return {
      title: "RETURN TO THE SORTING DESK",
      note: "The current batch is waiting.",
      lines: [line("Resume processing mail", false)]
    };
  }

  function roomObjective(room, save) {
    var flags = save.flags || {};

    if (room === "office") {
      return {
        title: save.finalInserted ? "SOMETHING'S WRONG" : "PROCESS RECEIVED LETTERS",
        note: save.finalInserted
          ? "The room is familiar. The room is not the same."
          : "Inspect the office or return to the desk.",
        lines: save.finalInserted
          ? [line("Inspect the changed office", false), line("Read the final letter", !!save.finalRead)]
          : [line("Check the new mail", false), line("Review the wall records", false, true)]
      };
    }

    if (room === "filing") {
      return {
        title: "FIND THE BELL FAMILY RECORDS",
        note: "Names are easier to erase when they are filed separately.",
        lines: [
          line("Read the pinned code", !!flags.FilingCodeSeen),
          line("Locate the Bell family folder", !!flags.BellFolderRead),
          line("Take the supervisor keys", !!save.keysFound, true)
        ]
      };
    }

    if (room === "archive") {
      return {
        title: "COMPARE ARCHIVED LETTERS",
        note: "The archive remembers edits the office does not.",
        lines: [
          line("Inspect the Marrow Creek files", false),
          line("Find the matching photograph", !!flags.PhotoSeen),
          line("Check the match ledger", false)
        ]
      };
    }

    if (room === "incinerator") {
      var carrying = !!save.pendingBurn;
      return {
        title: carrying ? "DECIDE WHAT TO DO WITH THE LETTER" : "THE INCINERATOR ROOM",
        note: carrying ? "Destruction requires a final, physical choice." : "Ash is still a kind of record.",
        lines: carrying
          ? [line("Burn the letter", false), line("Preserve the letter", false)]
          : [line("Inspect the furnace", false), line("Search the evidence shelves", false, true)]
      };
    }

    if (room === "breakroom") {
      return {
        title: "LISTEN TO THE OFFICE",
        note: "Static is only noise until it repeats a name.",
        lines: [
          line("Check the radio message", !!save.radioHeard),
          line("Read the notice board", false, true)
        ]
      };
    }

    if (room === "supervisor") {
      return {
        title: "SEARCH THE SUPERVISOR'S OFFICE",
        note: "The office keeps a file on every clerk.",
        lines: [
          line("Find the previous clerk's file", !!flags.ClerkFolderSeen),
          line("Open the combination safe", !!save.safeOpened, true)
        ]
      };
    }

    if (room === "basement") {
      return {
        title: "FIND THE FIRST DEAD LETTER",
        note: "The oldest record may not be the earliest one.",
        lines: [
          line("Inspect the unclaimed mail", false),
          line("Read the basement ledger", !!flags.BasementLedgerRead),
          line("Locate the earliest recorded letter", !!save.finalRead)
        ]
      };
    }

    return {
      title: "EXPLORE THE OFFICE",
      note: "Every room has been arranged for somebody.",
      lines: [line("Inspect the room", false)]
    };
  }

  function currentObjective(app, save) {
    var scene = app.querySelector(".scene");
    if (!scene) return null;

    var roomMatch = String(scene.className).match(/scene-(office|filing|archive|incinerator|breakroom|supervisor|basement)/);
    var room = roomMatch ? roomMatch[1] : "office";
    var isRoomView = !!app.querySelector(".room-screen");

    return isRoomView ? roomObjective(room, save) : deskObjective(save, app);
  }

  function renderObjective(app) {
    var box = app.querySelector(".taskbox");
    if (!box) return;

    var save = readSave();
    var objective = currentObjective(app, save);
    if (!objective) return;

    var signature = JSON.stringify(objective);
    if (signature === lastSignature && box.getAttribute("data-contextual") === "1") return;
    lastSignature = signature;

    var rows = objective.lines.map(function (item) {
      var classes = "objective-line" + (item.done ? " done" : "") + (item.optional ? " optional" : "");
      return "<div class='" + classes + "'><span class='objective-check'>" +
        (item.done ? "✓" : "") + "</span><span>" + esc(item.text) +
        (item.optional ? " <em>optional</em>" : "") + "</span></div>";
    }).join("");

    box.setAttribute("data-contextual", "1");
    box.innerHTML = "<div class='task-title'>" + esc(objective.title) + "</div>" +
      "<div class='task-note'>" + esc(objective.note) + "</div>" + rows;
  }

  function update() {
    var app = document.getElementById("app");
    if (app) renderObjective(app);
  }

  var observer = new MutationObserver(function () {
    window.requestAnimationFrame(update);
  });

  function start() {
    var app = document.getElementById("app");
    if (!app) return;
    observer.observe(app, { childList: true, subtree: true, attributes: true });
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
