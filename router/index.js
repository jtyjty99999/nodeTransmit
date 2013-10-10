/**
 * 路由,负责分发请求
 */

var handler = require('../handler/handler');
var router = require('urlrouter');

module.exports = router(function (app) {

	app.get('/getDistance', handler.getDistance);
	app.get('/testReadMap', handler.testReadRequest);
	app.get('/testWriteMap', handler.testWriteRequest);
	
	app.all('*', handler.notFound);
	
	})