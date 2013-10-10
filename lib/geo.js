/**
 * 地图算法库,负责处理距离,坐标等的计算
 */

var EARTH_RADIUS = 6378137.0;    //单位M
var PI = Math.PI;

function getRad(d){
    return d*PI/180.0;
}

/**
 * 计算大圆距离
 * @param {Object} lat1
 * @param {Object} lng1
 * @param {Object} lat2
 * @param {Object} lng2
 */
exports.getDistance = function (lat1,lng1,lat2,lng2){

console.log(lat1,lng1,lat2,lng1)
    var radLat1 = getRad(lat1);
    var radLat2 = getRad(lat2);

    var a = radLat1 - radLat2;
    var b = getRad(lng1) - getRad(lng2);

    var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s*EARTH_RADIUS;
    s = Math.round(s*10000)/10000.0;

    return s;
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