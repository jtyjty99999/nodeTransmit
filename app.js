var connect = require('connect'),
routeMap = require('./router/index'),
config = require('./config').config;

//https://github.com/TBEDP/show-me-the-code/blob/master/2013/0419/suqian.md
//graceful来保证 优雅退出 https://github.com/fengmk2/graceful
var graceful = require('graceful');


var app = connect(routeMap)
	.use(connect.logger('dev'))
	.use(connect.static('public'))
	.use(function (req, res) {
		res.end('hello world\n');
	})
	.listen(config.port);
	
graceful({
  server: app,
  killTimeout: 30000,
  error: function (err, throwErrorCount) {
    // you can do custom log here, send email, call phone and so on...
    if (err.message) {
      err.message += ' (uncaughtException throw ' + throwErrorCount + ' times on pid:' + process.pid + ')';
    }
	console.log(err.message)
    // logger.error(err);
  }
});	









