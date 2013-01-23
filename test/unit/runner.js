
var fs = require("fs");
var path = require("path");

var unitpath = path.dirname(module.filename);
var threejsPath = path.resolve(unitpath, "../../build/three.min.js");
var constantsPath = path.resolve(unitpath, "./math/Constants.js")

var threejsSource = fs.readFileSync(threejsPath,"UTF8");
var constantsSource = fs.readFileSync(constantsPath,"UTF8");

console.log("Three.js loaded");

var directories = ["./math/"];
var sources = [];

directories.forEach(function(dirPath){
	var files = fs.readdirSync(path.resolve(unitpath, dirPath));
	files.forEach(function(filePath){
		sources.push(fs.readFileSync(path.resolve(unitpath, dirPath, filePath),"UTF8"));
	});
});

var afterRead = function(data){

	var window = window || {};
	var self = self || {};
	
	var modulename,testname,errors =[],counter = 0;
	
	var module = function(name){
		
		modulename = name;
		
	}
	
	var test = function(name,testFunction){
		testname = name;
		counter = 0;
		var l = errors.length;
		try {
			testFunction();
		} catch	(ex) {
			errors.push({
				"module": modulename,
				"test":testname,
				"exception":ex
			})
		}
		if (l === errors.length){
			console.log(modulename + ": " + testname + " Passed." )
		} else {
			
			console.log(modulename + ": " + testname + " Failed." )
		}
		
	}
	
	var ok = function(expression,string){
		counter++;
		if (!expression){
			
			errors.push({
				"module": modulename,
				"test":testname,
				"number":counter,
				"description":string
				
			});
			
		}
	}
	
	eval( threejsSource + ";" + constantsSource + ";" + data);
	if (errors.length > 0){
		console.log("There are " + errors.length + " errors:");
		console.log(errors);
		process.exit(errors.length);
	} else {
		console.log("There are no errors.");
		process.exit(0);
	}
	console.log(errors);
};
	
afterRead(sources.join(";"));



