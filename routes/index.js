
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.redirect('/gasolina95');
    // res.render('map', 
    //     { title: 'Precios Carburantes en España' }
    // );

};
exports.gasolina95 = function(req, res){
    res.render('map95', 
        { title: 'Precios Carburantes en España' }
    );

};
exports.gasolina98 = function(req, res){
    res.render('map98', 
        { title: 'Precios Carburantes en España' }
    );

};
exports.diesel = function(req, res){
    res.render('mapDiesel', 
        { title: 'Precios Carburantes en España' }
    );

};
exports.heatmap = function(req, res){
    res.render('heatmap', 
        { title: 'Precios Carburantes en España' }
    );

};