window.onload = function() {

            var baseLayer = L.tileLayer(
              'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}.png',{
                //attribution: 'Esri, HERE, MapmyIndia, © OpenStreetMap contributors, and the GIS user community. Data: http://geoportalgasolineras.es/',
                maxZoom: 18
              }
            );

            var gasMarkers = [];
            var headerTypingText = [];
            
            var map = new L.Map('map', {
                center: new L.LatLng(40.1410,-2.35107),
                zoom: 7,
                layers: [baseLayer],
                attributionControl: false
            });
            var hash = new L.Hash(map);
            var precioCarburante = new PrecioCarburante();

            var jsonURL = "https://sigon426.github.io/precio-carburante/data/"+ precioCarburante.date +".json";

            var geojsonData ={
                "type": "FeatureCollection",
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },                                                         
                "features": []
            }
            var breaks = [];
            function getColor(precio) {
                return precio >= breaks[2] ? 'red' :
                       precio >= breaks[1]  ? 'yellow' :
                       precio >= breaks[0]  ? 'green' :
                            'blue';
            }

            function gasolinerasStyle(feature) {
                return {
                    radius: 3,
                    fillColor: getColor(feature.properties.diesel),
                    color: "transparent",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.7
                };
            }

            // get precio carburante json data and convert it to geojson
            $.getJSON(jsonURL, function(response) {
                precioCarburante.updatedOn(response.Fecha);
                headerTypingText.push("<i class='fa fa-car'> Diesel, Precio actualizado el : "+ response.Fecha)

                _.forEach(response.ListaEESSPrecio, function(station) {
                    var lat = station['Latitud'];
                    lat = lat  ? lat.replace(",", ".") : null;
                    var lng = station['Longitud (WGS84)'];
                    lng = lng ? lng.replace(",", "."): null;
                    lat = _.toNumber(lat);
                    lng = _.toNumber(lng);

                    var pDiesel = station["Precio Gasoleo A"];
                    if (pDiesel != null) {
                        
                        pDiesel = (pDiesel != null) ? pDiesel.replace(",", ".") : null;
                        var gasolinera = { 
                            "type": "Feature", 
                            "properties": { 
                                "Provincia": station["Provincia"], 
                                "Municipio": station["Municipio"], 
                                "Localidad": station["Localidad"],
                                "C.P.": station["C.P."], 
                                "Direccion": station["Dirección"], 
                                "Margen": station["Margen"], //(I, D o N)
                                "diesel": _.toNumber(pDiesel) || 'N/A', 
                                "Rotulo": station["Rótulo"], 
                                "Horario":station["Horario"] 
                            }, 
                            "geometry": { 
                                "type": "Point", 
                                "coordinates": [ lng, lat] 
                            } 
                        }
                        if (station["Provincia"] !== 'PALMAS (LAS)' &&  station["Provincia"] !== 'SANTA CRUZ DE TENERIFE' && station["Provincia"] !== 'MELILLA' && station["Provincia"] !== 'CEUTA'){
                            geojsonData.features.push(gasolinera);
                        }

                    }
   
                });

                // calculate breaks
                breaks = turf.jenks(geojsonData, 'diesel', 3);// Returns Array.<number> the break number for each class plus the minimum and maximum values
                precioCarburante.setBreaks(breaks);
                precioCarburante.setHeaderText(geojsonData.features);
                updateText(precioCarburante.headerTypingText);
                /*
                * add gas stations layer
                */
                var pMunicipio;
                var gasolineras_fcLayer = L.geoJson(geojsonData, {

                    onEachFeature: function(feature, layer) {
                        //stationsNumber++
                        layer.bindPopup("<h4>"+feature.properties.Rotulo+"</h4><br><b>Localidad:</b> " + feature.properties.Localidad +
                        "<br><b>Diesel: </b>" + feature.properties.diesel + ' €/l'+
                        "<br><b>Horario: </b>" + feature.properties.Horario+
                        "<br><b>Direccion: </b>" + feature.properties.Direccion+
                        "<br><b>Provincia: </b>" + feature.properties.Provincia);
                        
                    },
                    pointToLayer: function (feature, latlng) {
                        if (feature.properties.diesel === breaks[0]){

                            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon: 'star', markerColor: 'green', prefix: 'fa'}) }).addTo(map).openPopup();;
                        } else if (feature.properties.diesel === breaks[3]){
                            return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon: 'warning', markerColor: 'red', prefix: 'fa'}) }).addTo(map).openPopup();;

                        } else {
                            var gasolineraMarker = L.circleMarker(latlng);
                            gasMarkers.push(gasolineraMarker);
                            return gasolineraMarker;
                        }
                    },
                    style: gasolinerasStyle
                }).addTo(map);
                /*
                * add legend
                */
                var legend = L.control({position: 'bottomright'});

                legend.onAdd = function (map) {
                    console.log(breaks);
                    var div = L.DomUtil.create('div', 'info legend'),
                        labels = [];
                    div.innerHTML += '<p>Precio Diesel (€/l)</p>';
                    // loop through our density intervals and generate a label with a colored square for each interval
                    for (var i = 0; i < breaks.length -1; i++) {
                        var next = (i == breaks.length -2)? breaks[i + 1] : (breaks[i + 1]) -0.001
                        div.innerHTML +=
                            '<i style="background:' + getColor(breaks[i]) + '"></i> ' +
                            breaks[i] + '&ndash;' + next.toFixed(3) + '<br>';
                            //breaks[i] + (i == breaks.length -1)? '&ndash;' + (next +0.001)+ '<br>' : breaks[i] + '&ndash;' + next + '<br>'
                    }

                    return div;
                };

                legend.addTo(map);
            }).fail(function() {
                precioCarburante.reset();
            })

            map.on('zoomend', function () {
                var i;
                if (map.getZoom() < 13) {

                    for (i = 0; i < gasMarkers.length; i++) {
                        gasMarkers[i].setStyle({radius:3});
                    }
                } else {
                    for (i = 0; i < gasMarkers.length; i++) {
                        gasMarkers[i].setStyle({radius:8});
                    }        
                }
            })
};

