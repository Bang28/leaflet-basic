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

    // drawing polygon dynamically part 1  
    var polygon = L.polygon([], { color: 'red' }).addTo(mymap);
    // draw polygon function
    function drawPolygon(){
        mymap.on('click', function(e){
            let latlng = e.latlng
            polygon.addLatLng(latlng)
        });
    }
    
    var masterPolygon = L.polygon([], {color: 'blue'}).addTo(mymap);
    var masterPolygonCoordinates = []
    mymap.on('dblclick', function(e){
        let clickedAllCoordinates = polygon.getLatLngs()
        let clickedAllCoordinatesExceptTheLastOne = clickedAllCoordinates[0].slice(0, clickedAllCoordinates[0].length - 1)

        masterPolygonCoordinates.push(clickedAllCoordinatesExceptTheLastOne)
        masterPolygon.setLatLngs(masterPolygonCoordinates)

        polygon.setLatLngs([]) //reset lat and long values in the polygon object

        mymap.off('click')

        let drawPolygonButtonElement = document.querySelector('.draw-polygon');
        if (drawPolygonButtonElement){
            L.DomUtil.removeClass(drawPolygonButtonElement, 'draw-active')
        }
    });

    // custom draw geometry plugin "drawing polygon dynamically part 2"
    L.Control.CustomDrawGeometryTools = L.Control.extend({
        onAdd: function(mymap){
            var div = L.DomUtil.create('button', 'draw-polygon');
            div.innerHTML = 'Draw a Polygon'

            L.DomEvent.on(div, 'click', function(e){
                L.DomEvent.stopPropagation(e)
                
                let toggleDrawPolygonButton = div.classList.toggle('draw-active')
                if (toggleDrawPolygonButton){
                    drawPolygon()
                }
            })

            return div
        }
    });

    /*L.control.customdrawgeometrytools = function(opts){
        return new L.Control.CustomDrawGeometryTools(opts)
    };
    L.control.customdrawgeometrytools({position: 'topleft'}).addTo(mymap)*/

    // this code is the same as the code above
    var myCustomTool = new L.Control.CustomDrawGeometryTools({
        position: 'topleft'
    }).addTo(mymap);

    // svg overlay example
    // image overlay
    var svgURL = './data/smoking-mouse.svg';
    var svgBounds = [[-32.32427558887655, 129.11132812500003], [-19.228176737766248, 143.43750000000003]];
    var svgOverlay = L.imageOverlay(svgURL, svgBounds, {interactive: true})

    // circle layer
    var circle = L.circle([50.5, 30.5], {radius: 100000, color:'red'});
    var secondCircle = L.circleMarker([40.5, 40,5], {radius: 10});

    // feature group
    var featureGroup = L.featureGroup([circle, secondCircle, svgOverlay])
        .on('click', function(e){
            console.log('hey, you clicked on the featureGroup')
        })
        .addTo(mymap);

    featureGroup.bindPopup('Hi')

    featureGroup.setStyle({
        color: 'green'
    });

    // geoJson - point style
    var pointStyle = {
        radius: 50000,
        color: 'black'
    }
    
    // functon to add geoJson to the map
    function addGeoJSONData(data){
        // you can write like this (with variable),
        let geoJSONlayer = L.geoJSON(data, {
            // circles
            pointToLayer: function(feature, latlng){
                return L.circle(latlng, pointStyle)
            },
            // filter option
            filter: function(feature){
                if (feature.properties.active === 'true'){
                    return feature
                }
            }
        })
        geoJSONlayer.bindPopup(function(layer){
            return layer.feature.properties.name
        })
        geoJSONlayer.addTo(mymap)

        // or like this
        // L.geoJSON(data, {})
        //     .bindPopup(function(layer){
        //         return layer.feature.properties.name
        //     })
        //     .addTo(mymap)
    };
    
    // fetch API
    fetch('./data/europan_cities.geojson', {
        method: 'GET',
        mode: 'same-origin'
    })
        .then(function(response){
            if (response.status === 200){
                return response.json(response)
            } else {
                return new Error('fetch API could not fetch the data')
            }
        })
        .then(function(geojson){
            addGeoJSONData(geojson)
        })
        .catch(function(error){
            console.log(error)
        })
}