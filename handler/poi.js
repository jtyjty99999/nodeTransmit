//初始化poi
var store = require('../store/');
var poi = new store.poi();
var geo = require('../lib/geo'),
url = require('url'),
http = require('http'),
querystring = require('querystring');

exports.findPoi=function(req,res,next){

poi.on('_error', function (msg, error) {
	/*
	API.send( req, res, {
	result: false,
	type: 'searchItem',
	error: msg,
	data: error
	});
	 */
	console.log('wrong' + msg)
});

var query = querystring.parse(url.parse(req.url).query);

poi.query({
	maxDistance:query.distance,
	location:[Number(query.lon),Number(query.lat)]
}, function (poi) {

		for (var i = 0, l = poi.length; i < l; i++) {

			var points1 = new geo.LatLon(39.91223543, 116.35654039);
			var points2 = new geo.LatLon(poi[i].location[1], poi[i].location[0]);
			var dist = points1.distanceTo(points2);
				console.log(dist)
			poi[i].distance = dist
		}

	res.end(JSON.stringify(poi))
})

}