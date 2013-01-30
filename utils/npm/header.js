
var window = window || {};
var self = self || {};

// High-resulution counter: emulate window.performance.now() for THREE.CLOCK
if( window.performance === undefined ) {

	window.performance = { };

}

if( window.performance.now === undefined ) {

	window.performance.now = function () {

		var time = process.hrtime();
		return ( time[0] + time[1] / 1e9 ) * 1000;

	};

}
