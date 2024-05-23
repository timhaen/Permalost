require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/geometry/Point",
  "dojo/domReady!",
], function (Map, SceneView, GraphicsLayer, Graphic, Point) {
  // CSV-Daten laden und in Grafiken umwandeln
  fetch("grndtemp2003_200raster.csv")
    .then((response) => response.text())
    .then((csvText) => {
      const csvLines = csvText.split("\n");
      const graphics = [];

      let minValue = Infinity;
      let maxValue = -Infinity;

      // Ersten Durchlauf um Min- und Max-Wert zu ermitteln
      csvLines.forEach((line, index) => {
        if (index % 100 === 0) {
          // Nur jeden 100sten Punkt zeichnen
          const [x, y, value] = line.split(",");
          if (!isNaN(x) && !isNaN(y) && !isNaN(value)) {
            const parsedValue = parseFloat(value);
            minValue = Math.min(minValue, parsedValue);
            maxValue = Math.max(maxValue, parsedValue);
          }
        }
      });

      // Zweiten Durchlauf um die Grafiken zu erstellen
      csvLines.forEach((line, index) => {
        if (index % 100 === 0) {
          // Nur jeden 100sten Punkt zeichnen
          const [x, y, value] = line.split(",");
          if (!isNaN(x) && !isNaN(y) && !isNaN(value)) {
            const parsedValue = parseFloat(value);
            const colorValue =
              parsedValue <= minValue
                ? "blue"
                : parsedValue >= maxValue
                ? "red"
                : `rgb(${
                    ((parsedValue - minValue) / (maxValue - minValue)) * 255
                  }, 0, ${
                    ((maxValue - parsedValue) / (maxValue - minValue)) * 255
                  })`;

            const point = new Point({
              x: parseFloat(x),
              y: parseFloat(y),
              spatialReference: { wkid: 4326 },
            });
            const graphic = new Graphic({
              geometry: point,
              symbol: {
                type: "simple-marker",
                color: colorValue,
                size: 6, // Größe der Punkte erhöhen
                opacity: 0.1, // Punkte etwas transparent machen
                outline: null, // Outline der Punkte entfernen
              },
              attributes: {
                value: parsedValue,
              },
            });
            graphics.push(graphic);
          }
        }
      });

      // GraphicsLayer mit den Grafiken erstellen
      const dataGraphicsLayer = new GraphicsLayer({
        graphics: graphics,
      });

      const map = new Map({
        basemap: "dark-gray",
        layers: [dataGraphicsLayer],
      });

      const view = new SceneView({
        map: map,
        container: "sketch-container",
        environment: {
          atmosphereEnabled: false,
          lighting: {
            date: "none", // Beleuchtung zur Mittagszeit
          },
        },
        ui: {
          components: ["zoom"],
        },
        camera: {
          position: {
            x: 0, // Längengrad (Longitude)
            y: 90, // Breitengrad (Latitude), 90 für die Arktis
            z: 20000000, // Höhe über dem Meeresspiegel (in Metern)
          },
          tilt: 0, // Blickwinkel
        },
      });
    })
    .catch((error) => {
      console.error("Fehler beim Laden der CSV-Daten:", error);
    });
});
