/* Desktop-only controls. The browser build ignores this file gracefully. */
(function () {
  "use strict";

  var desktop = window.deadLetterDesktop;
  if (!desktop || !desktop.isDesktop) return;

  document.documentElement.classList.add("desktop-build");

  function makeButton(label, action, className) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = className || "btn ghost";
    button.textContent = label;
    button.setAttribute("data-desktop-action", action);
    return button;
  }

  function addTitleHint() {
    var footnote = document.querySelector(".title-screen .footnote");
    if (!footnote || footnote.querySelector(".desktop-hint")) return;

    var hint = document.createElement("span");
    hint.className = "desktop-hint";
    hint.textContent = " · F11 or Alt+Enter: fullscreen";
    footnote.appendChild(hint);
  }

  function enhanceMenu() {
    var restartButton = Array.prototype.find.call(
      document.querySelectorAll("button"),
      function (button) {
        return button.textContent.trim() === "RESTART FROM SHIFT 1";
      }
    );

    if (!restartButton) return;

    var container = restartButton.parentElement;
    if (!container || container.querySelector("[data-desktop-action]")) return;

    var fullscreen = makeButton("TOGGLE FULLSCREEN", "fullscreen", "btn ghost");
    var quit = makeButton("EXIT TO DESKTOP", "quit", "btn ghost desktop-exit");

    container.appendChild(fullscreen);
    container.appendChild(quit);
  }

  function enhance() {
    addTitleHint();
    enhanceMenu();
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-desktop-action]");
    if (!button) return;

    var action = button.getAttribute("data-desktop-action");
    if (action === "fullscreen") {
      desktop.toggleFullscreen();
    } else if (action === "quit") {
      desktop.quit();
    }
  });

  var observer = new MutationObserver(function () {
    window.requestAnimationFrame(enhance);
  });

  function start() {
    var app = document.getElementById("app");
    if (!app) return;
    observer.observe(app, { childList: true, subtree: true });
    enhance();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
