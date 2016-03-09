window.onload = function() {

            var baseLayer = L.tileLayer(
              'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}.png',{
                attribution: 'Esri, HERE, MapmyIndia, © OpenStreetMap contributors, and the GIS user community. Data: http://geoportalgasolineras.es/',
                maxZoom: 18
              }
            );

            var cfg = {
                // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                "radius": 0.1,//The radius each datapoint will have (if not specified on the datapoint itself)
                "maxOpacity": .8, 
                // scales the radius based on map zoom
                "scaleRadius": true, 
                // if set to false the heatmap uses the global maximum for colorization
                // if activated: uses the data maximum within the current map boundaries 
                //   (there will always be a red spot with useLocalExtremas true)
                "useLocalExtrema": true,
                // which field name in your data represents the latitude - default "lat"
                latField: 'lat',
                // which field name in your data represents the longitude - default "lng"
                lngField: 'lng',
                // which field name in your data represents the data value - default "value"
                valueField: 'Precio Gasolina 95 Protección'
            }

            var heatmapLayer = new HeatmapOverlay(cfg);

            var heatmapData = {max:1.4, min:0.7, data:[]};
            
            var map = new L.Map('map', {
                center: new L.LatLng(40.6586, -1.3568),
                zoom: 6,
                layers: [baseLayer, heatmapLayer]
            });

            var ts_hms = new Date();
            var today = ts_hms.getFullYear() +
                ("0" + (ts_hms.getMonth() + 1)).slice(-2)  + 
                ("0" + (ts_hms.getDate())).slice(-2);

            var geojsonURL = "https://sigon426.github.io/precio-carburante/data/"+ today +".json";

            $.getJSON(geojsonURL, function(response) {
                document.getElementById('updated').innerHTML = "Precio actualizado en : "+ response.Fecha;

                _.forEach(response.ListaEESSPrecio, function(station) {
                    var lat = station['Latitud'];
                    lat = lat  ? lat.replace(",", ".") : null;
                    var lng = station['Longitud (WGS84)'];
                    lng = lng ? lng.replace(",", "."): null;
                    var pGasolina95 = station['Precio Gasolina 95 Protección'];
                    if (pGasolina95 != null) {
                        pGasolina95 = pGasolina95.replace(",", ".");

                        heatmapData.data.push({
                            'lat':_.toNumber(lat), 
                            'lng': _.toNumber(lng), 
                            'gasolina95': _.toNumber(pGasolina95)
                        });
                    }
                });
                run(0.98);

            });


            function run(max){
                var filteredHeatmapData = {max:1.4, min:0.7, data:[]};
                var data = heatmapData.data;
                for (var i = 0; i < heatmapData.data.length; i++) {
                    if (heatmapData.data[i].gasolina95 < max) {
                    filteredHeatmapData.data.push({'lat':heatmapData.data[i].lat, 'lng': heatmapData.data[i].lng, 'gasolina95': heatmapData.data[i].gasolina95})
                    }
                }

                heatmapLayer.setData(filteredHeatmapData);
                document.getElementById('numStations').innerHTML = "Número de estaciones : "+ filteredHeatmapData.data.length;

            }
            $( "#price" ).change(function() {
                var newMin = $( "#price" ).val();
                run(newMin)
            });
            // make accessible for debugging
            layer = heatmapLayer;
};