var path = require('path');
var fs = require('fs');
var combineOneLess = require('../less/combineOne.js');

module.exports = function(app, config){

    app.get("*.less", function(req, res) {
        var theme = 'default';
        if(req.query && req.query.theme){
            theme = req.query.theme;
            console.log('theme:' + req.query.theme)
        }
        //创建临时文件
        //读取默认文件
        //默认文件的文件mixins替换

        var file = path.join(config.documentRoot, req.url.split('?')[0]);
        combineOneLess({
            file            : file,
            req             : req,
            res             : res,
            documentRoot    : config.documentRoot,
            debug           : config.isDebug,
            callback        : function(css){
                res.header("Content-Type", "text/css");
                res.end(css, 'utf-8');
            }
        });
    });


}
