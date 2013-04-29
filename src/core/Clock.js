/**
 * @author alteredq / http://alteredqualia.com/
 * @author bhouston / http://exocortex.com
 */

THREE.Clock = function ( autoStart ) {

	this.autoStart = ( autoStart !== undefined ) ? autoStart : true;

	this.startTime = 0;
	this.oldTime = 0;
	this.elapsedTime = 0;

	this.running = false;

};

THREE.Clock.now = (function() {

	// is this a standard browser window with standard profiling tools?
	if( self !== undefined && self.performance !== undefined && self.performance.now !== undefined ) {

		return function() {

			return self.performance.now();

		};

	}

	return function() {

		return Date.now();

	};

})();

THREE.Clock.prototype = {

	constructor: THREE.Clock,

	start: function () {

		this.startTime = THREE.Clock.now();

		this.oldTime = this.startTime;
		this.running = true;
	},

	stop: function () {

		this.getElapsedTime();
		this.running = false;

	},

	getElapsedTime: function () {

		this.getDelta();
		return this.elapsedTime;

	},

	getDelta: function () {

		var diff = 0;

		if ( this.autoStart && ! this.running ) {

			this.start();

		}

		if ( this.running ) {

			var newTime = THREE.Clock.now();

			diff = 0.001 * ( newTime - this.oldTime );
			this.oldTime = newTime;

			this.elapsedTime += diff;

		}

		return diff;

	}

};
