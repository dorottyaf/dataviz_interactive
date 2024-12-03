import "./leaflet.timedimension.choropleth.js";

// Initialize the map and set its view
const map = L.map('map', {
    // https://stackoverflow.com/questions/41759536/truly-smooth-zooming-in-leaflet
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    timeDimension: true,
    timeDimensionControl: true, 
    timeDimensionOptions: {
        timeInterval: "1972/2023", 
        autoPlay: true,
        period: "P1Y",
        currentTime: new Date("1972-01-01").getTime() 
    }
}).setView([15, 0], 2.5);

// get leaflet map without labels
// https://www.reddit.com/r/openstreetmap/comments/uiw4g1/map_without_labels/
const mainLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 17,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
});

mainLayer.addTo(map);

// set color according to status
// both of these functions were taken from the leaflet tutorial
// https://leafletjs.com/examples/choropleth/
function getColor(d) {
    return d === 'NF' ? '#933345' :
            d === 'PF' ? '#e3a152':
            d === 'F' ? '#5f7c43' :
            'white';
}

function styleFeature(feature) {
    const countryName = feature.properties.ADMIN;
    const time = map.timeDimension.getCurrentTime()
    let year;
    year = time instanceof Date ? time.getFullYear() : new Date(time).getFullYear();
    // the year variable was always a year behind, this is a clunky but working solution
    year++
    const status = countryStatusMap[countryName]?.[`${year}_Status`];
    // https://www.w3schools.com/jsref/met_console_error.asp
    if (!status) {
        console.error(`Country name error: ${feature.properties.ADMIN}, ${year}`);
    }
    return {
        fillColor: getColor(status),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 1
    };
}

let countryStatusMap = {};

// load the CSV
// https://codedamn.com/news/javascript/how-to-read-csv-with-javascript
Papa.parse('freedom_scores.csv', {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;

        // iterate through rows to map country names to their statuses
        // https://jsnoteclub.com/blog/how-to-iterate-table-rows-in-javascript/
        data.forEach(row => {
            const country = row["Year(s) Under Review"];
            if (country) {
                countryStatusMap[country] = {};
                for (let year = 1972; year <= 2023; year++) {
                    countryStatusMap[country][`${year}_Status`] = row[`${year}_Status`];
                }
            }
});
    },
    error: function(error) {
        console.error('Error loading CSV:', error);
    }
});

let geoJsonLayer;

// load GeoJSON for countries
fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
    .then(response => {
    console.log("Fetch Response:", response); // Inspect the fetch response
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}) 
    // use the geoJson to create a timedimension layer 
    // https://codesandbox.io/p/sandbox/leaflettimedimensionchoropleth-r3edo?file=%2Fsrc%2Findex.js%3A3%2C1-7%2C32
    .then(geojson => {
        console.log("GeoJSON Data Loaded:", geojson);
        // create geoJson layer 
        geoJsonLayer = L.geoJson(geojson, {
            style: (feature) => styleFeature(feature),
        })
        // add time dimension layer
        L.timeDimension.layer.choropleth(geoJsonLayer, {}).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

// make the map globally accessible
//https://stackoverflow.com/questions/5601773/how-do-i-create-a-globally-accessible-variable
window.map = map;