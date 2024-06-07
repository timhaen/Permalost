const rangeSlider = document.getElementById("rs-range-line");
const rangeTextYear = document.getElementById("rs-text-year");

rangeSlider.addEventListener(
  "input",
  () => {
    const year = rangeSlider.value;
    rangeTextYear.innerHTML = year;
    loadPermafrostData(year);
  },
  false
);

// Set dimensions for SVG
const width = window.innerWidth / 3;
const height = window.innerHeight;
const gridSize = 15;
const svgIds = ["#map1", "#map2", "#map3"];
const projections = [];
const rcpValues = ["rcp26", "rcp45", "rcp85"];

function drawMap(svg, projection) {
  const path = d3.geoPath().projection(projection);

  // Load and draw the world map
  d3.json("../world.json").then(function (data) {
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
      .rotate([0, -55, 0]) // Arctic center (Longitude, Latitude, Roll)
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
  }, 10);
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
      const minValue = d3.min(filteredData, (d) => d[rcpValue]);
      const maxValue = d3.max(filteredData, (d) => d[rcpValue]);

      const categoryThresholds = d3
        .scaleQuantile()
        .domain([-22, 8])
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
      const strokeWidth = 2;

      // Remove old elements
      svg.selectAll(".permafrost").remove();

      // Add new elements as crosses
      uniqueGridData.forEach((d) => {
        const color = getColor(categoryThresholds(d.value));
        const lineLength = 15; // Length of the lines forming the cross

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
  }).catch(error => console.error('Error loading data:', error));
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
