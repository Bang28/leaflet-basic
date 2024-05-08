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
        // noWrap: true,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    // initialize the map
    const mymap = L.map(mapElement, {
        center: [-27.059125784374054, 134.03320312500003],
        zoom: 4,
        minZoom: 3,
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

    // drawing polyline dynamically part 2
    var drawPolyline = L.polyline([], {
        color: 'red',
        smoothFactor: 0.1, //default 1.0
    }).addTo(mymap);
    
    mymap.on('click', function(e){
        let latlng = e.latlng
        drawPolyline.addLatLng(latlng)
    });
    
    var masterPolyline = L.polyline([], {color: 'blue'}).addTo(mymap);
    var masterLineCoordinates = []
    mymap.on('dblclick', function(e){
        let clickedAllCoordinates = drawPolyline.getLatLngs()
        let clickedAllCoordinatesExceptTheLastOne = clickedAllCoordinates.slice(0, clickedAllCoordinates.length - 1)

        masterLineCoordinates.push(clickedAllCoordinatesExceptTheLastOne)
        masterPolyline.setLatLngs(masterLineCoordinates)

        drawPolyline.setLatLngs([]) //reset line coordinates

        console.log(masterPolyline.toGeoJSON()) //export data to GeoJSON
    });
}