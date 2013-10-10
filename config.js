/**
 * config
 */

var path = require('path');

exports.config = {
  debug: true,
  name: 'mapServer',
  description: 'nodejs搭建的快速计算服务器',
  version: '0.0.0',
  db: 'mongodb://127.0.0.1/node_club_dev',
  port: 3000,
};