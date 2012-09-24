var fs = require("fs");
var path = require("path");
var argparse =  require( "argparse" );
var uglify = require("uglify-js");
var spawn = require('child_process').spawn;

function main(){
    "use strict";
    var parser = new argparse.ArgumentParser();
    parser.addArgument(['--include'], {"action":'append', 'required':true});
    parser.addArgument(['--externs'], {"action":'append', "defaultValue":['./externs/common.js']});
    parser.addArgument(['--minify'], {"action":'storeTrue', "defaultValue":false});
    parser.addArgument(['--output'], {"defaultValue":'../build/three.js'});   
    
    
	var args = parser.parseArgs();
    
    var output = args.output;
    console.log(' * Building ' + output);
    
    console.dir(args);
    
    var buffer = [];
    for (var i = 0;i < args.include.length;i++){
        
        var files = JSON.parse(fs.readFileSync('./includes/' + args.include[i] + '.json', 'utf8'));
        for (var file = 0;file < files.length;file++){
            buffer.push(fs.readFileSync(files[file], 'utf8'));
        }
    }
    console.log(buffer.length);
    var temp = buffer.join("");
    
    if (!args.minify){
        fs.writeFileSync(output,temp,'utf8');
    } else {
        
        fs.writeFileSync(output,uglify(temp),'utf8');
        
//        An attempt to get the closure minifier working

//        var externs = ' --externs ' + args.externs.join();
//        console.log(externs);
//        var temppath = output + ".tmp";
//        fs.writeFileSync(temppath,temp,'utf8');
//        var java = spawn("java -jar ./compiler/compiler.jar --warning_level=VERBOSE --jscomp_off=globalThis " + externs + " --jscomp_off=checkTypes --language_in=ECMASCRIPT5_STRICT --js " + temppath + "  --js_output_file " + output);
//        java.stdout.on('data', function (data) {
//            console.log(data);
//        });
//        java.stderr.on('data', function (data) {
//          console.log('java stderr: ' + data);
//        });
//        java.on('exit', function (code) {
//            if (code !== 0) {
//                console.log('java process exited with code ' + code);
//            }
//        });


        
    
    }
}
main();


