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
fs = require("fs"),
mongodb = require('mongodb');

//处理莫名其妙的请求
exports.notFound = function (req, res, next) {
   error.pageNotFound(req,res)
};


//获取坐标相对距离
//http://stackoverflow.com/questions/7985188/calculate-the-direction-of-an-object-with-geographical-coordinates-latitude-lo
exports.getDistance = function (req, res, next) {

	var query = querystring.parse(url.parse(req.url).query);
	
	if (isNaN(Number(query.lat1))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		error.dataInvalid(req, res)
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
		error.dataInvalid(req, res)
	}

	var points1 = new geo.LatLon(query.lat,query.lon);
	
	var next = points1.destinationPoint(Number(query.angle), query.distance);    
	
	var result = query;
	
	result['next'] = next;

	res.end(JSON.stringify(result));
	
}


exports.getIntersection= function(req, res, next){
	var query = querystring.parse(url.parse(req.url).query);
	
	if (isNaN(Number(query.lat1))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		error.dataInvalid(req, res)
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

	var query = querystring.parse(url.parse(req.url).query);
	
	if (isNaN(Number(query.lat1))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		error.dataInvalid(req, res)
	}
	var toward = geo.gps2d(query.lat1, query.lon1, query.lat2, query.lon2);

	var result = query;

	result['toward'] = toward;

	res.end(JSON.stringify(result));
};




//利用near查询poi
exports.getDegrees = function (req, res, next) {

	var query = querystring.parse(url.parse(req.url).query);
	
	if (isNaN(Number(query.lat1))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		error.dataInvalid(req, res)
	}
	
db.open(function (err, db) {
	if (!err) {
		console.log('connect');
	/*
db.dropCollection('mycoll',{safe:true},function(err,result){
        console.log(result);
      }); 
*/
		db.collection('mycoll', {
			safe : true
		}, function (err, collection) {
	
		

			collection.find({
				userid :'sjVE9pJXQF',
				"time" : {
					"$gt" : Number(query.gt),
					"$lte" : Number(query.lt)
				}
			}).toArray(function (err, docs) {
				res.end(JSON.stringify(docs))

			});

		})
	} else {
		console.log(err);
	}
})

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

//测试redis的写
exports.testRedisWrite = function (req, res, next) {

	var client = redis.createClient(config.redis_public_port, config.redis_public_host);
	client.on("error", function (err) {
		console.log("Error " + err);
	});

	client.hset('website', 'google', "www.g.cn", function (err, reply) {
		if (err)
			throw err;
		console.log(reply);

	});
	
}
//测试redis的读
exports.testRedisRead = function (req, res, next) {

	var client = redis.createClient(config.redis_public_port, config.redis_public_host);
	client.on("error", function (err) {
		console.log("Error " + err);
	});

		client.hget('website', 'google', function (err, reply) {

			if (err)
				throw err;
				
				res.end(reply);
			
			client.quit();
		})
	
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




exports.initData = function(req,res,next){

var fs = require('fs');
var csv = require('csv');

var server = new mongodb.Server(config.mongoServer, config.mongoPort, {auto_reconnect: true});
var db = new mongodb.Db(config.mongoDbname, server, {safe: true});




//历史轨迹初始化

db.open(function (err, db) {
    if (!err) {
        console.log('connect');
		
		
		        db.collection('mycoll', {
		        	safe : true
		        }, function (err, collection) {

				
				csv()
				.from.stream(fs.createReadStream(__dirname + '/bigData.csv'))
				.to.path(__dirname + '/sample.out')
				.transform(function (row) {
					row.unshift(row.pop());
					return row;
				})
				.on('record', function (row, index) {
					//console.log('#time' + row[6] + 'lat' + row[9] + 'lon' + row[8] + 'userid' + row[2]);

					collection.insert({
						userid : row[2],
						time : Number(row[6]),
						data : [row[9],row[8]]
					}, {
						safe : true
					}, function (err, result) {});

				})
				.on('close', function (count) {
					// when writing to a file, use the 'close' event
					// the 'end' event may fire before the file has been written
					console.log('Number of lines: ' + count);
					
					/*
								collection.find().toArray(function (err, docs) {
									console.log(docs);
									res.end(JSON.stringify(docs))

								});
					*/
					
				})
				.on('error', function (error) {
					console.log(error.message);
				});
				
					
		        });
		
    }
    else {
        console.log(err);
    }
})

}



//历史轨迹查询功能

exports.searchHistory = function(req, res, next){
var query = querystring.parse(url.parse(req.url).query);

var server = new mongodb.Server(config.mongoServer, config.mongoPort, {auto_reconnect: true});
var db = new mongodb.Db(config.mongoDbname, server, {safe: true});

db.open(function (err, db) {
	if (!err) {
		console.log('connect');
	/*
db.dropCollection('mycoll',{safe:true},function(err,result){
        console.log(result);
      }); 
*/
		db.collection('mycoll', {
			safe : true
		}, function (err, collection) {
	
		

			collection.find({
				userid :'sjVE9pJXQF',
				"time" : {
					"$gt" : Number(query.gt),
					"$lte" : Number(query.lt)
				}
			}).toArray(function (err, docs) {
				res.end(JSON.stringify(docs))

			});

		})
	} else {
		console.log(err);
	}
})


}


//添加历史轨迹


exports.storeHistory = function(req, res, next){

var query = querystring.parse(url.parse(req.url).query);



var data = require('./data');
var userid = data.userid;
var mainData = data.main;
var server = new mongodb.Server(config.mongoServer, config.mongoPort, {auto_reconnect: true});
var db = new mongodb.Db(config.mongoDbname, server, {safe: true});
db.open(function (err, db) {
    if (!err) {
        console.log('connect');
		
		
		        db.collection('mycoll', {
		        	safe : true
		        }, function (err, collection) {

		        	var i = 0;
		        	var a = +new Date();
		        	collection.insert({
		        		userid : userid[0],
		        		time : a,
		        		data : mainData.body.GPS.split(',')
		        	}, {
		        		safe : true
		        	}, function (err, result) {

		        		res.end('ok')

		        		/*
		        		collection.update({userid : userid[0]}, {$push : {data : { $each: ['12122.11260E','3113.16226N'] }}}, {safe : true },function (error, result) {
		        		collection.find({userid : userid[0],"time":{"$gt":Number(query.gt), "$lte":Number(query.lt)}}).toArray(function(err,docs){
		        		console.log(docs);
		        		res.end(JSON.stringify(docs))

		        		});

		        		})
		        		 */
		        	});
		        	var b = +new Date();
		        	console.log(b - a);
		        });
		
    }
    else {
        console.log(err);
    }
})


}
