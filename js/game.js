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
    render();
  }

  function flipItem() {
    A.paper();
    state.flipped = !state.flipped;
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
    if (item.kind === "final") {
      state.finalRead = true;
    }
    render();
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
    if (bin === "destroy") setTimeout(function () { A.burn(); }, 250);

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

    if (item.anomaly) logLine(item.anomaly, true);
    if (id === "s2-11" && bin === "destroy") {
      logLine("ITEM DID NOT BURN. ITEM IS RECORDED AS DESTROYED.", true);
      state.flags.BurnedTwice = true;
    }
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
      "<div class='workspace' id='workspace'>" + rWorkspace() + "</div>" +
      rStamps() +
      "</div>" +
      rLog() +
      (state.panel ? rPanel() : "") +
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
    var uv = hasUnlock("uv");
    return "<div class='sidebar'>" +
      "<div class='side-label'>REFERENCE</div>" +
      "<button class='side-btn' data-panel='registry'>ADDRESS REGISTRY</button>" +
      "<button class='side-btn" + (deaths ? "" : " locked") + "' data-panel='deaths'>" + (deaths ? "REGISTER OF DEATHS" : "REGISTER OF DEATHS — LOCKED") + "</button>" +
      "<button class='side-btn' data-panel='policy'>POLICY MANUAL</button>" +
      "<button class='side-btn' data-panel='map'>WALL MAP</button>" +
      "<button class='side-btn' data-panel='archive'>ARCHIVE</button>" +
      "<div class='side-label'>TOOLS</div>" +
      (uv ? "<button class='side-btn uv-btn" + (state.uvOn ? " on" : "") + "' data-act='uv'>UV LAMP " + (state.uvOn ? "· ON" : "· OFF") + "</button>"
          : "<div class='side-note'>Letter opener. Three stamps. A lamp.</div>") +
      "</div>";
  }

  function rWorkspace() {
    if (state.itemIdx >= state.queue.length) return "<div class='tray-empty'>The tray is empty.</div>";
    var item = currentItem();
    if (state.phase === "tray") {
      return "<div class='tray'>" +
        "<div class='tray-label'>INCOMING TRAY</div>" +
        "<div class='tray-item'>" + esc(item.label) + "</div>" +
        "<button class='btn' data-act='take'>TAKE ITEM</button>" +
        "</div>";
    }
    if (state.phase === "envelope") return rEnvelope(item);
    return rLetter(item);
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
    return "<div class='envelope " + (item.kind === "black" ? "black" : "") + (item.kind === "burned" ? " burned" : "") + "'>" +
      (state.flipped ? back : front) +
      "</div>" +
      "<div class='env-actions'>" +
      "<button class='btn' data-act='flip'>" + (state.flipped ? "FLIP TO FRONT" : "FLIP OVER") + "</button>" +
      "<button class='btn' data-act='open'>" + (item.sealed ? "THE SEAL…" : "OPEN") + "</button>" +
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
      "<div class='letter-envline'>" + esc(item.env.to.join(", ")) + " · " + esc(item.env.postmark) + "</div>" +
      "<div class='paper " + cls + (item.kind === "burned" ? " burned" : "") + "'>" +
      paras(item.body) + uvHtml +
      "</div>" + footer +
      "</div>";
  }

  function rStamps() {
    var item = state.itemIdx < state.queue.length ? currentItem() : null;
    var active = item && state.phase !== "tray";
    var dis = active ? "" : " disabled";
    var keep = (item && item.keepable && active)
      ? "<button class='stamp-btn keep' data-stamp='keep'>POCKET<br><span>KEEP IT</span></button>" : "";
    return "<div class='stampbar'>" +
      "<div class='side-label'>STAMPS</div>" +
      "<button class='stamp-btn ret" + "'" + dis + " data-stamp='return'>RETURN<br><span>TO SENDER</span></button>" +
      "<button class='stamp-btn arc'" + dis + " data-stamp='archive'>ARCHIVE<br><span>PRESERVE</span></button>" +
      "<button class='stamp-btn des'" + dis + " data-stamp='destroy'>DESTROY<br><span>INCINERATE</span></button>" +
      keep +
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
             policy: "POLICY MANUAL", map: "WALL MAP — MARROW CREEK", archive: "ARCHIVE — PROCESSED ITEMS" }[state.panel] || "";
  }

  function pRegistry() {
    var rows = D.registry.map(function (r) {
      var cls = r.status === "ACTIVE" ? "ok" : "bad";
      var extra = "";
      if (r.town === "MARROW CREEK") {
        extra = state.correctionFiled
          ? "<div class='reg-denied'>CORRECTION REQUEST: DENIED. DO NOT RESUBMIT.</div>"
          : "<button class='mini' data-act='correct'>FILE CORRECTION REQUEST</button>";
      }
      return "<div class='reg-row'><span class='reg-town'>" + esc(r.town) + "</span>" +
        "<span class='reg-status " + cls + "'>" + esc(r.status) + "</span>" +
        "<span class='reg-note'>" + esc(r.note) + "</span>" + extra + "</div>";
    }).join("");
    return "<div class='panel-intro'>All municipalities recognized by the county appear below. The registry is complete. The registry has always been complete.</div>" + rows;
  }

  function pDeaths() {
    var rows = D.deathRecords.map(function (r) {
      return "<div class='death-row'>" +
        "<div class='death-name'>" + esc(r.name) + "</div>" +
        "<div class='death-dates'>b. " + esc(r.born) + " — d. " + esc(r.died) + "</div>" +
        "<div class='death-cause'>" + esc(r.cause) + "</div>" +
        (r.note ? "<div class='death-note'>" + esc(r.note) + "</div>" : "") +
        "</div>";
    }).join("");
    return "<div class='panel-intro'>County register of deaths, as furnished to this facility. Amendments are not announced.</div>" + rows;
  }

  function pPolicy() {
    var rows = D.policies.filter(function (p) { return p.shift <= state.shiftIdx + 1; })
      .map(function (p) {
        return "<div class='policy-row'><div class='policy-id'>" + esc(p.id) + " — " + esc(p.title) + "</div>" +
          "<div class='policy-text'>" + esc(p.text) + "</div></div>";
      }).join("");
    return rows;
  }

  function pMap() {
    var dots = D.mapLocations.filter(function (m) { return m.revealed || (m.id === "bellhouse" && state.bellHouse); })
      .map(function (m) {
        var cls = m.redacted ? "redacted" : (m.id === "bellhouse" ? "new" : "");
        return "<div class='map-dot " + cls + "' style='left:" + m.x + "%;top:" + m.y + "%'>" +
          "<span class='dot'></span><span class='map-label'>" + esc(m.label) + "</span></div>";
      }).join("");
    var note = state.bellHouse
      ? "<div class='map-note'>A pin you did not place: 12 BRIAR LANE.</div>"
      : "<div class='map-note'>Parts of the map are faded, as if handled too often — or not often enough.</div>";
    return "<div class='wallmap'><div class='map-title'>MARROW CREEK — SURVEY (WITHDRAWN)</div>" + dots +
      "<div class='map-creek'></div></div>" + note;
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
        state.panel = el.getAttribute("data-panel");
        state.readingArchived = null;
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
