/**
 * 控制器,负责处理请求
 */

var geo = require('../lib/geo'),
url = require('url'),
querystring = require('querystring'),
error = require('../error/errorHandler'),
mysql = require('mysql'),
config = require('../config').config,
redis = require("redis"),
request = require("request"),
fs = require("fs");

//处理莫名其妙的请求
exports.notFound = function (req, res, next) {
   error.pageNotFound(req,res)
};


//获取坐标相对距离
exports.getDistance = function (req, res, next) {

	var query = querystring.parse(url.parse(req.url).query);
	
	if (isNaN(Number(query.lat1))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		error.dataInvalid(req, res)
	}
	var distance = geo.getDistance(query.lat1, query.lon1, query.lat2, query.lon2);

	var result = query;

	result['distance'] = distance;

	res.end(JSON.stringify(result));
};

//测试读取其他服务器的文件并写入本地
exports.testWriteRequest = function(req,res,next){
//利用readfile,文件数据一次性全部读入内存，
//优点就是接下来都是在内存的操作，速度会很快。
//但缺点也很明显，就是当文件非常大时，会造成内存溢出。  
var foo;
foo.bar();
request('http://www.google.cm/images/srpr/logo4w.png').pipe(fs.createWriteStream('doodle.png'))
res.end('over')

}

//测试读取本地服务器的图片文件
exports.testReadRequest = function(req,res,next){

 var readstream = fs.createReadStream('doodle.png');
	readstream.on('error', function(chunk) {
        res.end('file error');
    });
    readstream.on('data', function(chunk) {
        res.write(chunk,'binary');
    });
    readstream.on('end', function() {
        res.end();
    });

}


//初始化格网信息


exports.initGrid = function(){

var connection = mysql.createConnection(config.app_lbs);
connection.connect();

var client = redis.createClient(config.redis_public_port,config.redis_public_host);
client.on("error", function (err) {
    console.log("Error " + err);
});
var total_num = 9640000;
for(var start_num = 0;start_num<total_num;start_num +=5000){

    connection.query('SELECT grid,province,city,district,provinceCode,cityCode,districtCode FROM cityInfoOfGrid limit '+start_num+',5000',function(err,rows){
        if(err) throw err;
        var l = rows.length;
        for(var i=0;i<l;i++){
            (function(i){
                var grid = rows[i]['grid'],province = rows[i]['province'],city = rows[i]['city'],district = rows[i]['district'],provinceCode = rows[i]['provinceCode'],cityCode = rows[i]['cityCode'],districtCode = rows[i]['districtCode'];
                client.hmset(grid,'province',province,'city',city,'district',district,'provinceCode',provinceCode,'cityCode',cityCode,'districtCode',districtCode,function(err,reply){
                    if (err) throw err;
                    console.log(grid+reply);

                });
            })(i)
        }
    });
}
client.quit();
connection.end();
}
