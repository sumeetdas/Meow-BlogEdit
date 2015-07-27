/**
 * Created by sumedas on 26-Jul-15.
 */
var express     = require('express'),
    engine      = require('meow-blog'),
    app         = express();

global.__base = __dirname + '/';

app.use('/public', express.static(__dirname + '/public'));

app.use('/lib', express.static(__dirname + '/bower_components'));

app.use('/dist', express.static(__dirname + '/dist'));

app.use('/fonts', express.static(__dirname + '/fonts'));

app.get('/', function (pRequest, pResponse) {
    pResponse.sendFile(__dirname + '/public/index.html');
});

engine
    .config(function (pConfig) {
        pConfig
            .setConfig('jobs.cron.cronTime', '00 48 01 * * *')
            .setConfig('username', 'Sumeet Das')
            .setConfig('disqus.shortname', 'sumeetdas1992')
            .setConfig('angularSocialShare', {
                facebook: {
                    appId: '426706947492936'
                }
            });
    })
    .blog(app)
    .jobs(function (pJobs) {
        pJobs
            .startup()
            .then(function () {
                app.listen(5000, function () {
                    console.log('The server is running at port:5000');
                });
            });
    });
