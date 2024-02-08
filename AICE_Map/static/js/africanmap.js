// Variables for map and geojson
let AfricanMap;
let choroplethLayer = L.layerGroup();

// Function to create the map
function createMap() {
  // Set the center coordinates for the map
  const center = [3.323334, 25.981688];

  // Create a Leaflet map
  AfricanMap = L.map("map", {
    center: center,
    minZoom: 4, // Set minimum zoom level
    maxZoom: 10, // Set maximum zoom level
    zoomControl: false,
  }).setView(center, 4);

  // Return to center after dragging
  AfricanMap.on("dragend", function () {
    AfricanMap.setView(center);
  });

  // Add the TileLayer for the map
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(AfricanMap);

  // Define the legend
  const legend = L.control({ position: "bottomleft" });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend"),
      meaning = "Countries we are in";
      label = "#27AE60";

      // Apply CSS styles to the div
      div.style.backgroundColor = "rgba(255, 255, 255, 0.5)"; // Semi-transparent white background
      div.style.padding = "5px";

      div.innerHTML +=
        '<i style="background:' +
        label +
        '; width: 10px; height: 10px; display: inline-block;"></i> ' +
        meaning;

      return div;
  };

  // Add the legend to the map
  legend.addTo(AfricanMap);
}

async function getMapData() {
  // Fetch CSV file
  const csvResponse = await fetch(csvUrl);
  const csvData = await csvResponse.text();

  // Fetch GeoJSON file
  const geoJSONResponse = await fetch(geoJsonUrl);
  const geoJSONData = await geoJSONResponse.json();

  // Plot the data on the map
  plotData(csvData, geoJSONData);
}

// Function to plot data on the map
function plotData(csvData, geoJSONData) {
  const geoData = geoJSONData;
  const countriesInCSV = processData(csvData);

  // Clear existing layers
  choroplethLayer.clearLayers();

  // Create a choropleth layer using Folium
  geoData.features.forEach((feature) => {
    if (countriesInCSV.includes(feature.properties.name)) {
      console.log(feature.properties.name);

      L.geoJSON(feature, {
        style: {
          fillColor: "#27ae60", // Light blue
          weight: 1,
          opacity: 1,
          color: "white",
          dashArray: "3",
          fillOpacity: 0.7,
        },
      }).addTo(choroplethLayer);
    }
  });

  // Add the new choropleth layer to the map
  choroplethLayer.addTo(AfricanMap);
}

// Function to process and clean the data
function processData(csvData) {
  let data = csvData.split("\n");
  data = data.slice(1); // Skip irrelevant rows

  const cleanedData = data.map((row) => row.split(",")[0]);

  return cleanedData;
}


// Call the function to create the map
createMap();

getMapData()
  .then(() => {
    console.log("Files have been fetched and plotted.");
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
