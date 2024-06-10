(function () {
  let projection, svg, barChartSvg;
  let permafrostData = [];

  const buttons = document.querySelectorAll(".button-container button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activateButton(button.id);
    });
  });

  function activateButton(activeButtonId) {
    buttons.forEach((button) => {
      if (button.id === activeButtonId) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  const rangeSlider = document.getElementById("rs-range-line");

  if (rangeSlider) {
    rangeSlider.addEventListener(
      "input",
      () => {
        const year = rangeSlider.value;
        loadAltAktuell(year);
      },
      false
    );
  }

  function initialize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const sensitivity = 75;

    svg = d3
      .select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    projection = d3
      .geoOrthographic()
      .scale((height / 10) * 7)
      .center([0, 0])
      .rotate([0, -55])
      .translate([width / 2, (height / 10) * 7.5]);

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
      .attr("cy", (height / 10) * 7.5)
      .attr("r", initialScale * 1.05)
      .attr("fill", "url(#atmosphere-gradient)");

    const globe = svg
      .append("circle")
      .attr("fill", "rgb(40, 40, 40)")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("cx", width / 2)
      .attr("cy", (height / 10) * 7.5)
      .attr("r", initialScale);

    let currentRotation = projection.rotate();

    svg.call(
      d3.drag().on("drag", (event) => {
        const k = sensitivity / projection.scale();
        currentRotation[0] -= -event.dx * k;
        projection.rotate(currentRotation);
        path = d3.geoPath().projection(projection);
        svg.selectAll("path").attr("d", path);
        drawAltAktuell(permafrostData);
      })
    );

    const map = svg.append("g");

    barChartSvg = d3
      .select(".bar-chart")
      .append("svg")
      .attr("width", 200)
      .attr("height", height);

    d3.json("../data/world.json").then(function (data) {
      map
        .append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", (d) => "country_" + d.properties.name.replace(" ", "_"))
        .attr("d", path)
        .attr("fill", "rgb(60,60,60)")
        .style("stroke", "black")
        .style("stroke-width", 0.3)
        .style("opacity", 0.8);

      // Load permafrost data after the map is drawn
      loadAltAktuell(rangeSlider.value);
    });



    const colors = [
      "#000004",
      "#1A1042",
      "#54137D",
      "#8C2981",
      "#C73D73",
      "#F4675C",
      "#FEA973",
      "#FDEBAC"
    ];
    const labels = [
      "0 m bis 0.5 m",
      "0.5 m bis 1 m",
      "1 m bis 1.5 m",
      "1.5 m bis 2 m",
      "2 m bis 2.5 m",
      "2.5 m bis 3 m",
      "2.5 m bis 3 m",
      "> 3.5 m"
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
      .attr("y", "25px") // Position above the rectangles
      .attr("text-anchor", "middle") // Align text to the start (left side)
      .attr("fill", "white")
      .style("font-size", "1.3vh")
      .text("Auftauschicht");

    legend
      .selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .attr("class", "quadrat")
      .attr("x", "1vh")
      .attr("y", (d, i) => i * (heightLegend / 10) + 38 + "px")
      .attr("fill", (d) => d);

    legend
      .selectAll("text.label")
      .data(labels)
      .enter()
      .append("text")
      .attr("class", "legende-label")
      .attr("x", "4vh")
      .attr("y", (d, i) => i * (heightLegend / 10) + 55 + "px")
      .attr("fill", "white")
      .style("font-size", "1.3vh")
      .text((d) => d);

    
    // Add baseline and ticks to the range slider
    const rangeSliderLine = d3.select(".range-slider-line");

    // Add unterteiler
    const unterteilerCount = 25;
    const unterteiler = rangeSliderLine
      .append("div")
      .attr("class", "unterteiler")
      .style("position", "absolute")
      .style("bottom", "0") // Align with the bottom
      .style("left", "0.2vw")
      .style("width", "calc(100% - 0.2vw)") // Adjust width to fit inside the container
      .style("height", "20px")
      .style("display", "flex")
      .style("justify-content", "space-between");

    for (let i = 0; i < unterteilerCount; i++) {
      unterteiler
        .append("div")
        .style("width", "3px")
        .style("height", "20px")
        .style("border-radius", "10px")
        .style("background-color", "white");
    }

    // Add baseline
    rangeSliderLine
      .append("div")
      .attr("class", "baseline")
      .style("position", "absolute")
      .style("bottom", "0") // Position baseline at the bottom
      .style("left", "0.2vw")
      .style("width", "calc(100% - 0.2vw)") // Adjust width to fit inside the container
      .style("height", "2px")
      .style("border-radius", "10px")
      .style("background-color", "white");

    const zahlenListe = [
      "1997",
      "1999",
      "2001",
      "2003",
      "2005",
      "2007",
      "2009",
      "2011",
      "2013",
      "2015",
      "2017",
      "2019",
      "2021",
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

  function loadAltAktuell(year) {
    d3.csv("../data/filtered_data_alt_1997_2021.csv").then(function (data) {
      const filteredData = data.filter(
        (d) => parseFloat(d.year) === parseFloat(year)
      );

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
      .range([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

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
    const barChartElement = document.querySelector(".bar-chart");
    if (!barChartElement) {
      console.error("Element mit class 'bar-chart' not found");
      return;
    }
  
    const height = barChartElement.clientHeight;
    const width = barChartElement.clientWidth;
    const barWidth = width / 11;
    const unitHeight = 0.21; // Fixed height per data point
  
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
  
    // Add sideline
    barChartSvg
      .append("line")
      .attr("class", "grid")
      .attr("x1", 36)
      .attr("y1", height - 20) // Align with the bottom of the bars
      .attr("x2", 36)
      .attr("y2", 20) // Align with the bottom of the bars
      .attr("stroke", "#A9A9A9")
      .attr("stroke-width", 1);
  
    // Add grid lines and labels for 100, 200, and 300
    [0, 250, 500, 750].forEach((value) => {
      barChartSvg
        .append("line")
        .attr("class", "grid")
        .attr("x1", 36)
        .attr("y1", height - 20 - value * unitHeight) // Align with the bottom of the bars
        .attr("x2", width - 28)
        .attr("y2", height - 20 - value * unitHeight) // Align with the bottom of the bars
        .attr("stroke", "#A9A9A9")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,3");
  
      // Add grid labels
      barChartSvg
        .append("text")
        .attr("class", "grid-label")
        .attr("x", width / 10 - 7)
        .attr("y", height - 15 - value * unitHeight)
        .attr("text-anchor", "end")
        .attr("fill", "white")
        .style("font-size", "1.3vh")
        .text(value);
    });
  
    // Add new bars
    barChartSvg
      .selectAll(".bar")
      .data(counts)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => (width / 5) * 0.77 + i * barWidth )
      .attr("y", (d) => height - d * unitHeight - 20)
      .attr("width", barWidth - 6)
      .attr("height", (d) => d * unitHeight)
      .attr("fill", (d, i) => getColor(i + 1))
      .attr("fill-opacity", 0.5) // Set fill opacity to 50%
      .attr("stroke", (d, i) => getColor(i + 1));
  
    // Add baseline
    barChartSvg
      .append("line")
      .attr("class", "grid")
      .attr("x1", 36)
      .attr("y1", height - 20) // Align with the bottom of the bars
      .attr("x2", width - 28)
      .attr("y2", height - 20) // Align with the bottom of the bars
      .attr("stroke", "#A9A9A9")
      .attr("stroke-width", 1)
      .attr("opacity", 1);
  
    // Add text labels
    barChartSvg
      .selectAll(".bar-label")
      .data(counts)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d, i) => (width / 5) * 0.77 + i * barWidth + 13)
      .attr("y", (d) => height - d * unitHeight - 27)
      .attr("text-anchor", "middle")
      .attr("fill", "rgb(220, 220, 220)")
      .style("font-size", "1.3vh")
      .text((d) => d);
  
    // Add label below baseline
    barChartSvg
      .append("text")
      .attr("class", "chart-label")
      .attr("x", width / 2)
      .attr("y", "16px") // Position the text below the baseline
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-size", "1.3vh")
      .text("Anzahl Datenpunkte pro Kategorie");
  }
  
  function getColor(category) {
    if (category === 1) return "#000004";
    if (category === 2) return "#1A1042";
    if (category === 3) return "#54137D";
    if (category === 4) return "#8C2981";
    if (category === 5) return "#C73D73";
    if (category === 6) return "#F4675C";
    if (category === 7) return "#FEA973";
    if (category === 8) return "#FDEBAC";
  }

  initialize();
})();

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