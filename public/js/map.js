window.onload = function() {

            var baseLayer = L.tileLayer(
              'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}.png',{
                attribution: 'Esri, HERE, MapmyIndia, © OpenStreetMap contributors, and the GIS user community. Data: http://geoportalgasolineras.es/',
                maxZoom: 18
              }
            );

            
            var map = new L.Map('map', {
                center: new L.LatLng(40.6586, -1.3568),
                zoom: 6,
                layers: [baseLayer]
            });

            var ts_hms = new Date();
            var today = ts_hms.getFullYear() +
                ("0" + (ts_hms.getMonth() + 1)).slice(-2)  + 
                ("0" + (ts_hms.getDate())).slice(-2);

            var jsonURL = "https://sigon426.github.io/precio-carburante/data/"+ today +".json";

            var geojsonData ={
                "type": "FeatureCollection",
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },                                                         
                "features": []
            }
            var breaks = [0.718, 0.927, 1.074, 1.26];
            function getColor(precio) {
                return precio >= breaks[2] ? 'red' :
                       precio >= breaks[1]  ? 'yellow' :
                       precio >= breaks[0]  ? 'green' :
                            'blue';
            }

            function gasolinerasStyle(feature) {
                return {
                    radius: 5,
                    fillColor: getColor(feature.properties.Gasolina95),
                    color: "transparent",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.7
                };
            }

            // get precio carburante json data and convert it to geojson
            $.getJSON(jsonURL, function(response) {
                document.getElementById('updated').innerHTML = "Precio actualizado en : "+ response.Fecha;
                //var orderedPrices = _.orderBy(response.ListaEESSPrecio, ['Municipio', 'Precio Gasolina 95 Protección'], ['asc', 'asc']);
                //console.log(orderedPrices);
                _.forEach(response.ListaEESSPrecio, function(station) {
                    var lat = station['Latitud'];
                    lat = lat  ? lat.replace(",", ".") : null;
                    var lng = station['Longitud (WGS84)'];
                    lng = lng ? lng.replace(",", "."): null;
                    lat = _.toNumber(lat);
                    lng = _.toNumber(lng);
                    //http://mappingandco.github.io/geojsonDB/spain/spa_adm4.geojson

                    var pGasolina95 = station['Precio Gasolina 95 Protección'];
                    var pGasolina98 = station['Precio Gasolina  98'];
                    var pDiesel = station["Precio Gasoleo A"];
                    if (pGasolina95 != null) {
                        
                        pGasolina95 = (pGasolina95 != null) ? pGasolina95.replace(",", ".") : null;
                        pGasolina98 = (pGasolina98 != null) ? pGasolina98.replace(",", "."): null;
                        pDiesel = (pDiesel != null) ? pDiesel.replace(",", ".") : null;
                            
                        var gasolinera = { 
                            "type": "Feature", 
                            "properties": { 
                                "Provincia": station["Provincia"], 
                                "Municipio": station["Municipio"], 
                                "Localidad": station["Localidad"],
                                "C.P.": station["C.P."], 
                                "Direcci?n": station["Dirección"], 
                                "Margen": station["Margen"], //(I, D o N)
                                "Gasolina95": _.toNumber(pGasolina95) || 'N/A', 
                                "Gasolina98": _.toNumber(pGasolina98)|| 'N/A', 
                                "Diesel": _.toNumber(pDiesel)|| 'N/A', 
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


                        //L.marker([lat, lng]).addTo(map).bindPopup("I am a green leaf.");
                        
                        //L.marker([lat, lng], {icon: L.AwesomeMarkers.icon({icon: 'spinner', markerColor: 'red', prefix: 'fa', spin:true}) }).addTo(map).bindPopup("I am a green leaf.");

                    }

                    
                });
                // geojson orderer by municipio and gas95 price
                geojsonData.features = _.orderBy(geojsonData.features, ['Municipio', 'Gasolina95'], ['asc', 'asc']);
                console.log('ordered');
                console.log(geojsonData.features);
                // geojson orderer by municipio and gas95 price
                //geojsonData.features = _.uniqBy(geojsonData.features, 'Municipio');
                //console.log('unique');
     


                console.log(geojsonData);
                // calculate breaks
                breaks = turf.jenks(geojsonData, 'Gasolina95', 3);// Returns Array.<number> the break number for each class plus the minimum and maximum values
                //[0.718, 0.927, 1.074, 1.26]
                console.log('breaks');
                console.log(breaks);
                var pMunicipio;
                var gasolineras_fcLayer = L.geoJson(geojsonData, {
                    // filter: function(feature, layer) {
                    //     var cMunicipio = feature.properties.Municipio;
                    //     if (pMunicipio !== cMunicipio){
                    //         pMunicipio = cMunicipio;
                    //         console.log(cMunicipio);
                    //         return true;
                    //     } else {
                    //         return false;

                    //     }
                    // },
                    onEachFeature: function(feature, layer) {
                        //stationsNumber++
                        layer.bindPopup("<h4>"+feature.properties.Rotulo+"</h4><br><b>Localidad:</b> " + feature.properties.Localidad +
                        "<br><b>Gasolina95: </b>" + feature.properties.Gasolina95 +
                        "<br><b>Gasolina98: </b>" + feature.properties.Gasolina98 +
                        "<br><b>Diesel: </b>" + feature.properties.Diesel +
                        "<br><b>Horario: </b>" + feature.properties.Horario+
                        "<br><b>Provincia: </b>" + feature.properties.Provincia);
                    },
                    pointToLayer: function (feature, latlng) {

                        return L.circleMarker(latlng);

                        
                    },
                    style: gasolinerasStyle
                }).addTo(map);
            });

};

