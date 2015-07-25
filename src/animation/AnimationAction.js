/**
 *
 * A clip that has been explicitly scheduled.
 * 
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationAction = function ( clip, startTime, timeScale, weight, loop ) {

	this.clip = clip;
	this.startTime = startTime || 0;
	this.timeScale = timeScale || 1;
	this.weight = weight || 1;
	this.loop = loop || clip.loop || false;
	this.enabled = true;	// allow for easy disabling of the action.

	this.cache = {}; // track name, track, last evaluated time, last evaluated value (with weight included), keyIndex.
};

THREE.AnimationAction.prototype = {

	constructor: THREE.AnimationAction,

	toAnimationClipTime: function( time ) {

		console.log( 'AnimationAction[' + this.clip.name + '].toAnimationClipTime( ' + time + ' )' );

		var clipTime = time - this.startTime;
		console.log( '   clipTime: ' + clipTime );

		clipTime *= this.timeScale;
		console.log( '   clipTime: ' + clipTime );

		if( this.loop ) {

			if( clipTime < 0 ) {

				clipTime = clipTime - Math.floor( clipTime / this.clip.duration ) * this.clip.duration;
				console.log( '   clipTime: ' + clipTime );

			}

	   		clipTime = clipTime % this.clip.duration;
			console.log( '   clipTime: ' + clipTime );

	   	}
	   	else {

	   		clipTime = Math.min( clipTime, this.clip.duration );
	   		clipTime = Math.max( clipTime, 0 );
			console.log( '   clipTime: ' + clipTime );

	   	}

		console.log( '   clipTime: ' + clipTime );

   		return clipTime;
	},

	getAt: function( time ) {

		console.log( 'AnimationAction[' + this.clip.name + '].getAt( ' + time + ' )' );

		var clipTime = this.toAnimationClipTime( time );

		var clipResults = this.clip.getAt( clipTime );

		console.log( "  clipResults: ", clipResults );

		return clipResults;
		
	}

};
