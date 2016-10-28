/**
 * @author alteredq / http://alteredqualia.com/
 */

function Clock( autoStart ) {

	this.autoStart = ( autoStart !== undefined ) ? autoStart : true;

	this.startTime = 1;
	this.oldTime = 0;
	this.elapsedTime = 0;

	this.running = false;

	this.paused = false;
	this.pauseTime = 0;
	this.pauseOffset = 0;
}

Clock.prototype = {

	constructor: Clock,

	start: function () {

		this.startTime = ( performance || Date ).now();

		this.oldTime = this.startTime;
		this.elapsedTime = 0;
		this.running = true;

		this.pauseTime = 0;
		this.paused = false;
	},

	stop: function () {

		this.getElapsedTime();
		this.running = false;

	},

	pause: function () {
		if ( this.paused ) return;
		this.getDelta();
		this.paused = true;
	},

	resume: function () {
		if ( !this.paused ) return;
		this.paused = false;
		this.oldTime = ( performance || Date ).now();
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

		if ( this.paused ){
			return 0;
		}
		else if ( this.running ) {

			var newTime = ( performance || Date ).now();

			diff = ( newTime - this.oldTime ) / 1000;
			this.oldTime = newTime;

			this.elapsedTime += diff;

		}

		return diff;

	}

};


export { Clock };
