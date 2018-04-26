//**************************************************************//
//                       Tjax and storages                      //
//**************************************************************//
//  Copyright: Donsee.cn 2018.04.18
//  Author   : Sprite 
//  Email    : sprite@dosnee.cn
//  Introduce: TJAX is a Fronted cache function for tempotary ajax data.
//  Easily save and manage Data Cache with TJAX and tStorage.
//  Expires are calculated and managed by automated.

console.log('TJAX is a Fronted cache function for tempotary ajax data. Any questions via sprite@donsee.cn.');

var TJAX = function(options){

    var update         = options.update       ? options.update       : false;     // 是否强制更新

    var url            = options.url          ? options.url          : false;     // 请求地址
    var parameters     = options.parameters   ? options.parameters   : false;     // 请求参数
    var callback       = options.callback     ? options.callback     : false;     // 回调函数
    var expire         = options.expire       ? options.expire       : 86400*3;   // 有效时间
    var requesttype    = options.requesttype  ? options.requesttype  : 'POST';    // 请求类型
    var loadingtype    = options.loadingtype  ? options.loadingtype  : 'Window';  // 加载类型

    var request        = {'url':url,'parameters':parameters,'requesttype':requesttype};
    var tempid         = STORAGEHASH.hash(JSON.stringify(request));
    var expire         = expire ? expire : 86400*3;

    tStorage = (typeof tStorage.list == 'undefined') ? tStorage.init() : tStorage.refresh();

    if (tStorage.hasTemp(tempid) && !update ) {

        callback(tStorage.get(tempid),'200');

    }else{

//         jQuery.ajax({

//             'url':        url,
//             'timeout':    10,
//             'type':       requesttype,
// //请求开始
//             'beforeSend': loadingtype ? tLoading(loadingtype) : false,
// //请求结束
//             'error':
//         });

        if (requesttype=='POST') {

            jQuery.post(url,parameters,function(data,status){
                tStorage.add(tempid,data,expire);
                callback(data,status);
            });

        }else if(requesttype=='GET'){

            jQuery.get(url,function(data,status){
                tStorage.add(tempid,data,expire);
                callback(data,status);
            });

        }else{

            console.log('Unvalid Request Type');

        }   
    }
}


var tStorage = {
// TempStorage 临时存储\缓存
    
    init:function(){

        tStorage.max   = 500;
        tStorage.list  = localStorage.TEMPLIST ? JSON.parse(localStorage.TEMPLIST) : {} ;
        tStorage.count = tStorage.list.length;
        tStorage.time  = Math.round(new Date().getTime()/1000) ;

        return tStorage;
        
    },

    hasTemp:function(tempid){
        tStorage.refresh();

        // console.log('TempId: '+tempid+' expired: '+tStorage.list[tempid]);

        if (tStorage.list[tempid]!=='undefined') {
            if (parseInt(tStorage.list[tempid])>tStorage.time) {
                return true;
            }else{
                
                tStorage.remove(tempid); // console.log('This temp storage is expired.');
                return false;
            }
        }else{
            console.log('No temp storage with this tempid.');
            return false;
        }

    },

    add:function(tempid,data,expire=604800,update=true){

        if (update){
            tStorage.list[tempid]    = expire + Math.round(new Date().getTime()/1000);
        }

        localStorage['TEMPLIST']     = JSON.stringify(tStorage.list);
        localStorage['TEMP_'+tempid] = JSON.stringify(data);

        tStorage.checkMax();
        // tStorage.refresh();
        return tStorage;
        
    },

    update:function(tempid,data,expire=604800){

        tStorage.add(tempid,data,expire,true);
        return tStorage;
        
    },

    remove:function(tempid){

        delete tStorage.list[tempid];
        localStorage.removeItem('TEMP_'+tempid);

        tStorage.refresh();
        return tStorage;
        
    },

    removeAll:function(arr){

        for (var i = 0; i < arr.length; i++) {
            tStorage.remove(arr[i]);
        }

    },

    get:function(tempid){

        // var datatype = datatype ? datatype : 'string';
        // object datatype  return js object

        // if(tStorage.hasTemp(tempid)){
            tempdata = localStorage.getItem('TEMP_'+tempid);
            // return datatype==='object' ? JSON.parse(tempdata) : tempdata;
            return JSON.parse(tempdata);
        // }

    },

    clear:function(){

        localStorage['TEMPLIST'] = JSON.stringify(tStorage.list);

        for ( key in tStorage.list ){
            localStorage.removeItem('TEMP_'+tStorage.list[key]);
        }

        localStorage.removeItem('TEMPLIST');

        tStorage.list = {};
        tStorage.refresh();
        return tStorage;
        
    },

    refresh:function(){

        tStorage.time  = Math.round(new Date().getTime()/1000) ;
        tStorage.count = Object.keys(tStorage.list).length;
        return tStorage;
        
    },

    checkMax:function(){

        tStorage.refresh();

        if( tStorage.count >= (tStorage.max+(tStorage.max)/5) ){

            oldlist = STORAGEHASH.valueSort( tStorage.list );
            oldlist = oldlist.slice( 0, parseInt((tStorage.count)/5 )-1 );

            tStorage.removeAll(oldlist);

        }

    }

}


