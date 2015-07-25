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

	addAction: function( action ) {
		//console.log( this.root.name + ".AnimationMixer.addAnimationAction( " + action.name + " )" );

		this.actions.push( action );

		for( var trackID in action.clip.tracks ) {

			var track = action.clip.tracks[ trackID ];
			if( ! this.propertyBindings[ track.name ] ) {
			
				this.propertyBindings[ track.name ] = new THREE.PropertyBinding( this.root, track.name );
			
			}
		}

	},

	removeAction: function( action ) {
		//console.log( this.root.name + ".AnimationMixer.addRemove( " + action.name + " )" );

		var index = this.actions.indexOf( action );

		if ( index !== - 1 ) {

			this.actions.splice( index, 1 );

		}
	},

	update: function( time ) {
		//console.log( this.root.name + ".AnimationMixer.update( " + time + " )" );

		for ( var name in this.propertyBindings ) {

			this.propertyBindings[ name ].reset();

		}

		for( var i = 0; i < this.actions.length; i ++ ) {

			var action = this.actions[i];

			if( action.weight <= 0 || ! action.enabled ) continue;

			var actionResults = action.getAt( time );

			for( var name in actionResults ) {

				this.propertyBindings[name].accumulate( actionResults[name], action.weight );

			}

		}
	
		// apply to nodes
		for ( var name in this.propertyBindings ) {

			this.propertyBindings[ name ].apply();
			
		}
	}

};