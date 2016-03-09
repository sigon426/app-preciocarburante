window.onload = function() {

    var precioCarburante = new PrecioCarburante();

    var jsonURL = "https://sigon426.github.io/precio-carburante/data/"+ precioCarburante.date +".json";

    // get precio carburante json data and convert it to geojson, populate map
    $.getJSON(jsonURL, function(response) {
        precioCarburante.updatedOn(response.Fecha);
        document.getElementById('updated').innerHTML = "Gasolina 95, Precio actualizado el : "+ response.Fecha;

        precioCarburante.setFullGeojson(response.ListaEESSPrecio);

    }).done(function() {
    })
    .fail(function() {
        precioCarburante.reset();
    })
    .always(function() {
    });

    precioCarburante.map.on('zoomend', function () {
        var i;
        var gasMarkers = precioCarburante.gasMarkers;
        if (precioCarburante.map.getZoom() < 13 ) {

            for (i = 0; i < gasMarkers.length; i++) {
                gasMarkers[i].setStyle({radius:3});
            }
        } else {
            for (i = 0; i < gasMarkers.length; i++) {
                gasMarkers[i].setStyle({radius:8});
            }        
        }
    });
    var bboxButtom = document.getElementById("bbox");
    bboxButtom.addEventListener("click", _onClickBbox, false);
    
    function _onClickBbox(){
        var bounds = precioCarburante.map.getBounds();
        //Array of bounding box coordinates in the form: [xLow, yLow, xHigh, yHigh]
        var bbox = [bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat];
        precioCarburante.bbox(bbox);
    }
};

