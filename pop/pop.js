/*
 * @require ./pop.css
 *
 * @description 弹窗组件
 * @author momo
 * @update 2018/02/23
 */

;(function (win) {

    // 弹窗模版
    var templete = '<div id="{id}" class="pop-layer">\
                    <div class="pop-mask"></div>\
                    <div class="pop-body">{withClose}\
                        <div class="pop-title">{title}</div>\
                        <div class="content">{ctx}</div>\
                        <div class="operation">{btns}</div>\
                    </div>\
                </div>'
    // 默认z-index
    var layerIndex = 2000
    // 默认参数
    var defaultOpt = {
        title: '提示',
        btns: []
    }

    // 未定义
    var UNDEFINED = void 0;
	
	// elem选择器
	var $$ = function (elem, ctx, handle) {
		ctx = ctx || document;
		var elements = ctx.querySelectorAll(elem);
		var res = Array.prototype.slice.call(elements);
		return handle ? res : ( res.length ? ( res.length == 1 ? res[0] : res ) : null )
	}

    // 随机字符串
    var randomID = function () {
        var t = ((new Date() / 1) + "").split(""),
            tmp = "",
            ran = 0;
        for (var i = t.length; i > 0; i--) {
            ran = Math.floor(Math.random() * 3) + 1;
            if(t[i]){
                if (t[i] != 0) {
                    if (ran == 1) {
                        tmp += String.fromCharCode(64 + parseInt(t[i]));
                    } else if (ran == 2) {
                        tmp += String.fromCharCode(64 + parseInt(t[i])).toLowerCase();
                    } else {
                        tmp += t[i]
                    }
                } else {
                    tmp += t[i];
                }
            }
        }
        return tmp;
    }

    // 构建函数
    function Confirm(html, option){
        this.ctor.apply(this, arguments);
    };

    Confirm.prototype = {
        options: {},
        ctor: function (ctx, option) {
            // 参数容错
            var err = ''
            if(!ctx) {
                err += 'POP:No arguments！'
            }else if(utils.typeStr( ctx ) == 'Array' || utils.typeStr( ctx ) == 'Object' ) {
                err += 'POP:datatype error！'
            }
            if(err) {
                console.error( err )
                return
            }

            // 合并参数
            option = extend( { id: 'pop' + randomID() },  defaultOpt, option)
            option.btns.forEach(function (item ,idx) {
                if(!item.callback) item.callback = function () {}
            });

            this.options[option.id] = option;

            // 创建内容
            this.createCTX( ctx, option )
            this.bindUI( option.id )
        },
        createCTX: function ( ctx, option ) {
			// 加工拼接弹窗html
            var id = option.id
            var title = option.title || ''
            var withClose = option.withClose ? '<b class="pop-close" data-role="close">×</b>' : ''

            var btns = ''
            option.btns.forEach(function (item ,idx) {
                btns += '<a href="javascript:;" class="pop-btn pop-'+ item.color +'" data-idx="' + idx + '">'+ item.text +'</a>'
            });

            // 替换内容
            var html = templete.replace(/{(.*?)}/g, function(str, key){
                return eval(key)
            })
			// 插入弹窗
            $$('body').insertAdjacentHTML("beforeEnd", html)

        },
        bindUI: function (id) {
            var _self = this
            var dialog = $$('#' + id)
            dialog.addEventListener('click', _self.btnEvent.bind(event, _self, id), false)
        },
        btnEvent: function (_self, id, ev) {
			// 对应绑定事件
            e = ev || win.event
            var target = e.target || e.srcElement
            // id = target.dataset.id
            if(target.classList.contains('pop-btn')){
                _self.options[id].btns[Number(target.dataset.idx)].callback()
                _self.destory(id)
            }
            if(target.dataset.role){
                if(target.dataset.role == 'close'){
                    _self.destory(id)
                }
            }
        },
        destory: function (id) {
            var _self = this;
			// 移除弹窗
            $$('body').removeChild($$('#' + id))
            delete _self.options[id]

        }
    };

    win.POP = function (ctx, option) {
        return new Confirm(ctx, option)
    }

})(window)