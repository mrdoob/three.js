/**
 *
 * Runnable instance of an AnimationClip.
 *
 * Multiple Actions are required to add the same clip with the (same or
 * different) mixer(s) simultaneously.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationAction = function ( clip, startTime, timeScale, weight, loop ) {

	if( clip === undefined ) throw new Error( 'clip is null' );
	this.name = '';
	this.clip = clip;
	this.localRoot = null;
	this.startTime = startTime || 0;
	this.timeScale = timeScale || 1;
	this.weight = weight || 1;
	this.loop = loop || THREE.LoopRepeat;
	this.loopCount = 0;
	this.enabled = true;	// allow for easy disabling of the action.

	this.actionTime = - this.startTime;
	this.clipTime = 0;

	this.mixer = null;

	var tracks = clip.tracks,
		nTracks = tracks.length,
		interpolants = new Array( nTracks );

	for ( var i = 0; i !== nTracks; ++ i ) {

		interpolants[ i ] = tracks[ i ].createInterpolant( null );

	}

	this._interpolants = interpolants;
	this._propertyBindings = new Array( nTracks );

	this._prevRootUuid = '';
	this._prevMixerUuid = '';

};

/*
THREE.LoopOnce = 2200;
THREE.LoopRepeat = 2201;
THREE.LoopPingPing = 2202;
*/

THREE.AnimationAction.prototype = {

	constructor: THREE.AnimationAction,

	getName: function() {

		return this.name || this.clip.name;

	},

	setLocalRoot: function( localRoot ) {

		this.localRoot = localRoot;

		return this;

	},

	updateTime: function( clipDeltaTime ) {

		var previousClipTime = this.clipTime;
   		var previousLoopCount = this.loopCount;
   		var previousActionTime = this.actionTime;

		var duration = this.clip.duration;

		this.actionTime = this.actionTime + clipDeltaTime;

		if( this.loop === THREE.LoopOnce ) {

			this.loopCount = 0;
			this.clipTime = Math.min( Math.max( this.actionTime, 0 ), duration );

			// if time is changed since last time, see if we have hit a start/end limit
			if( this.clipTime !== previousClipTime ) {

				if( this.clipTime === duration ) {

					this.mixer.dispatchEvent( { type: 'finished', action: this, direction: 1 } );

				}
				else if( this.clipTime === 0 ) {

					this.mixer.dispatchEvent( { type: 'finished', action: this, direction: -1 } );

				}

			}


			return this.clipTime;

		}

		this.loopCount = Math.floor( this.actionTime / duration );

		var newClipTime = this.actionTime - this.loopCount * duration;
		newClipTime = newClipTime % duration;

		// if we are ping pong looping, ensure that we go backwards when appropriate
		if( this.loop == THREE.LoopPingPong ) {

			if( Math.abs( this.loopCount % 2 ) === 1 ) {

				newClipTime = duration - newClipTime;

			}

		}

		this.clipTime = newClipTime;

		if( this.loopCount !== previousLoopCount ) {

   			this.mixer.dispatchEvent( { type: 'loop', action: this, loopDelta: ( this.loopCount - this.loopCount ) } );

   		}

	   	return this.clipTime;

	},

	syncWith: function( action ) {

		this.actionTime = action.actionTime;
		this.timeScale = action.timeScale;

		return this;
	},

	warpToDuration: function( duration ) {

		this.timeScale = this.clip.duration / duration;

		return this;
	},

	init: function( time ) {

		this.clipTime = time - this.startTime;

		return this;

	},

	// pass in time, not clip time, allows for fadein/fadeout across multiple loops of the clip
	getTimeScaleAt: function( time ) {

		var timeScale = this.timeScale;

		if( timeScale.getAt !== undefined ) {

			return timeScale.getAt( time )[ 0 ];

		}

		return timeScale;

	},

	// pass in time, not clip time, allows for fadein/fadeout across multiple loops of the clip
	getWeightAt: function( time ) {

		var weight = this.weight;

		if( weight.getAt !== undefined ) {

			return weight.getAt( time )[ 0 ];

		}

		return weight;

	}

};
