//http://www.movable-type.co.uk/scripts/latlong.html

/**
 * 地图算法库,负责处理距离,坐标等的计算
 */

 
 //1°经线长111 km,1°纬线长111 cosφ km(φ为纬度)
var EARTH_RADIUS = 6378;    //单位KM
var PI = Math.PI;

function getRad(d){
    return d*PI/180.0;
}

/**
 * 计算大圆距离
 * @param {Object} lat1
 * @param {Object} lon1
 * @param {Object} lat2
 * @param {Object} lon2
 */
exports.getDistance = function (lat1,lon1,lat2,lon2){

var dLat = getRad(lat2-lat1);
var dLon = getRad(lon2-lon1);
var lat1 = getRad(lat1);
var lat2 = getRad(lat2);

var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
var d = EARTH_RADIUS * c;

    return d;
}


//计算坐标的方向
exports.getDegrees=function(lat1, long1, lat2, long2, headX) {

    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);

    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    var brng = toDeg(Math.atan2(y, x));

    // fix negative degrees
    if(brng<0) {
        brng=360-Math.abs(brng);
    }

    return brng - headX;
}


exports.gps2d=function(lat_a, lng_a, lat_b, lng_b) {

       var d = 0;

       lat_a=lat_a*Math.PI/180;

       lng_a=lng_a*Math.PI/180;

       lat_b=lat_b*Math.PI/180;

       lng_b=lng_b*Math.PI/180;

      

        d=Math.sin(lat_a)*Math.sin(lat_b)+Math.cos(lat_a)*Math.cos(lat_b)*Math.cos(lng_b-lng_a);

       d=Math.sqrt(1-d*d);

       d=Math.cos(lat_b)*Math.sin(lng_b-lng_a)/d;

       d=Math.asin(d)*180/Math.PI;

      

//     d = Math.round(d*10000);

       return d;

    }



//计算两条直线是否相交

exports.segmentsIntr = function(a, b, c, d){

    //线段ab的法线N1
    var nx1 = (b.y - a.y), ny1 = (a.x - b.x);

    //线段cd的法线N2
    var nx2 = (d.y - c.y), ny2 = (c.x - d.x);
    
    //两条法线做叉乘, 如果结果为0, 说明线段ab和线段cd平行或共线,不相交
    var denominator = nx1*ny2 - ny1*nx2;
    if (denominator==0) {
        return false;
    }
    
    //在法线N2上的投影
    var distC_N2=nx2 * c.x + ny2 * c.y;
    var distA_N2=nx2 * a.x + ny2 * a.y-distC_N2;
    var distB_N2=nx2 * b.x + ny2 * b.y-distC_N2;

    // 点a投影和点b投影在点c投影同侧 (对点在线段上的情况,本例当作不相交处理);
    if ( distA_N2*distB_N2>=0  ) {
        return false;
    }
    
    //
    //判断点c点d 和线段ab的关系, 原理同上
    //
    //在法线N1上的投影
    var distA_N1=nx1 * a.x + ny1 * a.y;
    var distC_N1=nx1 * c.x + ny1 * c.y-distA_N1;
    var distD_N1=nx1 * d.x + ny1 * d.y-distA_N1;
    if ( distC_N1*distD_N1>=0  ) {
        return false;
    }

    //计算交点坐标
    var fraction= distA_N2 / denominator;
    var dx= fraction * ny1,
        dy= -fraction * nx1;
    return { x: a.x + dx , y: a.y + dy };
}





