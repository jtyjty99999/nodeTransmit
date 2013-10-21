/**
 * 路由,负责分发请求
 */

var handler = require('../handler/handler');
var router = require('urlrouter');

module.exports = router(function (app) {

	app.get('/getDistance', handler.getDistance);
	app.get('/getToward', handler.getDegrees);
	app.get('/getNextPoint', handler.getNextPoint);
	app.get('/pInP', handler.pointInPolygon);
	app.get('/transform', handler.transform);
	app.get('/download', handler.download);
	app.get('/initPoi', handler.initPoi);
	app.get('/findPoi', handler.findPoi);
	app.get('/addressToPoints', handler.addressToPoints);
	app.get('/getIntersection', handler.getIntersection);
	app.get('/testReadMap', handler.testReadRequest);
	app.get('/testWriteMap', handler.testWriteRequest);
	app.get('/testWriteInCache', handler.testRedisWrite);
	app.get('/testReadInCache', handler.testRedisRead);
	app.get('/history', handler.searchHistory);
	app.get('/data', handler.initData);
	//app.get('/fastPoi',handler.poiSearch)
	
	app.all('*', handler.notFound);
	
	})