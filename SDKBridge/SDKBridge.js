// 可参考命令:
// "copyToClipboard": 复制文字, APP.call("copyToClipboard", "文字内容");

define(function(require, exports, module){

	// 偷懒，使用jQuery
	var $ = require("jquery");

	// 内置一个路径解析器
	var path = {
		// 获取绝对路径
        dirname: function(path){
            return path.match(/[^#?]*\//)[0];
        },
        isAbsolute: function(path){
            return /\/\/|:\//.test(path);
        },
        real: function(path){
            // 1. 修正 '.'
            // 把 /a/../b/././c/.././d => /a/../b//c/..//d
            path = path.replace(/\/\.\//g, '/');

            // 2. 修正 '//'
            path = path.replace(/([^:])\/{2}/g, '$1/');
            // => /a/../b/c/../d

            // 3. 修正 '..'
            path = path.replace(/\/([^/]*)\/\.\.\//g, '/');
            // => /b/d

            return path;
        },
        // 脚本合并
        join: function(){
            var arg = arguments, path = [].join.call(arg, '/');
            return this.real(path);
        }
	};

	var app = ({
		// 平台类型
		platform: "Android",
		_def	: $.Deferred(),
		// 初始化
		init: function(){
			this.platform = "Android";
			if( /iPhone|iPod|iPad/i.test(window.navigator.userAgent) ){
				this.platform = "IOS";
			}
			this["init" + this.platform]();

			return this;
		},
		// 平台类型
		getPlatformType: function(){
			return this.platform;
		},
		// android 初始化
		initAndroid: function(){
			if (window.SDK) {
				this._def.resolve($.proxy(window.SDK.callHandler, window.SDK));
			}
		},
		// IOS 初始化
		initIOS: function(){
			var self = this;
			function callback(bridge){
				// bridge 一定要调用 init 才会生效
				// 可搜索 WebViewJavascriptBridgeReady
				bridge.init(function(data, responseCallback) {
					// 桥梁初始化后..
				});
				self._def.resolve($.proxy(bridge.callHandler, bridge));
			}

			// 如果这个对象已经存在了，就不用监听 WebViewJavascriptBridgeReady
			if(window.WebViewJavascriptBridge) {
				callback(window.WebViewJavascriptBridge);
			}else{
				window.document.addEventListener('WebViewJavascriptBridgeReady', function(event) {
					var bridge = event.bridge;
					callback(bridge);
				}, false);
			}
		},
		// 获取客户端返回 json 的 callback 回调
		call: function(method, params, callback){
			if (typeof params === "function") {
				callback = params;
				params = "";
			}
			this._def.done($.proxy(function(handler){
				var fnName = jsonpCallback(callback || $.noop, this);
				// params只接收 string 类型的参数
				handler(method, typeof params === "string" ? params : JSON.stringify(params), this.platform == "Android" ? fnName : window[fnName]);
			}, this));
		},

		// 获取用户信息
		authorize: function(callback){
			// callback 将会第1个参数，将会是用户的信息
			// #param1: code
			// #param2: data
			this.call("getAuthentication", "", callback);
		},

		// 打开页面
		openWebPage: function(href){
			if(!path.isAbsolute(href)){
				href = path.join( path.dirname(window.location.href) , href );
			}
			this.call("openWebView", href);
		},

		// 路径解析
		path: path
	}).init();

	// 设置一层访问代理
	// 如果以后，有同步请求的需求，可以试试..

	module.exports = app;

});
