// Variables for map and geojson
let kenyaMap;
let choroplethLayer = L.layerGroup();

// Function to create the map
function createMap() {
  // Set the center coordinates for the map
  const center = [0.36543, 37.589951];

  // Create a Leaflet map
  kenyaMap = L.map("map", {
    center: center,
    minZoom: 7, // Set minimum zoom level
    maxZoom: 10, // Set maximum zoom level
    zoomControl: false,
  }).setView(center, 6);

  // Return to center after dragging
  kenyaMap.on("dragend", function () {
    kenyaMap.setView(center);
  });

  // Add the TileLayer for the map
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(kenyaMap);

  // Define the legend
  const legend = L.control({ position: "bottomleft" });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 20000, 50000, 100000, 200000, 500000, 1000000],
      labels = [
        "#C0392B",
        "#9B59B6",
        "#2980B9",
        "#8E44AD",
        "#27AE60",
        "#16A085",
        "#007BA7",
      ];

    // Apply CSS styles to the div
    div.style.backgroundColor = "rgba(255, 255, 255, 0.5)"; // Semi-transparent white background
    div.style.padding = "5px";

    // Loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        labels[i] +
        '; width: 10px; height: 10px; display: inline-block;"></i> ' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }

    return div;
  };

  // Add the legend to the map
  legend.addTo(kenyaMap);
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
  const cleanedData = processData(csvData, geoJSONData);

  // Clear existing layers
  choroplethLayer.clearLayers();

  // Create a choropleth layer using Folium
  L.geoJson(geoJSONData, {
    style: (feature) => {
      const population = feature.properties.Total || 0;
      return {
        fillColor: getColor(population),
        weight: 1,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
      };
    },
    onEachFeature: (feature, layer) => {
      const population = feature.properties.Total || 0;
      layer.bindPopup(
        `<strong>${feature.properties.COUNTY}</strong><br>Population: ${population}`
      );
    },
  }).addTo(choroplethLayer);

  // Add the new choropleth layer to the map
  choroplethLayer.addTo(kenyaMap);
}

// Function to process and clean the data
function processData(csvData, geojson) {
  // Process and clean the data (similar to the Python code)
  let data = csvData.split("\n");
  data = data.slice(7); // Skip irrelevant rows

  // Create an array of objects with cleaned data
  const cleanedData = data.map((row) => {
    const columns = row.split(",");
    return {
      Name: columns[0],
      Male: parseInt(columns[1]),
      Female: parseInt(columns[2]),
      Intersex: parseInt(columns[3]),
      Total: parseInt(columns[4]),
    };
  });

  // Correct county names for consistency
  cleanedData.forEach((item) => {
    if (item.Name === "Elgeyo-Marakwet") item.Name = "Keiyo-Marakwet";
    if (item.Name === "Tharaka-Nithi") item.Name = "Tharaka";
    if (item.Name === "Taita-Taveta") item.Name = "Taita Taveta";
  });

  // Merge population data with GeoJSON properties
  geojson.features.forEach((feature) => {
    const matchingData = cleanedData.find(
      (item) => item.Name === feature.properties.COUNTY
    );
    if (matchingData) {
      feature.properties = { ...feature.properties, ...matchingData };
    }
  });

  return cleanedData;
}

// Function to get color based on population density
function getColor(population) {
  return population > 1000000
    ? "#007BA7"
    : population > 500000
    ? "#16A085"
    : population > 200000
    ? "#27AE60"
    : population > 100000
    ? "#2980B9"
    : population > 50000
    ? "#8E44AD"
    : population > 20000
    ? "#9B59B6"
    : "#C0392B";
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
