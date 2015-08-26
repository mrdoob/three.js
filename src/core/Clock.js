/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Clock = function ( autoStart ) {

	this.autoStart = ( autoStart !== undefined ) ? autoStart : true;

	this.startTime = 0;
	this.oldTime = 0;
	this.elapsedTime = 0;

	this.running = false;

};

THREE.Clock.prototype = {

	constructor: THREE.Clock,

	start: function () {

		this.startTime = self.performance !== undefined && self.performance.now !== undefined
					 ? self.performance.now()
					 : Date.now();

		this.oldTime = this.startTime;
		this.running = true;

	},

	stop: function () {

		this.updateElapsedTime();
		this.running = false;

	},

	getElapsedTime: function () {

		this.updateElapsedTime();
		return this.elapsedTime;

	},

	updateElapsedTime: function () {

		this.elapsedTime += this.getDelta();

	},

	getDelta: function () {

		var diff = 0;

		if ( this.autoStart && ! this.running ) {

			this.start();

		}

		if ( this.running ) {

			var newTime = self.performance !== undefined && self.performance.now !== undefined
					 ? self.performance.now()
					 : Date.now();

			diff = 0.001 * ( newTime - this.oldTime );
			this.oldTime = newTime;

		}

		return diff;

	}

};
