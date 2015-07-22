/**
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

	update: function( time ) {

		var mixerResults = {};

		for( var i = 0; i < this.actions.length; i ++ ) {

			var action = this.actions[i];

			var actionResults = action.update( time );

			foreach( var result in actionResults ) {

				// TODO: do iterative linear interpolator based on cumulative weight ratios
				mixerResults[result.name].value = result.value;

			}

		}

		// apply to nodes
		foreach( var mixerResult in mixerResults ) {

			var trackInfo = this.trackInfos[mixerResult.name];

			// must use copy for Object3D.Euler/Quaternion
			if( trackInfo.node[trackInfo.propertyName].copy ) {
				trackInfo.node[trackInfo.propertyName].copy( mixerResult.value );
			}
			// otherwise just copy across value
			else {
				trackInfo.node[trackInfo.propertyName] = mixerResult.value;	
			}


			// trigger node dirty			
			if( trackInfo.node.needsUpdate ) { // material
				trackInfo.node.needsUpdate = true;
			}			
			if( trackInfo.node.matrixWorldNeedsUpdate && ! this.matrixAutoUpdate ) { // node transform
				trackInfo.node.matrixWorldNeedsUpdate = true;
			}
			
		}
	}

};