/*
* @description canvas合成图
* @author MO
* @update 2018/01/22
* @demo
    mixphoto({
        fileType: 'png',                // 合成图的后缀名
        width: 300,                     //canvas 宽高
        height: 300,
        task: [                         // 合成任务列
            {
                src: '/test.png',       // 图片类型的要传图片地址，合成时的宽高，合成的xy轴坐标
                width: 356,
                height: 627,
                x: 0,
                y: 0
            }
            {
                font: '14px',           // 文字类型的要传文字的字体设置，颜色文字内容以及合成的xy轴坐标
                fillStyle: '#3f3f3f',
                text: '我家有条大大狗',
                x: 104,
                y: 470
            }
        ],
        callback: function (file) {     // callback有合成图的返回内容，包括base64，可以给a标签用的href，还有时间戳文件名
            console.log(file)
            // file => {
                base64
                href
                name
            }
        }
    });
*/

;! function (win, doc) {

    // 检测是否支持下载资源
    var isSupportDownload = 'download' in document.createElement('a');

    // 类型判断
    var typeStr = function (obj) {
        return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, '')
    }

    // 创建元素 : tagName => 标签名  abs => 元素属性集合
    var ctElem = function (tagName, abs) {
        if (!tagName || typeof tagName != 'string') {
            console.error('创建元素缺少参数');
            return
        } else {
            var elem = doc.createElement(tagName)
            for (var i in abs) {
                elem[i] = abs[i]
            }
        }
        return elem;
    }

    // base64 转 2进制文件
    var base64ToBlob = function (code) {
        var type = code.match(/data:(\S*);/)[1];
        var raw = window.atob(code.split(',')[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], {type: type});
    }

    // 多图合成
    var APP = function (options) {
        return new APP.prototype.init(options);
    }
    APP.fn = APP.prototype = {
        constructor: APP,
        base64: void 0,
        init: function (options) {
            var _self = this;

            // 处理参数
            if (typeStr(options) !== 'Object') {
                console.error('合成图片缺少必须参数');
                return;
            } else {
                _self.options = options;
                // 开始合成
                return _self.start();
            }
        },
        ctPalette: function () {
            var _self = this;
            // 新增画板
            if(!_self.palette) {
                _self.palette = ctElem("canvas", {
					// 新建canvas并且设置待续哦啊
                    width: _self.options.width,
                    height: _self.options.height
                })
				// canvas的上下文
                _self.paletteCtx = _self.palette.getContext("2d");
            }
        },
        draw: function (list) {
            var _self = this;
			// 开始任务
            _self.options.task.forEach(function (e) {
                if(e.src){
					// 处理图片的
                    _self.paletteCtx.drawImage(e.elem, e.x, e.y, e.width, e.height);
                }else {
					// 处理文字的
                    _self.paletteCtx.font = e.font
                    _self.paletteCtx.fillStyle = e.fillStyle
                    e.x -= Math.ceil(_self.paletteCtx.measureText(e.text).width) /2
                    _self.paletteCtx.fillText(e.text, e.x, e.y);
                }
            })
			// 输出base64数据并调用回调方法
            _self.base64 = _self.palette.toDataURL('images/' + _self.options.fileType);
            _self.options.callback({
                base64: _self.base64,
                href:   URL.createObjectURL(base64ToBlob(_self.base64)),
                name: "FILE_" + (new Date()/1) + "." + _self.options.fileType
            })
            if(!isSupportDownload) console.warn("Warning: download attribute of 'a' element is not support in this borwser, maybe you should try to download this mixphoto with another way.")
        },
        loadSource: function () {
            var _self = this;
            
			// 先加载图片，后再操作
            _self.options.task.forEach(function (e) {
                if(e.src){
                    _self.promises.push(
                        new Promise(function ( resolve, reject ) {
                            e.elem = ctElem('img', {
                                crossOrigin : "*"
                            })
                            e.elem.onload = function(){
                                //第i张加载完成
                                resolve()
                            }
							e.elem.onerror = function () {
                                reject('"' + e.elem.src + '"加载出错');
                            }
                            e.elem.src = e.src;
                        })
                    )
                }
            });
        },
		// 利用promise实现异步加载
        promises: [],
        start: function () {

            var _self = this;
            
            _self.ctPalette();

            _self.loadSource();

            Promise.all(_self.promises).then(function () {
                _self.draw(_self.options.task);
            }, function ( msg ) {
                alert(msg)
            })

        }
    }
    APP.fn.init.prototype = APP.prototype;

	// 抛到window里
    win.mixphoto = APP;

}(window, document);