// 控制器 : 负责逻辑业务处理

// 定义一个变量接收  方便易读
var controller = module.exports;

// 引入 formidable 第三方模块
var formidable = require('formidable');

// 引入 文件模块
var fs = require('fs');

// 引入 path 路径模块
var path = require('path');

// 引入文件 
var model = require('../Modes/hero_model.js');

//引入config文件
var config = require('../config.js');



// 显示 英雄列表
controller.showHeroList = function (req, res) {
    /**思路:
     * 1. 读取heroList.html数据
     * 2. 读取 json数据
     * 3. 模板引擎渲染
     * 4. 返回渲染好的 html文本
     */

    // 读取文件
    fs.readFile(path.join(path.parse(__dirname).dir, 'hero.json'), 'UTF-8', function (err, data) {
        if (err) {
            throw err;
        }
        res.render('heroViews/heroList', JSON.parse(data));
    });
}

// 显示英雄页面
controller.showHeroAdd = function (req, res) {
    res.render('heroViews/heroAdd');
}

//添加英雄到数据库（json代替）
/**
 * 显示英雄添加到数据库
 *  思路： 1. 使用formidable接收post数据/文件数据
 *      2. 将数据存到数据库
 *      3. 响应返回保存结果
 */
controller.doHeroAdd = function (req, res) {
    /**
     * formidable接收文件用法 
     * 1. 将普通文本放入到fileds对象中
     * 2. 将文件数据放入files对象中
     * 3. 会默认保存到系统根目录临时文件中，文件名是随机的（防止重复）
     * 4. 默认文件不带拓展名 （通过keepExtensions可以设置）
     */

    //1.  创建一个解析对象
    var form = new formidable.IncomingForm();
    //设置文件提交目录，默认会提交系统根磁盘临时目录，设置之后将图片指定到文件中
    form.uploadDir = './public/images';
    //设置保留文件拓展名，默认会省略文件拓展名
    form.keepExtensions = true;
    console.log('4444444444444444444444444444');

    /**
     * form.parse(req,function(err,fields,files))
     * 第一个参数：请求对象
     * 第二个参数：回调函数  解析 完成后会调用
     * err 解析出错，fields对象存入普通文本数据，files文件数据详情信息(表单中name属性)
     */
    form.parse(req, function (err, fields, files) {
        // formidable解析完成后，将变通文本数据放入到fields对象中
        console.log(fields); //{ name: 'sdtfdy', gender: '男' }
        // formidable解析完成后，将文件数据放入到files中
        console.log(fields); //{ icon:  File { ...

        //默认 文件名是随机的，通过 name属性可以获取上传文件的真实文件名
        /**
         * 修改文件名三个参数:  fs.rename(0ldPath,newPath,function(err)) 
         * 第一个参数：原始路径 
         * 第二个参数： 新的路径
         * 第三个参数： 修改完成后的回调
         */
        var oldPath = path.join(path.parse(__dirname).dir, files.icon.path);
        var newPath = path.join(path.parse(__dirname).dir, form.uploadDir, files.icon.name);
        console.log('oldpath' + oldPath);
        console.log('newpath' + newPath);
        //修改提交文件名到 指定执行的文件路径
        fs.rename(oldPath, newPath, function (err) {
            if (err) {
                throw err;
            }
            console.log('文件保存成功');

            //2.  将数据对象保存到JSON文件中

            //把英雄对象 添加到数组中  
            var hero = {};
            //实际开发中，Id是自增的，这里  id：数组长度+1
            // hero.id = jsonObj.heros.length + 1; （在modeul层添加）
            hero.name = fields.name;
            hero.gender = fields.gender;
            //由于我们json数据库icon保存的 /public/image/filename.jpg
            hero.icon = path.join(form.uploadDir, files.icon.name);
            console.log("******************************8>" + hero.icon);

            // 调用 添加英雄方法
            model.addHero(hero, function (err) {
                if (err) {
                    //告诉浏览器出错了,添加失败
                    res.end(JSON.stringify({
                        err_code: 500,
                        err_message: err.message
                    }));
                }
                //3.  响应返回处理结果，添加成功
                res.end(JSON.stringify({
                    err_code: 0,
                    err_message: null
                }));
            });
        });
    })
}

// 显示查看英雄详情
controller.showHeroInfo = function (req, res) {
    // 获取 地址栏传值参数
    var id = req.query.id;
    console.log('请求地址栏参数：' + id);
    // 根据 id 查询具体对象
    model.fetchHeroById(id, function (err, hero) {
        // 如果查询失败，返回客户端查询失败
        if (err) {
            console.log('查询失败' + err);
            res.end(JSON.stringify({
                err_code: 500,
                err_message: err.message
            }));
        } else {
            console.log(hero);
            // 使用模板引擎，将该 对象的数据渲染到html中，响应返回渲染好的html文本
            res.render('heroViews/heroInfo', {
                hero: hero
            });
        }
    })
}

