/**
 *
 * Mixes together the Clips scheduled by Actions and applies them to the root and subtree
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.Mixer = function( root ) {

	this.root = root;
	this.actions = [];
	this.trackInfos = {};

};

THREE.Mixer.prototype = {

	constructor: THREE.Mixer,

	addAction: function( action ) {
		console.log( root.name + ".Mixer.addAction( " + action.name + " )" );

		this.actions.push( action );

		foreach( var track in action.tracks ) {
			if( ! this.trackInfos[track.name] ) {
				this.trackInfos[track.name] = {
					node: THREE.AnimationUtils.findNode( this.root, track.nodeName ),
					propertyName: track.propertyName
				} 
			}
		}

	},

	removeAction: function( action ) {
		console.log( root.name + ".Mixer.addRemove( " + action.name + " )" );

		var index = this.actions.indexOf( action );

		if ( index !== - 1 ) {

			this.actions.splice( index, 1 );

		}
	},

	update: function( time ) {
		console.log( root.name + ".Mixer.update( " + time + " )" );

		var mixerResults = {};

		for( var i = 0; i < this.actions.length; i ++ ) {

			var action = this.actions[i];

			if( action.weight <= 0 || ! action.enabled ) continue;

			var actionResults = action.getAt( time );

			for( var j = 0; j < actionResults.length; j ++ ) {

				var actionResult = actionResults[j];

				// TODO: do iterative linear interpolator based on cumulative weight ratios
				if( ! mixerResults[ actionResult.name ] ) {

					mixerResults[actionResult.name] = {
						name: actionResult.name
					};
				}

				mixerResults[actionResult.name].value = result.value;

			}

		}
	    console.log( "  mixerResults: ", mixerResults );
	

		// apply to nodes
		for ( var name in mixerResults ) {

			var mixerResult = mixerResults[ name ];

			var trackInfo = this.trackInfos[ name ];

			var node = trackInfo.node;

			if( ! node ) {
				console.log( "  trying to update node for track: " + name + " but it wasn't found." );
				continue;
			}

			var propertyName = trackInfo.propertyName;

			if( ! node[ propertyName ] ) {
				console.log( "  trying to update property for track: " + name + '.' + propertyName + " but it wasn't found." );				
				continue;
			}

			// must use copy for Object3D.Euler/Quaternion
			if( node[ propertyName ].copy ) {
				console.log( '  update property ' + name + '.' + propertyName + ' via a set() function.' );				
				node[ propertyName ].copy( mixerResult.value );
			}
			// otherwise just copy across value
			else {
				console.log( '  update property ' + name + '.' + propertyName + ' via assignment.' );				
				node[ propertyName ] = mixerResult.value;	
			}


			// trigger node dirty			
			if( node.needsUpdate ) { // material
				node.needsUpdate = true;
			}			
			if( node.matrixWorldNeedsUpdate && ! this.matrixAutoUpdate ) { // node transform
				node.matrixWorldNeedsUpdate = true;
			}

		}
	}

};