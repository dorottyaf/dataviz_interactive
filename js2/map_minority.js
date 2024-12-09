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
    const status = countryStatusMap[countryName]?.[`${year}_B4`];
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
                    countryStatusMap[country][`${year}_B4`] = row[`${year}_B4`];
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

let timeDimensionMinority;

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
        timeDimensionMinority = L.timeDimension.layer.choropleth(geoJsonLayer, {});
        window.timeDimensionMinority  = timeDimensionMinority;

        const event = new Event('timeDimensionMinorityReady');
        window.dispatchEvent(event);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

    // create legend
let legendNumbers = L.control({position: 'bottomleft'});
legendNumbers.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var container = L.DomUtil.create('div', 'legend-container');

    // Define the colors and labels for the legend
    var colors = ['#5f7c43', '#9ecb75', '#e3a152', '#933345', '#621523', 'grey'];
    var labels = ['4', '3', '2', '1', '0', 'No Data'];

    // Loop through each color and label to add them to the legend
    for (var i = 0; i < colors.length; i++) {
        var item = L.DomUtil.create('div', 'legend-item');
        item.innerHTML = 
            '<i style="background:' + colors[i] + '"></i>' +
            '<span>' + labels[i] + '</span>';
        container.appendChild(item);
    }

    div.appendChild(container);
    return div;
};

window.legendNumbers = legendNumbers;