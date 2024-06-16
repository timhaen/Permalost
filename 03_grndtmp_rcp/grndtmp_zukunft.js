const rangeSlider = document.getElementById("rs-range-line");

rangeSlider.addEventListener(
  "input",
  () => {
    const year = rangeSlider.value;
    loadPermafrostData(year);
  },
  false
);

// Set dimensions for SVG
const width = window.innerWidth / 3;
const height = window.innerHeight;
const gridSize = 10;
const svgIds = ["#map1", "#map2", "#map3"];
const projections = [];
const rcpValues = ["rcp26", "rcp45", "rcp85"];

function drawMap(svg, projection) {
  const path = d3.geoPath().projection(projection);

  // Load and draw the world map
  d3.json("../data/world.json").then(function (data) {
    const features = data.features;

    // Create gradient for atmosphere
    const gradient = svg
      .append("defs")
      .append("radialGradient")
      .attr("id", "atmosphere-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")
      .attr("fx", "50%")
      .attr("fy", "50%");

    gradient
      .append("stop")
      .attr("offset", "80%")
      .attr("stop-color", "rgb(150, 150, 190)");

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgb(40, 40, 40)");

    // Draw atmosphere
    svg
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 10 * 7.5)
      .attr("r", projection.scale() * 1.05)
      .attr("fill", "url(#atmosphere-gradient)");

    // Draw the Earth
    svg
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 10 * 7.5)
      .attr("r", projection.scale())
      .attr("fill", "rgb(40, 40, 40)");

    // Draw land masses
    svg
      .selectAll("path")
      .data(features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", "rgb(60,60,60)")
      .style("stroke-width", 0.4)
      .style("stroke", "rgb(80,80,80)");
  });
}

function initializeMaps() {
  svgIds.forEach((svgId, index) => {
    const svg = d3
      .select(svgId)
      .attr("width", width)
      .attr("height", height);
    const projection = d3
      .geoOrthographic()
      .translate([width / 2, height / 10 * 7.5])
      .scale(height / 10 * 7)
      .rotate([270, -55, 0]) // Arctic center (Longitude, Latitude, Roll)
      .clipAngle(89);
    projections.push(projection);
    drawMap(svg, projection);
  });

  // Add drag functionality to all maps
  let currentRotation = projections[0].rotate();

  d3.selectAll("svg").call(d3.drag().on('drag', (event) => {
    const k = -75 / projections[0].scale(); // sensitivity factor
    currentRotation[0] -= event.dx * k;
    projections.forEach((projection, index) => {
      projection.rotate(currentRotation);
      const path = d3.geoPath().projection(projection);
      d3.select(svgIds[index]).selectAll("path").attr("d", path);
    });
    loadPermafrostData(rangeSlider.value); // Reload data to reflect new rotation
  }));

  // Load initial data after the maps are drawn
  setTimeout(() => {
    loadPermafrostData(rangeSlider.value);
  }, 1);

  // Add legend and slider elements
  addLegend();
  addSliderElements();
}

function loadPermafrostData(year) {
  d3.csv("../data/grndtmp_future_1990_2100.csv").then(function (data) {
    data.forEach(function (d, i) {
      d.year = parseInt(d.year);
      d.lon = parseFloat(d.x);
      d.lat = parseFloat(d.y);
      d.rcp26 = parseFloat(d.rcp26);
      d.rcp45 = parseFloat(d.rcp45);
      d.rcp85 = parseFloat(d.rcp85);
      d.index = i;
    });

    // Filter data based on the selected year
    const filteredData = data.filter(d => d.year === parseInt(year));

    svgIds.forEach((svgId, index) => {
      const rcpValue = rcpValues[index];
      const categoryThresholds = d3
        .scaleQuantile()
        .domain([-22, 7])
        .range([1, 2, 3, 4, 5, 6, 7, 8]);

      const svg = d3.select(svgId);
      const projection = projections[index];

      const gridData = filteredData.map((d) => {
        const coordinates = projection([d.lon, d.lat]);
        return {
          ...d,
          value: d[rcpValue],
          gridX: Math.round(coordinates[0] / gridSize) * gridSize,
          gridY: Math.round(coordinates[1] / gridSize) * gridSize,
        };
      });

      // Reduce data to unique grid points to avoid overlap
      const uniqueGridData = Array.from(
        new Set(gridData.map((d) => `${d.gridX},${d.gridY}`))
      ).map((key) => {
        const [gridX, gridY] = key.split(",").map(Number);
        return gridData.find(
          (d) => d.gridX === gridX && d.gridY === gridY
        );
      });

      const r = 5;
      const strokeWidth = 1.5;

      // Remove old elements
      svg.selectAll(".permafrost").remove();

      // Add new elements as crosses
      uniqueGridData.forEach((d) => {
        const color = getColor(categoryThresholds(d.value));
        const lineLength = 10; // Length of the lines forming the cross

        svg
          .append("line")
          .attr("class", "permafrost")
          .attr("x1", d.gridX - lineLength / 2)
          .attr("y1", d.gridY)
          .attr("x2", d.gridX)
          .attr("y2", d.gridY - lineLength / 2)
          .attr("stroke", color)
          .attr("stroke-width", strokeWidth)
          .attr("opacity", 1);

        svg
          .append("line")
          .attr("class", "permafrost")
          .attr("x1", d.gridX)
          .attr("y1", d.gridY + lineLength / 2)
          .attr("x2", d.gridX + lineLength / 2)
          .attr("y2", d.gridY)
          .attr("stroke", color)
          .attr("stroke-width", strokeWidth)
          .attr("opacity", 1);

        svg
          .append("line")
          .attr("class", "permafrost")
          .attr("x1", d.gridX - lineLength / 2)
          .attr("y1", d.gridY + lineLength / 2)
          .attr("x2", d.gridX + lineLength / 2)
          .attr("y2", d.gridY - lineLength / 2)
          .attr("stroke", color)
          .attr("stroke-width", strokeWidth)
          .attr("opacity", 1);
      });
    });
  });
}

