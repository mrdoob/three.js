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
};

THREE.AnimationAction.prototype = {

	constructor: THREE.AnimationAction,

	toAnimationClipTime: function( time ) {

		//console.log( 'AnimationAction[' + this.clip.name + '].toAnimationClipTime( ' + time + ' )' );

		var clipTime = ( time - this.startTime ) * this.timeScale;
		//console.log( '   clipTime: ' + clipTime );

		var duration = this.clip.duration;

		if( this.loop ) {

			if( clipTime < 0 ) {

				clipTime -= Math.floor( clipTime / duration ) * duration;
				//console.log( '   clipTime: ' + clipTime );

			}

	   		return clipTime % duration;

	   	}
	   	else {

	   		return Math.min( clipTime, Math.max( duration, 0 ) );

	   	}
	},

	getAt: function( time ) {

		//console.log( 'AnimationAction[' + this.clip.name + '].getAt( ' + time + ' )' );

		var clipTime = this.toAnimationClipTime( time );

		var clipResults = this.clip.getAt( clipTime );

		//console.log( "  clipResults: ", clipResults );

		return clipResults;
		
	}

	getWeightAt: function( time ) {

		if( this.weight.getAt ) {
			// pass in time, not clip time, allows for fadein/fadeout across multiple loops of the clip
			return this.weight.getAt( time );

		}

		return this.weight;

	}

};
