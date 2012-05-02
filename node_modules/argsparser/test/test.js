var a = require('assert'),
    util = require('util'),
    parse = require('../lib/argsparser').parse;

util.print('Run tests...\n');

a.deepEqual(parse(), {node: __filename}, 'node script.js');

a.deepEqual(parse(['-o']), {'-o': true}, 'node script.js -o');

a.deepEqual(parse(['-o', 'true']), {'-o': true}, 'node script.js -o true');

a.deepEqual(parse(['-o', 'false']), {'-o': false}, 'node script.js -o false');

a.deepEqual(parse(['-o', '123']), {'-o': 123}, 'node script.js -o 123');

a.deepEqual(parse(['--token', 'bla--bla']), {'--token': 'bla--bla'}, 'node script.js --token bla--bla');

a.deepEqual(parse(['-o', '123.456']), {'-o': 123.456}, 'node script.js -o 123.456');

a.deepEqual(parse(['-o', 'test']), {'-o': 'test'}, 'node script.js -o test');

a.deepEqual(parse(['-a', 'testa', '-b', 'testb']), {'-a': 'testa', '-b': 'testb'}, 'node script.js -a testa -b testb');

a.deepEqual(parse(['--a', 'testa', '--b', 'testb']), {'--a': 'testa', '--b': 'testb'}, 'node script.js --a testa --b testb ');

a.deepEqual(parse(['-a', 'testa', '--b', 'testb']), {'-a': 'testa', '--b': 'testb'}, 'node script.js -a testa --b testb');

a.deepEqual(parse(['--a', 'testa', '-b', 'testb']), {'--a': 'testa', '-b': 'testb'}, 'node script.js --a testa -b testb');

a.deepEqual(parse(['-paths', '/test.js', '/test1.js']), {'-paths': ['/test.js', '/test1.js']}, 'node script.js -paths /test.js /test1.js');

a.deepEqual(parse(['--paths', '/test.js', '/test1.js']), {'--paths': ['/test.js', '/test1.js']}, 'node script.js --paths /test.js /test1.js');

a.deepEqual(parse(['--paths', '/test.js', '/test1.js', '-a', 'testa']), {'--paths': ['/test.js', '/test1.js'], '-a': 'testa'}, 'node script.js --paths /test.js /test1.js -a testa');

a.deepEqual(parse(['--port', '80', '8080']), {'--port': [80, 8080]}, 'node server.js --port 80 8080');

util.print('All tests ok\n');
