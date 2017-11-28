
// 引入 文件模块  
// var controller = require('./controller.js');
// 引入 controller 文件
var controller = require('../Controller/hero-controller.js');

//  引入  url模块
var urlPara = require('url');


module.exports = function (req, res) {

    // 定义变量  路径  提交方法  
    // decodeURI 是把地址栏乱码进行解码
    // var url = decodeURI(req.url);

    // 解析 url请求 路径   如是是中文会自动转码
    var urlObj = urlPara.parse(req.url, true);
    // console.log('请求路径：' + urlObj.pathname);
    // console.dir('请求参数：'+urlObj.query);  //不可以直接输出，会报错

    // 将解析到的参数对象复制给 req.query， 下一次使用时就可以直接使用req.query
    // 这种写法目的： 提高代码的识别度
    req.query = urlObj.query;

    //请求路径 
    var url = urlObj.pathname;
    console.log('请求路径' + url);

    var method = req.method;
    // console.log(url + "-----" + method);

    /**
     *1.  给 res 对象添加 一个渲染函数方法，方法参数就是相应对象
     * 2. 响应对象res的作用域是 server.on()方法中，外部无法读取，所以这里需要传参数
     */
    renderModule(res);
}



module.exports = function (app) {
    /**
     * 4. 路由
     * 第一个参数： 路径
     * 第二个参数： 回调函数
     */
    app.get('/', function (req, res) {
        //显示添加英雄页面
        controller.showHeroList(req, res);
    });
    app.get('/heroAdd', function (req, res) {
        //显示添加英雄页面
        controller.showHeroAdd(req, res);
    });
    app.post('/heroAdd', function (req, res) {
        //添加英雄
        controller.doHeroAdd(req, res);
    });
    app.get('/heroInfo', function (req, res) {
        //显示英雄详情信息
        controller.showHeroInfo(req, res);
    });
    app.get('/heroEdit', function (req, res) {
        //显示编辑英雄页面
        controller.showHeroEdit(req, res);
    });
    app.post('/heroEdit', function (req, res) {
        //编辑英雄
        controller.doHeroEdit(req, res);
    });
    app.get('/heroDelete', function (req, res) {
        // 删除英雄
        controller.doHeroDel(req, res);
    });
}