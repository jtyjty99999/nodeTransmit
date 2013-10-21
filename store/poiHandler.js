require( './poi' );
var mongoose = require( 'mongoose' );
var Poi = mongoose.model( 'poi');//get
var _ = require( 'underscore' );
var EventEmitter = require('events').EventEmitter;
var Util = require('util');

function poiHandler(){

    EventEmitter.call(this);
};

Util.inherits( poiHandler, EventEmitter );




_.extend( poiHandler.prototype, {

    /**
     * 添加新poi
     * @param poiObj
     * @param next
     */
    add: function(poiObj, callback ){

        var that = this;

            var newPoi;

            newPoi = new Poi( poiObj );
            newPoi.save( function( err ){

                if( err ){
					console.log(err)
                    that.emit( '_error', '添加poi失败', err );
                }
                else {
                        callback( newPoi );
                }
            });


    },

    /**
     * 根据条件检索poi
     * @param query {Object} {
     *      location: [ latitude, longitude ],
     *      id: {String},
     *      count: {Number},
     * }
     * @param fields
     * @param callback
     * @example poi.query( { count: 0, location: [ 116.35623999 , 39.91661331 ],id: 'abc' }
     */
    query: function( query, fields, callback ){

        var that = this;
        var queryObj = {};//条件查询器
        var queryField = undefined;
        var queryValue = undefined;

        for( queryField in query ){

            queryValue = query[ queryField ];

            switch( queryField ){
			
                case 'location': {

                    var maxDistance = query.maxDistance;

                    if( maxDistance ){
						// 地球半径km
                        var earthRadius = 6378;
                        queryObj.location = {
                            $nearSphere: queryValue,
                             $maxDistance: maxDistance ? ( maxDistance / earthRadius ) : ( 1 / earthRadius )
                        };
						console.log(queryObj.location)
                    }
                    else {

                        queryObj.location = queryValue;
                    }

                    break;
                }
				case 'count': {
                    queryObj.count = queryValue;
                    break;
                }
            }
        }

        if( typeof fields === 'function' ){
            callback = fields;
            fields = '';
        }

        Poi.find( queryObj, fields, function( err, pois ){

            if( err ){
                console.log( err );
                that.emit( '_error', '查找poi失败!', err );
            }
            else {
                    callback( pois );
            }
        });
    },

    /**
     * 根据poiId查找poi
     * @param id
     * @param callback( poi ) --> 该poi对象拥有成员poi
     */
    getById: function( id, callback ){

        var that = this;
		//mongoose提供了findById方法
        Poi.findById( id, function( err, poi ){

            if( err ){
                return that.emit( '_error', '查找出错，id:' + id, err );
            }
            else {

                if( poi ){
                            next( poi );
                }
                else {

                    that.emit( '_error', 'id为:' + id + ' 的poi不存在!', err );
                }
            }
        });


    },

    /**
     * 删除指定poiId的poi
     * @param poiId
     * @param callback
     */
    del: function( poiId, callback ){

        // 检查poiId是否存在
        this.getById( poiId, function( poi ){


            poi.remove( function( err ){

                if( err ){

                    that.emit( '_error', '删除商品失败！', err );
                }
                else {
				
                }
            });
        });
    },

    /**
     * 根据poi修改poi信息
     * @param poiId
     * @param updateObj
     * @param callback
     */
    update : function (poiId, updateObj, callback) {
    	var that = this;
    	poi.count = updateObj.count || poi.count;
    	poi.save(function (err) {

    		if (err) {

    			that.emit('_error', 'poi保存修改失败', err);
    		}
    	})

    }
})

module.exports = poiHandler;