function addLegend() {
  const colors = [
    "#FFE600",
    "#FEC400",
    "#F79E05",
    "#FC7E00",
    "#EA5E3C",
    "#D83F7D",
    "#C520BE",
    "#B200FC"
  ];
  const labels = [
    "-22 C° bis -18.25 C°",
    "-18.25 C° bis -14.5 C°",
    "-14.5 C° bis -10.75 C°",
    "-10.75 C° bis -7 C°",
    "-7 C° bis -3.25 C°",
    "-3.25 C° bis 0.5 C°",
    "0.5 C° bis 4.25 C°",
    "4.25 C° bis 8 C°",
  ];

    // Add squares and labels
    const legendElement = document.querySelector(".legende");
    const legend = d3.select(".legende svg");
    const widthLegend = legendElement.clientWidth;
    const heightLegend = legendElement.clientHeight;

    // Add title
    legend
      .append("text")
      .attr("class", "legende-titel")
      .attr("x", widthLegend / 2)
      .attr("y", "20px") // Position above the rectangles
      .attr("text-anchor", "middle") // Align text to the start (left side)
      .attr("fill", "white")
      .style("font-size", "13px")
      .text("Bodentemperatur");

    legend
      .selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .attr("class", "quadrat")
      .attr("x", "1vh")
      .attr("y", (d, i) => i * (heightLegend / 9.5) + 30 + "px")
      .attr("fill", (d) => d);

    legend
      .selectAll("text.label")
      .data(labels)
      .enter()
      .append("text")
      .attr("class", "legende-label")
      .attr("x", "37px")
      .attr("y", (d, i) => i * (heightLegend / 9.5) + 45 + "px")
      .attr("fill", "white")
      .style("font-size", "13px")
      .text((d) => d);
    }

function addSliderElements() {
  const rangeSliderLine = d3.select(".range-slider-line");

  // Add unterteiler
  const unterteilerCount = 10;
  const unterteiler = rangeSliderLine
    .append("div")
    .attr("class", "unterteiler")
    .style("position", "absolute")
    .style("bottom", "0")
    .style("left", "0.2vw")
    .style("width", "calc(100% - 0.2vw)")
    .style("height", "20px")
    .style("display", "flex")
    .style("justify-content", "space-between");

  for (let i = 0; i < unterteilerCount; i++) {
    unterteiler
      .append("div")
      .style("width", "2px")
      .style("height", "20px")
      .style("border-radius", "10px")
      .style("background-color", "white");
  }

  // Add baseline
  rangeSliderLine
    .append("div")
    .attr("class", "baseline")
    .style("position", "absolute")
    .style("bottom", "0")
    .style("left", "0.2vw")
    .style("width", "calc(100% - 0.2vw)")
    .style("height", "2px")
    .style("border-radius", "10px")
    .style("background-color", "white");

  const zahlenListe = [
    "2010",
    "2020",
    "2030",
    "2040",
    "2050",
    "2060",
    "2070",
    "2080",
    "2090",
    "2100",
  ];

  // Add baseline and ticks to the range slider
  const zahlenSlider = d3.select(".range-slider-zahlen");

  // Add zahlen
  zahlenListe.forEach((jahr, index) => {
    zahlenSlider
    .append("div")
    .attr("class", "zahl")
    .style("position", "absolute")
    .style("left", `${(index / (zahlenListe.length - 1)) * 100}%`)
    .style("transform", "translateX(-50%)")
    .text(jahr)
    .style("color", "white")
    .style("font-size", "1.3vh");
  });
}

function getColor(category) {
  if (category === 1) return "#FFE600";
  if (category === 2) return "#FEC400";
  if (category === 3) return "#F79E05";
  if (category === 4) return "#FC7E00";
  if (category === 5) return "#EA5E3C";
  if (category === 6) return "#D83F7D";
  if (category === 7) return "#C520BE";
  if (category === 8) return "#B200FC";
}

// Initial load for the default year
initializeMaps();

document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.querySelector(".overlay");
  const backgroundBlur = document.querySelector(".overlay-background-blur");
  const creditsButton = document.querySelector("#btn-rechts-credits");

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
