import "./leaflet.timedimension.choropleth.js";
import map from './main_map.js';

// set color according to status
// both of these functions were taken from the leaflet tutorial
// https://leafletjs.com/examples/choropleth/
function getColor(d) {
    return  d === '0.0' ? '#621523' :
            d === '1.0' ? '#933345':
            d === '2.0' ? '#e3a152' :
            d === '3.0' ? '#9ecb75':
            d === '4.0' ? '#5f7c43' :
            'grey';
}

function styleFeature(feature) {
    const countryName = feature.properties.ADMIN;
    const time = map.timeDimension.getCurrentTime()
    let year;
    year = time instanceof Date ? time.getFullYear() : new Date(time).getFullYear();
    const status = countryStatusMap[countryName]?.[`${year}_D1`];
    // https://www.w3schools.com/jsref/met_console_error.asp
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
Papa.parse('secondary_scores.csv', {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;

        // iterate through rows to map country names to their statuses
        // https://jsnoteclub.com/blog/how-to-iterate-table-rows-in-javascript/
        data.forEach(row => {
            const country = row["Country/Territory"];
            if (country) {
                countryStatusMap[country] = {};
                for (let year = 2013; year <= 2024; year++) {
                    countryStatusMap[country][`${year}_D1`] = row[`${year}_D1`];
                }
            }
});
    },
    error: function(error) {
        console.error('Error loading CSV:', error);
    }
});


let geoJsonLayer;


// highlight functions with mouseover event
// https://leafletjs.com/examples/choropleth/
function highlightFeature(e) {
    let layer = e.target;
    let name = layer.feature.properties.ADMIN;
        // set style for countries after the time controls
    layer.setStyle({
        weight: 2,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    });
    console.log(countryStatusMap)
    layer.setTooltipContent(
        `<b>${name}</b>`
    );
    layer.bringToFront();
}

function resetHighlight(e) {
    let layer = e.target;
    // reset for the rest of the world
    geoJsonLayer.resetStyle(e.target);
}

function onEachFeature(feature, layer) {
    // https://gis.stackexchange.com/questions/235050/leaflet-geojson-bindtooltip-from-feature-attribute
    layer.bindTooltip('', {permanent: false, opacity: 0.7, sticky: true}
    )
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

let timeDimensionMedia;

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
            onEachFeature: onEachFeature
        })
        console.log(geoJsonLayer)
        // add time dimension layer
        timeDimensionMedia = L.timeDimension.layer.choropleth(geoJsonLayer, {});
        // make it globally accessible
        window.timeDimensionMedia  = timeDimensionMedia;

        // make event handler
        const event = new Event('timeDimensionMediaReady');
        window.dispatchEvent(event);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

// make the map globally accessible
//https://stackoverflow.com/questions/5601773/how-do-i-create-a-globally-accessible-variable
window.map = map;