/*
 * @description 翻牌子组件
 * @author 陈荣亮
 * @update 2017/12/04
 
	html:
	<div class="target_element"></div>
	
	js:
	var Poker = require("/components/poker/poker");
	var poker = Poker({
        root: ".poker",		//	目标元素
        item: ".item",		//	奖项
        actClass: "light",	//	翻开后高亮的class
        awards: 9,			//  抽奖的个数，默认9个，需要自己调整
        lottery: function(cb){
					
					//	这里设置抽奖逻辑并把抽奖结果的id返回给脚本，控制翻开的奖品
			cb && typeof cb == "function" && cb(Number(d.result.position));
        }
    });
	
 * @翻牌子是有正反面的，这里仅提供一个梯子，具体样式要自己设置，如：
	奖盘大小，奖项高度，奖项正反面的大小位置以及背景图，正面的图案
	
	css：
		.poker {}
		.poker .item {}
		.poker .front,
		.poker .behind {}
		.poker [class^="ic"] {}
		.poker .ic-1 ~ ic-9 {}
		
 * @参考例子 http://m.guopan.cn/huodong/20171212vip/
 
 */

define(function(require, exports, module){

    var Poker = function (options) {
        return new Poker.prototype.init(options);
    }

    // 随机乱序
    var ranArr = function(arr){
        return arr.sort(function(){
            return 0.5 - Math.random()
        });
    }
    // 数组位置交换
    var swapArr = function(arr, i, j){
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
        return arr;
    }
    
    Poker.fn = Poker.prototype = {
        constructor: Poker,
        init: function(options) {
            var _self = this;

            options.item = options.item || ".item";

            _self.actClass = options.actClass || "light";
            
            // 开始状态
            this.status = false;
            // 是否已经点击过某一个
            this.isClick= false;

            // 参数处理
			this.awards = [];
			options.awards = options.awards ? options.awards : 9;
			for(var i = 0; i < options.awards; i++){
				this.awards.push({id: i + 1});
			}
			this.awards = ranArr(this.awards);
            this.root = document.querySelector(options.root);

            this.createContent(options.item);
            
            this.item = this.root.querySelectorAll(options.item);

            // 调整方块位置
            this.ui();

            // event
            this.lottery = options.lottery;
            this.bindUI();

            return this;
        },
        createContent: function(cName){
            var html = "";
            for(var i = 0; i < this.awards.length; i++){
                html += '<div class="item '+ cName.substr(1, cName.length) +'" data-id="'+i+'">\
                            <div class="front"><i class="ic-'+this.awards[i].id+'"></i></div>\
                            <div class="behind"></div>\
                        </div>';
            }
            this.root.insertAdjacentHTML("afterBegin", html);
        },
        ui: function(){

            var _self = this;

            var w = 0, h = 0;

            var reset = function(){
                w = _self.item[0].offsetWidth;
                h = _self.item[0].offsetHeight;
    
                _self.root.style.height = (h * 3) + "px";
    
                // 调整方块位置
                for(var i = 0; i < _self.item.length; i++){
                    _self.item[i].style.top = ((Math.ceil((i+1)/3)-1) * h) + "px";
                    _self.item[i].style.left = (Math.ceil(i%3) * w) + "px";
                }
            }
            
            reset();
            window.addEventListener("resize", function() { reset(); })
            window.addEventListener("orientationchange", function() { reset(); })

        },
        bindUI: function(){
            var _self = this;
            // 点击翻转
            for(var i = 0; i < _self.item.length; i++){
                _self.item[i].addEventListener("click", function(){
                    var _my = this;
                    if(!_self.status || _self.isClick) return;
                    _self.isClick = true;

                    _self.lottery(function(idx){

                        _self.changeIdx(_self.awards, Number(_my.dataset.id), idx);

                        _my.classList.remove("flop");
                        _my.classList.add(_self.actClass);
                        setTimeout(function(){
                            for(var j = 0; j < _self.item.length; j++){
                                _self.item[j].classList.remove("flop");
                            }
                            _self.status = false;
                            _self.isClick = false;
                        },800);
                    })

                }, false);
            }
        },
        start: function(){

            var _self = this;

            if(_self.status) return;
            _self.status = true;
            
            _self.flop();
        },
        changeIdx: function(){
            var _self = this;
            if(arguments.length){
                var j = 0;
    
                for(var i = 0; i < _self.awards.length; i++){
                    if(_self.awards[i].id == arguments[2]){
                        j = i;
                    }
                }
                swapArr(_self.awards, arguments[1], j);
            }else {
                ranArr(_self.awards);
            }

            for(var i = 0; i < _self.awards.length; i++){
                _self.item[i].querySelector(".front").innerHTML = "";
                _self.item[i].querySelector(".front").insertAdjacentHTML("afterBegin", "<i class='ic-"+_self.awards[i].id+"'></i>");
            }
        },
        flop: function () {
            var _self = this;
            // 翻转
            for(var i = 0; i < _self.item.length; i++){
                (function(i){
                    _self.item[i].classList.add("flop");
                })(i)
            }

            setTimeout(function(){
                _self.root.classList.add("trans");
                _self.root.classList.add("confound");
                setTimeout(function(){
                    _self.root.classList.remove("confound");
                },801)
                setTimeout(function(){
                    _self.root.classList.remove("trans");
                },1602)
                _self.changeIdx();
            }, 600);
        }
    }
    
    Poker.fn.init.prototype = Poker.prototype;
    
    module.exports = Poker;
});