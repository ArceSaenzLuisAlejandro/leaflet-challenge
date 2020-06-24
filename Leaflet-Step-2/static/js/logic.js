// Get the JSON data
var earthquakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
// Query to retrieve the faultline data
var tectonicData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
    
// Grabbing the JSON data
d3.json(earthquakeData, function(data) {

    // Check the data obtained
    // console.log(data)

    // From each feature of the JSON, get all the parameters related to the 
    // properties of each marker and add it to the main layer
    createFeaturesMap(data.features);
});

function createFeaturesMap(earthquakeData) {

    // Create all the three layers
    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });
    var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });
    var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // Create base layers
    var baseMaps = {
        Satellite: satelliteMap,
        Grayscale: grayscaleMap,
        Outdoor: outdoorsMap
    };

    // Create the tectonic plates layer
    var tectonicLine = new L.LayerGroup();
    // Use the tectonic JSON to draw the lines
    d3.json(tectonicData, function(data) {
        L.geoJSON(data, {
                color: "#bc7d09", 
                fillOpacity: 0
                }
        )
        .addTo(tectonicLine)
    });

    // Create a function to define the color of the marker
    // depending on the magnitude of the earthquake
    function markerColor(eqMagnitude) {
        if (eqMagnitude < 1) {
            return "#b7f34d"
        } else if (eqMagnitude < 2) {
            return "#e1f34d"
        } else if (eqMagnitude < 3) {
            return "#f3db4d"
        } else if (eqMagnitude < 4) {
            return "#f3ba4d"
        } else if (eqMagnitude < 5) {
            return "#f0a76b"
        } else {
            return "#f06b6b"
        }
    }

    var eqMarkers = L.geoJSON(earthquakeData, {
        // Create a layer for the markers 
        pointToLayer: 
            function(earthquakeData, eqLatLng) {
                // Call the circle function to create each marker 
                // Format each marker according to its magnitude 
                // in the corresponding coordinate
                return L.circle(eqLatLng, {
                    // Make bigger the markers size
                    radius: earthquakeData.properties.mag * 18000,
                    color: markerColor(earthquakeData.properties.mag),
                    fillOpacity: 0.7,
                    weight: 1.5
                }
            );
        },
        onEachFeature: onEachFeature
    });

    // Create and design popup
    function onEachFeature(feature, layer) {
        layer.bindPopup(
            "<h2>" + feature.properties.place + "</h2> <hr> <h4> Magnitude: " + feature.properties.mag + "</h4> <h4 Date: >" + Date(feature.properties.time) + "</h4>"
        );
    }

    // Overlays that may be toggled on or off
    var overlayMaps = {
        EarthquakeMarkers: eqMarkers,
        TectonicPlates: tectonicLine
    };

    // Create map object and set default layers
    var myMap = L.map("map", {
        center: [20.1, -98.75],
        zoom: 5,
        layers: [satelliteMap, eqMarkers, tectonicLine]
    });

    // Pass our map layers into our layer control
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Create legend
    var legend = L.control({position: 'bottomright'});

    // Add the legend
    legend.onAdd = function () {
    
        var div = L.DomUtil.create('div', 'info legend')
        
        div.innerHTML = "<img src='https://4.bp.blogspot.com/-_yM25HN0aZk/XvKAUW2iqGI/AAAAAAAAARs/QXnklqjHr4YLp1eVbe0gNXFWJQ1aUFVsQCK4BGAYYCw/s1600/Annotation%2B2020-06-23%2B172014.png' alt='Legend'>";

        return div;
    };
    
    // Add the previous layer to the Map layer
    legend.addTo(myMap);

}