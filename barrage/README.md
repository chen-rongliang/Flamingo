**简单弹幕组件**


----------


因为活动需要，做了两个版本的弹幕组件，使用上是一样的，有需要可以拿去用

 - canvas版本的流畅，但是机器性能要好，能承载的弹幕量大
 - dom版的效果一般，不过啥破机器都玩得开，推荐活动使用
 
用法都一样：

    
    html:
        <div id="target_elem"></div> 或者
        <div class="target_elem"></div>
    
    js:
        var Barrage = require("/components/barrage-dom.js");
        // var Barrage = require("/components/barrage-dom.js");
        
        var br = Barrage("target_elem");
        
        br.push("可以插入消息");
        br.push(["也可以用数组批量插入"]);
