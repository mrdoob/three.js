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
	this.time = 0;
	this.timeScale = 1.0;
	this.actions = [];
	this.propertyBindings = {};
	this.propertyBindingsArray = [];

};

THREE.AnimationMixer.prototype = {

	constructor: THREE.AnimationMixer,

	addAction: function( action ) {
		//console.log( this.root.name + ".AnimationMixer.addAnimationAction( " + action.name + " )" );

		this.actions.push( action );

		var tracks = action.clip.tracks;

		for( var i = 0; i < tracks.length; i ++ ) {

			var track = tracks[ i ];

			if( ! this.propertyBindings[ track.name ] ) {
			
				var propertyBinding = new THREE.PropertyBinding( this.root, track.name );
				this.propertyBindings[ track.name ] = propertyBinding;

				this.propertyBindingsArray.push( propertyBinding );
			
			}
		}

	},

	removeAllActions: function() {

		this.actions = [];

	},

	removeAction: function( action ) {
		//console.log( this.root.name + ".AnimationMixer.addRemove( " + action.name + " )" );

		var index = this.actions.indexOf( action );

		if ( index !== - 1 ) {

			this.actions.splice( index, 1 );

		}
	},

	update: function( deltaTime ) {

		this.time += deltaTime * this.timeScale;

		//console.log( this.root.name + ".AnimationMixer.update( " + time + " )" );

		for( var i = 0; i < this.actions.length; i ++ ) {

			var action = this.actions[i];

			if( action.weight <= 0 || ! action.enabled ) continue;

			var actionResults = action.getAt( this.time );

			for( var name in actionResults ) {

				this.propertyBindings[name].accumulate( actionResults[name], action.weight );

			}

		}
	
		// apply to nodes
		for ( var i = 0; i < this.propertyBindingsArray.length; i ++ ) {

			this.propertyBindingsArray[ i ].apply();

		}
	}

};