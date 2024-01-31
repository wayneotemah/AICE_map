// Variables for map and geojson
let kenyaMap;
let choroplethLayer = L.layerGroup();

// Function to create the map
function createMap() {
    // Set the center coordinates for the map
    const center = [0.365430, 37.589951];
 
    // Create a Leaflet map
    kenyaMap = L.map('map', {
        center: center,
        minZoom: 7, // Set minimum zoom level
        maxZoom: 10, // Set maximum zoom level
        zoomControl: false
     }).setView(center, 6);
 
    // Return to center after dragging
    kenyaMap.on('dragend', function() {
        kenyaMap.setView(center);
    });
 
    // Add the TileLayer for the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(kenyaMap);
 }




async function handleSubmit() {
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
        style: feature => {
            const population = feature.properties.Total || 0;
            return {
                fillColor: getColor(population),
                weight: 1,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        },
        onEachFeature: (feature, layer) => {
            const population = feature.properties.Total || 0;
            layer.bindPopup(`<strong>${feature.properties.COUNTY}</strong><br>Population: ${population}`);
        }
    }).addTo(choroplethLayer);

    // Add the new choropleth layer to the map
    choroplethLayer.addTo(kenyaMap);
}

// Function to process and clean the data
function processData(csvData, geojson) {
    // Process and clean the data (similar to the Python code)
    let data = csvData.split('\n');
    data = data.slice(7); // Skip irrelevant rows

    // Create an array of objects with cleaned data
    const cleanedData = data.map(row => {
        const columns = row.split(',');
        return {
            Name: columns[0],
            Male: parseInt(columns[1]),
            Female: parseInt(columns[2]),
            Intersex: parseInt(columns[3]),
            Total: parseInt(columns[4])
        };
    });

    // Correct county names for consistency
    cleanedData.forEach(item => {
        if (item.Name === 'Elgeyo-Marakwet') item.Name = 'Keiyo-Marakwet';
        if (item.Name === 'Tharaka-Nithi') item.Name = 'Tharaka';
        if (item.Name === 'Taita-Taveta') item.Name = 'Taita Taveta';
    });

    // Merge population data with GeoJSON properties
    geojson.features.forEach(feature => {
        const matchingData = cleanedData.find(item => item.Name === feature.properties.COUNTY);
        if (matchingData) {
            feature.properties = { ...feature.properties, ...matchingData };
        }
    });

    return cleanedData;
}

// Function to get color based on population density
function getColor(population) {
    return population > 1000000 ? '#800026' :
           population > 500000  ? '#BD0026' :
           population > 200000  ? '#E31A1C' :
           population > 100000  ? '#FC4E2A' :
           population > 50000   ? '#FD8D3C' :
           population > 20000   ? '#FEB24C' :
           population > 10000   ? '#FED976' :
                                  '#FFEDA0';
}


// Call the function to create the map
createMap();

handleSubmit().then(() => {
    console.log('Files have been fetched and plotted.');
}).catch(error => {
    console.error('An error occurred:',error);
});