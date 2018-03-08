define(function(require, exports, module){
    
    var typeStr = function(obj){
        return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, '')
    }

    // 随机乱序
    var ranArr = function(arr){
        var b = [];
        while (arr.length > 0) {
            var index = parseInt(Math.random() * (arr.length));
            b.push(arr[index]);
            arr.splice(index, 1);
        }
        return b;
    }

    var html = "<style></style>"
    
    var Barrage = function (elem) {
        return new Barrage.prototype.init(elem);
    }
    
    Barrage.fn = Barrage.prototype = {
        constructor: Barrage,
        init: function(elem) {
            var _self = this;

            _self.barrageList = [];         // 弹幕列表
            _self.list = [];                // 原数据
            _self.ballistic = [0,0,0,0,0];  // 弹幕弹道状态
            _self.idx = 0;                  // 弹幕当前活动下标
            _self.Interval = undefined;     // 定时器
            _self.speed = 1.2;              // 每次移动距离

            _self.buildUI(elem);
            _self.resize();

            return _self;
        },
        buildUI: function(elem){
            var root = document.querySelector(elem);
            root.insertAdjacentHTML("afterBegin", "<div class='barrageBox'></div>");
            this.box = root.querySelector(".barrageBox");
        },
        resize: function(){
            var _self = this;
            var re = function(){
                _self.width = _self.box.offsetWidth;
                _self.height = _self.box.offsetHeight;
                // 重置列表
                _self.box.style.fontSize = ((_self.width / 640) * 20) + "px";
            }
            re();
            window.addEventListener("resize", re, false);
            window.addEventListener("orientationchange", re, false);
        },
        start: function(arr){
            var _self = this;
        },
        push: function(o){
            var _self = this;
            if(o){
                if(typeStr(o) == "String" && o.trim()){
                    _self.list.push(o.trim());
                    _self.addItem(o.trim());                    
                }else if(typeStr(o) == "Array") {
                    for(var i = 0; i < o.length; i++){
                        if(typeStr(o[i]) == "String" && o[i].trim()){
                            _self.list.push(o[i].trim());
                            _self.addItem(o[i].trim());
                        }
                    }
                }
            }
            _self.reload();
        },
        addItem: function(str){
            var _self = this;            
            _self.box.insertAdjacentHTML("beforeEnd", "<span class='item'>" + str + "</span>");
            var item = _self.box.querySelector(".item:last-child");
            _self.barrageList.push({
                val     :   str,
                width   :   item.offsetWidth,
                left    :   _self.width,
                rid     :   (item.offsetWidth / _self.width) * 10000,
                status  :   false
            });
            
        },
        reload: function(str){
            var _self = this;
            var item = _self.box.querySelectorAll(".item");
            var bs = _self.getBallistic();            
            if(_self.Interval) {
                clearInterval(_self.Interval);
            }

            var setArgu = function() {
                // console.log(bs)
                if(_self.idx >= _self.list.length){
                    _self.idx = 0;
                }
                if(!_self.barrageList[_self.idx].status){
                    if(_self.list[_self.idx]){
                        var idx = _self.idx;
                        _self.barrageList[idx].ballistic = bs;
                        _self.barrageList[idx].status = true;
                        item[idx].style.top = (((90 / _self.ballistic.length) * bs) + 13.5 ) + "%";
                        item[idx].classList.add("shoot");
                        item[idx].style.transform = "translateY(-50%) translateX(" + -((_self.barrageList[idx].width + _self.width) / _self.barrageList[idx].width) * 100 + "%) translate3d(0,0,0)";
                        setTimeout(function(){
                            // 释放弹道
                            _self.ballistic[_self.barrageList[idx].ballistic] = 0;
                        }, _self.barrageList[idx].rid);
                        setTimeout(function(){
                            // 重置记录可用性
                            _self.barrageList[idx].status = false;
                            item[idx].classList.remove("shoot");
                            item[idx].style.transform = "translateY(-50%) translateX(0)";
                        }, 10000);
                    }
                }else {
                    _self.ballistic[bs] = 0;
                }
                _self.idx ++;
            }

            setArgu();
            _self.Interval = setInterval(function(){
                bs = _self.getBallistic();
                if(bs != -1) setArgu();
            }, 1000);
        },
        getBallistic: function(){     // 随机弹道
            var _self = this;

            var bs = -1;
            var ra = ranArr([0,1,2,3,4]);
            for(var i = 0; i < ra.length; i++){
                if(!_self.ballistic[ra[i]]){
                    bs = ra[i];
                    _self.ballistic[bs] = 1;
                    break;
                }
            }
            return bs;
        },
    }
    
    Barrage.fn.init.prototype = Barrage.prototype;
    
    module.exports = Barrage;
});