var sStorage = {

    init:function(){

        sStorage.max   = 500;
        sStorage.list  = localStorage.SESSIONLIST ? JSON.parse(localStorage.SESSIONLIST) : {} ;
        sStorage.count = sStorage.list.length;
        sStorage.time  = Math.round(new Date().getTime()/1000) ;

        return sStorage;
        
    },

    hasSession:function(sessionid){
        sStorage.refresh();

        if (sStorage.list[sessionid]!=='undefined') {
            if (parseInt(sStorage.list[sessionid])>sStorage.time) {
                return true;
            }else{
                
                sStorage.remove(sessionid); // console.log('This temp storage is expired.');
                return false;
            }
        }else{
            console.log('No session storage with this sessionid.');
            return false;
        }

    },

    add:function(sessionid,data,expire=864000,update=true){

        if (update){
            sStorage.list[sessionid]       = expire + Math.round(new Date().getTime()/1000);
        }

        localStorage['SESSIONLIST']        = JSON.stringify(sStorage.list);
        localStorage['SESSION_'+sessionid] = JSON.stringify(data);

        sStorage.checkMax();
        return sStorage;
        
    },

    set:function(sessionid,data,expire=864000){

        sStorage.add(sessionid,data,expire,true);
        return sStorage;
        
    },

    remove:function(sessionid){

        delete sStorage.list[sessionid];
        localStorage.removeItem('SESSION_'+sessionid);
        localStorage['SESSIONLIST']        = JSON.stringify(sStorage.list);

        sStorage.refresh();
        return sStorage;
        
    },

    removeAll:function(arr){

        for (var i = 0; i < arr.length; i++) {
            sStorage.remove(arr[i]);
        }

    },

    get:function(sessionid){

        tempdata = localStorage.getItem('SESSION_'+sessionid);

        return JSON.parse(tempdata);

    },

    getOnce:function(sessionid){

        tempdata = localStorage.getItem('SESSION_'+sessionid);
        sStorage.remove(sessionid);

        return JSON.parse(tempdata);

    },

    clear:function(){

        localStorage['SESSIONLIST'] = JSON.stringify(sStorage.list);

        for ( key in sStorage.list ){
            localStorage.removeItem('SESSION_'+sStorage.list[key]);
        }

        localStorage.removeItem('SESSIONLIST');

        sStorage.list = {};
        sStorage.refresh();
        return sStorage;
        
    },

    refresh:function(){

        sStorage.time  = Math.round(new Date().getTime()/1000) ;
        sStorage.count = Object.keys(sStorage.list).length;
        return sStorage;
        
    },

    checkMax:function(){

        sStorage.refresh();

        if( sStorage.count >= (sStorage.max+(sStorage.max)/5) ){

        oldlist = STORAGEHASH.valueSort( sStorage.list );
        oldlist = oldlist.slice( 0, parseInt((sStorage.count)/5 )-1 );

        sStorage.removeAll(oldlist);

        }

    }

}


var lStorage = {

    set:function(key,value){

        localStorage.setItem(key,value);
        return true;
            
    },

    get:function(key){

        data = localStorage.getItem(key);

        return JSON.parse(data);

    },

    remove:function(key){

        localStorage.removeItem(key);
        return true;
        
    },

    removeAll:function(arr){

        for (var i = 0; i < arr.length; i++) {
            localStorage.removeItem(arr[i]);
        }

    },

}



var STORAGEHASH = {

    I64BIT_TABLE:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split(''),
      
    hash:function(origin){
        var hash = 5381;
        var i = origin.length - 1;

        if(typeof origin == 'string'){
            for (; i > -1; i--){
            hash += (hash << 5) + origin.charCodeAt(i);
            }
        }else{
            for (; i > -1; i--){
            hash += (hash << 5) + origin[i];
            }
        }
        var value = hash & 0x7FFFFFFF;
        var retValue = '';
        do{
            retValue += STORAGEHASH.I64BIT_TABLE[value & 0x3F];
        }while(value >>= 4);
        return retValue;
    },
    valueSort:function(obj,desc=false){
        return Object.keys(obj).sort(function(a,b){
            return desc ? obj[b]-obj[a] : obj[a]-obj[b];
        });
        // return obj;
    }
}


tStorage.init();
sStorage.init();
