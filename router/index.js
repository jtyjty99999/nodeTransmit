/**
 * 路由,负责分发请求
 */

var handler = require('../handler');
var router = require('urlrouter');

console.log(handler)

module.exports = router(function (app) {
//poi相关操作
	app.get('/findPoi', handler.poi.findPoi);
//地图计算
	app.get('/getDistance', handler.geo.getDistance);
	app.get('/getToward', handler.geo.getDegrees);
	app.get('/getNextPoint', handler.geo.getNextPoint);
	app.get('/pInP', handler.geo.pointInPolygon);
	app.get('/transform', handler.geo.transform);
	app.get('/getIntersection', handler.geo.getIntersection);
	
//历史轨迹	
	//app.get('/history', handler.history.searchHistory);
//测试
	app.get('/initPoi', handler.test.initPoi);
	app.get('/addressToPoints', handler.test.addressToPoints);
	app.get('/download', handler.test.download);
	app.get('/testReadMap', handler.test.testReadRequest);
	app.get('/testWriteMap', handler.test.testWriteRequest);
	app.get('/testWriteInCache', handler.test.testRedisWrite);
	app.get('/testReadInCache', handler.test.testRedisRead);

	app.get('/data', handler.test.initData);
	//app.get('/fastPoi',handler.poiSearch)
	
	//app.all('*', handler.test.notFound);
	
	})