// 显示编辑英雄页面
controller.showHeroEdit = function (req, res) {
    // 查询要编辑的英雄
    model.fetchHeroById(req.query.id, function (err, hero) {
        //如果出错了直接响应客户操作失败
        if (err) {
            res.end(JSON.stringify({
                err_code: 500,
                err_message: err.message
            }));
        }
        // 使用模板引擎，将该对象的数据渲染到html中，
        // 响应返回渲染好的html
        res.render('heroViews/heroEdit', hero);
    });
}

// 修改英雄信息
controller.doHeroEdit = function (req, res) {
    // 获取表单数据，得到一个 formidable对象
    /**
     * fields：表单中普通文本的json对象（无需我们去反序列化url，内部已经帮我们处理）
     * files：表单中文件信息，包含文件大小、路径、时间等信息（默认情况下formidable会将我们的文件保存到操作系统的临时文件中,
     * b并且将文件进行了改名和去除拓展名，目的是为了防止同名文件被覆盖）    
     *  */
    //  1. 创建一个formidable对象
    var form = new formidable.IncomingForm();
    // 设置上传图片路径 
    form.uploadDir = './public/images/';
    // 设置拓展名（因为默认是存储到系统根目录中，没有带拓展名）
    form.keepExtensions = true;


    //开始解析请求，得到 form.parse()
    form.parse(req, function (err, fields, files) {
        if (err) {
            //告诉客户端失败
            res.end(JSON.stringify({
                err_code: 500,
                err_message: err.message
            }));
        }


        // 如果用户没有上传图片，刚不修改文件名
        // if (files.icon.size === 0) {
        //     //删除空的临时文件
        //     fs.unlink(files.icon.path);
        //     //设置对象的图片为原始图片
        // }

        // console.dir(files);
        // formidable解析文件名是随机的 ，这里指定用户需要真实名字
        var oldPath = path.join(path.parse(__dirname).dir, files.icon.path);
        var newPath = path.join(path.parse(__dirname).dir, form.uploadDir, files.icon.name);
        console.log('6666666666666666');
        console.log(oldPath);


        // 修改上传图片临时文件名
        fs.rename(oldPath, newPath, function (err) {
            if (err) {
                //告诉客户端编辑失败
                res.end(JSON.stringify({
                    err_code: 500,
                    err_message: err.message
                }));
            }
            // 修改英雄  通过 model来修改

            // 创建英雄对象并赋值
            var hero = {};
            hero.name = fields.name;
            hero.gender = fields.gender;
            hero.id = fields.id;
            hero.icon = path.join(form.uploadDir, files.icon.name);

            // 修改英雄
            model.updateHero(hero, function (err) {
                if (err) {
                    // 告诉浏览器失败
                    res.end(JSON.stringify({
                        err_code: 500,
                        err_message: err.message
                    }));
                }
                //告诉客户端编辑成功
                res.end(JSON.stringify({
                    err_code: 0,
                    err_message: null
                }));
            });
        });
    });
}

// 删除英雄 
controller.doHeroDel = function (req, res) {
    // 获取get请求参数，英雄id
    var id = req.query.id; // 得到id是字符串 
    // 让 model模型去删除英雄 
    model.deleteHeroById(id, function (err) {
        // 告诉浏览器失败
        if (err) {
            res.end(JSON.stringify({
                err_code: 500,
                err_message: err.message
            }));
        }
        /**
         * 浏览器删除成功，用户首页刷新
         * 刷新可以在客户端也可以在服务端操作
         * 客户端： window.location.href = '/'
         * 服务端： 重新渲染首页
         */
        fs.readFile(path.join(path.parse(__dirname).dir,'hero.json'),'UTF-8',function(err, data){
            if(err){
                throw err;
            }
            res.render('heroViews/heroList',JSON.parse(data));
        })
    });
}



// 开放文件静态资源 
controller.showStatic = function (req, res) {

    // 定义变量  路径  提交方法  
    // decodeURI 是把地址栏乱码进行解码
    var url = decodeURI(req.url);

    fs.readFile(path.join(__dirname, url), function (err, data) {
        if (err) {
            throw err;
            //真实项目，不应该抛出异常，一旦抛出异常就停止，这里返回客户端错误原因
            res.end('file not found' + url);
        }
        res.end(data);
    })
}