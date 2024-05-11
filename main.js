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
    
    const openStreetMapStandard_Basic_V2 = L.tileLayer('https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=kQXJkJvo0vUB8ShEOBA2', {
        maxZoom: 19,
        // noWrap: true,
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
    });

    var crs = new L.Proj.CRS('EPSG:3006',
        '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        {
            resolutions: [
                8192, 4096, 2048, 1024, 512, 256, 128,
                64, 32, 16, 8, 4, 2, 1, 0.5
            ],
            origin: [0, 0],
            bounds: L.bounds([218128.7031, 6126002.9379], [1083427.2970, 7692850.9468])
        })

    var kartenaBasemap = L.tileLayer('https://api.geosition.com/tile/osm-bright-3006/{z}/{x}/{y}.png', {
        maxZoom: 14,
        // minZoom: 0,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, Imagery &copy; <a href="http://www.kartena.se/">Kartena</a>'
    })
    
    // initialize the map
    const mymap = L.map(mapElement, {
        center: [-27.059125784374054, 134.03320312500003],
        zoom: 4,
        minZoom: 1,
        zoomSnap: 0.25,
        zoomDelta: 0.25,
        easeLinearity: 0.5,
        // worldCopyJump: true, 
        layers: [openStreetMapStandard], // sett your default map in here
        // layers: [openStreetMapStandard_Basic_V2], // sett your default map in here
        // layers: [kartenaBasemap], // sett your default map in here
        // crs: L.CRS.EPSG3857,
        // crs: crs

    });

    // mymap.setView([57.704, 11.965], 13);


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
    const layerControl = L.control.layers(baseLayers, overLayLayers, {
        collapsed: false,
        position: 'topright',
    }).addTo(mymap);
    
    // perth marker
    const perthMarker = L.marker([-32.0546446905493, 115.87280273437501], {
        title: 'Perth City',
        opacity: 1
    })
    layerControl.addOverlay(perthMarker, 'Perth')

    const perthMarkerPopup = perthMarker.bindPopup('Perth City from the popup') //.openPopup(); for make auto open popup
    const perthMarkerTooltip = perthMarker.bindTooltip("my tooltip text") //.openTooltip(); for make auto open tooltip

    // video overlay
    var videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
        videoBounds = [[32, -130], [13, -100]];
        videoOverlay = L.videoOverlay(videoUrl, videoBounds)
    
    layerControl.addOverlay(videoOverlay, 'Video Overlay')
    
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
    
    layerControl.addOverlay(featureGroup, 'Feature Group')

    featureGroup.bindPopup('Hi')

    featureGroup.setStyle({
        color: 'green'
    });

    // geoJson - point style
    var pointStyle = {
        radius: 50000,
        color: 'black',
        stroke: true,
        wigth: 6,
        fillColor: 'green',
        fillOpacity: 0.5
    }
    // hoverstyle
    var hoverStyle = {
        radius: 50000,
        color: 'blue',
        stroke: true,
        wigth: 6,
        fillColor: 'yellow',
        fillOpacity: 0.5
    }
    
    // functon to add geoJson to the map
    function addGeoJSONData(data, layername){
        // example layer order part 2
        /*let javaIslandPane = mymap.createPane('java-island');
        let indonesianCitiesPane = mymap.createPane('indonesian-cities')
        let geoJSONLayer;

        switch (layername){
            case 'Indonesian Cities':
                mymap.getPane('indonesian-cities').style.zIndex = 401
                geoJSONLayer = L.geoJSON(data, {
                    pane: 'indonesian-cities',
                    style: { color: 'black', fillOpacity: 1 }
                }).addTo(mymap);
                break;

            case 'Java Island':
                mymap.getPane('java-island').style.zIndex = 400
                geoJSONLayer = L.geoJSON(data, {
                    pane: 'java-island',
                    style: { color: 'green', fillOpacity: 1 }
                }).addTo(mymap);
                break;

            default:
                geoJSONLayer = L.geoJSON(data, {}).addTo(mymap)
        }*/
        
        // you can write like this (with variable),
        let geoJSONlayer = L.geoJSON(data, {
            // circles
            pointToLayer: function(feature, latlng){
                switch (feature.properties.name){
                    case 'Jakarta':
                        return L.marker(latlng)
                    default:
                        return L.circle(latlng, pointStyle)
                }
            },
            // filter option
            filter: function(feature){
                if (feature.properties.active === 'true'){
                    return feature
                }
            },

            // line styling
            style: function(feature){
                if (feature.geometry.type === 'LineString'){
                    return {color: 'orange', weight: 5}
                }
            },

            // popup for layers & style for polygons
            onEachFeature: function(feature, layer){
                // style for pilygons
                if (feature.geometry.type === 'Polygon'){
                    layer.setStyle({color: 'red', fillOpacity: 0.5})
                }

                // popup for layers
                if (feature.properties.name){
                    layer.bindPopup(feature.properties.name)
                } else {
                    layer.bindPopup('no content to show')
                }
            }
        })

        geoJSONlayer.addTo(mymap)

        // sending the Indonesian Cities layer to back of all other layers
        if (layername === 'Indonesian Cities'){
            geoJSONlayer.bringToBack()
        }

        // mouseover event - set hoverstyle
        geoJSONlayer.on('mouseover', function(e){
            if (e.layer instanceof L.Circle){
                e.layer.setStyle(hoverStyle)
            }
        })
        
        // mouseout event - set default style
        geoJSONlayer.on('mouseout', function(e){
            if (e.layer instanceof L.Circle){
                geoJSONlayer.resetStyle(e.layer)
            }
        })
        
        layerControl.addOverlay(geoJSONlayer, layername)

        // or like this
        // L.geoJSON(data, {})
        //     .bindPopup(function(layer){
        //         return layer.feature.properties.name
        //     })
        //     .addTo(mymap)
    }
    
    // fetch API
    function fetchData(url, layername){
        fetch(url, {
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
                addGeoJSONData(geojson, layername)
            })
            .catch(function(error){
                console.log(error)
            })
    };

    fetchData('./data/europan_cities.geojson', 'European Cities')
    fetchData('./data/southeast_cities.geojson', 'Southeast Cities')
    fetchData('./data/indonesian_major_roads.geojson', 'Indonesian Major Roads')
    fetchData('./data/indonesian_cities.geojson', 'Indonesian Cities')
    // layer order part 2
    // fetchData('./data/java_island.geojson', 'Java Island')

    // WMS Layer
    var wmsURL = 'https://services.ga.gov.au/gis/services/2021GHG_AcreageReleaseAreas/MapServer/WmsServer?'
    const wmsLayer = L.tileLayer.wms(wmsURL, {
        layers: '2021GHG_AcreageReleaseAreas',
        format: 'image/png',
        transparent: true,
        maxZoom: 20,
        styles: 'default',
        opacity: 1,
        version: '1.3.0',
        tileSize: 256,
        bounds: [[-21.000000, 115.000000], [-11.000000, 130.500000]],
        attribution: '© Commonwealth of Australia (Geoscience Australia) 2021. This product is released under the Creative Commons Attribution 4.0 International Licence. http://creativecommons.org/licenses/by/4.0/legalcode'
    });

    layerControl.addOverlay(wmsLayer, 'Acreage Release Areas')
    mymap.fitBounds([[-21.000000, 115.000000], [-11.000000, 130.500000]])

    // WFS Layer
    var WFSURL = 'https://services.ga.gov.au/gis/services/CW_1970_1980/MapServer/WFSServer?' +
    'service=wfs&' +
    'version=2.0.0&' +
    'request=GetFeature&' +
    'typeNames=CW_1970_1980:CW_1970_1980_Limits&' +
    'srsName=EPSG::4326&' +
    'outputFormat=GEOJSON'

    function addWFSData(WFSData, layername){
        let WFSLayer = L.geoJSON(WFSData, {
            coordsToLatLng: function(coords){
                return new L.LatLng(coords[0][1], coords[0][0])
            }
        }).addTo(mymap)

        layerControl.addOverlay(WFSLayer, layername)
    };
    
    // fetch API
    function fetchWFS(url, layername) {
        fetch(url, {
            method: 'GET',
            mode: 'cors'
        })
            .then(function (response) {
                if (response.status === 200) {
                    return response.json(response)
                } else {
                    return new Error('fetch API could not fetch the data')
                }
            })
            .then(function (geojson) {
                addWFSData(geojson, layername)
            })
            .catch(function (error) {
                console.log(error)
            })
    };

    fetchWFS(WFSURL, 'Water Features of Australia')

    // leaflet fraw plugin
    var drawnItems = new L.FeatureGroup();
    mymap.addLayer(drawnItems);
    var drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
            marker: true
        },
        edit: {
            featureGroup: drawnItems,
            edit: true
        }
    });
    mymap.addControl(drawControl);

    mymap.on('draw:created', function(e){
        drawnItems.addLayer(e.layer)
    })
}