//http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html?  点是否在区域内
//http://en.wikipedia.org/wiki/Point_in_polygon  点是否在区域内
//http://forcefront.github.io/point-in-polygon/point-in-polygon.html  点是否在区域内
//http://ask.csdn.net/questions/703  mongodb
/*
$vertices_x = array(37.628134, 37.629867, 37.62324, 37.622424); // x-coordinates of the vertices of the polygon
$vertices_y = array(-77.458334,-77.449021,-77.445416,-77.457819); // y-coordinates of the vertices of the polygon
$points_polygon = count($vertices_x); // number vertices
$longitude_x = $_GET["longitude"]; // x-coordinate of the point to test
$latitude_y = $_GET["latitude"]; // y-coordinate of the point to test
//// For testing.  This point lies inside the test polygon.
// $longitude_x = 37.62850;
// $latitude_y = -77.4499;

if (is_in_polygon($points_polygon, $vertices_x, $vertices_y, $longitude_x, $latitude_y)){
  echo "Is in polygon!";
}
else echo "Is not in polygon";


function is_in_polygon($points_polygon, $vertices_x, $vertices_y, $longitude_x, $latitude_y)
{
	var i =0,j= 0,res = false;
  for (i = 0, j = $points_polygon-1 ; $i < $points_polygon; $j = $i++) {
    if ( (($vertices_y[$i] > $latitude_y != ($vertices_y[$j] > $latitude_y)) &&
    ($longitude_x < ($vertices_x[$j] - $vertices_x[$i]) * ($latitude_y - $vertices_y[$i]) / ($vertices_y[$j] - $vertices_y[$i]) + $vertices_x[$i]) ) ) 
        $c = !$c;
  }
  return $c;
}
*/
exports.pointsInPolygon = function(area,lon,lat){

var verd =  areaToArray(area);
var verX = verd.verX;
var verY = verd.verY;
var len = area.length;


	var i =0, j = len-1,res = false;
  for (; i < len; j = i++) {
    if ( ((verY[i] > lat != (verY[j] > lat)) &&
    (lon < (verX[j] - verX[i]) * (lat - verY[i]) / (verY[j] - verY[i]) + verX[i]) ) ) 
        res = !res;
  }
  return res;

}



function areaToArray(area) {

	var verX = [],
	verY = [];

	var i = 0,
	l = area.length;
	for (; i < l; i++) {

		verX.push(area[i]['x']);
		verY.push(area[i]['y']);

	}

	return {
		verX : verX,
		verY : verY
	}
}



/*
/// <summary>
/// 高斯坐标反解算法
/// </summary>
/// <param name="dY">高斯坐标的Y坐标</param>
/// <param name="dX">高斯坐标的X坐标</param>
/// <param name="dB">纬度</param>
/// <param name="dL">经度</param>
/// <param name="dCenter">中央子午线经度值（弧度）</param>
void XY2BL(double dY, double dX, double *dB, double *dL, double dCenter)
{
        //椭球第二偏心率
        const double ParaE2 = 6.73950181947292E-03;

        //极点子午圈曲率半径
        const double ParaC = 6399596.65198801;

        const double Parak0 = 1.57048687472752E-07;
        const double Parak1 = 5.05250559291393E-03;
        const double Parak2 = 2.98473350966158E-05;
        const double Parak3 = 2.41627215981336E-07;
        const double Parak4 = 2.22241909461273E-09;

        double y1 = dX - 500000;
        double e = Parak0 * dY;
        double se = sin(e);
        double bf = e + cos(e) * (Parak1 * se - Parak2 * pow(se, 3) + Parak3 * pow(se, 5) - Parak4 * pow(se, 7));
        double t = tan(bf);

        //使用椭球第二偏心率
        double nl = ParaE2 * pow(cos(bf), 2);
        double v = sqrt(1 + nl);
        double N = ParaC / v;
        double yn = y1 / N;
        double vt = pow(v, 2) * t;
        double t2 = pow(t, 2);
        *dB = bf - vt * pow(yn, 2) / 2 + (5 + 3 * t2 + nl - 9 * nl * t2) * vt * pow(yn, 4) / 24 - (61 + 90 * t2 + 45 * pow(t2, 2)) * vt * pow(yn, 6) / 720;
        *dB = *dB / m_PI * 180.0;

        double cbf = 1 / cos(bf);
        *dL = cbf * yn - (1 + 2 * t2 + nl) * cbf * pow(yn, 3) / 6 + (5 + 28 * t2 + 24 * pow(t2, 2) + 6 * nl + 8 * nl * t2) * cbf * pow(yn, 5) / 120 + dCenter;
        *dL = *dL / m_PI * 180;
}





/// <summary>
/// 根据经纬度转换为投影坐标
/// </summary>
/// <param name="dB">纬度</param>
/// <param name="dL">经度</param>
/// <param name="dX">X值</param>
/// <param name="dY">Y值</param>
void BL2XY(double dB, double dL, double *dX, double *dY)
{
        double dBeltNumber = floor((dL + 1.5) / 3.0);
        double dL0 = dBeltNumber * 3.0;

        double a = 6378137;
        double b = 6356752.3142;
        double k0 = 1;
        double FE = 500000;

        double e1 = sqrt(1 - pow(b / a, 2));
        double e2 = sqrt(pow(a / b, 2) - 1);

        //得到参数T
        dB = dB * m_PI / 180.0;
        double T = pow(tan(dB), 2);

        //得到参数C
        double C = e2 * e2 * pow(cos(dB), 2);

        //得到参数A
        dL = dL * m_PI / 180.0;
        dL0 = dL0 * m_PI / 180.0;
        double A = (dL - dL0) * cos(dB);

        //得到参数M
        double M = (1 - pow(e1, 2) / 4.0 - 3.0 * pow(e1, 4) / 64.0 - 5.0 * pow(e1, 6) / 256.0) * dB;
        M = M - (3.0 * pow(e1, 2) / 8.0 + 3.0 * pow(e1, 4) / 32.0 + 45.0 * pow(e1, 6) / 1024.0) * sin(dB * 2);
        M = M + (15.0 * pow(e1, 4) / 256.0 + 45.0 * pow(e1, 6) / 1024.0) * sin(dB * 4);
        M = M - (35.0 * pow(e1, 6) / 3072.0) * sin(dB * 6);
        M = a * M;

        //卯酉圈曲率半径N
        double N = a / pow(1.0 - pow(e1, 2) * pow(sin(dB), 2), 0.5);

        //得到Y值
        double mgs1 = pow(A, 2) / 2.0;
        double mgs2 = pow(A, 4) / 24.0 * (5.0 - T + 9.0 * C + 4.0 * pow(C, 2));
        double mgs3 = pow(A, 6) / 720.0 * (61.0 - 58.0 * T + pow(T, 2) + 270 * C - 330.0 * T * C);
        *dY = M + N * tan(dB) * (mgs1 + mgs2) + mgs3;
        *dY = *dY * k0;

        //得到X值
        mgs1 = A + (1.0 - T + C) * pow(A, 3) / 6.0;
        mgs2 = (5.0 - 18.0 * T + pow(T, 2) + 14.0 * C - 58.0 * T * C) * pow(A, 5) / 120.0;
        *dX = (mgs1 + mgs2) * N * k0 + FE;
}
*/












