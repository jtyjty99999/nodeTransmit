/**
 * config
 */

var path = require('path');

exports.config = {
  debug: true,
  name: 'mapServer',
  description: 'nodejs搭建的快速计算服务器',
  version: '0.0.0',
  mongoServer: 'localhost',
  mongoPort: '27017',
  mongoDbname: 'test',
  port: 3000,
  redis_public_port:'6379',
  redis_public_host:'192.168.1.3'
};