var obj2bin = require('./obj2bin');
var fs = require('fs');
var path = require('path');

var fname = 'big.obj';
if(process.argv.length > 2) {
    fname = process.argv[2];
}
var basename = fname.replace(/\.obj$/, '');

console.log('starting, converting: ' + fname);

var result = obj2bin.obj2bin(fs.readFileSync(fname, 'utf8'));
var buffer = new Uint8Array(result.binary);

console.log(buffer.length);

var nodesBuffer = new Buffer(262144);

var fd = fs.openSync(basename + '.bin', 'w');
var offset = 0;
while(buffer.length > offset) {
    var count = Math.min(nodesBuffer.length, buffer.length - offset);
    for(var pos = 0; pos < count; ++pos) {
        nodesBuffer.writeUInt8(buffer[offset], pos);
        ++offset;
    }
    fs.writeSync(fd, nodesBuffer, 0, count)
}
fs.closeSync(fd);

result.meta.metadata.sourceFile = basename + '.obj';
result.meta.buffers = basename + '.bin';
fd = fs.openSync(basename + '.js', 'w');
fs.writeSync(fd, JSON.stringify(result.meta), 0);
fs.closeSync(fd);

console.log('all done');

// for waiting after done (to e.g. check mem)
//~ process.stdin.resume();
//~ fs.readSync(process.stdin.fd, 1, 0, "utf8");
//~ process.stdin.pause();