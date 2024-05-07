window.onload = init;

function init() {


    const mapElement = document.getElementById('mapid')
    
    const mymap = L.map(mapElement, {
        center: [48, 14],
        zoom: 5,
        minZoom: 4,
        layers: [
            L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
                attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                ext: 'png'
            })
        ]
    })

    mymap.on('resize', function(e){
        console.log('The map has been resized')
    })

    mymap.on('resize', function(e){
        mymap.flyTo([0, 0])
    })

    console.log(mymap.getPanes().tilePane)
}