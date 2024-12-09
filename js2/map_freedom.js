import "./leaflet.timedimension.choropleth.js";
import map from './main_map.js';

// set color according to status
// both of these functions were taken from the leaflet tutorial
// https://leafletjs.com/examples/choropleth/
function getColor(d) {
    return d === 'NF' ? '#933345' :
            d === 'PF' ? '#e3a152':
            d === 'F' ? '#5f7c43' :
            'grey';
}

function styleFeature(feature) {
    const countryName = feature.properties.ADMIN;
    const time = map.timeDimension.getCurrentTime()
    let year;
    year = time instanceof Date ? time.getFullYear() : new Date(time).getFullYear();
    const status = countryStatusMap[countryName]?.[`${year}_Status`];
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

// list of countries with changing borders
const ussrCountries = ["Lithuania", "Latvia", "Estonia", "Georgia", "Ukraine", "Belarus", "Moldova", "Kyrgyzstan",
    "Uzbekistan", "Tajikistan", "Armenia", "Azerbaijan", "Turkmenistan", "Russia", "Kazakhstan"]

// function for finding the geoJson layers belonging to a list of countries
function findLayers (layerList, nameList) {
    for (const layer of Object.values(geoJsonLayer._layers)) {
        if (nameList.includes(layer.feature.properties.ADMIN)) {
            layerList.push(layer);
        }
    }
}

// highlight functions with mouseover event
// https://leafletjs.com/examples/choropleth/
function highlightFeature(e) {
    let layer = e.target;
    let currentYear = layer._map.timeDimension._currentTimeIndex
    let name = layer.feature.properties.ADMIN;
    // handle borders changing at 1989
    if (currentYear < 18) {
        // custom layer for the USSR
        if (ussrCountries.includes(name)) {
            let layerList = [];
            findLayers(layerList, ussrCountries)
            for (const layer of layerList) {
                layer.setStyle({
                    weight: 2,
                    color: 'white',
                    dashArray: '',
                    fillOpacity: 0.7
                });
                // custom tooltip based on the year 
                // https://gis.stackexchange.com/questions/262007/dynamic-tooltip-update-leaflet
                layer.setTooltipContent(
                    `<b>USSR</b>`
                );
                layer.bringToFront();
            }
        } else {
            // set style for everything else
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
    }  else {
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
}

function resetHighlight(e) {
    let layer = e.target;
    let name = layer.feature.properties.ADMIN;
    let currentYear = layer._map.timeDimension._currentTimeIndex
    // reset highlight before 1989
    if (currentYear < 18) {
        // reset the highlight for the USSR
        if (ussrCountries.includes(name)) {
            let layerList = [];
            findLayers(layerList, ussrCountries)
            for (const layer of layerList) {
                geoJsonLayer.resetStyle(layer);
            }
        } else {
            // reset for the rest of the world
            geoJsonLayer.resetStyle(e.target);
        }
    } else {
    // reset for the rest of the world
    geoJsonLayer.resetStyle(e.target);
    }
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

let timeDimensionFreedom;

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
        // add time dimension layer
        timeDimensionFreedom = L.timeDimension.layer.choropleth(geoJsonLayer, {});
        window.timeDimensionFreedom = timeDimensionFreedom;

        const event = new Event('timeDimensionFreedomReady');
        window.dispatchEvent(event);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

// create legend
// https://gis.stackexchange.com/questions/434632/create-custom-legend-control-using-l-extramarkers-icon-icons-in-leaflet
let legend = L.control({position: 'bottomleft'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var container = L.DomUtil.create('div', 'legend-container');

    // Define the colors and labels for the legend
    var colors = ['#5f7c43', '#e3a152', '#933345', 'grey'];
    var labels = ['Free', 'Partially <br /> Free', 'Not Free', 'No Data'];

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
window.legend = legend;
window.map = map;