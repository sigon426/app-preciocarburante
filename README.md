
.. image:: https://img.shields.io/badge/License-GNU-blue.svg
    :target: https://github.com/sigon426/app-preciocarburante/blob/master/LICENSE


[![License](https://img.shields.io/badge/License-GNU-blue.svg)](https://github.com/sigon426/app-preciocarburante/blob/master/LICENSE)
 
 .. image:: https://img.shields.io/badge/License-GNU-blue.svg
    :target: https://github.com/sigon426/app-preciocarburante/blob/master/LICENSE
    :alt: License


# Precio Carburante


Petrol prices in Spain, updated daily.

http://app-preciocarburante.rhcloud.com/gasolina95

http://app-preciocarburante.rhcloud.com/gasolina98

http://app-preciocarburante.rhcloud.com/diesel 

## Dataset Filters

### If we want to compare the prices of gasolina 95 on specific provinces on 01 march 2016, let's use the filter:

http://app-preciocarburante.rhcloud.com/gasolina95?

    date=20160301

    filter=only-this

    admin=Provincia

    list=burgos,valladolid,palencia

http://app-preciocarburante.rhcloud.com/gasolina95?date=20160301&filter=only-this&admin=Provincia&list=burgos,valladolid,palencia

### Prices on the Canary Islands, Ceuta and Melilla are slightly different than the rest of Spain, so let's try one query without those provinces:

http://app-preciocarburante.rhcloud.com/gasolina95

    date=20160309

    filter=not-this

    admin=Provincia

    list=PALMAS (LAS),SANTA CRUZ DE TENERIFE,MELILLA,CEUTA

http://app-preciocarburante.rhcloud.com/gasolina95?date=20160309&filter=not-this&admin=Provincia&list=PALMAS%20(LAS),SANTA%20CRUZ%20DE%20TENERIFE,MELILLA,CEUTA

### Now let's check prices on the peninsula only for a specific brand, Repsol stations: 

http://app-preciocarburante.rhcloud.com/gasolina95?

    date=20160309

    filter=not-this

    admin=Provincia

    list=PALMAS (LAS),SANTA CRUZ DE TENERIFE,MELILLA,CEUTA,BALEARS (ILLES)

    rotulo=REPSOL

http://app-preciocarburante.rhcloud.com/gasolina95?date=20160309&filter=not-this&admin=Provincia&list=PALMAS%20(LAS),SANTA%20CRUZ%20DE%20TENERIFE,MELILLA,CEUTA:,BALEARS%20(ILLES),%20&rotulo=REPSOL

### There is also a bounding box filter (bounding box coordinates in the form: [xLow, yLow, xHigh, yHigh]), we could also filter by brand (rotulo)

http://app-preciocarburante.rhcloud.com/gasolina95

    date=20160309

    filter=bbox

    rectangle=-4.31488,41.96153,-3.048706,42.81958

    rotulo=CEPSA

http://app-preciocarburante.rhcloud.com/gasolina95?date=20160309&filter=bbox&rectangle=-4.31488,41.96153,-3.048706,42.81958&rotulo=CEPSA


## Source

Data taken from Ministerio de Industria, Energía y Turismo (http://geoportalgasolineras.es/)

minetur.gob.es data conditions :

English
https://sede.minetur.gob.es/en-US/datosabiertos/Paginas/modalidades-reutilizacion.aspx

Spanish
https://sede.minetur.gob.es/es-ES/Paginas/aviso.aspx#Reutilizacion