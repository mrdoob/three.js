// somewhat supports running with nodeunit
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var obj2bin = require('./obj2bin');


exports.testObj2Bin = function (test) {
	function testFile(basename) {
		var result = obj2bin.obj2bin(fs.readFileSync(basename + '.obj', 'utf8'));
		var jsExpected = JSON.parse(fs.readFileSync(basename + '.js', 'utf8'))
		var jsTest = result.meta;
		
		jsExpected.metadata.sourceFile = jsTest.metadata.sourceFile;
		jsExpected.metadata.generatedBy = jsTest.metadata.generatedBy;
		jsExpected.buffers = jsTest.buffers;

		test.deepEqual(jsExpected, jsTest, 'Metadata wrong for: ' + path.basename(basename));
		
		var binTest = new Uint8Array(result.binary);
		var binExpected = fs.readFileSync(basename + '.bin');
		assert.equal(binExpected.length, binTest.length);
		// TODO: optimize (node-buffertools?)
		for ( var i = 0; i < binTest.length; ++i ) {
			if ( binExpected.readUInt8(i, true) !== binTest[i] ) {
				test.ok(false, 'Binary wrong for: ' + path.basename(basename));
				break;
			}
		}
	}
	
	var testFiles = __dirname + '/test_files/';

	testFile(testFiles + 'captain');
	testFile(testFiles + 'rock_sculpt');
	testFile(testFiles + 'large_monkey');
	
	if(test.done) {
		test.done();
	}
}

if ( !module.parent ) {
	try {
	    var reporter = require('nodeunit').reporters.default;
	    process.chdir(__dirname);
	    reporter.run([path.basename(__filename)]);
	}
	catch (e) {
		exports.testObj2Bin(assert);		
	}
}
