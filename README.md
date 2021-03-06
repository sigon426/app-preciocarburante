
[![License](https://img.shields.io/badge/License-GNU-blue.svg)](https://github.com/sigon426/app-preciocarburante/blob/master/LICENSE)
 


# Precio Carburante


Petrol prices in Spain, updated daily  :clock8:

http://app-preciocarburante.rhcloud.com/gasolina95

http://app-preciocarburante.rhcloud.com/gasolina98

http://app-preciocarburante.rhcloud.com/diesel 

![precio carburante](https://raw.githubusercontent.com/sigon426/app-preciocarburante/master/public/img/screenshot_bbox.png)

Data can be filter by 'date' (Ej: `date=20160301`), and by administrative division selecting only specific provinces or municipalities (Ej: `filter=only-this&admin=Provincia&list=barcelona`, or `filter=not-this&admin=Provincia&list=barcelona`). 

Also, there is a brand filter if you only want to display specific REPSOL or CAMPSA stations (Ej: `filter=only-this&admin=Provincia&list=barcelona&rotulo=CAMPSA`).

There is available a geospatial filter, you can select a bounding box like this: `date=20160309&filter=bbox&rectangle=-4.314,41.961,-3.048,42.819` to get only the gas station within that box, if you dont know the coordinates of the bounding box you can use the gear icon on the right side to set the current map view as the bounding rectangle.

### Data classification

![legend](https://raw.githubusercontent.com/sigon426/app-preciocarburante/master/public/img/legend.png)

Data breaks are calculated using [Turf.js Jenks Natural breaks](http://turfjs.org/static/docs/module-turf_jenks.html)


## How to use the dataset Filters

### If we want to compare the prices of gasolina 95 on 3 specific provinces on the 01 march 2016, let's use the filter:

http://app-preciocarburante.rhcloud.com/gasolina95

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

### Now let's check prices on the peninsula only for a specific brand (Repsol stations, but you could choose other like CEPSA, GALP, SHELL, BP, etc.): 

http://app-preciocarburante.rhcloud.com/gasolina95?

    date=20160309

    filter=not-this

    admin=Provincia

    list=PALMAS (LAS),SANTA CRUZ DE TENERIFE,MELILLA,CEUTA,BALEARS (ILLES)

    rotulo=REPSOL

http://app-preciocarburante.rhcloud.com/gasolina95?date=20160309&filter=not-this&admin=Provincia&list=PALMAS%20(LAS),SANTA%20CRUZ%20DE%20TENERIFE,MELILLA,CEUTA:,BALEARS%20(ILLES),%20&rotulo=REPSOL

### Using a geospatial filter (bounding box coordinates in the form: [xLow, yLow, xHigh, yHigh]): 

With this we could also filter by brand (rotulo)

http://app-preciocarburante.rhcloud.com/gasolina95

    date=20160309

    filter=bbox

    rectangle=-4.31488,41.96153,-3.048706,42.81958

    rotulo=CEPSA

http://app-preciocarburante.rhcloud.com/gasolina95?date=20160309&filter=bbox&rectangle=-4.31488,41.96153,-3.048706,42.81958&rotulo=CEPSA


## Other stuff

Data is taken from Ministerio de Industria, Energía y Turismo (http://geoportalgasolineras.es/)

minetur.gob.es data conditions :

English
https://sede.minetur.gob.es/en-US/datosabiertos/Paginas/modalidades-reutilizacion.aspx

Spanish
https://sede.minetur.gob.es/es-ES/Paginas/aviso.aspx#Reutilizacion

The geospatial filter use the fantastic [Turf.js](http://turfjs.org/) library

Some extra 'descriptive statistics' like the mode or median are calculated with the [Simplestatistics](http://simplestatistics.org/) library

## License

Copyright 2016 Sigon

Licensed under the GPLv3: http://www.gnu.org/licenses/gpl-3.0.html