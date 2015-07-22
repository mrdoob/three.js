/**
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.Action = function ( clip, startTime, timeScale, weight, loop ) {

	this.clip = clip;
	this.startTime = startTime || 0;
	this.timeScale = timeScale || 1;
	this.weight = weight || 1;
	this.loop = loop || false;
	this.enabled = true;	// allow for easy disabling of the action.

	this.cache = {}; // track name, track, last evaluated time, last evaluated value (with weight included), keyIndex.
};

THREE.Action.prototype = {

	constructor: THREE.Action,

	toClipTime: function( time ) {

		console.log( 'Action[' + this.clip.name + '].toClipTime( ' + time + ' )' );

		var clipTime = time - this.startTime;

		clipTime *= this.timeScale;

		if( this.loop ) {

			if( clipTime < 0 ) {

				clipTime = clipTime - Math.floor( clipTime / this.clip.duration ) * this.clip.duration;

			}

	   		clipTime = clipTime % this.clip.duration;

	   	}
	   	else {

	   		clipTime = Math.min( clipTime, this.clip.duration );
	   		clipTime = Math.max( clipTime, 0 );

	   	}

		console.log( '   clipTime: ' + clipTime );

   		return clipTime;
	},

	getAt: function( time ) {

		console.log( 'Action[' + this.clip.name + '].getAt( ' + time + ' )' );

		var clipTime = this.toClipTime( time );

		var clipResults = this.clip.getAt( clipTime );

		console.log( "  clipResults: ", clipResults );

		return clipResults;
		
	}

};
