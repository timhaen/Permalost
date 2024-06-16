const backgrounds = [
  "bilder/1_1.png",
  "bilder/europa_plus_ps.png",
  "bilder/alaska_plus_ps.png",
  "bilder/4_1.png",
  "bilder/5_1.png",
  "bilder/6_1.jpg",
  "bilder/7_1.jpg",
];

const sequenceVideos = [
  "video/europa_plus.mp4",
  "video/alaska_plus.mp4",
  "video/sibirien_plus.mp4",
  "video/batagaika_plus.mp4",
  "video/bondo_plus.mp4",
  "video/atqasuk_plus.mp4",
];

const textboxContents = [
  {
    title: "",
    content:
      "Gut fünf Prozent der Fläche der Schweiz beinhaltet Perma&shy;frost. Zu finden ist der dauerhaft gefrorene Boden in der Schweiz oberhalb von etwa 2500 Metern über Meer.<br/ >Im Schweizerischen Nationalpark ist rund ein Drittel von Permafrost und Blockgletschern geprägt. Durch den Klimawandel ist die Durchschnitts&shy;temperatur an der Klimastation Buffalora in den letzten hundert Jahren um fast zwei Grad Celsius gestiegen. Die Auftauschicht im Boden nimmt zu und die Berge werden instabil.",
    class: "textbox-intro",
  },
  {
    title: "Permafrost",
    content:
      "Als Permafrost wird Boden bezeichnet, dessen Temperatur in der Tiefe für mindestens zwei Jahre unter null Grad Celsius liegt und der aus Eis, Gestein und organischem Material besteht. Die Permafrostschicht kann wenige Meter bis mehrere hundert Meter dick sein,wobei der oberste Teil im Sommer auftaut und im Winter wieder gefriert. Dieser Teil wird als aktive Schicht bezeichnet.",
    class: "textbox-permafrost",
  },
  {
    title: "Alaska, Kanada + Grönland",
    content:
      "Die Landmassen von Alaska befinden sich etwa zu 80% in der Permafrostzone. In Kanada ist 65% der Böden Dauerfrostboden und in Grönland 99%.",
    class: "textbox-alaska",
  },
  {
    title: "Sibirien + Skandinavien",
    content:
      "Die Landmassen von Russland befinden sich etwa zu 65% in der Permafrostzone. In Skandinavien ist 2.2% der Böden Dauerfrostboden und in China etwa 20%.",
    class: "textbox-sibirien",
  },
  {
    title: "Bodenabsenkung",
    content:
      "Durch den Temperaturanstieg in Permafrostgebieten schmilzt das Eis im Boden und es entstehen Hohlräume, die bei einem Einsturz den Boden absacken lassen. Das geschmolzene Eis tritt als Wasser an die Oberfläche und bildet kleine Seen und Teiche, die die einzigartige Permafrostlandschaft bilden, aber auch Gebäude und Infrastruktur gefährden.",
    class: "textbox-bodenabsackung",
  },
  {
    title: "Murgänge und Felsstürze",
    content:
      "Zusätzlich erhöht sich in den hochalpinen Gebieten das Risiko von Felsstürzen aufgrund der instabileren Beschaffenheiten der Berge.",
    class: "textbox-murgang",
  },
  {
    title: "Freisetzung von Treibhausgasen",
    content:
      "Schätzungen zufolge sind in den Permafrost&shy;gebieten weltweit 1700 Gigatonnen Kohlenstoff in Form von organischem Material gespeichert. Dieser Wert entspricht mehr als der doppelten Menge Kohlenstoff die aktuell in der Atmosphäre gespeichert ist. Mit dem Auftauen beginnen Mikroorganismen dieses organische Material abzubauen, wodurch Kohlendioxid und Methan in die Atmosphäre freigesetzt werden. Die freigesetzten Treibhausgase treiben den Klimawandel weiter voran.",
    class: "textbox-treibhausgas",
  },
];

let currentBackgroundIndex = 0;
let currentTextbox;

