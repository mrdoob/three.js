/**
 * @author alteredq / http://alteredqualia.com/
 * @author timmutton / http://www.timmutton.com.au/
 */

THREE.Clock = function ( autoStart ) {

	this.autoStart = ( autoStart !== undefined ) ? autoStart : true;

	if( this.autoStart ) {
		this.start()
	} 

	this.startTime = 0;
	this.oldTime = 0;
	//this.elapsedTime = 0;

	this.running = false;
	
};

THREE.Clock.prototype = {

	constructor: THREE.Clock,

	//convenience function since this gets called a couple times
	getTimeNow: function () {
		return self.performance !== undefined && self.performance.now !== undefined
					? self.performance.now()
					: Date.now();
	},

	start: function () {

		this.startTime = this.getTimeNow();

		this.oldTime = this.startTime;
		this.running = true;
		
	},

	stop: function () {

		this.running = false;

	},

	getElapsedTime: function () {
		var elapsed = 0;
		
		if ( this.autoStart && ! this.running ) {

			this.start();

		}

		if ( this.running ) {
		 
			elapsed = 0.001 * ( this.getTimeNow() - this.startTime );
		
		}

		return elapsed;
	
	},
	
	getDelta: function () {
	
		console.warn( 'DEPRECATED: Clock\'s .getDelta() has been moved to Clock\'s .getDeltaTime().' );

		return this.getDeltaTime();
		
	},

	getDeltaTime: function () {

		var diff = 0;

		if ( this.autoStart && !this.running ) {

			this.start();

		}

		if ( this.running ) {

			var newTime = this.getTimeNow();

			diff = 0.001 * ( newTime - this.oldTime );
			this.oldTime = newTime;

			//this.elapsedTime += diff;

		}

		return diff;

	}

};
