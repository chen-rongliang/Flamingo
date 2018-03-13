var extend = function() {
	var isPlainObject = function(o){
		// 纯粹对象判断
		return o.constructor.prototype === Object.prototype;
	};
	var isType = function(o, str){
		// 判断变量的类型是否是指定的
		return (Object.prototype.toString.call(o).replace(/\[object\s|\]/g, "")) == str;
	};
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        // 使用||运算符，排除隐式强制类型转换为false的数据类型
        // 如'', 0, undefined, null, false等
        // 如果target为以上的值，则设置target = {}
        i = 1,
        length = arguments.length,
        deep = false;

    // 当typeof target === 'boolean'时
    // 则将deep设置为target的值
    // 然后将target移动到第二个参数，
    if (typeof target === "boolean") {
        deep = target;
        // 使用||运算符，排除隐式强制类型转换为false的数据类型
        // 如'', 0, undefined, null, false等
        // 如果target为以上的值，则设置target = {}
        target = arguments[i] || {};
        i++;
    };

    // 如果target不是一个对象或数组或函数，
    // 则设置target = {}
    // 这里与Object.assign的处理方法不同，
    // assign方法会将Boolean、String、Number方法转换为对应的基本包装类型
    // 然后再返回，
    // 而extend方法直接将typeof不为object或function的数据类型
    // 全部转换为一个空对象
    if (!isType(target, "Object") && !isType(target, "Function")) {
        target = {};
    };

    // 如果arguments.length === 1 或
    // typeof arguments[0] === 'boolean', 且存在arguments[1]，
    // 这时候目标对象会指向this
    // this的指向哪个对象需要看是使用$.fn.extend还是$.extend
    if (i === length) {
        target = this;
        // i-- 表示不进入for循环
        i--;
    };

    // 循环arguments类数组对象，从源对象开始
    for (; i < length; i++) {
        // 针对下面if判断
        // 有一点需要注意的是
        // 这里有一个隐式强制类型转换 undefined == null 为 true
        // 而undefined === null 为 false
        // 所以如果源对象中数据类型为Undefined或Null
        // 那么就会跳过本次循环，接着循环下一个源对象
        if ((options = arguments[i]) != null) {
            // 遍历所有[[emuerable]] === true的源对象
            // 包括Object, Array, String
            // 如果遇到源对象的数据类型为Boolean, Number
            // for in循环会被跳过，不执行for in循环
            for (name in options) {
                // src用于判断target对象是否存在name属性
                src = target[name];

                // 需要复制的属性
                // 当前源对象的name属性
                copy = options[name];

                // 这种情况暂时未遇到..
                // 按照我的理解，
                // 即使copy是同target是一样的对象
                // 两个对象也不可能相等的..
                if (target === copy) {
                    continue;
                };

                // if判断主要用途：
                // 如果是深复制且copy是一个对象或数组
                // 则需要递归jQuery.extend(),
                // 直到copy成为一个基本数据类型为止
                if (deep && copy && (isPlainObject(copy) || copyIsArray == isType(copy, "Array"))) {
                    // 深复制
                    if (copyIsArray) {
                        // 如果是copy是一个数组
                        // 将copyIsArray重置为默认值
                        copyIsArray = false;
                        // 如果目标对象存在name属性且是一个数组
                        // 则使用目标对象的name属性，否则重新创建一个数组，用于复制
                        clone = src && isType(copy, "src") ? src : [];

                    } else {
                        // 如果目标对象存在name属性且是一个对象
                        // 则使用目标对象的name属性，否则重新创建一个对象，用于复制
                        clone = src && isPlainObject(src) ? src : {};
                    };

                    // 因为深复制，所以递归调用jQuery.extend方法
                    // 返回值为target对象，即clone对象
                    // copy是一个源对象
                    target[name] = extend(deep, clone, copy);

                } else if (copy !== undefined) {
                    // 浅复制
                    // 如果copy不是一个对象或数组
                    // 那么执行elseif分支
                    // 在elseif判断中如果copy是一个对象或数组，
                    // 但是都为空的话，排除这种情况
                    // 因为获取空对象的属性会返回undefined
                    target[name] = copy;
                };
            }
        }
    }
    // 当源对象全部循环完毕之后，返回目标对象
    return target;
};