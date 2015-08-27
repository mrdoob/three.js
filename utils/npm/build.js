/**
 * Builds node_modules three and three-math
 *
 * Expects a single command line argument that is the build version in the format 0.54.4-dev
 *
 * @author bhouston / http://exocortex.com
 */

var fs = require( "fs" );
var cp = require('child_process');

var commandLineArguments = process.argv.splice(2);

var outputRootDir = "./node_modules";
var inputDir = "../../build";
var readmeFileName = "../../README.md";

var headerFileName = "./header.js";
var footerFileName = "./footer.js";

if( commandLineArguments.length == 0 ) {
	throw new Error( "build version must be specified as a command line argument (e.g. 0.54.3-dev)");
}
var buildVersion = commandLineArguments[0];


var concateFiles = function ( inputFileNames, outputFileName ) {
	var buffer = [];
	for ( var i = 0; i < inputFileNames.length; i++ ) {
		buffer.push( 
			fs.readFileSync( inputFileNames[i], 'utf8' )
			);
	}

	var combinedContents = buffer.join("");
	fs.writeFileSync( outputFileName, combinedContents, 'utf8' );   
}

var createTemplatedFile = function ( templateFileName, replaceSet, outputFileName ) {
	var templateContents = fs.readFileSync( templateFileName, 'utf8' );
	for( var token in replaceSet ) {
		templateContents = templateContents.replace( "%"+token+"%", replaceSet[token] );
	}
	fs.writeFileSync( outputFileName, templateContents, 'utf8' );
}

var copyFile = function( sourceFileName, destinationFileName ) {

	var contents = fs.readFileSync( sourceFileName, 'utf8' );
	fs.writeFileSync( destinationFileName, contents, 'utf8' );

}

var buildModule = function ( name, version ) {

	if( ! fs.existsSync( outputRootDir ) ) {
		fs.mkdirSync( outputRootDir );
	}

	var outputModuleDir = outputRootDir + "/" + name;
	if( ! fs.existsSync( outputModuleDir ) ) {
		fs.mkdirSync( outputModuleDir );
	}
	// make directory moduleDir

	var inputRawFileName = inputDir + "/" + name + ".js";
	var outputRawFileName = outputModuleDir + "/" + name + ".js";

	concateFiles( [ headerFileName, inputRawFileName, footerFileName ], outputRawFileName );

	var inputMinifiedFileName = inputDir + "/" + name + ".min.js";
	var outputMinifiedFileName = outputModuleDir + "/" + name + ".min.js";

	concateFiles( [ headerFileName, inputMinifiedFileName, footerFileName ], outputMinifiedFileName );

	var templatePackageFileName = "./" + name + ".package.json";
	var replaceSet = {
		"VERSION": buildVersion
	};
	var outputPackageFileName = outputModuleDir + "/package.json";
	createTemplatedFile( templatePackageFileName, replaceSet, outputPackageFileName );

	var outputReadmeFileName = outputModuleDir + "/README.md";
	copyFile( readmeFileName, outputReadmeFileName );
}

var cmdExe, args;
if (process.platform === 'win32' || process.platform === 'win64') {
	cmdExe = "cmd.exe";
	args = [ "/c", "build.bat" ];
} else {
	cmdExe = './build.sh';
	args = [];
}
var opts = { "cwd": "../build" };
var buildAll = cp.spawn( cmdExe, args, opts );

buildAll.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

buildAll.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

buildAll.on( 'exit', function ( exitCode ) {
	console.log( "exitCode: " + exitCode );
	buildModule( "three" );
});
