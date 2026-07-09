/* Dead Letter Office — synthesized audio. No sound files.
   Fluorescent hum, paper, rubber stamps, the printer, the lights going out. */

var DLO = window.DLO || {};

DLO.Audio = (function () {
  var ctx = null;
  var enabled = true;
  var humGain = null;
  var humNodes = [];

  function ensure() {
    if (!enabled) return null;
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { enabled = false; return null; }
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function noiseBuffer(seconds) {
    var c = ensure(); if (!c) return null;
    var buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* Continuous fluorescent hum + faint room tone */
  function startHum() {
    var c = ensure(); if (!c || humGain) return;
    humGain = c.createGain();
    humGain.gain.value = 0.0;
    humGain.connect(c.destination);

    var o1 = c.createOscillator();
    o1.type = "sawtooth"; o1.frequency.value = 120;
    var g1 = c.createGain(); g1.gain.value = 0.012;
    o1.connect(g1); g1.connect(humGain);

    var o2 = c.createOscillator();
    o2.type = "sine"; o2.frequency.value = 60;
    var g2 = c.createGain(); g2.gain.value = 0.02;
    o2.connect(g2); g2.connect(humGain);

    var src = c.createBufferSource();
    src.buffer = noiseBuffer(2); src.loop = true;
    var f = c.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 240;
    var g3 = c.createGain(); g3.gain.value = 0.03;
    src.connect(f); f.connect(g3); g3.connect(humGain);

    o1.start(); o2.start(); src.start();
    humNodes = [o1, o2, src];
    humGain.gain.linearRampToValueAtTime(1.0, c.currentTime + 2.5);
  }

  function stopHum(fadeSeconds) {
    if (!ctx || !humGain) return;
    var t = ctx.currentTime;
    humGain.gain.cancelScheduledValues(t);
    humGain.gain.setValueAtTime(humGain.gain.value, t);
    humGain.gain.linearRampToValueAtTime(0.0, t + (fadeSeconds || 0.15));
    var nodes = humNodes, g = humGain;
    humNodes = []; humGain = null;
    setTimeout(function () {
      nodes.forEach(function (n) { try { n.stop(); } catch (e) {} });
      try { g.disconnect(); } catch (e) {}
    }, ((fadeSeconds || 0.15) + 0.2) * 1000);
  }

  function flickerHum() {
    if (!ctx || !humGain) return;
    var t = ctx.currentTime;
    humGain.gain.cancelScheduledValues(t);
    humGain.gain.setValueAtTime(1.0, t);
    humGain.gain.linearRampToValueAtTime(0.1, t + 0.05);
    humGain.gain.linearRampToValueAtTime(1.0, t + 0.12);
    humGain.gain.linearRampToValueAtTime(0.2, t + 0.22);
    humGain.gain.linearRampToValueAtTime(1.0, t + 0.4);
  }

  /* Short filtered-noise swish for paper */
  function paper() {
    var c = ensure(); if (!c) return;
    var src = c.createBufferSource();
    src.buffer = noiseBuffer(0.25);
    var f = c.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 3200; f.Q.value = 0.6;
    var g = c.createGain();
    g.gain.setValueAtTime(0.0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.16, c.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start();
  }

  /* Rubber stamp: thump + slap */
  function stamp() {
    var c = ensure(); if (!c) return;
    var o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(140, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(45, c.currentTime + 0.09);
    var g = c.createGain();
    g.gain.setValueAtTime(0.5, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.14);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + 0.16);

    var src = c.createBufferSource();
    src.buffer = noiseBuffer(0.08);
    var f = c.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 1800;
    var g2 = c.createGain();
    g2.gain.setValueAtTime(0.25, c.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07);
    src.connect(f); f.connect(g2); g2.connect(c.destination);
    src.start();
  }

  /* Letter opener tearing the flap */
  function tear() {
    var c = ensure(); if (!c) return;
    var src = c.createBufferSource();
    src.buffer = noiseBuffer(0.35);
    var f = c.createBiquadFilter();
    f.type = "highpass"; f.frequency.value = 1200;
    var g = c.createGain();
    g.gain.setValueAtTime(0.0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.2, c.currentTime + 0.05);
    g.gain.linearRampToValueAtTime(0.08, c.currentTime + 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.33);
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start();
  }

  /* Dot-matrix printer chatter */
  function printer(durationMs, done) {
    var c = ensure();
    if (!c) { if (done) setTimeout(done, durationMs); return; }
    var end = c.currentTime + durationMs / 1000;
    var t = c.currentTime;
    while (t < end) {
      var o = c.createOscillator();
      o.type = "square";
      o.frequency.value = 700 + Math.random() * 900;
      var g = c.createGain();
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.035);
      t += 0.045;
    }
    if (done) setTimeout(done, durationMs);
  }

  /* Low incinerator whump */
  function burn() {
    var c = ensure(); if (!c) return;
    var src = c.createBufferSource();
    src.buffer = noiseBuffer(0.9);
    var f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(300, c.currentTime);
    f.frequency.exponentialRampToValueAtTime(90, c.currentTime + 0.8);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.3, c.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.85);
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start();
  }

  function setEnabled(on) {
    enabled = on;
    if (!on) stopHum(0.1);
  }

  return {
    startHum: startHum,
    stopHum: stopHum,
    flickerHum: flickerHum,
    paper: paper,
    stamp: stamp,
    tear: tear,
    printer: printer,
    burn: burn,
    setEnabled: setEnabled,
    isEnabled: function () { return enabled; }
  };
})();

window.DLO = DLO;
