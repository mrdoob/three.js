/**
 *
 * Mixes together the AnimationClips scheduled by AnimationActions and applies them to the root and subtree
 *
 * TODO: MUST add support for blending between AnimationActions based on their weights, right now only the last AnimationAction is applied at full weight.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationMixer = function( root ) {

	this.root = root;
	this.actions = [];
	this.propertyBindings = {};

};

THREE.AnimationMixer.prototype = {

	constructor: THREE.AnimationMixer,

	addAnimationAction: function( action ) {
		console.log( root.name + ".AnimationMixer.addAnimationAction( " + action.name + " )" );

		this.actions.push( action );

		for( var track in action.tracks ) {

			if( ! this.propertyBindings[ track.name ] ) {
			
				this.propertyBindings[ track.name ] = new THREE.PropertyBinding( this.root, track.name );
			
			}
		}

	},

	removeAnimationAction: function( action ) {
		console.log( root.name + ".AnimationMixer.addRemove( " + action.name + " )" );

		var index = this.actions.indexOf( action );

		if ( index !== - 1 ) {

			this.actions.splice( index, 1 );

		}
	},

	update: function( time ) {
		console.log( root.name + ".AnimationMixer.update( " + time + " )" );

		var mixerResults = {};

		for( var i = 0; i < this.actions.length; i ++ ) {

			var action = this.actions[i];

			if( action.weight <= 0 || ! action.enabled ) continue;

			var actionResults = action.getAt( time );

			for( var actionResult in actionResults ) {

				var mixerResult = mixerResults[actionResult.name];

				if( ! mixerResult ) {

					mixerResults[actionResult.name] = {
						name: actionResult.name,
						cumulativeValue: actionResult.value,
						cumulativeWeight: action.weight
					};

				}
				else {

					var lerpAlpha = action.weight / ( mixerResult.cumulativeWeight + action.weight );
					mixerResult.cumulativeValue = AnimationUtils.lerp( mixerResult.cumulativeValue, result.value, lerpAlpha );
					mixerResult.cumulativeWeight += action.weight;

				}
			}

		}
	    console.log( "  mixerResults: ", mixerResults );
	
		// apply to nodes
		for ( var name in mixerResults ) {

			var mixerResult = mixerResults[ name ];

			var propertyBinding = this.propertyBindings[ name ];
			propertyBinding.set( mixerResult.value );
			
		}
	}

};