<script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js" integrity="sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM=" crossorigin=""></script>
<script src = "C:\Users\jurge\Desktop\Stellenbosch\2023(Hons)\Modules\GIT 713\Leaflet\polgon.js"></script>
<script src = "C:\Users\jurge\Desktop\Stellenbosch\2023(Hons)\Modules\GIT 713\Leaflet\Beds.js"></script>
<script src = "C:\Users\jurge\Desktop\Stellenbosch\2023(Hons)\Modules\GIT 713\Leaflet\bedSymbology.js"></script>
<script src = "C:\Users\jurge\Desktop\Stellenbosch\2023(Hons)\Modules\GIT 713\Leaflet\trees.js"></script>
<script src = 'C:\Users\jurge\Desktop\Stellenbosch\2023(Hons)\Modules\GIT 713\Leaflet\background.js'></script>

//Map initialisation
var map = L.map('map').setView([-33.9362, 18.8648], 18);

var infoDiv = document.getElementById('info');


//See zoom level
L.control.scale().addTo(map);

//Basemap 
//OSM layer
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map);

//tile provider
//https://leaflet-extras.github.io/leaflet-providers/preview/

//https://gis.stackexchange.com/questions/225098/using-google-maps-static-tiles-with-leaflet
googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 25,
    subdomains:['mt0','mt1','mt2','mt3']
});

googleStreets.addTo(map);

//geojson

L.geoJSON(background, {
  style: {
    fillOpacity: 1,
    opacity: 1,
    fillColor: '#ffb6c1',
    stroke: true,
    weight: 1.5
  }
}).addTo(map);

var smallTreesLayer = L.geoJSON(trees, {
    filter: function(feature, layer) {
        return feature.properties.size === 'small';
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 8,
            fillColor: 'blue',
            fillOpacity: 1,
            stroke: false
        });
    },
    onEachFeature: function (feature, layer) {
            layer.on({
                mouseover: function (event) {
                    layer.bindPopup('<b>Tree size: </b>' + feature.properties.size).openPopup();
                },
                mouseout: function (event) {
                    layer.closePopup();
                }
            });
        layer.on('click', function(e) {
            document.getElementById('info').textContent = 'Tree size: ' + feature.properties.size + ' ' +'(Circumference = '+feature.properties.circumference+')';
        });
    }
});

var largeTreesLayer = L.geoJSON(trees, {
    filter: function(feature, layer) {
        return feature.properties.size === 'large';
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 8,
            fillColor: 'red',
            fillOpacity: 1,
            stroke: false
        });
    },
    onEachFeature: function (feature, layer) {
            layer.on({
                mouseover: function (event) {
                    layer.bindPopup('<b>Tree size: </b>' + feature.properties.size).openPopup();
                },
                mouseout: function (event) {
                    layer.closePopup();
                }
            });
        layer.on('click', function(e) {
            document.getElementById('info').textContent = 'Tree size: ' + feature.properties.size + ' ' +'(Circumference = '+feature.properties.circumference+')';
        });
    }
});

var treesOverlay = L.layerGroup();
var smallt = L.layerGroup();
var larget = L.layerGroup();

// Check zoom level before adding small/large trees layers to the treesOverlay layer
var zoomLevel = map.getZoom();
if (zoomLevel >= 19) {
    treesOverlay.addLayer(smallTreesLayer);
    treesOverlay.addLayer(largeTreesLayer);
}

//layercontroller
var baseLayers = {
    'OSM': osm,
    'Google Street': googleStreets
};

var overlays = {
    'Plant Beds': L.geoJSON(Beds, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup('<b>Bed name: </b>' + feature.properties.Display_name);
        },
        style: function (feature) {
            var bedName = feature.properties.Display_name;

            for (var j = 0; j < bedsym.length; j++) {
                var name = bedsym[j].name;

                if (bedName === name) {
                    return {
                        fillColor: bedsym[j].color,
                        fillOpacity: 1,
                        stroke: false
                    };
                }
            }

            return {
                fillColor: '#000000',
                fillOpacity: 1,
                stroke: false
            };
        } 
    }),
    'Small Trees': smallt,
    'Large Trees': larget
};

// Add the 'Plant Beds' layer to the map by default
overlays['Plant Beds'].addTo(map);
//Zoom levels check


function updateTreesOverlay() {
    var zoomLevel = map.getZoom();
    if (zoomLevel >= 19) {
        if (!smallt.hasLayer(smallTreesLayer)) {
          smallt.addLayer(smallTreesLayer);
        }
        if (!larget.hasLayer(largeTreesLayer)) {
          larget.addLayer(largeTreesLayer);
        }
    } else {
        if (smallt.hasLayer(smallTreesLayer)) {
          smallt.removeLayer(smallTreesLayer);
        }
        if (larget.hasLayer(largeTreesLayer)) {
          larget.removeLayer(largeTreesLayer);
        }
    }
}

map.on('zoomend', updateTreesOverlay);

L.control.layers(baseLayers, overlays).addTo(map);

//north arrow
var north = L.control({position: "topright"});
north.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML = '<img src="pngtree-compass-png-image_2961664.jpg" style="width: 50px; height: 50px;">';
    return div;
}
north.addTo(map);