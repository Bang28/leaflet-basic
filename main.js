window.onload = init;

function init() {

    // get element by id from HTML
    const mapElement = document.getElementById('mapid')
    
    // adding stadia map layer (map object)
    const stadiaMaps = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });

    // adding osm layer (map object)
    const openStreetMapStandard = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        noWrap: true,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    // initialize the map
    const mymap = L.map(mapElement, {
        center: [-27.059125784374054, 134.03320312500003],
        zoom: 2,
        minZoom: 1,
        zoomSnap: 0.25,
        zoomDelta: 0.25,
        easeLinearity: 0.5,
        worldCopyJump: true, 
        layers: [openStreetMapStandard] // sett your default map in here
    });

    // leaflet basemaps object
    const baseLayers = {
        '<b>OpenStreetMapStandard</b>': openStreetMapStandard,
        'StadiaMap': stadiaMaps
    };

    // overlays
    const perthBaseMapImage = './data/perth_image.png';
    const perthBaseMapBounds = [[-35.49645605658415, 113.51074218750001], [-20.632784250388028, 130.07812500000003]];
    const imagePerthOverlay = L.imageOverlay(perthBaseMapImage, perthBaseMapBounds);

    // overlay object
    const overLayLayers = {
        'Perth Image': imagePerthOverlay,
    }
    
    // leaflet layer control
    const layerControls = L.control.layers(baseLayers, overLayLayers, {
        collapsed: false,
        position: 'topright',
    }).addTo(mymap);
    
    // perth marker
    const perthMarker = L.marker([-32.0546446905493, 115.87280273437501], {
        title: 'Perth City',
        opacity: 0.5
    }).addTo(mymap);

    const perthMarkerPopup = perthMarker.bindPopup('Perth City from the popup') //.openPopup(); for make auto open popup
    const perthMarkerTooltip = perthMarker.bindTooltip("my tooltip text") //.openTooltip(); for make auto open tooltip

    // example drawing polyline
    var latlngs = [
        [45.51, -122.68],
        [37.77, -122.43],
        [34.04, -118.2]
    ];

    var polyline = L.polyline(latlngs, {color: 'red'}).addTo(mymap);
    mymap.fitBounds(polyline.getBounds())

    // drawing polyline dynamically part 1
    var lineCoordinates = [];
    var drawPolyline = L.polyline([], {color: 'red'}).addTo(mymap);

    mymap.on('click', function(e){
        let latlng = e.latlng
        lineCoordinates.push(latlng)

        if (lineCoordinates.length > 1){
            drawPolyline.setLatLngs(lineCoordinates)
        }
    });
}