## Yet another tiny arguments parser for node

## Features
 * extremely tiny
 * instead to parse all possible spellings, it uses just some simple rules

## How this parser works
The target is to get a key-value object from an array. A key can be the first element or element prefixed by "-" and "--" (switch). 
So the parser loops through the array and looks for keys. After he could detect an a key all next elements will be added as a value of this key until he find another key.
If there is no value, then the key is true (boolean). If there are a lot of values, then the key is an array.

## Examples

node script.js -> {"node": "script.js"}

node script.js -o -> {"node": "script.js", "-o": true}

node script.js -o test -> {"node": "script.js", "-o": "test"}

node script.js -a testa --b testb -> {node: "script.js", "-a": "testa", "--b": "testb"}
 
node script.js -paths /test.js /test1.js -> {node: "script.js", "-paths": ["/test.js", "/test1.js"]}

## Usage

    // per default it parses process.argv
    var args = require( "argsparser" ).parse(); // {"node": "/path/to/your/script.js"}
    
    // optional you can pass your own arguments array
    var args = require( "argsparser" ).parse(["-a", "test"]); // {"-a": "test"}

    
## Installation
    npm install argsparser    