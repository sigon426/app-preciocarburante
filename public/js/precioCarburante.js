var PC = function (methods) {
    // constructor 
    var pcClass = function () {
        this.initialize.apply(this, arguments);
    };

    for (var property in methods) {
        pcClass.prototype[property] = methods[property];
    }

    return pcClass;
};

var PrecioCarburante = PC({
    /**
     * Geting current date, gas type, define intial variables, instantiate map
     */
    initialize: function () {
        this.fitBounds = !location.hash;
        var ts_hms = new Date();
        var today = ts_hms.getFullYear() +
            ("0" + (ts_hms.getMonth() + 1)).slice(-2)  + 
            ("0" + (ts_hms.getDate())).slice(-2);

        var query = this.parseQueryString(window.location.search);
        this.today = today;
        this.query = query;
        
        // available url query parameters
        // filter: not-this, only-this, bbox
        // provincia, municipio, bbox
        var qFilter = '&filter=' + query.filter;//not-this, only-this, bbox
        var qAdmin = '&admin=' + query.admin;// Provincia, Municipio
        var qList = '&list=' + query.list;;// comma separated list of 'municipios' or 'provincias'
        var updateURL = false;
        if (query.date){
            this.date = query.date;
        } else {
            updateURL = true;
            this.query['date'] = today;
            this.date = today;
        }
        // not include Islas Canarias, Ceuta and Melilla by default
        var defaultNotThisProvincias = 'PALMAS (LAS),SANTA CRUZ DE TENERIFE,MELILLA,CEUTA';
        if (!query.filter){
            this.query.filter = 'not-this';
            this.query.admin = 'Provincia';
            this.query.list = defaultNotThisProvincias;
            qFilter = '&filter=not-this';
            qAdmin = '&admin=Provincia';
            qList = '&list=' + defaultNotThisProvincias;
            updateURL = true;
        }

        // push history state on browser
        var locationHash = location.hash;
        if (updateURL){
            window.history.pushState({ date: today }, '', '?date='+this.date+qFilter+qAdmin+qList+locationHash);
        }

        var defaultBreaks = [0.718, 0.927, 1.074, 1.30];
        this.breaks = defaultBreaks;
        var gasType = location.pathname;
        this.gasType = gasType.slice(1);//gasolina95, gasolina98, diesel
        
        this.dictionary = {
            gasolina95: {
                magramaField: 'Precio Gasolina 95 Protección',
                appText: 'Gasolina 95'
            },
            gasolina98: {
                magramaField: 'Precio Gasolina  98',
                appText: 'Gasolina 98'
            },
            diesel: {
                magramaField: 'Precio Gasoleo A',
                appText: 'Diesel'
            }                    
        }

        this.gasMarkers = []; // array with the markers to be able to update later their style on zoomend
        var baseLayer = L.tileLayer(
          'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}.png',{
            maxZoom: 18
          }
        );
        var maplat =locationHash
        var maplng =locationHash
        var mapZoom =locationHash
        //TODO use location hash to center the map
        var map = new L.Map('map', {
            center: new L.LatLng(40.1410,-2.35107),
            zoom: 7,
            layers: [baseLayer],
            attributionControl: false
        });
        var hash = new L.Hash(map);

        this.map = map;
    },
    addLegend: function(){
        var map = this.map;
        var breaks = this.breaks;
        var legend = L.control({position: 'bottomright'});
        var dictionary = this.dictionary;
        var gasType = this.gasType;
        legend.onAdd = function (map) {
            function getColor(precio) {
                return precio >= breaks[2] ? 'red' :
                       precio >= breaks[1]  ? 'yellow' :
                       precio >= breaks[0]  ? 'green' :
                            'blue';
            }
            var div = L.DomUtil.create('div', 'info legend'),
                labels = [];
            div.innerHTML += '<p>Precio '+ dictionary[gasType].appText + ' (€/l)</p>';
            
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
    },
    yesterday: function(){
        var date = new Date();

        date.setDate(date.getDate() - 1);
        var yesterday = date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2)  + 
            ("0" + (date.getDate())).slice(-2);        
        
        this.yesterday = yesterday;
    },
    /**
     * Set date available on data file (price update)
     */    
    updatedOn: function(fecha){
        console.log('Precio actualizado el:');
        console.log(fecha);
        this.updated = fecha;
    },
    /**
     * Get a json object an create a feature collection (geoJSON)
     */  
    setFullGeojson: function (listaEESSPrecio){
        var geojsonData ={
            "type": "FeatureCollection",
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },                                                         
            "features": []
        }

        var gasTypeField = this.dictionary[this.gasType].magramaField;
        var query = this.query;
        console.log(query);
        var rotuloFilter = (query.rotulo)? _.toUpper(query.rotulo) : 'all';
        // populate geojson features
        _.forEach(listaEESSPrecio, function(station) {
            var lat = station['Latitud'];
            lat = lat  ? lat.replace(",", ".") : null;
            var lng = station['Longitud (WGS84)'];
            lng = lng ? lng.replace(",", "."): null;
            lat = _.toNumber(lat);
            lng = _.toNumber(lng);
            var price = station[gasTypeField];
            if (price !== null) {
                
                price = (price != null) ? price.replace(",", ".") : null;
                var gasolinera = { 
                    "type": "Feature", 
                    "properties": { 
                        "Provincia": station["Provincia"], 
                        "Municipio": station["Municipio"], 
                        "Localidad": station["Localidad"],
                        "C.P.": station["C.P."], 
                        "Direccion": station["Dirección"], 
                        "Margen": station["Margen"], //(I, D o N)
                        "price": _.toNumber(price) || 'N/A', 
                        "Rotulo": station["Rótulo"], 
                        "Horario":station["Horario"],
                        "TipoVenta":station["Tipo Venta"], 
                        "Remision":station["Remisión"] 
                    }, 
                    "geometry": { 
                        "type": "Point", 
                        "coordinates": [ lng, lat] 
                    } 
                }
                var admin = _.capitalize(query.admin);
                
                // 'provincias' needs to be uppercase
                switch(query.filter) {
                    case 'not-this':
                        // 'municipios' needs to be Capitalized
                        var notIncluded = query.list.split(',');
                        if (admin === 'Municipio'){
                            notIncluded = _.map(notIncluded, function (name) {
                                return _.capitalize(name);
                            });
                        } 
                        // 'provincias' needs to be uppercase
                        else {
                            notIncluded = _.map(notIncluded, function (name) {
                                return _.toUpper(name);
                            }); 
                        }
                        // add all except not included provinces
                        if (!_.includes(notIncluded, station[admin])){

                            if (rotuloFilter === 'all' || station['Rótulo'] === rotuloFilter )
                                geojsonData.features.push(gasolinera);
                        }
                        break;
                    case 'only-this':
                        // add only selected list
                        var addOnly = (query.list)? query.list.split(',') : '';
                        
                        // 'municipios' needs to be Capitalized
                        if (admin === 'Municipio'){
                            addOnly = _.map(addOnly, function (name) {
                                return _.capitalize(name);
                            });
                        } 
                        // 'provincias' needs to be uppercase
                        else {
                            addOnly = _.map(addOnly, function (name) {
                                return _.toUpper(name);
                            }); 
                        }
                        if (_.includes(addOnly, station[admin])){

                            if (rotuloFilter === 'all' || station['Rótulo'] === rotuloFilter )
                                geojsonData.features.push(gasolinera);
                        }                    
                        break;
                    case 'bbox':
                        if (rotuloFilter === 'all' || station['Rótulo'] === rotuloFilter )
                            geojsonData.features.push(gasolinera);
                        break;
                }

            }

        }); 

        if (geojsonData.features.length > 0){
            
            // if there is a bbox
            if (query.filter === 'bbox'){
                var bbox = (query.rectangle).split(',');
                // convert to float
                bbox = _.map(bbox, function(value) {
                    return parseFloat(value); 
                });
                console.log('bbox:');
                console.log(bbox);
 
                // convert bbox to polygon
                var polygon = turf.bboxPolygon(bbox);//feature
                var polygonFC ={
                    "type": "FeatureCollection",
                    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },                                                         
                    "features": [polygon]
                }
           
                var ptsWithin = turf.within(geojsonData, polygonFC);
                geojsonData = ptsWithin;

            }
            // calculate some statistics
            var values = _.map(geojsonData.features, function(d) {
                return + d.properties.price; 
            });
            this.descriptiveStat = {
                median: ss.median(values),
                mean: ss.mean(values),
                mode: ss.median(values),
                rootMeanSquare: ss.rootMeanSquare(values),
                standardDeviation: ss.standardDeviation(values),
                variance: ss.variance(values),
                datasetLength: geojsonData.features.length
            }
            console.log(this.descriptiveStat);
            // calculate jenks based data breaks
            var breaks = turf.jenks(geojsonData, 'price', 3);

            // sometimes jenks return not unique breaks, so ..
            if (_.uniq(breaks).length < 4){
                console.log('this are quantiles, not jenks');
                breaks = [ss.quantile(values, 0), ss.quantile(values, 0.33), ss.quantile(values, 0.66), ss.quantile(values, 1)]
            }
            console.log('breaks');
            console.log(breaks);
            this.breaks = breaks; 
            this.setHeaderText(geojsonData.features);
            updateText(this.headerTypingText); 
            this.gasStationGeojson = geojsonData;
            this.addGasolinerasLayerToMap(geojsonData);
            this.addLegend();
        } else {
            var headerTypingText = [];
            headerTypingText.push("<i class='fa fa-car'>  Precio actualizado el : "+ this.updated)
            headerTypingText.push("<i class='fa fa-warning'> No hay ninguna gasolinera con estos parametros." )

            updateText(headerTypingText)
        }
    },
    /*
     * Add gas station markers to the leaflet map
     */
    addGasolinerasLayerToMap: function(gasStationGeojson){
        var breaks = this.breaks;
        var gasMarkers = this.gasMarkers;
        var map = this.map;
        var query = this.query;
        var stats = this.descriptiveStat;
        var dictionary = this.dictionary;
        var gasType = this.gasType;
        function getColor(precio) {
            return precio >= breaks[2] ? 'red' :
                   precio >= breaks[1]  ? 'yellow' :
                   precio >= breaks[0]  ? 'green' :
                        'blue';
        }

        function gasolinerasStyle(feature) {
            return {
                radius: 3,
                fillColor: getColor(feature.properties.price),
                color: "transparent",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            };
        }
        var gasolineras_fcLayer = L.geoJson(gasStationGeojson, {
            filter: function(feature, layer) {
                var addBoolean = true;
                if (feature.geometry.coordinates[0]=== 0){
                    addBoolean = false
                }
                return addBoolean;

            },
            onEachFeature: function(feature, layer) {
                //stationsNumber++

                var priceDiference = feature.properties.price -stats.mean;
                var simbol = (priceDiference > 0)? '+' : '';
                var color = (priceDiference > 0)? 'red' : 'green';
                layer.bindPopup("<h3 class='popupHeader'>"+feature.properties.Rotulo+"</h3>"+
                "<br><strong>"+dictionary[gasType].appText+": </strong>" + feature.properties.price + ' €/l'+
                "<br><b>Horario: </b>" + feature.properties.Horario+
                "<br><b>Localidad:</b> " + feature.properties.Localidad +
                "<br><b>Direccion: </b>" + feature.properties.Direccion+
                "<br><b>Provincia: </b>" + feature.properties.Provincia+
                "<p>Diferencia con la media: = "+
                "<span style='color:"+color+"'>"+simbol+priceDiference.toFixed(3)+
                "</span></p>");
                
            },
            pointToLayer: function (feature, latlng) {
                if (feature.properties.price === breaks[0]){

                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon: 'star', markerColor: 'green', prefix: 'fa'}) }).addTo(map).openPopup();;
                } else if (feature.properties.price === breaks[3]){
                    return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon: 'warning', markerColor: 'red', prefix: 'fa'}) }).addTo(map).openPopup();;

                } else {
                    var gasolineraMarker = L.circleMarker(latlng);
                    gasMarkers.push(gasolineraMarker);
                    return gasolineraMarker;
                }
            },
            style: gasolinerasStyle
        }).addTo(map);
        this.markerLayer = gasolineras_fcLayer;
        if (this.fitBounds)
            this.map.fitBounds(gasolineras_fcLayer.getBounds());
        this.gasMarkers = gasMarkers;
    },
    /**
     * Reset app when selected date is not available
     */
    reset: function () {
        // the error is because today's file is not ready yet
        if (this.date === this.today){
            this.yesterday();//calculate yesterday date
            this.date = this.yesterday
        // the error is because the selected date is not available as a file
        } else{
            this.date = this.today;

        }
        window.history.pushState({ date: this.date }, '', '?date='+this.date);
        location.reload();
        console.log('reset')
    },
    /*
     * Array of texts to be included as an animation on the header
     */
    setHeaderText: function (features) {
        var headerTypingText = []
        var gasType = this.gasType;

        headerTypingText.push("<i class='fa fa-car'> " +  this.dictionary[gasType].appText + ", Precio actualizado el : "+ this.updated)

        // find highest and lowest stations
        var highest, lowest;
        var breaks = this.breaks;
        var lineBreak = ' ';
        _.forEach(features, function(station, index) {
            if (station.properties.price === breaks[3]){
                highest = station.properties;
            } else if (station.properties.price === breaks[0]){
                lowest =station.properties;
            }
        });

        // add line break on small screens
        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.screen.width

        if (width < 1000){
            lineBreak = '<br>&nbsp;&nbsp;&nbsp;';
        }
        var stats= this.descriptiveStat;
        headerTypingText.push("<i class='fa fa-warning'></i> Precio mas elevado: "+ breaks[3] + " €/l,"+lineBreak+highest.Localidad  + lineBreak +'('+highest.Provincia+')');
        headerTypingText.push("<i class='fa fa-star'></i> Precio mas económico: " + breaks[0]+ " €/l,"+ lineBreak+lowest.Localidad+ lineBreak + '('+lowest.Provincia+')');
        headerTypingText.push("<i class='fa fa-info'></i> Media: " + (stats.mean).toFixed(3)+ " , Mediana: "+ (stats.median).toFixed(3)+", moda: "+(stats.mode).toFixed(3));
        headerTypingText.push("<i class='fa fa-info'></i> Hay " + stats.datasetLength+ " gasolineras en este dataset ");
        this.headerTypingText = headerTypingText;
    },
    /*
     * Takes array of bounding box coordinates in the form: [xLow, yLow, xHigh, yHigh]
     * Map display data that is within that box
     */    
    bbox:function(bbox){
        console.log(bbox);
        this.bbox = bbox;
        var query = this.parseQueryString(window.location.search);
        var rotuloFilter ='';
        if (query.rotulo){
            rotuloFilter = '&rotulo=' + query.rotulo;
        }
        window.history.pushState({ date: this.date }, '', '?date='+query.date+'&filter=bbox&rectangle='+bbox + rotuloFilter);
        location.reload();
        // // convert bbox to polygon
        // var polygon = turf.bboxPolygon(bbox);//feature
        // var polygonFC ={
        //     "type": "FeatureCollection",
        //     "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },                                                         
        //     "features": [polygon]
        // }
        // console.log(this.gasStationGeojson);
        // console.log(polygonFC);
        // var ptsWithin = turf.within(this.gasStationGeojson, polygonFC);
        // console.log('resultante');
        // console.log(ptsWithin);
        // //remove previous marker layer
        // this.map.removeLayer(this.markerLayer); 
        // this.addGasolinerasLayerToMap(ptsWithin)
    }, 
    timeMachine: function (newDate){
        this.today = newDate;
    },
    setBreaks: function (breaks){
        this.breaks = breaks;
    }, 
    /*
     * Parse URL search parameters
     */    
    parseQueryString: function(queryString){
        // get URL params
        if (!_.isString(queryString))
            return;
        queryString = queryString.substring(queryString.indexOf('?') + 1);
        var params = {};
        var queryParts = decodeURI(queryString).split(/&/g);
        _.each(queryParts, function (val) {
            var parts = val.split('=');
            if (parts.length >= 1) {
                var theValue = undefined;
                if (parts.length == 2)
                    theValue = parts[1];
                params[parts[0]] = theValue;
            }
        });
        return params;
    }
});

