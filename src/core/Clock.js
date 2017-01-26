/**
 * @author alteredq / http://alteredqualia.com/
 */

function Clock( autoStart ) {

	var autoStart = ( autoStart !== undefined ) ? autoStart : true;

	this.startTime = 0;
	this.oldTime = 0;
	this.elapsedTime = 0;
	this.delta = 0;

	this.running = false;

	if(autoStart) {
		
		this.start();
		
	}
}

Object.assign( Clock.prototype, {

	start: function () {

		if ( this.running ) {

			console.warn("Clock already running.");
			return;

		}

		this.startTime   = ( performance || Date ).now();
		this.oldTime     = this.startTime;
		this.elapsedTime = 0;
		this.delta = 0;

		this.running = true;

	},

	stop: function () {

		this._update();
		this.running = false;

	},

	getElapsedTime: function () {

		this._update();
		return this.elapsedTime;

	},

	getDelta: function () {

		this._update();
		return this.delta;

	},

	_update: function () {

		if ( this.running ) {

			var newTime = ( performance || Date ).now();

			this.delta = ( newTime - this.oldTime ) / 1000;
			this.oldTime = newTime;

			this.elapsedTime += this.delta;

		}

	}

} );


export { Clock };