// Funktion zum Aktualisieren des Hintergrundbilds und der Textbox
function updateBackgroundAndTextbox() {
  console.log("Index: " + currentBackgroundIndex); // Ausgabe des aktuellen Index in der Konsole
  document.body.style.backgroundImage = `url('${backgrounds[currentBackgroundIndex]}')`;

  // Entferne die vorherige Textbox, falls vorhanden
  if (currentTextbox) currentTextbox.remove();

  // Erstelle und positioniere die neue Textbox
  const textboxConfig = textboxContents[currentBackgroundIndex];
  const textbox = document.createElement("div");
  textbox.classList.add("textbox", textboxConfig.class);
  textbox.innerHTML = `<h2 class="textbox-title">${textboxConfig.title}</h2><p class="textbox-content">${textboxConfig.content}</p>`;
  document.body.appendChild(textbox);
  currentTextbox = textbox;

  // Zeige die SVGs an, wenn die entsprechenden Bilder angezeigt werden
  const overlaySVG0 = document.getElementById("overlaySVG0");


  const overlaySVG1 = document.getElementById("overlaySVG1");

  const overlaySVG2 = document.getElementById("overlaySVG2");

  const overlaySVG3 = document.getElementById("overlaySVG3");

  const overlaySVG4 = document.getElementById("overlaySVG4");

  const overlaySVG5 = document.getElementById("overlaySVG5");

  const overlaySVG6 = document.getElementById("overlaySVG6");

  const nextButtonText1 = document.getElementById("button-next-text1");
  const nextButtonText2 = document.getElementById("button-next-text2");
  const linkButtonText = document.getElementById("button-link-text");

  if (currentBackgroundIndex === 0) {
    overlaySVG0.style.opacity = "1";
    backButton.style.opacity = "0";
    linkButton.querySelector("img").src = "grafische_elemente/pfeil_link.svg";
    linkButtonText.style.opacity = "1";
    nextButtonText1.style.opacity = "1";
  } else {
    overlaySVG0.style.opacity = "0";
    backButton.style.opacity = "1";
    linkButtonText.style.opacity = "0";
    nextButtonText1.style.opacity = "0";
  }

  if (currentBackgroundIndex === 1) {
    overlaySVG2.style.opacity = "1";
  } else {
    overlaySVG2.style.opacity = "0";
  }

  if (currentBackgroundIndex === 2) {
    overlaySVG1.style.opacity = "1";
  } else {
    overlaySVG1.style.opacity = "0";
  }

  if (currentBackgroundIndex === 3) {
    overlaySVG3.style.opacity = "1";
  } else {
    overlaySVG3.style.opacity = "0";
  }

  if (currentBackgroundIndex === 4) {
    overlaySVG4.style.opacity = "1";
    buttonNext.style.textShadow = "2px 2px 8px #000000";
  } else {
    overlaySVG4.style.opacity = "0";
  }

  if (currentBackgroundIndex === 5) {
    overlaySVG5.style.opacity = "1";
  } else {
    overlaySVG5.style.opacity = "0";
  }

  if (currentBackgroundIndex === 6) {
    overlaySVG6.style.opacity = "1";
    nextButtonText2.style.opacity = "1";
    linkButton.style.opacity = "0";
    nextButton.style.opacity = "0";
    nextButton.remove(); // Lösche den nextButton
    nextLinkButton.style.display = "block"; // Zeige den nextLinkButton an
  } else {
    overlaySVG6.style.opacity = "0";
    nextButtonText2.style.opacity = "0";
    linkButton.style.opacity = "1";
    nextLinkButton.style.display = "none"; // Verstecke den nextLinkButton
  }
}

// Button-Elemente auswählen

const nextButton = document.querySelector(".button-next");
const backButton = document.querySelector(".button-back");
const linkButton = document.querySelector(".button-link");
const nextLinkButton = document.querySelector(".button-next-link");
const sequenceVideo = document.getElementById("sequenceVideo");

let isVideoPlaying = false; // Variable zum Überprüfen, ob das Video gerade abgespielt wird

