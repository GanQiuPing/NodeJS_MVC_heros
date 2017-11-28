// 导入 express 模块
var express = require('express');

// 引入 path文件路径
var path = require('path');



//1.  创建服务器
var app = express();

// express中无需自行封装渲染函数，express支持模板引擎配置
/**
 * 使用官方文档配置
 * app.engine('art', require('express-art-template'));
 *  app.set('view options', {
 *      debug: process.env.NODE_ENV !== 'production'
 *  });
 */

/**
 * 2.  使用模板引擎，第一个参数： 模板文件名的后缀名，
 * 如果这里写 a,那么模板文件后缀名也要改为 a，一一对应
 */
app.engine('html', require('express-art-template'));
/**
 *  设置express模板引擎  
 *  第一个参数： view engine 表示使用模板引擎   不能写错，是固定的
 *  第二个参数： 告诉 express 渲染什么文件后缀模板（这个必须与上一个方法第一个参数对应）
 */
app.set('view engine', 'html');


/**
 * 4. 托管静态资源
 * express.static() ，参数是要托管的文件目录路径
 * 原理 ：自动帮我们判断路径，如果是我们路径前缀的请求会自动帮我们返回对应的静态资源
 */
//第一个参数：对应的虚拟目录（如果真的文件路径是node_modules/jquery/dist/jquery.min.js）
// 客户端也要写成：/a/jquery/dist/jquery.min.js 格式
app.use('/node_modules',express.static(path.join(__dirname,'node_modules')));
app.use('/public',express.static(path.join(__dirname,'public')));

// 路由分发网络请求
require('./routes/hero-route.js')(app);

// 监听端口号
app.listen(9090,function(){
    console.log('服务器启动成功');
});