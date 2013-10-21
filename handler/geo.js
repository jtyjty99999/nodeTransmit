var geo = require('../lib/geo'),
url = require('url'),
querystring = require('querystring'),
errorHandler = require('../error/errorHandler');

function getQuery(req){
return querystring.parse(url.parse(req.url).query);
}

exports.pointInPolygon = function(req,res,next){


var query =getQuery(req);
var area = [{x:37.628134,y:-77.458334},{x:37.629867,y:-77.449021},{x:37.62324,y:-77.445416},{x:37.622424,y:-77.457819}]

query['result'] = geo.pointsInPolygon(eval(query.area),Number(query.lat),Number(query.lon))

res.end(JSON.stringify(query))

}


//获取坐标相对距离
//http://stackoverflow.com/questions/7985188/calculate-the-direction-of-an-object-with-geographical-coordinates-latitude-lo
exports.getDistance = function (req, res, next) {

	var query =getQuery(req)
	
	if (isNaN(Number(query.lat1))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		errorHandler.dataInvalid(req, res)
	}
	//var distance = geo.getDistance(query.lat1, query.lon1, query.lat2, query.lon2);

	var points1 = new geo.LatLon(query.lat1,query.lon1);
	var points2 = new geo.LatLon(query.lat2,query.lon2);
	var dist = points1.distanceTo(points2);    
	var bear = points1.bearingTo(points2);    
	var midPoint = points1.midpointTo(points2);    
	var result = query;

	result['distance'] = dist;
	result['bear'] = bear;
	result['midPoint'] = midPoint;

	res.end(JSON.stringify(result));
};



exports.getNextPoint = function(req, res, next){
	var query = querystring.parse(url.parse(req.url).query);
	
	if (isNaN(Number(query.lat))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		errorHandler.dataInvalid(req, res)
	}

	var points1 = new geo.LatLon(query.lat,query.lon);
	
	var next = points1.destinationPoint(Number(query.angle), query.distance);    
	
	var result = query;
	
	result['next'] = next;

	res.end(JSON.stringify(result));
	
}

exports.transform = function(req, res, next){
	var query =getQuery(req)
	
	if (isNaN(Number(query.lat))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		errorHandler.dataInvalid(req, res)
	}

	
	var trans = geo.transform(query.lat,query.lon);    
	
	var result = query;
	
	result['trans'] = trans;

	res.end(JSON.stringify(result));
	
}


exports.getIntersection= function(req, res, next){
	var query =getQuery(req)
	
	if (isNaN(Number(query.lat1))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		errorHandler.dataInvalid(req, res)
	}

	var points1 = new geo.LatLon(query.lat1,query.lon1);
	var points2 = new geo.LatLon(query.lat2,query.lon2);
	
	var next = geo.LatLon.intersection(points1,Number(query.angle1),points2,Number(query.angle2));
	
	var result = query;
	
	result['intersection'] = next;

	res.end(JSON.stringify(result));
	
}


//获取坐标相对角度
exports.getDegrees = function (req, res, next) {

	var query =getQuery(req)
	
	if (isNaN(Number(query.lat1))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		errorHandler.dataInvalid(req, res)
	}
	var toward = geo.gps2d(query.lat1, query.lon1, query.lat2, query.lon2);

	var result = query;

	result['toward'] = toward;

	res.end(JSON.stringify(result));
};
