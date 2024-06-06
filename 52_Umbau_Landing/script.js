function loadScript(scriptUrl, callback) {
  const script = document.createElement("script");
  script.src = scriptUrl;
  script.onload = callback;
  document.body.appendChild(script);
}

const rangeSlider = document.getElementById("rs-range-line");
const rangeBullet = document.getElementById("rs-bullet");

function updateContent(year) {
  const activeButton = document.querySelector("button.active");
  if (activeButton) {
    const activeButtonId = activeButton.id;
    if (
      (activeButtonId === "btn-grndtmp" || activeButtonId === "grndtmp-btn-aktuell") &&
      typeof loadGrndtmpAktuell === "function"
    ) {
      loadGrndtmpAktuell(year);
    } else if (
      (activeButtonId === "btn-alt" || activeButtonId === "alt-btn-aktuell") &&
      typeof loadAltAktuell === "function"
    ) {
      loadAltAktuell(year);
    }
  }
}

function activateButton(activeButtonId) {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    if (button.id === activeButtonId) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  const beschreibungGrndtmp = document.querySelector(".beschreibung-container-grndtmp");
  const beschreibungAlt = document.querySelector(".beschreibung-container-alt");

  if (activeButtonId === "btn-grndtmp") {
    beschreibungGrndtmp.style.display = "block";
    beschreibungAlt.style.display = "none";
  } else if (activeButtonId === "btn-alt") {
    beschreibungGrndtmp.style.display = "none";
    beschreibungAlt.style.display = "block";
  }
}

function clearOldData() {
  d3.select("#map").selectAll("svg").remove();
  d3.select(".bar-chart").selectAll("svg").remove();
}

function handleGrndtmpClick() {
  clearOldData();
  loadScript("grndtmp_aktuell.js", () => {
    activateButton("btn-grndtmp");
    updateContent(rangeSlider ? rangeSlider.value : "1997");
  });
  hideOverlay(); // Overlay ausblenden
}

function handleAltClick() {
  clearOldData();
  loadScript("alt_aktuell.js", () => {
    activateButton("btn-alt");
    updateContent(rangeSlider ? rangeSlider.value : "1997");
  });
  hideOverlay(); // Overlay ausblenden
}

function showOverlay() {
  const overlay = document.getElementById("overlay-home");
  overlay.style.display = "block";
}

function hideOverlay() {
  const overlay = document.getElementById("overlay-home");
  overlay.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  // Show overlay on initial load
  showOverlay();

  // Bind event listeners for index.html buttons
  const btnGrndtmp = document.getElementById("btn-grndtmp");
  const btnAlt = document.getElementById("btn-alt");

  if (btnGrndtmp && btnAlt) {
    btnGrndtmp.addEventListener("click", handleGrndtmpClick);
    btnAlt.addEventListener("click", handleAltClick);
  }

  // Bind event listeners for home.html buttons
  const btnGrndtmpAktuell = document.getElementById("grndtmp-btn-aktuell");
  const btnAltAktuell = document.getElementById("alt-btn-aktuell");

  if (btnGrndtmpAktuell && btnAltAktuell) {
    btnGrndtmpAktuell.addEventListener("click", handleGrndtmpClick);
    btnAltAktuell.addEventListener("click", handleAltClick);
  }

  // Home button navigation
  const btnHome = document.getElementById("btn-home");
  if (btnHome) {
    btnHome.addEventListener("click", showOverlay);
  }

  // Range slider event listener
  if (rangeSlider) {
    rangeSlider.addEventListener("input", () => {
      const year = rangeSlider.value;
      rangeBullet.innerHTML = year;
      updateContent(year);
    });
  }

});
