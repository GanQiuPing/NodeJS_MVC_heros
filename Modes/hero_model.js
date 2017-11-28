// 模型：负责数据增删改查

var model = module.exports;

// 引入 fs 文件模块
var fs = require('fs');

// 引入 path文件路径模块
var path = require('path');

var modelPath = path.join(path.parse(__dirname).dir,'hero.json')

/**
 * 查询所有数据
 * @param {*} callback  function(err,hero) err: 错误信息 hero所有英雄代码
 * 如果一个模块（js文件中）没有函数导出，则该函数可以理解为是当前模块的私有函数
 * callback1 形参 作为函数调用 并传入两个参数
 */
function getAllData(callback1) {
    console.log('2. 函数1， 获取所有数据，开始调用');
    // 读取文件
    fs.readFile(modelPath, 'UTF-8', function (err, data) {
        // 如是数据是空，说明出错了，否则data有数据
        if (err) {
            // 形参1开始调用 实参1，给实参1传入两个参数
            console.log('3.形参1开始调用实参1，并给实参传入两个参数');
            callback1(err, null);
        }
        // 将 字符串 转换成 json对象
        var jsonObj = JSON.parse(data);
        callback1(null, jsonObj);
    })

}

// 添加英雄
/**
 * @param {*} hero要添加的英雄对象
 * @param {*} callback function(err){} ; 添加结果
 */
model.addHero = function (hero, callback2) {
    console.log('1. 进入添加英雄函数');
    // 读取所有的英雄数据
    getAllData(function (err, heroData) {
        console.log('4. 这个函数体是实参1，它被调用了');
        //如果读取所有英雄出错，进入判断
        if (err) {
            console.log('5. 形参2调用实参2，并给实参2传入 一个参数');
            callback2(err);
        }
        // 将英雄添加到数组
        hero.id = heroData.heros.length + 1;
        heroData.heros.push(hero);
        //保存英雄
        saveHero(heroData, function (err) {
            //如果出错，执行写入失败
            if (err) {
                callback(err);
            }
            callback2(null);
        })
    });
}

//保存英雄
/**
 * @param {*} heroData  json 对象
 * @param {*} callback function(err) 写入回调
 */
function saveHero(heroData, callback) {
    //1. 将json对象 转成字符串
    var jsonStr = JSON.stringify(heroData, null, '  ');
    // 2. 写入文件
    fs.writeFile(modelPath, jsonStr, function (err) {
        callback(err);
    })
}

//根据 id查询具体英雄
model.fetchHeroById = function (id, callback) {
    // 获取参数id 是字符串，所以需要转 int类型
    var id = parseInt(id);
    console.log('我是传值过来的id' + id);
    // 调用 方法，读取所有的英雄
    getAllData(function (err, data) {
        if (err) {
            callback(err);
        }
        console.log(data);
        // // 把 字符串 转为 json对象
        // var jsonObj = JSON.parse(data);

        // 取出 json中数据， 用一个变量接收
        var heros = data.heros;

        //遍历英雄数组，找出对应的 id 对象

        /**
         * forEeach: 一旦开始，则会从头到尾执行，不可以使用return 
         * some: 循环中可以使用return来停止执行 ，节省循环性能，ture 停止，false从头到尾执行
         * fillter: 过滤循环，指定一个循环条件，通过循环查找满足条件的所有数据，从头到尾执行
         */
        heros.some(function (hero) {
            // 如果 数据中的 id 跟 地址栏id相同 ，说明找到了
            if (hero.id === id) {
                console.log('没错，就是你要找的' + hero);
                callback(null, hero);
                return true;
            }
        });

    });
}


/**
 * 修改英雄 
 * hero 要修改对象
 * callback 修改完成回调函数
 */
model.updateHero = function (hero, callback) {
    // 客户端浏览器提交的参数是字符串，这里需要转为int 类型
    var id = parseInt(hero.id);
    hero.id = id;
    //查看所有英雄，得到英雄列表json对象
    fs.readFile(modelPath, 'UTF-8', function (err, data) {
        console.log(" 我是修改英雄信息的formidable");
        if (err) {
            callback(err);
        }
        //将 字符串 转为 JOSN对象
        var jsonObj = JSON.parse(data);
        // 匹配id,如果相同，则修改数组对应的id
        /**
         * 常规思路： 遍历数组，找到id后修改
         * 非常规思路 ： 使用api操作不用循环  splice()
         * 第一个参数：从哪个开始下标开始删除，
         * 第二个参数：要删除数量
         * 第三个参数：添加
         */
        // 减1，是因为数组下标是0开始，英雄id1开始，
        jsonObj.heros.splice(id - 1, 1, hero);
        // 将 json对象 转为 字符串 
        var josnStr = JSON.stringify(jsonObj, null, '  ');
        //写入文件
        fs.writeFile(modelPath, josnStr, function (err) {
            if (err) {
                callback(err);
            }
            //编辑成功
            callback(null);
        });
    });
}


// 删除 英雄 
model.deleteHeroById = function (id, callback) {
    // 把得到 id转为 Int类型
    var id = parseInt(id);
    //读取所有数据
    fs.readFile(modelPath, 'UTF-8', function (err, data) {
        if (err) {
            callback(err);
        }
        // 把 字符串 轩为 json对象 
        var jsonObj = JSON.parse(data);
        console.log('json'+jsonObj);

        // 删除指定id下标数据
        jsonObj.heros.splice(id - 1, 1);

        //把要删除id之后的下标往前移动一位，遍历中的id要比删除对应id要大，减1
        jsonObj.heros.forEach(function (hero) {
            if (hero.id > id) {
                hero.id -= 1;
            }
        })


        // 把 对象  转为 josn字符串
        var jsonStr = JSON.stringify(jsonObj);

        //写入文件
        fs.writeFile(modelPath, jsonStr, function (err) {
            // 删除失败
            if (err) {
                callback(err);
            }
            //删除成功
            callback(null);
        });
    });
}