/*
 * @author zz85 / http://github.com/zz85
 * 
 * 	Usage: slimerjs generate_screenshots.js <path to examples> <viewport>
 *
 *	Example: slimerjs generate_screenshots.js http://localhost:8000/three.js/examples/ 640x480
 * 
 */

//
// ------- Configurations ------------
//

var EXAMPLES_PATH = 'http://localhost:8000/examples/';
var SCREENSHOTS_PATH = '../../examples/screenshots/';
var WIDTH = 800;
var HEIGHT = 600;
var SCREENSHOT_DELAY = 1000;

var args = require('system').args;

if (args.length > 1) {

	if (args[1]) {
		EXAMPLES_PATH = args[1];
		console.log('EXAMPLES_PATH set to: ' + EXAMPLES_PATH)
	}

	if (args[2]) {
		var arg = args[2];
		if (arg.match(/^[0-9]+x[0-9]+$/)) {
			var viewportParts = arg.split('x');
			WIDTH = viewportParts[0]
			HEIGHT = viewportParts[1];
			console.log('WIDTH set to: ' + WIDTH);
			console.log('HEIGHT set to: ' + HEIGHT);
		}
	}

}

//
// ------ End Configurations ---------
//


var queue = [];
var webpage = require("webpage");
var page = webpage.create();

page.onConsoleMessage = function (msg, line, source) {

	if (typeof(msg)=='object' && 'filesForSlimer' in msg) {
		files = msg['filesForSlimer'];
		init(files);
	} else {
		console.log(msg);	
	}

};

// page.onResourceReceived = function (response) {
    // if (response.stage=='end') console.log('downloaded: ' + response.url)
// };

// page.onLoadFinished = function (status) {
    // console.log('Load finished.' + JSON.stringify(arguments));
// };


function open(file, delay, cb) {
	
	console.log('Opening ' + file);

	var target = EXAMPLES_PATH + file + '.html';

	page.open(target).then(function(){ 

		page.viewportSize = { width: WIDTH, height: HEIGHT };

		setTimeout(function() {
			
			page.render(SCREENSHOTS_PATH + file + '.jpg', {
				format: "jpg",
				quality: 100, 
				onlyViewport: true
			});
			
			page.close();
			
			if (cb) cb();

		}, delay);

	});
}

function init(files) {

	console.log('Received files: ' + JSON.stringify(files));

	for (var category in files) {

		var list = files[category];

		for (i=0;i<list.length;i++) {
			var file = list[i];
			queue.push(file);
		}
	}

	run();

}

function run() {

	console.log('Examples to be processed: ' + queue.length);

	if (!queue.length) {
		console.log('no more in queue');
		slimerjs.exit();
		return;
	}

	var file = queue.pop();
	open(file, SCREENSHOT_DELAY, run);	

}


page.open(EXAMPLES_PATH + 'index.html').then(
	function() {
		page.evaluate(function () {
			console.log({'filesForSlimer': files});
		})
	}
);
