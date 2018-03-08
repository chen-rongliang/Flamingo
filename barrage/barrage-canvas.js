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

    var Point = function(x, y) {  
        return {x:x, y:y};  
    };
    
    var Barrage = function (elem) {
        return new Barrage.prototype.init(elem);
    }
    
    Barrage.fn = Barrage.prototype = {
        constructor: Barrage,
        init: function(elem) {
            var _self = this;
            _self.createContent(elem);
            _self.ctx = _self.canvas.getContext("2d");
            
            _self.ballistic = [0,0,0,0,0];  // 弹道可用

            _self.speed = 1.2;  // 每次移动距离

            _self.idx = 0;
            _self.Interval = undefined;
            
            _self.resize();
            
            _self.list = [];
            _self.barrageList = [];
            
            return _self;
        },
        resize: function(){
            var _self = this;
            var re = function(){
                _self.width = _self.canvas.width = _self.canvas.offsetWidth;
                _self.height = _self.canvas.height = _self.canvas.offsetHeight;
                _self.ui();
            }
            re();
            window.addEventListener("resize", re, false);
            window.addEventListener("orientationchange", re, false);
        },
        createContent: function(elem){
            var root = document.querySelector(elem);
            root.insertAdjacentHTML("afterBegin", "<canvas style='width:100%;height:100%'></canvas>");
            this.canvas = root.querySelector("canvas");            
        },
        ui: function(){
            var _self = this;
            _self.ctx.font = ((_self.width / 640) * 24) + 'px Arial';
            if(_self.barrageList){
                for(var i = 0; i < _self.barrageList.length; i++){
                    var tmp = _self.barrageList[i];
                    if(tmp.ballistic != -1){
                        tmp.top = _self.getTop(tmp.ballistic);
                    }
                    tmp.left = (_self.width / 640) * tmp.left;
                    tmp.width = Math.ceil(_self.ctx.measureText(tmp.val).width)
                }
            }
        },
        start: function(arr){
            var _self = this;
               
            _self.shoot();

            _self.draw();
        },
        push: function(o){
            var _self = this;
            if(!o){
                return;
            }else{
                if(typeStr(o) == "String" && o.trim()){
                    _self.list.push(o.trim());
                }else if(typeStr(o) == "Array") {
                    for(var i = 0; i < o.length; i++){
                        if(typeStr(o[i]) == "String" && o[i].trim()){
                            _self.list.push(o[i].trim());
                        }
                    }
                }else {
                    return;
                }
            }
            if(!_self.Interval) {
                _self.start();
            }
        },
        draw: function(){
            var _self = this;
            if(_self.barrageList.length){
                _self.clean();
                for(var i = 0; i < _self.barrageList.length; i++){
                    var tmp = _self.barrageList[i];
                    if(tmp.left + tmp.width <= 0){
                        _self.barrageList.splice(i, 1);
                        i--;
                        continue;
                    }
                    if(tmp.left < _self.width - tmp.width - 10 && tmp.ballistic != -1) {
                        _self.ballistic[tmp.ballistic] = 0;
                        tmp.ballistic = -1;
                    }
                    tmp.left -= tmp.speed;
                    _self.drawRoundedRect(tmp);
                    _self.drawText(tmp);
                }
            }else {
                _self.start();
            }
            requestAnimationFrame(_self.draw.bind(this));
        },
        shoot: function(){
            var _self = this;
            var bs = _self.getBallistic();            
            if(_self.Interval) {
                clearInterval(_self.Interval);
            }
            var add = function() {
                if(_self.idx >= _self.list.length + 1){
                    _self.idx = 0;
                }
                if(_self.list[_self.idx]){
                    _self.barrageList.push({
                        val     :   _self.list[_self.idx],
                        color   :   _self.getColor(),
                        speed   :   _self.speed,
                        left    :   _self.width,
                        ballistic : bs,
                        top     :   _self.getTop(bs),
                        width   :   Math.ceil(_self.ctx.measureText(_self.list[_self.idx]).width)
                    });
                }
                _self.idx ++;
            }
            add();
            _self.Interval = setInterval(function(){
                bs = _self.getBallistic();
                if(bs != -1) add();
            }, 2400);
        },
        clean: function(){      // 擦除
            this.ctx.clearRect(0, 0, this.width, this.height);
        },
        drawText: function(o){  // 写字
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(o.val, o.left, o.top);
        },
        drawRoundedRect: function(o) {
            var ratio = this.width / 640;
            var rect = {x: o.left - (ratio * 12), y: o.top - (ratio * 25), width: o.width + (ratio * 24), height: ratio * 32};
            var r = ratio * 18;
            var ptA = Point(rect.x + r, rect.y);  
            var ptB = Point(rect.x + rect.width, rect.y);  
            var ptC = Point(rect.x + rect.width, rect.y + rect.height);  
            var ptD = Point(rect.x, rect.y + rect.height);  
            var ptE = Point(rect.x, rect.y);  
              
            this.ctx.beginPath();  
              
            this.ctx.moveTo(ptA.x, ptA.y);  
            this.ctx.arcTo(ptB.x, ptB.y, ptC.x, ptC.y, r);  
            this.ctx.arcTo(ptC.x, ptC.y, ptD.x, ptD.y, r);  
            this.ctx.arcTo(ptD.x, ptD.y, ptE.x, ptE.y, r);  
            this.ctx.arcTo(ptE.x, ptE.y, ptA.x, ptA.y, r);  
            this.ctx.fillStyle = "rgba(0,0,0,0.32)"
            this.ctx.fill();  
        },
        getColor: function(){   // 随机颜色
            return '#'+Math.floor(Math.random()*0xffffff).toString(16);
        },
        getTop: function(bs){     // 高度
            var _self = this;
            return Math.floor((_self.height / 5) * bs ) + ((_self.width / 640) * 30);
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