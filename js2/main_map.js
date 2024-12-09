// Initialize the map and set its view
const map = L.map('map', {
    // https://stackoverflow.com/questions/41759536/truly-smooth-zooming-in-leaflet
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    continuousWorld: false,
    worldCopyJump: false,
    timeDimension: true,
    timeDimensionControl: true, 
    timeDimensionControlOptions: {
        displayDate: false,
        playerOptions: {
            startOver: true
        }
    },
    timeDimensionOptions: {
        timeInterval: "1973/2024", 
        autoPlay: true,
        period: "P1Y",
        currentTime: new Date("1973-01-01").getTime() 
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

let yearDisplay = L.DomUtil.create('div', 'year-display');
yearDisplay.style.position = 'absolute';
yearDisplay.style.top = '510px';
yearDisplay.style.left = '58px';
yearDisplay.style.backgroundColor = 'transparent';
yearDisplay.style.padding = '5px';
yearDisplay.style.fontSize = '65px';
yearDisplay.style.fontFamily = 'Lato', 'sans-serif';
yearDisplay.style.zIndex = '1000';
yearDisplay.textContent = '1972';
document.body.appendChild(yearDisplay);

// Event listener to update the year display on time change
map.timeDimension.on('timeload', function() {
    let time = map.timeDimension.getCurrentTime();
    let year = new Date(time);
    yearDisplay.textContent = year.getFullYear();
});

export default map;