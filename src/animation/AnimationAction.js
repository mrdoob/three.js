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

	this.clipTime = 0;
};

THREE.AnimationAction.prototype = {

	constructor: THREE.AnimationAction,

	updateTime: function( clipDeltaTime ) {

		//console.log( 'AnimationAction[' + this.clip.name + '].toAnimationClipTime( ' + time + ' )' );
		this.clipTime += clipDeltaTime;

		//console.log( this.clip.name, '.getTimeScaleAt( ' + this.time + ' )', this.getTimeScaleAt( this.time ) );
		//console.log( '   clipTime: ' + clipTime );

		var duration = this.clip.duration;

		if( this.loop ) {

			if( this.clipTime < 0 ) {

				this.clipTime -= Math.floor( this.clipTime / duration ) * duration;
				//console.log( '   clipTime: ' + clipTime );

			}

	   		this.clipTime = this.clipTime % duration;

	   	}
	   	else {

	   		this.clipTime = Math.min( this.clipTime, Math.max( duration, 0 ) );

	   	}

	
	   	return this.clipTime;

	},

	init: function( time ) {

		this.clipTime = time - this.startTime;

	},

	update: function( clipDeltaTime ) {

		//console.log( 'AnimationAction[' + this.clip.name + '].getAt( ' + time + ' )' );

		this.updateTime( clipDeltaTime );

		var clipResults = this.clip.getAt( this.clipTime );

		//console.log( "  clipResults: ", clipResults );

		return clipResults;
		
	},

	getTimeScaleAt: function( time ) {

		if( this.timeScale.getAt ) {
			// pass in time, not clip time, allows for fadein/fadeout across multiple loops of the clip
			return this.timeScale.getAt( time );

		}

		return this.timeScale;

	},

	getWeightAt: function( time ) {

		if( this.weight.getAt ) {
			// pass in time, not clip time, allows for fadein/fadeout across multiple loops of the clip
			return this.weight.getAt( time );

		}

		return this.weight;

	}

};
