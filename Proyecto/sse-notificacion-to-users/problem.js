var events = require('events'),
EventEmitter = events.EventEmitter,
rr = new EventEmitter();

app.post('/api/:boardname/remoterefresh', function(req, res){
    var boardname = req.param('boardname'),
    data = new Date().getTime();
    rr.emit("refresh-"+boardname, data)
    res.json({data: data})
});

app.get('/api/:boardname/remoterefresh', function(req, res){
    var boardname = req.param('boardname')

    rr.on("refresh-"+boardname, function(data){
        setTimeout(function(){
            res.write('data: '+data+'\n\n');
        }, 1000)
    });

    req.socket.setTimeout(Infinity);

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    res.write('\n');

    req.on('close', function(){
        console.log('closed')
        rr.removeListener("refresh-"+boardname, function(){
            //
        })
    })

})