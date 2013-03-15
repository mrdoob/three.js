
var window = window || {};
var self = self || {};

// High-resulution counter: emulate window.performance.now() for THREE.CLOCK
if( window.performance === undefined ) {

	window.performance = { };

}

if( window.performance.now === undefined ) {

	// check if we are in a Node.js environment
	if( ( process !== undefined ) && ( process.hrtime !== undefined ) ) {

		window.performance.now = function () {

			var time = process.hrtime();
			return ( time[0] + time[1] / 1e9 ) * 1000;

		};

	}
	// if not Node.js revert to using the Date class
	else {

		window.performance.now = function() {

			return new Date().getTime();

		};

	}

}
