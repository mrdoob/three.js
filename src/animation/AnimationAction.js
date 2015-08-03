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
	this.loopCount = 0;
	this.enabled = true;	// allow for easy disabling of the action.

	this.clipTime = 0;
};

THREE.AnimationAction.prototype = {

	constructor: THREE.AnimationAction,

	updateTime: function( clipDeltaTime ) {

		var newClipTime = this.clipTime + clipDeltaTime;
		var duration = this.clip.duration;

		if( newClipTime <= 0 ) {

			if( this.loop ) {

				newClipTime -= Math.floor( newClipTime / duration ) * duration;
		   		this.clipTime = newClipTime % duration;

		   		this.loopCount --;

	   			this.mixer.dispatchEvent( { type: 'loop', action: this, direction: -1 } );

			}
			else {

		   		if( this.clipTime > 0 ) {

		   			this.mixer.dispatchEvent( { type: 'finished', action: this, direction: -1 } );

		   		}

				this.clipTime = Math.min( newClipTime, Math.max( duration, 0 ) );

			}

		}
		else if( newClipTime >= duration ) {

			if( this.loop ) {
	
				this.clipTime = newClipTime % duration;

		   		this.loopCount ++;
	
	 			this.mixer.dispatchEvent( { type: 'loop', action: this, direction: +1 } );

			}
			else {

		   		if( this.clipTime < duration ) {

		   			this.mixer.dispatchEvent( { type: 'finished', action: this, direction: +1 } );

		   		}

				this.clipTime = Math.min( newClipTime, Math.max( duration, 0 ) );

		   	}

	   	}
	   	else {

	   		this.clipTime = newClipTime;
	   		
	   	}
	
	   	return this.clipTime;

	},

	init: function( time ) {

		this.clipTime = time - this.startTime;

	},

	update: function( clipDeltaTime ) {

		this.updateTime( clipDeltaTime );

		var clipResults = this.clip.getAt( this.clipTime );

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
