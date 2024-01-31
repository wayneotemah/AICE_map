// Variables for map and geojson
let kenyaMap;
// let choroplethLayer = L.layerGroup();

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
 
// Call the function to create the map
createMap();