//坐标计算算法
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2012            */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var p1 = new LatLon(51.5136, -0.0983);                                                      */
/*    var p2 = new LatLon(51.4778, -0.0015);                                                      */
/*    var dist = p1.distanceTo(p2);          // in km                  返回距离                           */
/*    var brng = p1.bearingTo(p2);           // in degrees clockwise from north     返回磁极角度差             */
/*    ... etc                                                                                     */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Note that minimal error checking is performed in this example code!                           */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * @requires Geo
 */
 
 
/**
 * Creates a point on the earth's surface at the supplied latitude / longitude //利用横纵坐标初始化点
 *
 * @constructor
 * @param {Number} lat: latitude in numeric degrees
 * @param {Number} lon: longitude in numeric degrees
 * @param {Number} [rad=6371]: radius of earth if different value is required from standard 6,371km
 */


function LatLon(lat, lon, rad) {
  if (typeof(rad) == 'undefined') rad = 6371;  // earth's mean radius in km
  // only accept numbers or valid numeric strings
  this._lat = typeof(lat)=='number' ? lat : typeof(lat)=='string' && lat.trim()!='' ? +lat : NaN;
  this._lon = typeof(lon)=='number' ? lon : typeof(lon)=='string' && lon.trim()!='' ? +lon : NaN;
  this._radius = typeof(rad)=='number' ? rad : typeof(rad)=='string' && trim(lon)!='' ? +rad : NaN;
}

exports.LatLon=LatLon;

/**
 * Returns the distance from this point to the supplied point, in km  //计算距离算法
 * (using Haversine formula)
 *
 * from: Haversine formula - R. W. Sinnott, "Virtues of the Haversine",
 *       Sky and Telescope, vol 68, no 2, 1984
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @param   {Number} [precision=4]: no of significant digits to use for returned value
 * @returns {Number} Distance in km between this point and destination point
 */
LatLon.prototype.distanceTo = function(point, precision) {
  // default 4 sig figs reflects typical 0.3% accuracy of spherical model
  if (typeof precision == 'undefined') precision = 4;
  
  var R = this._radius;
  var lat1 = this._lat.toRad(), lon1 = this._lon.toRad();
  var lat2 = point._lat.toRad(), lon2 = point._lon.toRad();
  var dLat = lat2 - lat1;
  var dLon = lon2 - lon1;

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1) * Math.cos(lat2) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d.toPrecisionFixed(precision);
}


