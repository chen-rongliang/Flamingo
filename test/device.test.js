;(function (win, doc) {
    // 设备映射表
    var devices = {
        "Apple A7 GPU": {
            1136: ["iPhone 5", "iPhone 5s"],
            2048: ["iPad Air", "iPad Mini 2", "iPad Mini 3"]
        },

        "Apple A8 GPU": {
            1136: ["iPod touch (6th generation)"],
            1334: ["iPhone 6"],
            2001: ["iPhone 6 Plus"],
            2048: ["iPad Air 2", "iPad Mini 4"]
        },

        "Apple A9 GPU": {
            1136: ["iPhone SE"],
            1334: ["iPhone 6s"],
            2001: ["iPhone 6s Plus"],
            2224: ["iPad Pro (9.7-inch)"],
            2732: ["iPad Pro (12.9-inch)"]
        },

        "Apple A10 GPU": {
            1334: ["iPhone 7"],
            2001: ["iPhone 7 Plus"]
        }
    }, canvas, renderer /*设备信息*/, model /*型号*/


    var getDevice = {
        getCanvas: function () {    // 创建canvas
            if(!this.canvas){
                this.canvas = doc.createElement('canvas')
            }else {
                return
            }
        },
        getGl: function () {
            this.getCanvas()
            // 获取上下文的webgl
            return this.canvas.getContext('experimental-webgl')
        },
        getScreenWidth: function () {
            // 设备宽度 屏宽 × 设备像素比
            return Math.max(screen.width, screen.height) * (window.devicePixelRatio || 1)
        },
        getGlRenderer: function () {
            // 获取图形设备(GPU)的型号
            if (!this.renderer) {
                var debugInfo = this.getGl().getExtension('WEBGL_debug_renderer_info')
                this.renderer = debugInfo == void 0 ? 'unknown' : this.getGl().getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            }
            return this.renderer
        },
        deviceInfo: function () {
            var self = this
            if (!this.model) {
                // 同GPU对应的设备表
                var device = devices[self.getGlRenderer()]
    
                if (!device) {
                    // 查找不到
                    model = ['unknown']
                } else {
                    // 同GPU对应的设备表中不同屏幕宽度设备
                    model = device[getScreenWidth()]
                    
                    if (!model) {
                        // 也查找不到的话就只能返回未知
                        model = ['unknown']
                    }
                }
            }
    
            return {
                renderer: self.renderer,
                model: self.model
            };
        }
    }

    win.MobileDevice = getDevice.deviceInfo()

})(window, document)