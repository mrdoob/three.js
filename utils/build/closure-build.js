const compile = require('google-closure-compiler-js').compile;
const fs = require('fs');

function read(filename) {
	return fs.readFileSync(filename, { encoding: 'utf-8' });
}

const flags = {
	jsCode: [{src: read('build/three.js')}],
	warningLevel: 'VERBOSE',
	languageIn: 'ECMASCRIPT5_STRICT',
	languageOut: 'ECMASCRIPT5',
	compilationLevel: 'ADVANCED',
	externs: [{src: read('utils/build/externs.js')}]
};

console.time('compile');
const out = compile(flags);
console.timeEnd('compile');

fs.writeFileSync('build/three.min.js', out.compiledCode);