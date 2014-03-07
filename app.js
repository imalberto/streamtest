/*jslint node:true*/


/**
http://stackoverflow.com/questions/6068820/node-js-problems-with-response-write

http://stackoverflow.com/questions/19073085/node-app-is-not-streaming-when-called-from-browser

**/
var express = require('express'),
    app,
    lineno,
    defaultCount = 50;

app = express();

app.set('port', process.env.PORT || 8666);

app.use(express.logger());


function getData(ln) {
    return 'One line status here [' + ln + ']\n';
}

function run(req, res) {
    var handle;

    res.on('close', function () {
        console.log('connection close');
        if (handle) {
            clearInterval(handle);
        }
    });
    handle = setInterval(function () {
        var Stream = require('stream'),
            stream = new Stream();

        stream.pipe = function (dest) {
            lineno++;
            dest.write(getData(lineno));
        };
        stream.pipe(res);
    }, 1000);
}

app.get('/stream', function (req, res, next) {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
    });

    // Force flush
    for (lineno = 0; lineno < defaultCount; lineno++) {
        res.write(getData(lineno));
    }

    run(req, res);
});

app.listen(app.get('port'), function () {
    console.log('Listening on port ' + app.get('port'));
});

