/**
 * 加密模块,负责加密解密数据
 */

var crypto = require('crypto');

//md5
function md5(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str,'utf8');
    str = md5sum.digest('hex');
    return str;
}
//sha1
function sha1(str) {
    console.log(str)
    var md5sum = crypto.createHash('sha1');
    md5sum.update(str,'utf8');
    str = md5sum.digest('hex');
    return str;
}

//字典排序再散列器
exports.dictAndMd5ize=function(obj,secret){
    var array = new Array();

    //字典排序

    for(var key in obj)
    {
        array.push(key);
    }
    array.sort();

    var paramArray = new Array();

    //拼接字符串

    for(var index in array)
    {
        var key = array[index];
        paramArray.push(key + obj[key]);
    }

    //md5化
    var md5Source = paramArray.join("");
    console.log('md5Source:'+md5Source)
    var sign = sha1(md5Source);
    console.log('sign:'+sign)
    obj.sign = sign.toUpperCase();
    delete obj.secret;//清理secret
    return obj
}