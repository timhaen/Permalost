(function () {
  let projection, svg, barChartSvg;
  let permafrostData = [];

  const buttons = document.querySelectorAll('.button-container button');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      activateButton(button.id);
    });
  });

  function activateButton(activeButtonId) {
    buttons.forEach(button => {
      if (button.id === activeButtonId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  const rangeSlider = document.getElementById("rs-range-line");
  const rangeBullet = document.getElementById("rs-bullet");

  if (rangeSlider && rangeBullet) {
    rangeSlider.addEventListener(
      "input",
      () => {
        const year = rangeSlider.value;
        rangeBullet.innerHTML = year;
        loadAltAktuell(year);
      },
      false
    );
  }

  function initialize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const sensitivity = 75;

    svg = d3.select("#map").append("svg").attr("width", width).attr("height", height);

    projection = d3.geoOrthographic()
      .scale(height / 10 * 7)
      .center([0, 0])
      .rotate([0, -55])
      .translate([width / 2, height / 10 * 7.5]);

    const initialScale = projection.scale();
    let path = d3.geoPath().projection(projection);

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
      .attr("r", initialScale * 1.05)
      .attr("fill", "url(#atmosphere-gradient)");

    const globe = svg.append("circle")
      .attr("fill", "rgb(40, 40, 40)")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("cx", width / 2)
      .attr("cy", height / 10 * 7.5)
      .attr("r", initialScale);

    let currentRotation = projection.rotate();

    svg.call(d3.drag().on('drag', (event) => {
      const k = sensitivity / projection.scale();
      currentRotation[0] -= -event.dx * k;
      projection.rotate(currentRotation);
      path = d3.geoPath().projection(projection);
      svg.selectAll("path").attr("d", path);
      drawAltAktuell(permafrostData);
    }));

    const map = svg.append("g");

    barChartSvg = d3.select(".bar-chart").append("svg").attr("width", 200).attr("height", height);

    d3.json("../world.json").then(function (data) {
      map.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("class", d => "country_" + d.properties.name.replace(" ", "_"))
        .attr("d", path)
        .attr("fill", "rgb(60,60,60)")
        .style('stroke', 'black')
        .style('stroke-width', 0.3)
        .style("opacity", 0.8);

      // Load permafrost data after the map is drawn
      loadAltAktuell(rangeSlider.value);
    });

    const colors = ["#cae3fc", "#acc5f6", "#8da8f0", "#8b89f3", "#9668fa", "#9f53f9", "#b354f7", "#c454f1"];
    const labels = ["0 m bis 0.5 m", "0.5 m bis 1 m", "1 m bis 1.5 m", "1.5 m bis 2 m", "2 m bis 2.5 m", "2.5 m bis 3 m", "2.5 m bis 3 m", "> 3.5 m",];

    // Add squares and labels
    const legend = d3.select(".legende svg");

    // Add title
    legend.append("text")
      .attr("class", "legende-titel")
      .attr("x", "1vh")
      .attr("y", "2vh") // Position above the rectangles
      .attr("text-anchor", "start") // Align text to the start (left side)
      .style("font-size", "1vh") // Set font size to 1vh
      .attr("fill", "white")
      .style("font-size", "1.3vh")
      .text("Auftauschicht");

    legend.selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .attr("class", "quadrat")
      .attr("x", "1vh")
      .attr("y", (d, i) => i * (30 / 10) + 3.6 + "vh")
      .attr("width", "1.5vh")
      .attr("height", "1.5vh")
      .attr("fill", d => d);

    legend.selectAll("text.label")
      .data(labels)
      .enter()
      .append("text")
      .attr("class", "legende-label")
      .attr("x", "4vh")
      .attr("y", (d, i) => i * (30 / 10) + 4.8 + "vh")
      .attr("fill", "white")
      .style("font-size", "1.3vh")
      .text(d => d);
  }

  function loadAltAktuell(year) {

    d3.csv("../data/filtered_data_alt_1997_2021.csv").then(function (data) {
      const filteredData = data.filter(d => parseFloat(d.year) === parseFloat(year));

      filteredData.forEach(function (d, i) {
        d.year = parseInt(d.year);
        d.lon = parseFloat(d.x);
        d.lat = parseFloat(d.y);
        d.value = parseFloat(d.value);
        d.index = i;
      });
      permafrostData = filteredData;
      drawAltAktuell(permafrostData);
    });
  }

  function drawAltAktuell(data) {
    const gridSize = 15;
    const minValue = d3.min(data, (d) => d.value);
    const maxValue = d3.max(data, (d) => d.value);
    const meanValue = d3.mean(data, (d) => d.value);

    const categoryThresholds = d3
      .scaleQuantile()
      .domain([0, 3.5])
      .range([1, 2, 3, 4, 5, 6, 7, 8]);

    const gridData = data.map((d) => {
      const coordinates = projection([d.lon, d.lat]);
      return {
        ...d,
        gridX: Math.round(coordinates[0] / gridSize) * gridSize,
        gridY: Math.round(coordinates[1] / gridSize) * gridSize,
      };
    });

    // Reduce data to unique grid points to avoid overlap
    const uniqueGridData = Array.from(
      new Set(gridData.map((d) => `${d.gridX},${d.gridY}`))
    ).map((key) => {
      const [gridX, gridY] = key.split(",").map(Number);
      return gridData.find((d) => d.gridX === gridX && d.gridY === gridY);
    });

    const r = 5;
    const opa = 1;
    const strokeWidth = 1.5;

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
        .attr("y1", d.gridY - lineLength / 2)
        .attr("x2", d.gridX + lineLength / 2)
        .attr("y2", d.gridY + lineLength / 2)
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opa);

      svg
        .append("line")
        .attr("class", "permafrost")
        .attr("x1", d.gridX - lineLength / 2)
        .attr("y1", d.gridY + lineLength / 2)
        .attr("x2", d.gridX + lineLength / 2)
        .attr("y2", d.gridY - lineLength / 2)
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opa);
    });

    drawBarChart(uniqueGridData, categoryThresholds);
  }

  function drawBarChart(data, categoryThresholds) {
    const height = document.querySelector(".bar-chart").clientHeight;
    const width = document.querySelector(".bar-chart").clientWidth;
    const barWidth = document.querySelector(".bar-chart").clientWidth / 10;
    const barHeight = height - 20; // Subtract some padding from height
    const unitHeight = 0.23; // Fixed height per data point

    // Remove old bars and text
    barChartSvg.selectAll(".bar").remove();
    barChartSvg.selectAll(".bar-label").remove();
    barChartSvg.selectAll(".grid").remove();
    barChartSvg.selectAll(".grid-label").remove();
    barChartSvg.selectAll(".chart-label").remove();

    // Count the number of data points per category
    const counts = Array(8).fill(0);
    data.forEach((d) => {
      const category = categoryThresholds(d.value) - 1;
      counts[category]++;
    });

    // Add baseline
    barChartSvg
      .append("line")
      .attr("class", "grid")
      .attr("x1", 50)
      .attr("y1", height - 30) // Align with the bottom of the bars
      .attr("x2", width - 30)
      .attr("y2", height - 30) // Align with the bottom of the bars
      .attr("stroke", "#A9A9A9")
      .attr("stroke-width", 1);

    // Add sideline
    barChartSvg
      .append("line")
      .attr("class", "grid")
      .attr("x1", 50)
      .attr("y1", height - 30) // Align with the bottom of the bars
      .attr("x2", 50)
      .attr("y2", height - 30 - 450 * unitHeight) // Align with the bottom of the bars
      .attr("stroke", "#A9A9A9")
      .attr("stroke-width", 2);

    // Add grid lines and labels for 100, 200, and 300
    [250, 500, 750].forEach((value) => {
      barChartSvg
        .append("line")
        .attr("class", "grid")
        .attr("x1", 50)
        .attr("y1", height - 30 - value * unitHeight) // Align with the bottom of the bars
        .attr("x2", width - 30)
        .attr("y2", height - 30 - value * unitHeight) // Align with the bottom of the bars
        .attr("stroke", "#A9A9A9")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,3");

      //Add grid labels
      barChartSvg
        .append("text")
        .attr("class", "grid-label")
        .attr("x", 42)
        .attr("y", height - 32 - value * unitHeight + 3.5)
        .attr("text-anchor", "end")
        .attr("fill", "rgb(220, 220, 220)")
        .text(value);
    });

    // Add new bars
    barChartSvg
      .selectAll(".bar")
      .data(counts)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => 60 + i * barWidth)
      .attr("y", (d) => height - d * unitHeight - 30)
      .attr("width", barWidth - 6)
      .attr("height", (d) => d * unitHeight)
      .attr("fill", (d, i) => getColor(i + 1))
      .attr("fill-opacity", 0.5) // Set fill opacity to 50%
      .attr("stroke", (d, i) => getColor(i + 1));

    // Add text labels
    barChartSvg
      .selectAll(".bar-label")
      .data(counts)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d, i) => i * barWidth + barWidth / 2 + 56)
      .attr("y", (d) => height - d * unitHeight - 37)
      .attr("text-anchor", "middle")
      .attr("fill", "rgb(220, 220, 220)")
      .text((d) => d);

    // Add label below baseline
    barChartSvg
      .append("text")
      .attr("class", "chart-label")
      .attr("x", width / 2)
      .attr("y", height - 12) // Position the text below the baseline
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .text("Anzahl Datenpunkte pro Kategorie");

  }

  function getColor(category) {
    if (category === 1) return "#cae3fc";
    if (category === 2) return "#acc5f6";
    if (category === 3) return "#8da8f0";
    if (category === 4) return "#8b89f3";
    if (category === 5) return "#9668fa";
    if (category === 6) return "#9f53f9";
    if (category === 7) return "#b354f7";
    if (category === 8) return "#c454f1";
  }

  initialize();
})();
