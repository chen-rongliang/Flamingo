(function(win){
    var ajax = ({
        init: function(){
            return this;
        },
        createXMLHttpRequest: function(){
            var obj;
            if(win.ActiveXObject){
                try {
                    obj = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        obj = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (E) {
                        obj = false;
                    }
                }
            }else if(win.XMLHttpRequest){
                //如果当前浏览器支持XMLHttp Request，则创建XMLHttpRequest对象
                obj = new XMLHttpRequest();
            }
            return obj;
        },
        post: function(url, data, callback){
            var parm = "";//构造URL参数
            for(var i in data){
                parm += i + "=" + data[i];
            }
            var obj = this.createXMLHttpRequest();

            obj.open("POST", url, true); //调用weather.php
            obj.setRequestHeader("cache-control","no-cache");
            obj.setRequestHeader("contentType","text/html;charset=uft-8") //指定发送的编码
            obj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");  //设置请求头信息
            obj.onreadystatechange = function(){  //判断URL调用的状态值并处理
                if (obj.readyState == 4 && (obj.status == 200 || obj.status == 304)) {  // 304未修改
                    typeof callback == "function" && callback.call(this, obj.responseText);
                }
            };
            obj.send(parm); //设置为发送给服务器数据
        },
        get: function(url, data, callback) {
            var obj = this.createXMLHttpRequest();  // XMLHttpRequest对象用于在后台与服务器交换数据
            var parm = "?";//构造URL参数
            for(var i in data){
                parm += i + "=" + data[i];
            }
            if(parm != "?") url += parm;
            obj.open('GET', url, true);
            obj.onreadystatechange = function() {
                if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) { // readyState == 4说明请求已完成
                    typeof callback == "function" && callback.call(this, obj.responseText);
                }
            };
            obj.send();
        }
    }).init();

    win.AJAX = ajax;
})(window)