/**
 * Returns the (initial) bearing from this point to the supplied point, in degrees //返回偏移的磁极坐标
 *   see http://williams.best.vwh.net/avform.htm#Crs
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Initial bearing in degrees from North
 */
LatLon.prototype.bearingTo = function(point) {
  var lat1 = this._lat.toRad(), lat2 = point._lat.toRad();
  var dLon = (point._lon-this._lon).toRad();

  var y = Math.sin(dLon) * Math.cos(lat2);
  var x = Math.cos(lat1)*Math.sin(lat2) -
          Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
  var brng = Math.atan2(y, x);
  
  return (brng.toDeg()+360) % 360;
}


/**
 * Returns final bearing arriving at supplied destination point from this point; the final bearing 
 * will differ from the initial bearing by varying degrees according to distance and latitude
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Final bearing in degrees from North
 */
LatLon.prototype.finalBearingTo = function(point) {
  // get initial bearing from supplied point back to this point...
  var lat1 = point._lat.toRad(), lat2 = this._lat.toRad();
  var dLon = (this._lon-point._lon).toRad();

  var y = Math.sin(dLon) * Math.cos(lat2);
  var x = Math.cos(lat1)*Math.sin(lat2) -
          Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
  var brng = Math.atan2(y, x);
          
  // ... & reverse it by adding 180°
  return (brng.toDeg()+180) % 360;
}


/**
 * Returns the midpoint between this point and the supplied point. //返回两点的中点
 *   see http://mathforum.org/library/drmath/view/51822.html for derivation
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {LatLon} Midpoint between this point and the supplied point
 */
LatLon.prototype.midpointTo = function(point) {
  lat1 = this._lat.toRad(), lon1 = this._lon.toRad();
  lat2 = point._lat.toRad();
  var dLon = (point._lon-this._lon).toRad();

  var Bx = Math.cos(lat2) * Math.cos(dLon);
  var By = Math.cos(lat2) * Math.sin(dLon);

  lat3 = Math.atan2(Math.sin(lat1)+Math.sin(lat2),
                    Math.sqrt( (Math.cos(lat1)+Bx)*(Math.cos(lat1)+Bx) + By*By) );
  lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);
  lon3 = (lon3+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º
  
  return new LatLon(lat3.toDeg(), lon3.toDeg());
}


/**
 * Returns the destination point from this point having travelled the given distance (in km) on the 
 * given initial bearing (bearing may vary before destination is reached)
 * //利用距离与方位定位另一个点
 *
 *   see http://williams.best.vwh.net/avform.htm#LL
 *
 * @param   {Number} brng: Initial bearing in degrees
 * @param   {Number} dist: Distance in km
 * @returns {LatLon} Destination point
 */
LatLon.prototype.destinationPoint = function(brng, dist) {
  dist = typeof(dist)=='number' ? dist : typeof(dist)=='string' && dist.trim()!='' ? +dist : NaN;
  dist = dist/this._radius;  // convert dist to angular distance in radians
  brng = brng.toRad();  // 
  var lat1 = this._lat.toRad(), lon1 = this._lon.toRad();

  var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dist) + 
                        Math.cos(lat1)*Math.sin(dist)*Math.cos(brng) );
  var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(dist)*Math.cos(lat1), 
                               Math.cos(dist)-Math.sin(lat1)*Math.sin(lat2));
  lon2 = (lon2+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º

  return new LatLon(lat2.toDeg(), lon2.toDeg());
}


/**
 * Returns the point of intersection of two paths defined by point and bearing
 * 利用方向角与坐标定位一条路的交叉口
 *   see http://williams.best.vwh.net/avform.htm#Intersection
 *
 * @param   {LatLon} p1: First point
 * @param   {Number} brng1: Initial bearing from first point
 * @param   {LatLon} p2: Second point
 * @param   {Number} brng2: Initial bearing from second point
 * @returns {LatLon} Destination point (null if no unique intersection defined)
 */
