var mongoose = require( 'mongoose' ),
    schema = mongoose.Schema;

// 商品表
var Poi = new schema({
    count: { type: Number, required: true },
    id: { type: Number, required: true },
    // GPS 坐标 [longitude, latitude ] Important Specify coordinates in this order: “longitude, latitude.” http://docs.mongodb.org/manual/reference/operator/query/near/
    location: { type: Array, index: '2d' }
});

mongoose.model( 'poi', Poi );