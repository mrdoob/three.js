var fs = require("fs");
var path = require("path");
var argsparser =  require( "argsparser" );
var uglify = require("uglify-js");


function merge(files){
	"use strict";
	var buffer = [];
	for (var i = 0,il = files.length;i<il;i++){
		var fileName = path.join("src", files[i]);
		buffer.push(fs.readFileSync(fileName,'utf8'));
	}
	
	return buffer.join("");

}

function output(text, filename){
	"use strict";
    var file = path.join('build', filename);
    fs.writeFileSync(file,text,'utf8');
}


function compress(text, fname_externs){
	/*

	externs = ""
	if fname_externs:
		externs = "--externs %s.js" % fname_externs

	in_tuple = tempfile.mkstemp()
	with os.fdopen(in_tuple[0], 'w') as handle:
		handle.write(text)

	out_tuple = tempfile.mkstemp()

	os.system("java -jar compiler/compiler.jar --warning_level=VERBOSE --jscomp_off=globalThis --jscomp_off=checkTypes --externs externs_common.js %s --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s" % (externs, in_tuple[1], out_tuple[1]))

	with os.fdopen(out_tuple[0], 'r') as handle:
		compressed = handle.read()

	os.unlink(in_tuple[1])
	os.unlink(out_tuple[1])

	return compressed*/
	"use strict";	
	return uglify(text);
}

function addHeader(text, endFilename){
	"use strict";
	return "// " + endFilename + " - http://github.com/mrdoob/three.js\n" + text;
	
}

function makeDebug(text){
	"use strict";
	var position = 0;
	while (true){
		position = text.indexOf("/* DEBUG", position);
		if (position == -1){
			break;
		}
		text = text.substring(0,position) + text.substring(position+8);
		position = text.find("*/", position);
		text = text.substring(0,position) + text.substring(position+2);
	}
	return text;
}

function buildLib(files, debug, minified, filename, fname_externs){
	"use strict";
	var text = merge(files);

	if (debug){
		text = makeDebug(text);
		filename = filename + 'Debug';
	}
	
	var folder;
	if (filename == "Three"){
		folder = '';
	} else {
		folder = 'custom/';
	}

	filename = filename + '.js';

	//print("=" * 40)
	console.log("========================================");
	console.log("Compiling " + filename);
	//print("=" * 40)
	console.log("========================================");

	if (minified){
		text = compress(text, fname_externs);
	}

	output(addHeader(text, filename), folder + filename);

}

function buildIncludes(files, filename){
	"use strict";
	//var template = "\t\t<script src='../src/%s'></script>";
	//var text = "\n".join(template % f for f in files)
	var text = [];
	for (var i = 0,il = files.length;i<il;i++){
		text.push("\t\t<script src='../src/" + files[i] + "'></script>");
	}
	
	output(text.join("\n"), filename + '.js');
}

function getFileNames(){
	"use strict";
	var fileName = "utils/files.json";
	var data = JSON.parse(fs.readFileSync(fileName,'utf8'));	
	return data;
}

function parse_args(){
	"use strict";
	//parse 
	var returnValue = argsparser.parse();
	/*
	# If no arguments have been passed, show the help message and exit
	if len(sys.argv) == 1:
		parser.print_help()
		sys.exit(1)
*/
	for (var i in returnValue){
		if (i.substring(0,2) == "--"){
			returnValue[i.substring(2)] = returnValue[i];
			delete returnValue[i];
		} else {
			delete returnValue[i];
		}
	}
	return returnValue;
}

function main(){
	"use strict";
	var args = parse_args();
	var debug = args.debug;
	var minified = args.minified;
	var files = getFileNames();

	var config = [
	['Three', 'includes', '', files["common"].concat(files["extras"]), args.common],
	['ThreeCanvas', 'includes_canvas', '', files["canvas"], args.canvas],
	['ThreeWebGL', 'includes_webgl', '', files["webgl"], args.webgl],
	['ThreeExtras', 'includes_extras', 'externs_extras', files["extras"], args.extras]
	];


	for (var i = 0,il = config.length;i<il;i++){
		var chosenConfig = config[i],
			fname_lib = chosenConfig[0], 
			fname_inc = chosenConfig[1], 
			fname_externs = chosenConfig[2], 
			files = chosenConfig[3], 
			enabled = chosenConfig[4];
		if (enabled || args.all){
			buildLib(files, debug, minified, fname_lib, fname_externs);
			if (args.includes){
				buildIncludes(files, fname_inc);
			}
		}
	}
}
main();


