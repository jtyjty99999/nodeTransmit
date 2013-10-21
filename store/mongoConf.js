var mongoose = require('mongoose'),config =require('../config').config

var HOST =config.mongoServer,
    PORT = config.mongoPort,
    DATABASE =config.mongoDbname;
// 连接
mongoose.connect( HOST, DATABASE, PORT );