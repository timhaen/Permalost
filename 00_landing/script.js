document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.querySelector(".overlay");
  const backgroundBlur = document.querySelector(".overlay-background-blur");
  const creditsButton = document.querySelector("#credits-btn");

  creditsButton.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevent the event from bubbling up to the document
    overlay.style.display = overlay.style.display === "none" ? "flex" : "none";
    backgroundBlur.style.display = backgroundBlur.style.display === "none" ? "block" : "none";
  });

  document.addEventListener("click", function (event) {
    if (
      overlay.style.display === "flex" &&
      !overlay.contains(event.target) &&
      !creditsButton.contains(event.target)
    ) {
      overlay.style.display = "none";
      backgroundBlur.style.display = "none";
    }
  });
});
