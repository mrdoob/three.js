/**
 * @author alteredq / http://alteredqualia.com/
 * @author TristanVALCKE / https://github.com/TristanVALCKE
 */

function Clock ( autoStart, unstopable ) {

	var _autoStart  = ( autoStart !== undefined ) ? autoStart : true;
	this.unstopable = ( unstopable !== undefined ) ? unstopable : false;

	this.startTime   = 0;
	this.oldTime     = 0;
	this.elapsedTime = 0;
	this.delta       = 0;

	this.running = false;

	if ( _autoStart ) {

		this.start();

	}
}

Object.assign( Clock.prototype, {

	start: function () {

		if ( this.running ) {

			console.warn( "Clock already running." );
			return;

		}

		this.startTime   = ( performance || Date ).now();
		this.oldTime     = this.startTime;
		this.elapsedTime = 0;
		this.delta       = 0;

		this.running = true;

	},

	stop: function () {

		if ( this.unstopable ) {

			console.warn( "Unable to stop clock in unstopable mode" )
			return;

		}

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

		if ( this.running || this.unstopable ) {

			var newTime = ( performance || Date ).now();

			this.delta   = ( newTime - this.oldTime ) / 1000;
			this.oldTime = newTime;

			this.elapsedTime += this.delta;

		}

	}

} );

export { Clock };