LatLon.intersection = function(p1, brng1, p2, brng2) {
  brng1 = typeof brng1 == 'number' ? brng1 : typeof brng1 == 'string' && trim(brng1)!='' ? +brng1 : NaN;
  brng2 = typeof brng2 == 'number' ? brng2 : typeof brng2 == 'string' && trim(brng2)!='' ? +brng2 : NaN;
  lat1 = p1._lat.toRad(), lon1 = p1._lon.toRad();
  lat2 = p2._lat.toRad(), lon2 = p2._lon.toRad();
  brng13 = brng1.toRad(), brng23 = brng2.toRad();
  dLat = lat2-lat1, dLon = lon2-lon1;
  
  dist12 = 2*Math.asin( Math.sqrt( Math.sin(dLat/2)*Math.sin(dLat/2) + 
    Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)*Math.sin(dLon/2) ) );
  if (dist12 == 0) return null;
  
  // initial/final bearings between points
  brngA = Math.acos( ( Math.sin(lat2) - Math.sin(lat1)*Math.cos(dist12) ) / 
    ( Math.sin(dist12)*Math.cos(lat1) ) );
  if (isNaN(brngA)) brngA = 0;  // protect against rounding
  brngB = Math.acos( ( Math.sin(lat1) - Math.sin(lat2)*Math.cos(dist12) ) / 
    ( Math.sin(dist12)*Math.cos(lat2) ) );
  
  if (Math.sin(lon2-lon1) > 0) {
    brng12 = brngA;
    brng21 = 2*Math.PI - brngB;
  } else {
    brng12 = 2*Math.PI - brngA;
    brng21 = brngB;
  }
  
  alpha1 = (brng13 - brng12 + Math.PI) % (2*Math.PI) - Math.PI;  // angle 2-1-3
  alpha2 = (brng21 - brng23 + Math.PI) % (2*Math.PI) - Math.PI;  // angle 1-2-3
  
  if (Math.sin(alpha1)==0 && Math.sin(alpha2)==0) return null;  // infinite intersections
  if (Math.sin(alpha1)*Math.sin(alpha2) < 0) return null;       // ambiguous intersection
  
  //alpha1 = Math.abs(alpha1);
  //alpha2 = Math.abs(alpha2);
  // ... Ed Williams takes abs of alpha1/alpha2, but seems to break calculation?
  
  alpha3 = Math.acos( -Math.cos(alpha1)*Math.cos(alpha2) + 
                       Math.sin(alpha1)*Math.sin(alpha2)*Math.cos(dist12) );
  dist13 = Math.atan2( Math.sin(dist12)*Math.sin(alpha1)*Math.sin(alpha2), 
                       Math.cos(alpha2)+Math.cos(alpha1)*Math.cos(alpha3) )
  lat3 = Math.asin( Math.sin(lat1)*Math.cos(dist13) + 
                    Math.cos(lat1)*Math.sin(dist13)*Math.cos(brng13) );
  dLon13 = Math.atan2( Math.sin(brng13)*Math.sin(dist13)*Math.cos(lat1), 
                       Math.cos(dist13)-Math.sin(lat1)*Math.sin(lat3) );
  lon3 = lon1+dLon13;
  lon3 = (lon3+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º
  
  return new LatLon(lat3.toDeg(), lon3.toDeg());
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Returns the distance from this point to the supplied point, in km, travelling along a rhumb line
 *
 *   see http://williams.best.vwh.net/avform.htm#Rhumb
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Distance in km between this point and destination point
 */
LatLon.prototype.rhumbDistanceTo = function(point) {
  var R = this._radius;
  var lat1 = this._lat.toRad(), lat2 = point._lat.toRad();
  var dLat = (point._lat-this._lat).toRad();
  var dLon = Math.abs(point._lon-this._lon).toRad();
  
  var dPhi = Math.log(Math.tan(lat2/2+Math.PI/4)/Math.tan(lat1/2+Math.PI/4));
  var q = (isFinite(dLat/dPhi)) ? dLat/dPhi : Math.cos(lat1);  // E-W line gives dPhi=0
  
  // if dLon over 180° take shorter rhumb across anti-meridian:
  if (Math.abs(dLon) > Math.PI) {
    dLon = dLon>0 ? -(2*Math.PI-dLon) : (2*Math.PI+dLon);
  }
  
  var dist = Math.sqrt(dLat*dLat + q*q*dLon*dLon) * R; 
  
  return dist.toPrecisionFixed(4);  // 4 sig figs reflects typical 0.3% accuracy of spherical model
}

/**
 * Returns the bearing from this point to the supplied point along a rhumb line, in degrees
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Bearing in degrees from North
 */
LatLon.prototype.rhumbBearingTo = function(point) {
  var lat1 = this._lat.toRad(), lat2 = point._lat.toRad();
  var dLon = (point._lon-this._lon).toRad();
  
  var dPhi = Math.log(Math.tan(lat2/2+Math.PI/4)/Math.tan(lat1/2+Math.PI/4));
  if (Math.abs(dLon) > Math.PI) dLon = dLon>0 ? -(2*Math.PI-dLon) : (2*Math.PI+dLon);
  var brng = Math.atan2(dLon, dPhi);
  
  return (brng.toDeg()+360) % 360;
}

/**
 * Returns the destination point from this point having travelled the given distance (in km) on the 
 * given bearing along a rhumb line
 *
 * @param   {Number} brng: Bearing in degrees from North
 * @param   {Number} dist: Distance in km
 * @returns {LatLon} Destination point
 */
LatLon.prototype.rhumbDestinationPoint = function(brng, dist) {
  var R = this._radius;
  var d = parseFloat(dist)/R;  // d = angular distance covered on earth’s surface
  var lat1 = this._lat.toRad(), lon1 = this._lon.toRad();
  brng = brng.toRad();

  var dLat = d*Math.cos(brng);
  // nasty kludge to overcome ill-conditioned results around parallels of latitude:
  if (Math.abs(dLat) < 1e-10) dLat = 0; // dLat < 1 mm
  
  var lat2 = lat1 + dLat;
  var dPhi = Math.log(Math.tan(lat2/2+Math.PI/4)/Math.tan(lat1/2+Math.PI/4));
  var q = (isFinite(dLat/dPhi)) ? dLat/dPhi : Math.cos(lat1);  // E-W line gives dPhi=0
  var dLon = d*Math.sin(brng)/q;
  
  // check for some daft bugger going past the pole, normalise latitude if so
  if (Math.abs(lat2) > Math.PI/2) lat2 = lat2>0 ? Math.PI-lat2 : -Math.PI-lat2;
  
  lon2 = (lon1+dLon+3*Math.PI)%(2*Math.PI) - Math.PI;
 
  return new LatLon(lat2.toDeg(), lon2.toDeg());
}

/**
 * Returns the loxodromic midpoint (along a rhumb line) between this point and the supplied point.
 *   see http://mathforum.org/kb/message.jspa?messageID=148837
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {LatLon} Midpoint between this point and the supplied point
 */
LatLon.prototype.rhumbMidpointTo = function(point) {
  lat1 = this._lat.toRad(), lon1 = this._lon.toRad();
  lat2 = point._lat.toRad(), lon2 = point._lon.toRad();
  
  if (Math.abs(lon2-lon1) > Math.PI) lon1 += 2*Math.PI; // crossing anti-meridian
  
  var lat3 = (lat1+lat2)/2;
  var f1 = Math.tan(Math.PI/4 + lat1/2);
  var f2 = Math.tan(Math.PI/4 + lat2/2);
  var f3 = Math.tan(Math.PI/4 + lat3/2);
  var lon3 = ( (lon2-lon1)*Math.log(f3) + lon1*Math.log(f2) - lon2*Math.log(f1) ) / Math.log(f2/f1);
  
  if (!isFinite(lon3)) lon3 = (lon1+lon2)/2; // parallel of latitude
  
  lon3 = (lon3+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º
  
  return new LatLon(lat3.toDeg(), lon3.toDeg());
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Returns the latitude of this point; signed numeric degrees if no format, otherwise format & dp 
 * as per Geo.toLat()
 *
 * @param   {String} [format]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to display
 * @returns {Number|String} Numeric degrees if no format specified, otherwise deg/min/sec
 */
LatLon.prototype.lat = function(format, dp) {
  if (typeof format == 'undefined') return this._lat;
  
  return Geo.toLat(this._lat, format, dp);
}

/**
 * Returns the longitude of this point; signed numeric degrees if no format, otherwise format & dp 
 * as per Geo.toLon()
 *
 * @param   {String} [format]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to display
 * @returns {Number|String} Numeric degrees if no format specified, otherwise deg/min/sec
 */
LatLon.prototype.lon = function(format, dp) {
  if (typeof format == 'undefined') return this._lon;
  
  return Geo.toLon(this._lon, format, dp);
}

/**
 * Returns a string representation of this point; format and dp as per lat()/lon()
 *
 * @param   {String} [format]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to display
 * @returns {String} Comma-separated latitude/longitude
 */
LatLon.prototype.toString = function(format, dp) {
  if (typeof format == 'undefined') format = 'dms';
  
  return Geo.toLat(this._lat, format, dp) + ', ' + Geo.toLon(this._lon, format, dp);
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

// ---- extend Number object with methods for converting degrees/radians

/** Converts numeric degrees to radians */
if (typeof Number.prototype.toRad == 'undefined') {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

/** Converts radians to numeric (signed) degrees */
if (typeof Number.prototype.toDeg == 'undefined') {
  Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
  }
}

/** 
 * Formats the significant digits of a number, using only fixed-point notation (no exponential)
 * 
 * @param   {Number} precision: Number of significant digits to appear in the returned string
 * @returns {String} A string representation of number which contains precision significant digits
 */
if (typeof Number.prototype.toPrecisionFixed == 'undefined') {
  Number.prototype.toPrecisionFixed = function(precision) {
    
    // use standard toPrecision method
    var n = this.toPrecision(precision);
    
    // ... but replace +ve exponential format with trailing zeros
    n = n.replace(/(.+)e\+(.+)/, function(n, sig, exp) {
      sig = sig.replace(/\./, '');       // remove decimal from significand
      l = sig.length - 1;
      while (exp-- > l) sig = sig + '0'; // append zeros from exponent
      return sig;
    });
    
    // ... and replace -ve exponential format with leading zeros
    n = n.replace(/(.+)e-(.+)/, function(n, sig, exp) {
      sig = sig.replace(/\./, '');       // remove decimal from significand
      while (exp-- > 1) sig = '0' + sig; // prepend zeros from exponent
      return '0.' + sig;
    });
    
    return n;
  }
}

/** Trims whitespace from string (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
  String.prototype.trim = function() {
    return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }
}






//
// Copyright (C) 1000 - 9999 Somebody Anonymous
// NO WARRANTY OR GUARANTEE
//




        //
        // Krasovsky 1940
        //
        // a = 6378245.0, 1/f = 298.3
        // b = a * (1 - f)
        // ee = (a^2 - b^2) / a^2;
        var a = 6378245.0;
        var ee = 0.00669342162296594323;


		exports.transform = function (wgLat, wgLon) {
			if (outOfChina(wgLat, wgLon)) {
				mgLat = wgLat;
				mgLon = wgLon;

				return {
					mgLat : mgLat,
					mgLon : mgLon
				}
			}
			var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
			var dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
			var radLat = wgLat / 180.0 * Math.PI;
			var magic = Math.sin(radLat);
			magic = 1 - ee * magic * magic;
			var sqrtMagic = Math.sqrt(magic);
			dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
			dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
			mgLat = wgLat + dLat;
			mgLon = wgLon + dLon;

			return {
				mgLat : mgLat,
				mgLon : mgLon
			}
		}
		
		
		

	        function outOfChina(lat, lon) {
	        	if (lon < 72.004 || lon > 137.8347) {
	        		return true;
	        	}
	        	if (lat < 0.8293 || lat > 55.8271) {
	        		return true;
	        	}
	        	return false;
	        }

	        function transformLat(x, y) {
	        	var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
	        	ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
	        	ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
	        	ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
	        	return ret;
	        }

	        function transformLon(x, y) {
	        	var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
	        	ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
	        	ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
	        	ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
	        	return ret;
	        }











/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy representation conversion functions (c) Chris Veness 2002-2012                        */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var lat = Geo.parseDMS('51° 28′ 40.12″ N');                                                 */
/*    var lon = Geo.parseDMS('000° 00′ 05.31″ W');                                                */
/*    var p1 = new LatLon(lat, lon);                                                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


var Geo = {};  // Geo namespace, representing static class


/**
 * Parses string representing degrees/minutes/seconds into numeric degrees
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3º 37' 09"W) 
 * or fixed-width format without separators (eg 0033709W). Seconds and minutes may be omitted. 
 * (Note minimal validation is done).
 *
 * @param   {String|Number} dmsStr: Degrees or deg/min/sec in variety of formats
 * @returns {Number} Degrees as decimal number
 * @throws  {TypeError} dmsStr is an object, perhaps DOM object without .value?
 */
Geo.parseDMS = function(dmsStr) {
  if (typeof deg == 'object') throw new TypeError('Geo.parseDMS - dmsStr is [DOM?] object');
  
  // check for signed decimal degrees without NSEW, if so return it directly
  if (typeof dmsStr === 'number' && isFinite(dmsStr)) return Number(dmsStr);
  
  // strip off any sign or compass dir'n & split out separate d/m/s
  var dms = String(dmsStr).trim().replace(/^-/,'').replace(/[NSEW]$/i,'').split(/[^0-9.,]+/);
  if (dms[dms.length-1]=='') dms.splice(dms.length-1);  // from trailing symbol
  
  if (dms == '') return NaN;
  
  // and convert to decimal degrees...
  switch (dms.length) {
    case 3:  // interpret 3-part result as d/m/s
      var deg = dms[0]/1 + dms[1]/60 + dms[2]/3600; 
      break;
    case 2:  // interpret 2-part result as d/m
      var deg = dms[0]/1 + dms[1]/60; 
      break;
    case 1:  // just d (possibly decimal) or non-separated dddmmss
      var deg = dms[0];
      // check for fixed-width unseparated format eg 0033709W
      //if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
      //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600; 
      break;
    default:
      return NaN;
  }
  if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve
  return Number(deg);
}


/**
 * Convert decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added
 *
 * @private
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} deg formatted as deg/min/secs according to specified format
 * @throws  {TypeError} deg is an object, perhaps DOM object without .value?
 */
Geo.toDMS = function(deg, format, dp) {
  if (typeof deg == 'object') throw new TypeError('Geo.toDMS - deg is [DOM?] object');
  if (isNaN(deg)) return null;  // give up here if we can't make a number from deg
  
    // default values
  if (typeof format == 'undefined') format = 'dms';
  if (typeof dp == 'undefined') {
    switch (format) {
      case 'd': dp = 4; break;
      case 'dm': dp = 2; break;
      case 'dms': dp = 0; break;
      default: format = 'dms'; dp = 0;  // be forgiving on invalid format
    }
  }
  
  deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)
  
  switch (format) {
    case 'd':
      d = deg.toFixed(dp);     // round degrees
      if (d<100) d = '0' + d;  // pad with leading zeros
      if (d<10) d = '0' + d;
      dms = d + '\u00B0';      // add º symbol
      break;
    case 'dm':
      var min = (deg*60).toFixed(dp);  // convert degrees to minutes & round
      var d = Math.floor(min / 60);    // get component deg/min
      var m = (min % 60).toFixed(dp);  // pad with trailing zeros
      if (d<100) d = '0' + d;          // pad with leading zeros
      if (d<10) d = '0' + d;
      if (m<10) m = '0' + m;
      dms = d + '\u00B0' + m + '\u2032';  // add º, ' symbols
      break;
    case 'dms':
      var sec = (deg*3600).toFixed(dp);  // convert degrees to seconds & round
      var d = Math.floor(sec / 3600);    // get component deg/min/sec
      var m = Math.floor(sec/60) % 60;
      var s = (sec % 60).toFixed(dp);    // pad with trailing zeros
      if (d<100) d = '0' + d;            // pad with leading zeros
      if (d<10) d = '0' + d;
      if (m<10) m = '0' + m;
      if (s<10) s = '0' + s;
      dms = d + '\u00B0' + m + '\u2032' + s + '\u2033';  // add º, ', " symbols
      break;
  }
  
  return dms;
}


/**
 * Convert numeric degrees to deg/min/sec latitude (suffixed with N/S)
 *
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 */
Geo.toLat = function(deg, format, dp) {
  var lat = Geo.toDMS(deg, format, dp);
  return lat==null ? '–' : lat.slice(1) + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
}


/**
 * Convert numeric degrees to deg/min/sec longitude (suffixed with E/W)
 *
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 */
Geo.toLon = function(deg, format, dp) {
  var lon = Geo.toDMS(deg, format, dp);
  return lon==null ? '–' : lon + (deg<0 ? 'W' : 'E');
}


/**
 * Convert numeric degrees to deg/min/sec as a bearing (0º..360º)
 *
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 */
Geo.toBrng = function(deg, format, dp) {
  deg = (Number(deg)+360) % 360;  // normalise -ve values to 180º..360º
  var brng =  Geo.toDMS(deg, format, dp);
  return brng==null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360º!
}
