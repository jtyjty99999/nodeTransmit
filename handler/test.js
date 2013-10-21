/**
 * 控制器,负责处理请求
 */

var geo = require('../lib/geo'),
url = require('url'),
http = require('http'),
querystring = require('querystring'),
errorHandler = require('../error/errorHandler'),
mysql = require('mysql'),
config = require('../config').config,
redis = require("redis"),
request = require("request"),
fs = require("fs"),
path = require("path"),
mongodb = require('mongodb'),
tool = require('../lib/tool');
mime = require('mime'),
csv = require('csv');

//处理莫名其妙的请求
exports.notFound = function (req, res, next) {
   errorHandler.pageNotFound(req,res)
};

//利用near查询poi
exports.near = function (req, res, next) {

	var query =getQuery(req)
	
	if (isNaN(Number(query.lat1))) {//解析后是String,用Number转换一下,之后用isNaN判断,因为NaN跟NaN不一样
		errorHandler.dataInvalid(req, res)
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
var query =getQuery(req);
//var foo;
//foo.bar();
request(query.url).pipe(fs.createWriteStream(query.toFile))
res.end('over')

}

//测试读取本地服务器的图片文件
exports.testReadRequest = function(req,res,next){
var query =getQuery(req);
 var readstream = fs.createReadStream(query.file);
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
var query =getQuery(req);

	var client = redis.createClient(config.redis_public_port, config.redis_public_host);
	client.on("error", function (err) {
		console.log("Error " + err);
	});

	client.hset(query.set, query.key, query.value, function (err, reply) {
		if (err)
			throw err;
		res.end('ok');
	});
	
}
//测试redis的读
exports.testRedisRead = function (req, res, next) {

var query =getQuery(req);

	var client = redis.createClient(config.redis_public_port, config.redis_public_host);
	client.on("error", function (err) {
		console.log("Error " + err);
	});

		client.hget(query.set, query.key, function (err, reply) {

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
var server = new mongodb.Server(config.mongoServer, config.mongoPort, {auto_reconnect: true});
var db = new mongodb.Db(config.mongoDbname, server, {safe: true});




//历史轨迹初始化

db.open(function (err, db) {
    if (!err) {
        console.log('connect');
		
		
		        db.collection('poiDb', {
		        	safe : true
		        }, function (err, collection) {

				
				csv()
				.from.stream(fs.createReadStream(__dirname + '/poi.csv'))
				.to.path(__dirname + '/sample.out')
				.transform(function (row) {
					row.unshift(row.pop());
					return row;
				})
				.on('record', function (row, index) {
					//console.log('#time' + row[6] + 'lat' + row[9] + 'lon' + row[8] + 'userid' + row[2]);

					collection.insert({
						count:0,
						location : [Number(row[0]),Number(row[1])]
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

//测试高德的地址匹配接口

exports.addressToPoints = function(req,res,next){

	var query = querystring.parse(url.parse(req.url).query);
	

var options = {
    host: 'search1.mapabc.com',
    port: 80,
    path: '/sisserver?config=GOC&address='+tool.chinese2Gb2312(query.address)+'&a_k=ebfae93ca717a7dc45f6f4962c6465993808dbdadd8b280f412c4e22db13145e647323bd421ac59c'
};

http.get(options, function(response) {
    console.log("Got response: " + response.statusCode, response.headers);
    var buffers = [], size = 0;
    response.on('data', function(buffer) {
        buffers.push(buffer);
        size += buffer.length;
    });
    response.on('end', function() {
        var buffer = new Buffer(size), pos = 0;
        for(var i = 0, l = buffers.length; i < l; i++) {
            buffers[i].copy(buffer, pos);
            pos += buffers[i].length;
        }
	   console.log(buffer.toString())
	    res.writeHead(200, {'Content-Type': 'text/xml;charset=GBK'});
		res.write(buffer.toString());
		res.end();
    });
}).on('error', function(e) {
    console.log("Got error: " + e.message);
});
	
}


exports.download = function(req,res){
    
	var query = querystring.parse(url.parse(req.url).query);
	var downloadPath = query.download;
	console.log('downloadPath='+downloadPath);
  path.exists(downloadPath, function(exists) {
        console.log("exists: ", exists);
        if (exists) {

		var filename = path.basename(downloadPath);
		var mimetype = mime.lookup(downloadPath); //匹配文件格式

		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		res.setHeader('Content-type', mimetype);

		var filestream = fs.createReadStream(downloadPath);
		filestream.on('data', function (chunk) {
			res.write(chunk);
		});
		filestream.on('end', function () {
			res.end();

		});
		
        }
    });
    /*
  
              var fileStream = fs.createReadStream(downloadPath);
            res.writeHead(200, {"Content-Type":"application/octet-stream"});
            fileStream.pipe(res);
            console.log('fileStream pipe');
            fileStream.on("end", function() {
                res.end();
            })
  */
};

//初始化poi
var store = require('../store/');
var poi = new store.poi();


exports.initPoi = function (req, res, next) {

  poi.on( '_error', function (msg,error){
		   errorHandler.sendErrorMsg(req,res,msg);
        });


var i = 0;
	csv()
	.from.stream(fs.createReadStream(__dirname + '/poi.csv'))
	.to.path(__dirname + '/sample.out')
	.transform(function (row) {
		row.unshift(row.pop());
		return row;
	})
	.on('record', function (row, index) {
		poi.add({
			location : [Number(row[1]), Number(row[0])],  //long,lat
			id : ++i,
			count : 0,
		}, function (a) {
			
		})
		

	})
	.on('close', function (count) {
		console.log('Number of lines: ' + count);
		res.end('poi初始化完毕')
	})
	.on('error', function (error) {
		console.log(error.message);
	});

}





