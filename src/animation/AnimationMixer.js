/**
 *
 * Mixes together the AnimationClips scheduled by AnimationActions and applies them to the root and subtree
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationMixer = function( root ) {

	this.root = root;
	this.time = 0;
	this.timeScale = 1.0;
	this.actions = [];
	this.propertyBindings = {};
	this.propertyBindingsArray = [];

};

THREE.AnimationMixer.prototype = {

	constructor: THREE.AnimationMixer,

	addAction: function( action ) {

		this.actions.push( action );

		var tracks = action.clip.tracks;

		for( var i = 0; i < tracks.length; i ++ ) {

			var track = tracks[ i ];

			var propertyBinding = this.propertyBindings[ track.name ];

			if( ! this.propertyBindings[ track.name ] ) {
			
				propertyBinding = new THREE.PropertyBinding( this.root, track.name );
				this.propertyBindings[ track.name ] = propertyBinding;
				this.propertyBindingsArray.push( propertyBinding );
			
			}

			// track usages of shared property bindings, because if we leave too many around, the mixer can get slow
			propertyBinding.referenceCount += 1;

		}

	},

	removeAllActions: function() {

		// unbind all property bindings
		for( var i = 0; i < this.propertyBindingsArray.length; i ++ ) {

			this.propertyBindingsArray[i].unbind();

		}

		this.actions = [];
		this.propertyBindings = {};
		this.propertyBindingsArray = [];

	},

	removeAction: function( action ) {

		var index = this.actions.indexOf( action );

		if ( index !== - 1 ) {

			this.actions.splice( index, 1 );

		}

		// remove unused property bindings because if we leave them around the mixer can get slow
		var tracks = action.clip.tracks;

		for( var i = 0; i < tracks.length; i ++ ) {
		
			var track = tracks[ i ];
			var propertyBinding = this.propertyBindings[ track.name ];

			propertyBinding.referenceCount -= 1;

			if( propertyBinding.referenceCount <= 0 ) {

				propertyBinding.unbind();

				delete this.propertyBindings[ track.name ];
				this.propertyBindingArray.splice( this.propertyBindingArray.indexOf( propertyBinding ), 1 );

			}
		}

	},

	play: function( action, optionalFadeInDuration ) {

		action.startTime = this.time;
		this.addAction( action );

	},

	fadeOut: function( action, duration ) {

		var keys = [];

		keys.push( { time: this.time, value: 1 } );
		keys.push( { time: this.time + duration, value: 0 } );
		
		action.weight = new THREE.KeyframeTrack( "weight", keys );
	},

	fadeIn: function( action, duration ) {
		
		var keys = [];
		
		keys.push( { time: this.time, value: 0 } );
		keys.push( { time: this.time + duration, value: 1 } );
		
		action.weight = new THREE.KeyframeTrack( "weight", keys );

	},

	warp: function( action, startTimeScale, endTimeScale, duration ) {

		var keys = [];
		
		keys.push( { time: this.time, value: startTimeScale } );
		keys.push( { time: this.time + duration, value: endTimeScale } );
		
		action.timeScale = new THREE.KeyframeTrack( "timeScale", keys );

	},

	crossFade: function( fadeOutAction, fadeInAction, duration, warp ) {

		this.fadeOut( fadeOutAction, duration );
		this.fadeIn( fadeInAction, duration );

		if( warp ) {
	
			var startEndRatio = fadeOutAction.clip.duration / fadeInAction.clip.duration;
			var endStartRatio = 1.0 / startEndRatio;

			this.warp( fadeOutAction, 1.0, startEndRatio, duration );
			this.warp( fadeInAction, endStartRatio, 1.0, duration );

		}
		
	},

	update: function( deltaTime ) {

		var mixerDeltaTime = deltaTime * this.timeScale;
		this.time += mixerDeltaTime;

		for( var i = 0; i < this.actions.length; i ++ ) {

			var action = this.actions[i];

			var weight = action.getWeightAt( this.time );

			var actionTimeScale = action.getTimeScaleAt( this.time );
			var actionDeltaTime = mixerDeltaTime * actionTimeScale;
		
			var actionResults = action.update( actionDeltaTime );

			if( action.weight <= 0 || ! action.enabled ) continue;

			for( var name in actionResults ) {

				this.propertyBindings[name].accumulate( actionResults[name], weight );

			}

		}
	
		// apply to nodes
		for ( var i = 0; i < this.propertyBindingsArray.length; i ++ ) {

			this.propertyBindingsArray[ i ].apply();

		}
	}

};