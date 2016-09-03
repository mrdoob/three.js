const compile = require('google-closure-compiler-js').compile;
const fs = require('fs');

function read(filename) {
	return fs.readFileSync(filename, { encoding: 'utf-8' });
}

const flags = {
	// externs: [{src: read('utils/build/externs.js')}],
	jsCode: [{src: read('build/three.js')}],
	warningLevel: 'VERBOSE',
	languageIn: 'ECMASCRIPT5',
	languageOut: 'ECMASCRIPT5',
	compilationLevel: 'ADVANCED'
};

const out = compile(flags);
fs.writeFileSync('build/three.min.js', out.compiledCode);