// Funktion zum Anzeigen des Sequenzvideos und Aktualisieren des Hintergrunds
function playSequenceAndUpdateBackground() {
  isVideoPlaying = true; // Setze isVideoPlaying auf true, wenn das Video abgespielt wird

  // Entferne SVGs, bevor das Video abgespielt wird
  document.getElementById("overlaySVG0").style.opacity = "0";
  document.getElementById("overlaySVG1").style.opacity = "0";
  document.getElementById("overlaySVG2").style.opacity = "0";
  document.getElementById("overlaySVG3").style.opacity = "0";
  document.getElementById("overlaySVG4").style.opacity = "0";
  document.getElementById("overlaySVG5").style.opacity = "0";
  document.getElementById("overlaySVG6").style.opacity = "0";

  sequenceVideo.src = sequenceVideos[currentBackgroundIndex];
  sequenceVideo.style.display = "block";
  sequenceVideo.play();

  sequenceVideo.onended = () => {
    sequenceVideo.style.display = "none";
    currentBackgroundIndex++;
    isVideoPlaying = false; // Setze isVideoPlaying auf false, wenn das Video beendet ist
    updateBackgroundAndTextbox();
  };
}

// Hintergrundbild und Textbox beim Klick auf den nächsten Button aktualisieren
nextButton.addEventListener("click", function () {
  if (isVideoPlaying) {
    sequenceVideo.pause(); // Pausiere das Video, wenn es abgespielt wird
    sequenceVideo.style.display = "none";
    currentBackgroundIndex++;
    isVideoPlaying = false; // Setze isVideoPlaying auf false, wenn das Video angehalten wird
    updateBackgroundAndTextbox();
    console.log("Index: " + currentBackgroundIndex)
  } else {
    // Entferne die vorherige Textbox, falls vorhanden
    if (currentTextbox) currentTextbox.remove();

    // Verstecke die Texte "Einleitung überspringen" und "Entdecken"
    document.getElementById("button-link-text").style.opacity = "0";
    document.getElementById("button-next-text1").style.opacity = "0";

    // Entferne SVGs, bevor das nächste Bild oder Video angezeigt wird
    document.getElementById("overlaySVG1").style.opacity = "0";
    document.getElementById("overlaySVG2").style.opacity = "0";
    document.getElementById("overlaySVG3").style.opacity = "0";

    if (currentBackgroundIndex < sequenceVideos.length) {
      playSequenceAndUpdateBackground();
    } else {
      currentBackgroundIndex++;
      updateBackgroundAndTextbox();
    }
  }
});

// Hintergrundbild und Textbox beim Klick auf den vorherigen Button aktualisieren
backButton.addEventListener("click", function () {
  currentBackgroundIndex =
    (currentBackgroundIndex - 1 + backgrounds.length) % backgrounds.length;
  updateBackgroundAndTextbox();
  console.log("Index: " + currentBackgroundIndex)

});

// Funktion zum Initialisieren des Hintergrundbilds und der Textbox
function startSlideshow() {
  document.querySelector("#introVideo").style.display = "none";
  document.querySelector(".button-next").style.display = "block";
  document.querySelector(".button-back").style.display = "block";
  document.querySelector(".button-link").style.display = "block";
  updateBackgroundAndTextbox();
}

// Initialisierung des Hintergrundbilds und der Textbox
function fadeOutVideoOverlay() {
  const videoOverlay = document.querySelector("#videoOverlay");
  videoOverlay.style.transition = "opacity 0.5s"; // Optional: Transition-Effekt
  videoOverlay.style.opacity = "0";
}

// Überwache das Intro-Video, um das Overlay kurz vor dem Ende auszublenden
const introVideo = document.getElementById("introVideo");
introVideo.addEventListener("timeupdate", function() {
  if (introVideo.currentTime >= introVideo.duration - 0.5) { // 0.5 Sekunden vor Ende
    fadeOutVideoOverlay();
  }
});

// Start der Slideshow, wenn das Intro-Video endet
introVideo.addEventListener("ended", startSlideshow);


document.getElementById("introVideo").addEventListener("ended", startSlideshow);
