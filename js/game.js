/* Dead Letter Office — MVP game engine.
   Two night shifts. Fifteen letters. Three stamps. One town that does not exist. */

(function () {
  "use strict";

  var D = DLO.DATA;
  var A = DLO.Audio;
  var SAVE_KEY = "dlo_save_v1";
  var $app;

  /* ------------------------------------------------ state */

  var state = null;

  function freshState() {
    return {
      screen: "title",
      shiftIdx: 0,
      queue: [],
      itemIdx: 0,
      phase: "tray",          // tray | envelope | letter
      flipped: false,
      uvOn: false,
      panel: null,
      consulted: { registry: false, deaths: false }, // per-item reference checks
      tut: 0,                 // orientation walkthrough step (99 = skipped)
      readingArchived: null,  // id of archived letter being reread
      flags: {},
      compliance: 100,
      memory: 0,
      counts: { archive: 0, destroy: 0, "return": 0, keep: 0 },
      processed: [],          // { id, bin }
      deviations: [],
      log: [],
      correctionFiled: false,
      burnedInserted: false,
      burnedVariant: null,
      bellHouse: false,
      archiveChanged: false,
      archiveChangeSeen: false,
      foundHiddenPS: false,
      finalInserted: false,
      lampMode: false,
      finalRead: false
    };
  }

  /* ------------------------------------------------ save / load */

  function save() {
    try {
      var s = {};
      for (var k in state) if (k !== "panel" && k !== "readingArchived") s[k] = state[k];
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    } catch (e) {}
  }
  function loadSave() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }
  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }

  /* ------------------------------------------------ helpers */

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function paras(arr, cls) {
    return arr.map(function (p) { return "<p class='" + (cls || "") + "'>" + esc(p) + "</p>"; }).join("");
  }
  function logLine(text, sys) {
    state.log.push({ text: text, sys: !!sys });
    if (state.log.length > 6) state.log.shift();
  }
  function getItem(id) {
    if (id === "s2-11") return state.burnedVariant;
    return D.letters[id];
  }
  function currentId() { return state.queue[state.itemIdx]; }
  function currentItem() { return getItem(currentId()); }
  function shiftDef() { return D.shifts[state.shiftIdx]; }
  function hasUnlock(u) {
    for (var i = 0; i <= state.shiftIdx; i++)
      if (D.shifts[i].unlocks.indexOf(u) >= 0) return true;
    return false;
  }

  /* ------------------------------------------------ flow */

  function newGame() {
    clearSave();
    state = freshState();
    startShift(0);
  }

  function continueGame() {
    var s = loadSave();
    if (!s) { newGame(); return; }
    state = freshState();
    for (var k in s) state[k] = s[k];
    state.panel = null;
    state.screen = "desk";
    state.phase = "tray";
    state.flipped = false;
    state.uvOn = false;
    if (typeof state.tut !== "number") state.tut = 99;
    if (!state.consulted) state.consulted = { registry: false, deaths: false };
    render();
  }

  function startShift(idx) {
    state.shiftIdx = idx;
    state.queue = D.shifts[idx].items.slice();
    state.itemIdx = 0;
    state.phase = "tray";
    state.flipped = false;
    state.uvOn = false;
    state.deviations = [];
    state.log = [];
    state.screen = "intro";
    save();
    render();
  }

  function clockIn() {
    state.screen = "desk";
    logLine("The lights hum. The tray is full.");
    render();
  }

  function takeItem() {
    if (state.itemIdx >= state.queue.length) return;
    A.paper();
    state.phase = "envelope";
    state.flipped = false;
    state.uvOn = false;
    state.consulted = { registry: false, deaths: false };
    if (state.tut === 0) state.tut = 1;
    else if (state.tut === 6) state.tut = 7;
    render();
  }

  function flipItem() {
    A.paper();
    state.flipped = !state.flipped;
    if (state.tut === 1) state.tut = 2;
    render();
  }

  function openItem() {
    var item = currentItem();
    if (item.sealed && !state.flags.BlackEnvelopeOpened) {
      modal([
        "The seal is black wax, unbroken.",
        "Policy P-40: black-sealed items are to be archived UNOPENED.",
        "The seal records its own condition."
      ], [
        { label: "BREAK THE SEAL", fn: function () { reallyOpen(true); } },
        { label: "LEAVE IT", fn: function () { closeModal(); } }
      ]);
      return;
    }
    reallyOpen(false);
  }

  function reallyOpen(brokeSeal) {
    closeModal();
    var item = currentItem();
    if (brokeSeal && item.onOpen) {
      state.compliance = clamp(state.compliance + (item.onOpen.compliance || 0));
      (item.onOpen.flags || []).forEach(function (f) { state.flags[f] = true; });
      logLine("The wax parts with a sound like a knuckle.", false);
    }
    A.tear();
    state.phase = "letter";
    if (state.tut >= 1 && state.tut < 3) state.tut = 3;
    if (item.kind === "final") {
      state.finalRead = true;
    }
    render();
  }

  /* ------------------------------------------------ FORM 11 (disposition worksheet) */

  function metaFor(id) { return D.lookup[id] || {}; }

  /* What policy objectively directs for this item, with full knowledge. */
  function directiveFor(id) {
    var m = metaFor(id);
    if (m.noPolicy)   return { bin: null, ref: null, text: "NO APPLICABLE POLICY." };
    if (m.discretion) return { bin: null, ref: null, text: "REPROCESS — CLERK'S DISCRETION." };
    if (m.sealed)     return { bin: "archive", ref: "P-40", text: "BLACK SEAL — ARCHIVE UNOPENED." };
    if (m.internal)   return { bin: "archive", ref: "P-09", text: "INTERNAL DOCUMENT — ARCHIVE." };
    if (state.shiftIdx >= 1 && m.recipientDead)
      return { bin: "destroy", ref: "14-A", text: "RECIPIENT DECEASED — DESTROY." };
    if (!m.senderTown) return { bin: "archive", ref: "P-09", text: "NO VERIFIABLE SENDER — ARCHIVE." };
    var rec = null;
    for (var i = 0; i < D.registry.length; i++) if (D.registry[i].town === m.senderTown) rec = D.registry[i];
    if (rec && rec.status === "ACTIVE")
      return { bin: "return", ref: "P-06", text: "SENDER VERIFIED — RETURN TO SENDER." };
    return { bin: "archive", ref: "22-C", text: "SENDER MUNICIPALITY NOT RECOGNIZED — ARCHIVE." };
  }

  /* The worksheet as the clerk can currently fill it in: lines appear only
     after the relevant reference has been consulted for this item. */
  function rWorksheet(id) {
    var m = metaFor(id);
    var rows = [];
    var pendingWhat = [];

    /* sender line */
    if (!m.internal && !m.sealed && !m.noPolicy && !m.discretion) {
      if (!m.senderTown) {
        rows.push("<div class='ws-row'>SENDER: NONE GIVEN — <b>UNVERIFIABLE</b></div>");
      } else if (state.consulted.registry) {
        var rec = null;
        for (var i = 0; i < D.registry.length; i++) if (D.registry[i].town === m.senderTown) rec = D.registry[i];
        var st = rec ? rec.status : "NO RECORD";
        rows.push("<div class='ws-row'>SENDER TOWN: " + esc(m.senderTown) + " — <b>" + esc(st) + "</b></div>");
      } else {
        rows.push("<div class='ws-row dim'>SENDER TOWN: " + esc(m.senderTown) + " — unverified</div>");
        pendingWhat.push("ADDRESS REGISTRY");
      }
      /* mortality line, shift 2+ */
      if (state.shiftIdx >= 1) {
        if (state.consulted.deaths) {
          rows.push(m.recipientDead
            ? "<div class='ws-row bad'>RECIPIENT: IN REGISTER OF DEATHS — <b>DECEASED</b></div>"
            : "<div class='ws-row'>RECIPIENT: NOT IN REGISTER — <b>NO RECORD OF DEATH</b></div>");
        } else {
          rows.push("<div class='ws-row dim'>RECIPIENT: mortality unchecked</div>");
          pendingWhat.push("REGISTER OF DEATHS");
        }
      }
    }
    if (m.dateAnomaly) {
      rows.push("<div class='ws-row bad'>POSTMARK EXCEEDS PROCESSING DATE — NO POLICY COVERS THIS.</div>");
    }
    if (m.sealed && state.flags.BlackEnvelopeOpened) {
      rows.push("<div class='ws-row bad'>SEAL CONDITION: BROKEN. NOTED.</div>");
    }

    /* directive line */
    var dline;
    if (pendingWhat.length) {
      dline = "<div class='ws-directive dim'>POLICY DIRECTS: PENDING — consult the " + pendingWhat.join(" and the ") + ".</div>";
    } else {
      var d = directiveFor(id);
      var stampWord = { "return": "RETURN TO SENDER", archive: "ARCHIVE", destroy: "DESTROY" }[d.bin];
      dline = d.bin
        ? "<div class='ws-directive'>POLICY DIRECTS: <b>" + stampWord + "</b>" + (d.ref ? " (" + d.ref + ")" : "") +
          " — " + esc(d.text) + "<span class='ws-yours'>The decision is yours.</span></div>"
        : "<div class='ws-directive'>POLICY DIRECTS: <b>—</b> " + esc(d.text) + "</div>";
    }

    return "<div class='worksheet'><div class='ws-head'>FORM 11 — DISPOSITION WORKSHEET</div>" +
      rows.join("") + dline + "</div>";
  }

  function toggleUV() {
    if (!hasUnlock("uv")) return;
    state.uvOn = !state.uvOn;
    var item = currentItem();
    if (state.uvOn && item && item.uv && state.phase === "letter") {
      if (item.kind === "final") state.foundHiddenPS = true;
      logLine("Under the lamp, the paper is not empty where it looked empty.");
    }
    render();
  }

  function clamp(v) { return Math.max(0, Math.min(100, v)); }

  function stampItem(bin) {
    var id = currentId();
    var item = currentItem();
    if (!item) return;

    if (item.unstampable) {
      A.paper();
      logLine("The stamp leaves no mark on it. The bins will not take it.", true);
      render();
      return;
    }

    A.stamp();
    if (bin === "destroy") {
      setTimeout(function () { A.burn(); }, 250);
      document.body.classList.add("burnflash");
      setTimeout(function () { document.body.classList.remove("burnflash"); }, 1000);
    }

    applyOutcome(id, item, bin);

    /* brief imprint, then advance */
    var impText = { "return": "RETURN TO SENDER", archive: "ARCHIVED", destroy: "DESTROY" }[bin];
    showImprint(impText, function () { advance(); });
  }

  function keepItem() {
    var id = currentId();
    var item = currentItem();
    if (!item || !item.keepable) return;
    A.paper();
    state.counts.keep++;
    if (item.onKeep) {
      state.compliance = clamp(state.compliance + (item.onKeep.compliance || 0));
      state.memory += (item.onKeep.memory || 0);
      (item.onKeep.flags || []).forEach(function (f) { state.flags[f] = true; });
    }
    state.processed.push({ id: id, bin: "keep" });
    state.deviations.push(D.reviewDeviation[id]);
    logLine("You fold it twice and put it in your coat pocket.");
    logLine("ITEM UNACCOUNTED FOR. DEVIATION RECORDED.", true);
    advance();
  }

  function applyOutcome(id, item, bin) {
    state.counts[bin]++;
    state.processed.push({ id: id, bin: bin });

    var eff = null;
    if (bin === "archive" && item.onArchive) eff = item.onArchive;
    if (bin === "destroy" && item.onDestroy) eff = item.onDestroy;
    if (bin === "return" && item.onReturn) eff = item.onReturn;
    if (eff) {
      state.memory += (eff.memory || 0);
      (eff.flags || []).forEach(function (f) { state.flags[f] = true; });
    }

    var deviated = false;
    if (item.correct && bin !== item.correct) deviated = true;
    if (item.sealed && state.flags.BlackEnvelopeOpened) deviated = true;
    if (deviated && D.reviewDeviation[id]) {
      state.deviations.push(D.reviewDeviation[id]);
      state.compliance = clamp(state.compliance - 10);
    }

    /* immediate feedback: did that follow policy or not */
    var dir = directiveFor(id);
    if (item.sealed && state.flags.BlackEnvelopeOpened) {
      logLine("SEAL BROKEN — DEVIATION FROM P-40 RECORDED.", true);
    } else if (!dir.bin) {
      logLine("PROCESSED. NO POLICY APPLIED.", true);
    } else if (bin === dir.bin) {
      logLine("PROCESSED PER POLICY " + dir.ref + ".", true);
    } else {
      logLine("DEVIATION FROM POLICY " + dir.ref + " RECORDED.", true);
    }

    if (item.anomaly) logLine(item.anomaly, true);
    if (id === "s2-11" && bin === "destroy") {
      logLine("ITEM DID NOT BURN. ITEM IS RECORDED AS DESTROYED.", true);
      state.flags.BurnedTwice = true;
    }
    if (state.tut > 0 && state.tut < 6) state.tut = 6;
  }

  function advance() {
    state.itemIdx++;
    state.phase = "tray";
    state.flipped = false;
    state.uvOn = false;
    save();

    /* scripted insertions */
    var justDone = state.processed.length ? state.processed[state.processed.length - 1] : null;

    if (state.shiftIdx === 1 && !state.burnedInserted && justDone && justDone.id === "s2-10") {
      state.burnedInserted = true;
      state.burnedVariant = state.flags.JonahLetterDestroyed ? D.burned.jonah : D.burned.ruth;
      state.archiveChanged = true;
      state.queue.splice(state.itemIdx, 0, "s2-11");
      save();
      A.flickerHum();
      flickerLights();
      modal([
        "The incoming tray rattles once, like a knuckle on tin.",
        "There is a new envelope in it. The edges are burned."
      ], [{ label: "LOOK", fn: function () { closeModal(); render(); } }]);
      render();
      return;
    }

    if (state.shiftIdx === 1 && !state.finalInserted && justDone && justDone.id === "s2-14") {
      maybeBellHouse(function () { finalSequence(); });
      return;
    }

    if (state.itemIdx >= state.queue.length) {
      endShift();
      return;
    }
    render();
  }

  function maybeBellHouse(next) {
    var f = state.flags;
    var archivedBell = (f.RuthLetter1Archived ? 1 : 0) + (f.JonahLetterArchived ? 1 : 0) + (f.RuthFinalArchived ? 1 : 0);
    if (!state.bellHouse && archivedBell >= 2) {
      state.bellHouse = true;
      state.memory += 1;
      save();
      modal([
        "Behind you, a soft click, like a pin going into cork.",
        "The wall map of Marrow Creek has gained a house. 12 BRIAR LANE, at the top of the lane, holding its ground."
      ], [{ label: "TURN AROUND SLOWLY", fn: function () { closeModal(); next(); } }]);
      render();
      return;
    }
    next();
  }

  /* ------------------------------------------------ shift ends */

  function endShift() {
    if (state.shiftIdx === 0) {
      printerEvent(function () {
        state.screen = "review";
        save();
        render();
      });
    } else {
      state.screen = "end";
      clearSave();
      render();
    }
  }

  function printerEvent(next) {
    var text = state.correctionFiled
      ? "THE CORRECTION REQUEST HAS BEEN NOTED.\nDO NOT CORRECT THE DATABASE.\nDO NOT RESUBMIT."
      : "DO NOT CORRECT THE DATABASE.";
    state.screen = "printer";
    render();
    A.printer(1600, function () {
      var p = document.getElementById("printer-paper");
      if (p) {
        p.textContent = text;
        p.classList.add("out");
      }
      var btn = document.getElementById("printer-btn");
      if (btn) btn.style.visibility = "visible";
      window.__dlo_printer_done = true;
    });
    window.__dlo_printer_next = next;
  }

  function finalSequence() {
    state.finalInserted = true;
    flickerLights();
    A.flickerHum();
    setTimeout(function () {
      document.body.classList.add("blackout");
      A.stopHum(0.3);
      setTimeout(function () {
        document.body.classList.remove("blackout");
        document.body.classList.add("lampmode");
        state.lampMode = true;
        state.queue.push("s2-15");
        state.itemIdx = state.queue.length - 1;
        state.phase = "tray";
        logLine("The overheads are gone. The desk lamp holds.", false);
        logLine("Something slid into the tray in the dark.", false);
        save();
        render();
      }, 1900);
    }, 900);
  }

  function finishFinal() {
    state.screen = "end";
    document.body.classList.remove("lampmode");
    clearSave();
    render();
  }

  function flickerLights() {
    document.body.classList.add("flicker");
    setTimeout(function () { document.body.classList.remove("flicker"); }, 600);
  }

  /* ------------------------------------------------ registry actions */

  function fileCorrection() {
    if (!state.correctionFiled) {
      state.correctionFiled = true;
      state.compliance = clamp(state.compliance - 5);
      logLine("CORRECTION REQUEST TRANSMITTED.", true);
      setTimeout(function () {
        logLine("REQUEST DENIED. DO NOT RESUBMIT.", true);
        render();
      }, 900);
    }
    render();
  }

  /* ------------------------------------------------ modal */

  var modalState = null;
  function modal(lines, buttons) { modalState = { lines: lines, buttons: buttons }; render(); }
  function closeModal() { modalState = null; render(); }

  function showImprint(text, done) {
    var ws = document.getElementById("workspace");
    if (ws) {
      var d = document.createElement("div");
      d.className = "imprint";
      d.textContent = text;
      ws.appendChild(d);
    }
    setTimeout(done, 750);
  }

  /* ------------------------------------------------ rendering */

  function render() {
    var html = "";
    switch (state.screen) {
      case "title":   html = rTitle(); break;
      case "intro":   html = rIntro(); break;
      case "desk":    html = rDesk(); break;
      case "printer": html = rPrinter(); break;
      case "review":  html = rReview(); break;
      case "end":     html = rEnd(); break;
    }
    if (modalState) html += rModal();
    $app.innerHTML = html;
    bind();
  }

  function rTitle() {
    var hasSave = !!loadSave();
    return "" +
      "<div class='screen title-screen'>" +
      "<div class='title-stamp'>UNDELIVERABLE</div>" +
      "<h1>DEAD LETTER OFFICE</h1>" +
      "<p class='subtitle'>REGIONAL DEAD LETTER FACILITY 9 · NIGHT SHIFT</p>" +
      "<p class='tagline'>The town of Marrow Creek does not exist.<br>Its mail keeps arriving anyway.</p>" +
      "<div class='title-buttons'>" +
      "<button class='btn' data-act='new'>CLOCK IN — NEW SHIFT</button>" +
      (hasSave ? "<button class='btn' data-act='continue'>CONTINUE SHIFT</button>" : "") +
      "<button class='btn ghost' data-act='sound'>SOUND: " + (A.isEnabled() ? "ON" : "OFF") + "</button>" +
      "</div>" +
      "<p class='footnote'>A demonstration of the first two shifts. Headphones recommended. No jumpscares — only paperwork.</p>" +
      "</div>";
  }

  function rIntro() {
    var s = shiftDef();
    return "" +
      "<div class='screen intro-screen'>" +
      "<div class='memo-card'>" +
      "<div class='memo-head'>SHIFT " + s.number + " — " + esc(s.title) + "</div>" +
      paras(s.brief, "memo-line") +
      "<button class='btn' data-act='clockin'>BEGIN SHIFT " + s.number + "</button>" +
      "</div></div>";
  }

  function rDesk() {
    return "" +
      "<div class='screen desk-screen" + (state.uvOn ? " uv" : "") + "'>" +
      rHeader() +
      "<div class='desk-body'>" +
      rSidebar() +
      "<div class='deskscene'>" +
      rWallDecor() +
      "<div class='lampglow'></div>" + rLampSvg() +
      "<div class='workspace' id='workspace'>" + rWorkspace() + "</div>" +
      rTrays() +
      "</div>" +
      "</div>" +
      rLog() +
      (state.panel ? rPanel() : "") +
      "</div>";
  }

  /* The room behind the desk: corkboard with red string, clock, basement door. */
  function rWallDecor() {
    var t = new Array(7);
    return "<div class='wall'>" +
      "<div class='wainscot'></div>" +
      /* corkboard with pinned photos and red string */
      "<div class='corkboard'>" +
      "<svg viewBox='0 0 300 150' preserveAspectRatio='none'>" +
      "<rect x='36' y='18' width='34' height='26' fill='#c9bd97' transform='rotate(-4 53 31)'/>" +
      "<rect x='120' y='12' width='34' height='26' fill='#b7a983' transform='rotate(3 137 25)'/>" +
      "<rect x='214' y='24' width='34' height='26' fill='#c9bd97' transform='rotate(-2 231 37)'/>" +
      "<rect x='70' y='84' width='34' height='26' fill='#b7a983' transform='rotate(5 87 97)'/>" +
      "<rect x='176' y='96' width='34' height='26' fill='#c9bd97' transform='rotate(-5 193 109)'/>" +
      "<rect x='40' y='24' width='26' height='3' fill='#6b5f43' transform='rotate(-4 53 31)'/>" +
      "<rect x='124' y='18' width='26' height='3' fill='#6b5f43' transform='rotate(3 137 25)'/>" +
      "<rect x='218' y='30' width='26' height='3' fill='#6b5f43' transform='rotate(-2 231 37)'/>" +
      "<path d='M53 31 L137 25 L231 37 L193 109 L87 97 Z' stroke='#8e2b20' stroke-width='1.4' fill='none'/>" +
      "<path d='M137 25 L87 97 M53 31 L193 109' stroke='#8e2b20' stroke-width='1' fill='none' opacity='.7'/>" +
      "<circle cx='53' cy='31' r='2.4' fill='#8e2b20'/><circle cx='137' cy='25' r='2.4' fill='#8e2b20'/>" +
      "<circle cx='231' cy='37' r='2.4' fill='#8e2b20'/><circle cx='87' cy='97' r='2.4' fill='#8e2b20'/>" +
      "<circle cx='193' cy='109' r='2.4' fill='#8e2b20'/>" +
      "</svg></div>" +
      /* wall clock */
      "<div class='clock'><svg viewBox='0 0 60 60'>" +
      "<circle cx='30' cy='30' r='27' fill='#221f15' stroke='#6b5f43' stroke-width='2'/>" +
      "<circle cx='30' cy='30' r='1.8' fill='#b7a983'/>" +
      "<line x1='30' y1='30' x2='30' y2='13' stroke='#b7a983' stroke-width='2'/>" +
      "<line x1='30' y1='30' x2='41' y2='36' stroke='#b7a983' stroke-width='1.4'/>" +
      "</svg></div>" +
      /* basement door hint */
      "<div class='doorsign'>BASEMENT<br>▼<br><span>NO CLERK ACCESS</span></div>" +
      "</div>";
  }

  function rLampSvg() {
    return "<div class='banklamp'><svg viewBox='0 0 160 110'>" +
      "<ellipse cx='80' cy='104' rx='34' ry='5' fill='#241c10'/>" +
      "<rect x='76' y='58' width='8' height='46' rx='3' fill='#5e4a22'/>" +
      "<path d='M80 60 L80 34' stroke='#5e4a22' stroke-width='6' stroke-linecap='round'/>" +
      "<path d='M28 34 Q80 8 132 34 L124 46 Q80 24 36 46 Z' fill='#2f4a2c'/>" +
      "<path d='M28 34 Q80 8 132 34' stroke='#476b40' stroke-width='3' fill='none'/>" +
      "<rect x='34' y='42' width='92' height='7' rx='3.5' fill='#e9c979' opacity='.95'/>" +
      "</svg></div>";
  }

  /* Sorting trays along the desk edge. DELIVER and REVIEW ship with the full game. */
  function rTrays() {
    var item = state.itemIdx < state.queue.length ? currentItem() : null;
    var active = item && state.phase !== "tray";
    var dis = active ? "" : " disabled";
    function tray(cls, stamp, label, sub, sealed, act) {
      var attr = sealed ? " data-act='" + act + "'" : dis + " data-stamp='" + stamp + "'";
      return "<button class='traybox " + cls + (sealed ? " sealedtray" : "") + "'" + attr + ">" +
        "<span class='tray-paper'></span>" +
        "<span class='tray-plate'>" + label + "</span>" +
        "<span class='tray-sub'>" + sub + "</span>" +
        "</button>";
    }
    var keep = (item && item.keepable && active)
      ? tray("t-keep", "keep", "POCKET", "KEEP IT", false) : "";
    return "<div class='traysrow'>" +
      tray("t-deliver", null, "DELIVER", "SEALED", true, "sealed-deliver") +
      tray("t-return", "return", "RETURN", "TO SENDER") +
      tray("t-archive", "archive", "ARCHIVE", "PRESERVE") +
      tray("t-destroy", "destroy", "DESTROY", "INCINERATE") +
      tray("t-review", null, "REVIEW", "SEALED", true, "sealed-review") +
      keep +
      "</div>";
  }

  function rHeader() {
    var s = shiftDef();
    var remaining = state.queue.length - state.itemIdx;
    return "<div class='desk-header'>" +
      "<span class='fac'>" + esc(D.office.facility) + "</span>" +
      "<span>SHIFT " + s.number + "</span>" +
      "<span>" + esc(D.office.today) + "</span>" +
      "<span>ITEMS REMAINING: " + Math.max(0, remaining) + "</span>" +
      "<button class='mini' data-act='sound'>SOUND " + (A.isEnabled() ? "ON" : "OFF") + "</button>" +
      "</div>";
  }

  function rSidebar() {
    var deaths = hasUnlock("deaths");
    var news = hasUnlock("news");
    var uv = hasUnlock("uv");
    function drawer(panel, label, locked) {
      return "<button class='side-btn" + (locked ? " locked" : "") + "' data-panel='" + panel + "'>" +
        "<span class='drawer-pull'></span><span class='drawer-plate'>" + label + (locked ? " — LOCKED" : "") + "</span></button>";
    }
    return "<div class='sidebar'>" +
      "<div class='side-label'>REFERENCE DRAWERS</div>" +
      drawer("registry", "ADDRESS REGISTRY", false) +
      drawer("deaths", "DEATH RECORDS", !deaths) +
      drawer("news", "NEWSPAPER ARCHIVE", !news) +
      drawer("policy", "POLICY MANUAL", false) +
      drawer("map", "WALL MAP", false) +
      drawer("archive", "ARCHIVE", false) +
      drawer("help", "DESK REFERENCE", false) +
      "<div class='side-label'>TOOLS</div>" +
      (uv ? "<button class='side-btn uv-btn" + (state.uvOn ? " on" : "") + "' data-act='uv'><span class='drawer-plate'>UV LAMP " + (state.uvOn ? "· ON" : "· OFF") + "</span></button>"
          : "<div class='side-note'>Letter opener. Three stamps. A lamp.</div>") +
      "</div>";
  }

  function rWorkspace() {
    var slip = rTutorial();
    if (state.itemIdx >= state.queue.length) return slip + "<div class='tray-empty'>The tray is empty.</div>";
    var item = currentItem();
    if (state.phase === "tray") {
      return slip + "<div class='tray'>" +
        "<div class='tray-label'>INCOMING TRAY</div>" +
        "<div class='tray-item'>" + esc(item.label) + "</div>" +
        "<button class='btn' data-act='take'>TAKE ITEM</button>" +
        "</div>";
    }
    var ws = rWorksheet(currentId());
    if (state.phase === "envelope") return slip + rEnvelope(item) + ws;
    return slip + rLetter(item) + ws;
  }

  /* ---------- orientation walkthrough (shift 1, first item) ---------- */

  var TUT_STEPS = {
    0: { text: "ORIENTATION — STEP 1 OF 5: Take the item from the tray.", target: "[data-act=take]" },
    1: { text: "STEP 2: Inspect it. Flip it over, front and back.", target: "[data-act=flip]" },
    2: { text: "STEP 3: Open it with the letter opener and read it.", target: "[data-act=open]" },
    3: { text: "STEP 4: Verify the sender. Open the ADDRESS REGISTRY and find the sender's town.", target: "[data-panel=registry]" },
    5: { text: "STEP 5: FORM 11, beneath the item, now states what policy directs. Place the item in that tray — or another. Both are recorded.", target: "[data-stamp=return]" },
    6: { text: "Orientation complete. Every item works the same way: inspect, verify, decide. What you do with what you learn is your own affair.", target: null }
  };

  function rTutorial() {
    if (state.shiftIdx !== 0 || state.tut >= 7 || !TUT_STEPS[state.tut]) return "";
    return "<div class='tut-slip'><span>" + esc(TUT_STEPS[state.tut].text) + "</span>" +
      "<button class='mini' data-act='tutskip'>SKIP TRAINING</button></div>";
  }

  function tutTarget() {
    if (state.shiftIdx !== 0 || !TUT_STEPS[state.tut]) return null;
    return TUT_STEPS[state.tut].target;
  }

  function rEnvelope(item) {
    var e = item.env;
    var front = "" +
      "<div class='env-face'>" +
      "<div class='env-to'><span class='env-tag'>TO</span>" + e.to.map(esc).join("<br>") + "</div>" +
      "<div class='env-from'><span class='env-tag'>FROM</span>" + e.from.map(esc).join("<br>") + "</div>" +
      "<div class='env-postmark'>" + esc(e.postmark) + "</div>" +
      "<div class='env-stampdesc'>STAMP: " + esc(e.stamp) + "</div>" +
      "</div>";
    var back = "" +
      "<div class='env-face back'>" +
      "<div class='env-back-text'>" + esc(e.back) + "</div>" +
      "<div class='env-notes'>" + e.notes.map(function (n) { return "<div class='env-note'>· " + esc(n) + "</div>"; }).join("") + "</div>" +
      "</div>";
    var details = "<div class='env-details'>" +
      "<div class='env-dline'><b>POSTMARK:</b> " + esc(e.postmark) + "</div>" +
      "<div class='env-dline'><b>STAMP:</b> " + esc(e.stamp) + "</div>" +
      "<div class='env-dline'><b>CONDITION:</b> " + esc(e.back) + "</div>" +
      "</div>";
    return "<div class='envelope " + (item.kind === "black" ? "black" : "") + (item.kind === "burned" ? " burned" : "") + "'>" +
      (state.flipped ? back : front) +
      (item.kind === "black" ? "<span class='waxseal'></span>" : "") +
      "</div>" + details +
      "<div class='env-actions'>" +
      "<button class='btn' data-act='flip'>" + (state.flipped ? "FLIP TO FRONT" : "FLIP OVER") + "</button>" +
      "<button class='btn' data-act='open'>" + (item.sealed ? "THE SEAL…" : "VIEW CONTENTS") + "</button>" +
      "</div>";
  }

  function rLetter(item) {
    var cls = { typed: "l-typed", hand: "l-hand", child: "l-child" }[item.style] || "l-hand";
    var uvHtml = "";
    if (item.uv) {
      uvHtml = "<p class='uv-text" + (state.uvOn ? " visible" : "") + "'>" + esc(item.uv) + "</p>";
    }
    var footer;
    if (item.kind === "final") {
      footer = "<div class='env-actions'><button class='btn' data-act='finishfinal'>PUT IT DOWN</button></div>";
    } else {
      footer = "<div class='letter-hint'>Choose a stamp." + (item.keepable ? " Or keep it — nobody has counted it yet." : "") + "</div>";
    }
    return "" +
      "<div class='letter-wrap'>" +
      "<div class='letter-duo'>" +
      "<div class='env-mini" + (item.kind === "black" ? " black" : "") + "'>" +
      "<div class='env-mini-tag'>TO</div><div class='env-mini-v'>" + item.env.to.map(esc).join("<br>") + "</div>" +
      "<div class='env-mini-tag'>FROM</div><div class='env-mini-v'>" + item.env.from.map(esc).join("<br>") + "</div>" +
      "<div class='env-mini-tag'>POSTMARK</div><div class='env-mini-v'>" + esc(item.env.postmark) + "</div>" +
      "</div>" +
      "<div class='paper " + cls + (item.kind === "burned" ? " burned" : "") + "'>" +
      paras(item.body) + uvHtml +
      "</div>" +
      "</div>" + footer +
      "</div>";
  }

  function rLog() {
    return "<div class='deskliner'>" +
      state.log.map(function (l) {
        return "<div class='logline" + (l.sys ? " sys" : "") + "'>" + esc(l.text) + "</div>";
      }).join("") +
      "</div>";
  }

  /* ---------- panels ---------- */

  function rPanel() {
    var inner = "";
    switch (state.panel) {
      case "registry": inner = pRegistry(); break;
      case "deaths":   inner = pDeaths(); break;
      case "policy":   inner = pPolicy(); break;
      case "map":      inner = pMap(); break;
      case "archive":  inner = pArchive(); break;
      case "news":     inner = pNews(); break;
      case "help":     inner = pHelp(); break;
    }
    return "<div class='panel-overlay' data-act='closepanel'>" +
      "<div class='panel' data-stop='1'>" +
      "<div class='panel-head'><span>" + panelTitle() + "</span>" +
      "<button class='mini' data-act='closepanel'>CLOSE</button></div>" +
      "<div class='panel-body'>" + inner + "</div>" +
      "</div></div>";
  }

  function panelTitle() {
    return { registry: "MUNICIPAL ADDRESS REGISTRY", deaths: "COUNTY REGISTER OF DEATHS",
             policy: "POLICY MANUAL", map: "WALL MAP — MARROW CREEK", archive: "ARCHIVE — PROCESSED ITEMS",
             news: "NEWSPAPER ARCHIVE — MICROFILM", help: "DESK REFERENCE — SORTING PROCEDURE" }[state.panel] || "";
  }

  function activeMeta() {
    if (state.phase === "tray" || state.itemIdx >= state.queue.length) return null;
    return metaFor(currentId());
  }

  function pRegistry() {
    var m = activeMeta();
    var rows = D.registry.map(function (r) {
      var cls = r.status === "ACTIVE" ? "ok" : "bad";
      var hl = (m && m.senderTown === r.town) ? " hl" : "";
      var mark = hl ? "<span class='hl-mark'>◂ THIS ITEM</span>" : "";
      var extra = "";
      if (r.town === "MARROW CREEK") {
        extra = state.correctionFiled
          ? "<div class='reg-denied'>CORRECTION REQUEST: DENIED. DO NOT RESUBMIT.</div>"
          : "<button class='mini' data-act='correct'>FILE CORRECTION REQUEST</button>";
      }
      return "<div class='reg-row" + hl + "'><span class='reg-town'>" + esc(r.town) + mark + "</span>" +
        "<span class='reg-status " + cls + "'>" + esc(r.status) + "</span>" +
        "<span class='reg-note'>" + esc(r.note) + "</span>" + extra + "</div>";
    }).join("");
    return "<div class='panel-intro'>All municipalities recognized by the county appear below. If the sender's town is ACTIVE, the item can go back (P-06). The registry is complete. The registry has always been complete.</div>" +
      "<input class='rec-search' data-filter='.reg-row' placeholder='SEARCH…' spellcheck='false'>" + rows;
  }

  function pDeaths() {
    var m = activeMeta();
    var rows = D.deathRecords.map(function (r) {
      var hl = (m && m.deadNames && m.deadNames.indexOf(r.name) >= 0) ? " hl" : "";
      var mark = hl ? "<span class='hl-mark'>◂ THIS ITEM</span>" : "";
      return "<div class='death-row" + hl + "'>" +
        "<div class='death-name'>" + esc(r.name) + mark + "</div>" +
        "<div class='death-dates'>b. " + esc(r.born) + " — d. " + esc(r.died) + "</div>" +
        "<div class='death-cause'>" + esc(r.cause) + "</div>" +
        (r.note ? "<div class='death-note'>" + esc(r.note) + "</div>" : "") +
        "</div>";
    }).join("");
    return "<div class='panel-intro'>County register of deaths, as furnished to this facility. If a recipient appears below, Policy 14-A directs DESTROY. Amendments are not announced.</div>" +
      "<input class='rec-search' data-filter='.death-row' placeholder='SEARCH BY NAME…' spellcheck='false'>" + rows;
  }

  function pHelp() {
    return "" +
      "<div class='help-block'><div class='help-h'>THE PROCEDURE</div>" +
      "<div class='help-t'>1. TAKE the item. 2. FLIP it and read both sides. 3. VIEW CONTENTS and read. 4. VERIFY: check the sender's town in the ADDRESS REGISTRY, and (from Shift 2) every name against the DEATH RECORDS. 5. FORM 11, beneath the item, fills in as you verify and states what policy directs. 6. Stamp it into a tray. The DELIVER and REVIEW trays are sealed; do not ask about the DELIVER and REVIEW trays.</div></div>" +
      "<div class='help-block'><div class='help-h'>THE TRAYS</div>" +
      "<div class='help-t'><b>RETURN TO SENDER</b> — the item goes back where it came from. Policy P-06 directs this when the sender's town is ACTIVE in the registry.</div>" +
      "<div class='help-t'><b>ARCHIVE</b> — the item is kept here, on this facility's record, and can be re-read from the ARCHIVE shelf. Policy directs this for items with no verifiable sender (P-09), unrecognized towns (22-C), internal documents, and black-sealed items (P-40, unopened).</div>" +
      "<div class='help-t'><b>DESTROY</b> — the incinerator. From Shift 2, Policy 14-A directs this for all mail addressed to the deceased. Destroyed items are gone. Usually.</div></div>" +
      "<div class='help-block'><div class='help-h'>DEVIATIONS</div>" +
      "<div class='help-t'>You may stamp anything with anything. Deviations from policy are recorded and lower your COMPLIANCE INDEX; preserving what the office would rather forget raises MEMORY CONTAMINATION. Nothing stops you. Something notices.</div></div>" +
      "<div class='help-block'><div class='help-h'>ADVICE FOUND SCRATCHED UNDER THE DESK</div>" +
      "<div class='help-t'>Read everything twice. Check every name. The letters know more than the records do.</div></div>";
  }

  function pPolicy() {
    var rows = D.policies.filter(function (p) { return p.shift <= state.shiftIdx + 1; })
      .map(function (p) {
        return "<div class='policy-row'><div class='policy-id'>" + esc(p.id) + " — " + esc(p.title) + "</div>" +
          "<div class='policy-text'>" + esc(p.text) + "</div></div>";
      }).join("");
    return rows;
  }

  /* Small map glyphs, drawn at (x, y) in map coordinates. */
  function mapGlyph(id, x, y) {
    var ink = "#4f4326";
    switch (id) {
      case "church":
        return "<path d='M" + (x - 7) + " " + (y + 6) + " h14 v-8 l-7 -6 l-7 6 z' fill='" + ink + "'/>" +
               "<path d='M" + x + " " + (y - 9) + " v-7 M" + (x - 3) + " " + (y - 13) + " h6' stroke='" + ink + "' stroke-width='1.6'/>";
      case "cemetery":
        return "<path d='M" + (x - 5) + " " + (y + 6) + " v-8 a5 5 0 0 1 10 0 v8 z' fill='" + ink + "'/>" +
               "<path d='M" + x + " " + (y + 1) + " v-6 M" + (x - 2.5) + " " + (y - 3) + " h5' stroke='#b3a884' stroke-width='1.2'/>";
      case "orchard":
        return "<circle cx='" + x + "' cy='" + (y - 4) + "' r='6' fill='#5d6b45'/>" +
               "<rect x='" + (x - 1.5) + "' y='" + y + "' width='3' height='7' fill='" + ink + "'/>";
      case "canal":
        return "<path d='M" + (x - 10) + " " + y + " q5 -5 10 0 t10 0 M" + (x - 10) + " " + (y + 6) + " q5 -5 10 0 t10 0' stroke='#5b7069' stroke-width='2' fill='none'/>";
      case "district":
        return "<rect x='" + (x - 16) + "' y='" + (y - 6) + "' width='32' height='12' fill='#211d13'/>";
      case "bellhouse":
        return "<path d='M" + (x - 6) + " " + (y + 5) + " h12 v-7 l-6 -5 l-6 5 z' fill='#8e2b20'/>" +
               "<circle cx='" + x + "' cy='" + y + "' r='14' stroke='#8e2b20' stroke-width='1.6' fill='none' stroke-dasharray='3 2'/>";
      default: /* generic building */
        return "<path d='M" + (x - 6) + " " + (y + 5) + " h12 v-7 l-6 -5 l-6 5 z' fill='" + ink + "'/>";
    }
  }

  function pMap() {
    var locs = D.mapLocations.filter(function (m) { return m.revealed || (m.id === "bellhouse" && state.bellHouse); });
    var glyphs = locs.map(function (m) {
      var x = m.x * 6, y = m.y * 3.8;
      var labelFill = m.id === "bellhouse" ? "#8e2b20" : (m.redacted ? "#211d13" : "#574a2e");
      var label = m.redacted
        ? "<rect x='" + (x - 22) + "' y='" + (y + 10) + "' width='44' height='9' fill='#211d13'/>"
        : "<text x='" + x + "' y='" + (y + 19) + "' text-anchor='middle' font-size='9' letter-spacing='1' fill='" + labelFill + "'>" + esc(m.label) + "</text>";
      return mapGlyph(m.id, x, y) + label;
    }).join("");
    var svg = "" +
      "<svg class='mapsvg' viewBox='0 0 600 380'>" +
      /* parchment mottling */
      "<rect width='600' height='380' fill='#b3a884'/>" +
      "<ellipse cx='140' cy='90' rx='150' ry='90' fill='#bfb28c' opacity='.5'/>" +
      "<ellipse cx='470' cy='300' rx='170' ry='100' fill='#a59771' opacity='.4'/>" +
      "<ellipse cx='320' cy='180' rx='240' ry='150' fill='#b8ab85' opacity='.3'/>" +
      /* the creek */
      "<path d='M392 0 C398 60 372 110 396 170 C418 226 388 300 402 380' stroke='#6f7d6a' stroke-width='7' fill='none' opacity='.65'/>" +
      /* roads */
      "<path d='M72 251 L180 281 L312 209 L330 129 L132 99' stroke='#7d6f4d' stroke-width='2.4' fill='none' stroke-dasharray='6 3'/>" +
      "<path d='M312 209 L492 236 L444 296 L372 334' stroke='#7d6f4d' stroke-width='2.4' fill='none' stroke-dasharray='6 3'/>" +
      "<path d='M264 53 L228 160 L312 209' stroke='#7d6f4d' stroke-width='2' fill='none' stroke-dasharray='6 3'/>" +
      "<path d='M330 129 L420 76' stroke='#7d6f4d' stroke-width='2' fill='none' stroke-dasharray='6 3'/>" +
      glyphs +
      "<text x='16' y='24' font-size='13' letter-spacing='3' fill='#574a2e'>MARROW CREEK — SURVEY (WITHDRAWN)</text>" +
      "</svg>";
    var keyRows = locs.map(function (m) {
      var sym = "<svg viewBox='-14 -16 28 28' class='key-ic'>" + mapGlyph(m.id, 0, 0) + "</svg>";
      return "<div class='key-row" + (m.id === "bellhouse" ? " new" : "") + "'>" + sym + "<span>" +
        (m.redacted ? "UNKNOWN" : esc(m.label)) + "</span></div>";
    }).join("");
    var note = state.bellHouse
      ? "<div class='map-note'>A pin you did not place: 12 BRIAR LANE.</div>"
      : "<div class='map-note'>Parts of the map are faded, as if handled too often — or not often enough.</div>";
    return "<div class='mapwrap'><div class='wallmap'>" + svg + "</div>" +
      "<div class='mapkey'><div class='key-head'>KEY</div>" + keyRows + "</div></div>" + note;
  }

  function pNews() {
    var rows = D.newspaper.map(function (n) {
      return "<div class='news-row'>" +
        "<div class='news-mast'>" + esc(n.paper) + " — " + esc(n.date) + "</div>" +
        "<div class='news-head'>" + esc(n.head) + "</div>" +
        "<div class='news-body'>" + esc(n.body) + "</div>" +
        "</div>";
    }).join("");
    return "<div class='panel-intro'>Clippings furnished on microfilm, county library, as available. Some editions could not be located and were never printed, in that order.</div>" + rows;
  }

  function pArchive() {
    var archived = state.processed.filter(function (p) { return p.bin === "archive"; });
    if (!archived.length) return "<div class='panel-intro'>Nothing has been archived yet.</div>";
    if (state.readingArchived) {
      var item = getItem(state.readingArchived);
      var extra = "";
      if (state.readingArchived === "s2-08" && state.archiveChanged) {
        extra = "<p class='changed-line'>P.S. It is darker now.</p>";
        if (!state.archiveChangeSeen) {
          state.archiveChangeSeen = true;
          state.memory += 1;
          logLine("That line was not there when you archived it.", false);
        }
      }
      var uvHtml = item.uv ? "<p class='uv-text" + (state.uvOn ? " visible" : "") + "'>" + esc(item.uv) + "</p>" : "";
      return "<button class='mini' data-act='backarchive'>← BACK TO SHELF</button>" +
        "<div class='paper archived-paper " + ({ typed: "l-typed", hand: "l-hand", child: "l-child" }[item.style] || "l-hand") + "'>" +
        paras(item.body) + extra + uvHtml + "</div>";
    }
    var rows = archived.map(function (p) {
      var item = getItem(p.id);
      return "<button class='arch-row' data-read='" + p.id + "'>" + esc(item.env.to.join(", ")) +
        " <span class='arch-mark'>ARCHIVED</span></button>";
    }).join("");
    return "<div class='panel-intro'>Processed items may be re-read. Re-reading is not the same as remembering, but it is close.</div>" + rows;
  }

  /* ---------- printer / review / end ---------- */

  function rPrinter() {
    return "<div class='screen printer-screen'>" +
      "<div class='printer'>" +
      "<div class='printer-body'>OFFICE PRINTER — DO NOT LOAD PAPER<br>(there is no paper loaded)</div>" +
      "<pre class='printer-paper' id='printer-paper'></pre>" +
      "</div>" +
      "<button class='btn' id='printer-btn' data-act='printerdone' style='visibility:hidden'>TAKE THE PAGE</button>" +
      "</div>";
  }

  function memoryLevel() {
    return state.memory >= 6 ? "SEVERE" : state.memory >= 3 ? "ELEVATED" : "LOW";
  }

  function rReview() {
    var dev = state.deviations.length
      ? state.deviations.map(function (d) { return "<div class='dev-line'>" + esc(d) + "</div>"; }).join("")
      : "<div class='dev-line none'>No deviations recorded. The office thanks you. The office is watching you be thanked.</div>";
    var notes = "";
    if (state.flags.BlackEnvelopeOpened) notes += "<div class='dev-line'>Seal condition report: BROKEN. Noted.</div>";
    if (state.correctionFiled) notes += "<div class='dev-line'>One (1) correction request: DENIED. Noted.</div>";
    return "<div class='screen review-screen'><div class='memo-card'>" +
      "<div class='memo-head'>END OF SHIFT " + shiftDef().number + " — PERFORMANCE REVIEW</div>" +
      "<div class='review-stats'>" +
      "<div>COMPLIANCE INDEX: " + state.compliance + "</div>" +
      "<div>MEMORY CONTAMINATION: " + memoryLevel() + "</div>" +
      "<div>ARCHIVED " + state.counts.archive + " · DESTROYED " + state.counts.destroy + " · RETURNED " + state.counts["return"] + "</div>" +
      "</div>" +
      "<div class='memo-sub'>DEVIATIONS</div>" + dev + notes +
      "<div class='plain-note'>(For the record: COMPLIANCE is how closely you followed policy. MEMORY CONTAMINATION is how much of Marrow Creek you chose to keep. Different parties care about each.)</div>" +
      "<button class='btn' data-act='nextshift'>GO HOME. COME BACK TOMORROW.</button>" +
      "</div></div>";
  }

  function rEnd() {
    var lines = [];
    lines.push("The lamp is still on. The tray is empty. Tomorrow's mail is already waiting somewhere, being wrong.");
    if (state.flags.JonahLetterDestroyed && !state.flags.BurnedTwice) lines.push("Somewhere on Briar Lane, a boy has stopped knocking.");
    if (state.flags.BurnedTwice) lines.push("You burned it twice. The second time, it did not burn. The log says otherwise. Trust the log.");
    if (state.flags.JonahLetterArchived) lines.push("Three knocks. Then one. You will catch yourself listening for it, some nights, in your own hall.");
    if (state.bellHouse) lines.push("On the wall map, a small house holds its ground at the top of Briar Lane.");
    if (state.flags.BlackEnvelopeOpened) lines.push("Somewhere there is a photograph of you reading this. It is already yellowing.");
    if (state.counts.keep > 0) lines.push("The routing slip is in your coat pocket. Rule three worked. Remember rule two.");
    if (state.foundHiddenPS) lines.push("The knocks were for you.");

    return "<div class='screen end-screen'>" +
      "<div class='end-card'>" +
      "<div class='memo-head'>END OF THE SECOND SHIFT</div>" +
      paras(lines, "end-line") +
      "<div class='review-stats end-stats'>" +
      "<div>COMPLIANCE INDEX: " + state.compliance + "</div>" +
      "<div>MEMORY CONTAMINATION: " + memoryLevel() + "</div>" +
      "<div>ARCHIVED " + state.counts.archive + " · DESTROYED " + state.counts.destroy + " · RETURNED " + state.counts["return"] + (state.counts.keep ? " · KEPT " + state.counts.keep : "") + "</div>" +
      "</div>" +
      "<div class='plain-note'>(COMPLIANCE is how closely you followed policy. MEMORY is how much of the town you kept. Play again and choose differently — the office remembers differently.)</div>" +
      "<div class='end-title'>MARROW CREEK REMEMBERS YOU.</div>" +
      "<div class='end-sub'>DEAD LETTER OFFICE — the full night shift is still being sorted.</div>" +
      "<button class='btn' data-act='restart'>WORK THE SHIFTS AGAIN</button>" +
      "</div></div>";
  }

  function rModal() {
    return "<div class='modal-overlay'><div class='modal'>" +
      modalState.lines.map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") +
      "<div class='modal-btns'>" +
      modalState.buttons.map(function (b, i) {
        return "<button class='btn' data-modal='" + i + "'>" + esc(b.label) + "</button>";
      }).join("") +
      "</div></div></div>";
  }

  /* ------------------------------------------------ event binding */

  function bind() {
    $app.querySelectorAll("[data-act]").forEach(function (el) {
      el.addEventListener("click", function (ev) {
        var act = el.getAttribute("data-act");
        if (act === "closepanel" && ev.target !== el) return; // only direct overlay/btn clicks
        handleAct(act);
      });
    });
    $app.querySelectorAll("[data-stamp]").forEach(function (el) {
      el.addEventListener("click", function () {
        var s = el.getAttribute("data-stamp");
        if (s === "keep") keepItem(); else stampItem(s);
      });
    });
    $app.querySelectorAll("[data-panel]").forEach(function (el) {
      el.addEventListener("click", function () {
        if (el.classList.contains("locked")) {
          logLine("The drawer does not move. A slip reads: SECOND SHIFT.", false);
          render();
          return;
        }
        var p = el.getAttribute("data-panel");
        state.panel = p;
        state.readingArchived = null;
        if (p === "registry") {
          state.consulted.registry = true;
          if (state.tut >= 1 && state.tut < 5) state.tut = 5;
        }
        if (p === "deaths") state.consulted.deaths = true;
        render();
      });
    });
    $app.querySelectorAll("[data-read]").forEach(function (el) {
      el.addEventListener("click", function () {
        state.readingArchived = el.getAttribute("data-read");
        A.paper();
        render();
      });
    });
    $app.querySelectorAll("[data-modal]").forEach(function (el) {
      el.addEventListener("click", function () {
        var i = parseInt(el.getAttribute("data-modal"), 10);
        var b = modalState && modalState.buttons[i];
        if (b) b.fn();
      });
    });
    var stop = $app.querySelector("[data-stop]");
    if (stop) stop.addEventListener("click", function (ev) { ev.stopPropagation(); });

    /* record search: filter rows in place, no re-render (keeps input focus) */
    $app.querySelectorAll("input[data-filter]").forEach(function (input) {
      var sel = input.getAttribute("data-filter");
      input.addEventListener("input", function () {
        var q = input.value.toUpperCase();
        $app.querySelectorAll(sel).forEach(function (row) {
          row.style.display = row.textContent.toUpperCase().indexOf(q) >= 0 ? "" : "none";
        });
      });
    });

    /* orientation: pulse the next control */
    var target = tutTarget();
    if (target && !state.panel) {
      var t = $app.querySelector(target);
      if (t) t.classList.add("pulse");
    }
  }

  function handleAct(act) {
    switch (act) {
      case "new":        A.startHum(); newGame(); break;
      case "continue":   A.startHum(); continueGame(); break;
      case "sound":
        A.setEnabled(!A.isEnabled());
        if (A.isEnabled() && state.screen !== "title") A.startHum();
        render(); break;
      case "clockin":    clockIn(); break;
      case "take":       takeItem(); break;
      case "flip":       flipItem(); break;
      case "open":       openItem(); break;
      case "uv":         toggleUV(); break;
      case "closepanel": state.panel = null; state.readingArchived = null; render(); break;
      case "correct":    fileCorrection(); break;
      case "backarchive": state.readingArchived = null; render(); break;
      case "printerdone":
        if (window.__dlo_printer_next) { var n = window.__dlo_printer_next; window.__dlo_printer_next = null; n(); }
        break;
      case "nextshift":  startShift(1); break;
      case "finishfinal": finishFinal(); break;
      case "tutskip":    state.tut = 99; render(); break;
      case "sealed-deliver":
        logLine("The DELIVER tray is sealed by directorate order. There is nowhere to deliver to. Yet.", true);
        render(); break;
      case "sealed-review":
        logLine("REVIEW routes upstairs. The stairs are not installed.", true);
        render(); break;
      case "restart":    document.body.className = ""; A.startHum(); newGame(); break;
    }
  }

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && state && state.panel) {
      state.panel = null; state.readingArchived = null; render();
    }
  });

  /* ------------------------------------------------ boot */

  document.addEventListener("DOMContentLoaded", function () {
    $app = document.getElementById("app");
    state = freshState();
    render();
  });

  /* Development hook for automated smoke tests. */
  window.__dlo = {
    getState: function () { return state; },
    act: handleAct,
    stamp: function (bin) { if (bin === "keep") keepItem(); else stampItem(bin); },
    modalChoose: function (i) { if (modalState) modalState.buttons[i].fn(); },
    hasModal: function () { return !!modalState; }
  };
})();
