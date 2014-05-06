var path = require('path');
var os = require('os');
var fs = require('fs');
var express = require('express');
var combineOneCSS = require('../css/combineOne.js');
var isDebug = true;
var cssRoute = require('../route/cssRoute.js');

var conf = require("argsparser").parse();
var config = {
    documentRoot    : conf['-root'] && conf['-root'] !== 'undefined'? conf['-root'] : process.cwd(),
    port            : parseInt(conf['-port']) || 8888,
    isDebug : isDebug
};




process.on('uncaughtException', function(err) {
    console.error('Caught exception: ', err);
});

var pidPath = path.join(os.tmpDir(), config.port + '.node_pid');
fs.writeFile(pidPath, process.pid);

process.on('SIGTERM', function() { //SIGKILL是kill -9 的信号,无法捕获; SIGTERM是kill的信号,可以捕获
    console.log('HTTPD killed');

    fs.unlink(pidPath, function() {
        process.exit(0);
    });
});

process.title = 'simpled-server'; //linux only
var app = express();
cssRoute(app, config);
//处理post请求
// app.configure(function(){
//   app.use(express.bodyParser());
//   app.use(app.route);
// });

// app.all('/', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
//  });
// app.all('*', function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     next();
//     console.log('header');
// });
// app.all('/*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });


app.get('/favicon.ico', function(req, res) {
    res.end('');
});

app.get('*.css',function(req, res){
    var file = path.join(config.documentRoot, req.url.split('?')[0]);
    if (fs.existsSync(file)) {
        res.header('Content-Type', 'text/css;Charset=UTF-8');
        res.end(combineOneCSS(file, {
            root : config.documentRoot,
            debug : isDebug
        }), 'utf-8');
    }else{
        res.redirect(req.url.split('?')[0].replace('.css', '.less'));
    }
});

app.all('*.ajaxCross', function(req,res){
    var file = path.join(config.documentRoot, req.url.split('?')[0]);
    if (fs.existsSync(file)) {
        res.header('Content-Type', 'text/json;Charset=UTF-8');
        // res.header('Access-Control-Allow-Origin', '*');
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Credentials", true);


        // // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        // // res.header('Access-Control-Allow-Headers', 'Content-Type');
        // res.set({
        //     'Access-Control-Allow-Origin' : 'lcoalhost:8081',
        //     'Access-Control-Allow-Headers' : 'X-Requested-With',
        //     'Access-Control-Allow-Methods' : 'GET'
        // });
console.log(req.method,'request' +  new Date().getTime());
        var filestr = fs.readFileSync(file,'utf-8');
        res.end(filestr, 'utf-8');
    }
});

app.get('*.jsonp', function(req,res){
    var file = path.join(config.documentRoot, req.url.split('?')[0]);
    if (fs.existsSync(file)) {
        res.header('Content-Type', 'application/x-javascript;Charset=UTF-8');
        var filestr = fs.readFileSync(file,'utf-8');
        var callback = req.query.callback;
        res.end(callback + '(' + filestr + ')', 'utf-8');
    }
});


if (config.documentRoot) { //下面的2句必须在自定义路由规则之后
    app.use(express.static(config.documentRoot));
    app.use(express.directory(config.documentRoot));
}

app.listen(config.port);
console.log('################################################');
console.log('simple-server (pid: ' + process.pid + ') started! please visit http://127.0.0.1:' + config.port + ' . documentRoot is: ' + config.documentRoot);
console.log('################################################');
