	/**
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

 THREE.AnimationMath = {

 	lerp: function( a, b, alpha ) {

		if( a.lerp ) {

			return a.clone().lerp( b, alpha );

		}
		else if( a.slerp ) {

			return a.clone().lerp( b, alpha );

		}
		else {

			return a * ( 1 - alpha ) + b * alpha;
			
		}
	}

};

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
					node: this.findNode( track.nodeName ),
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
			else {
				trackInfo.node[trackInfo.propertyName] = mixerResult.value;	
			}


			// material
			if( trackInfo.node.needsUpdate ) {
				trackInfo.node.needsUpdate = true;
			}
			// node transform
			if( trackInfo.node.matrixWorldNeedsUpdate && ! this.matrixAutoUpdate ) {
				trackInfo.node.matrixWorldNeedsUpdate = true;
			}
		}
	},

	// TODO: Cache this at some point
	findNode: function( name ) {

		if( ! nodeName || nodeName === "" || nodeName === "root" || nodeName === "." || nodeName === -1 ) {

			return this.root;

		}

		// (2) search into skeleton bones.
		{

			var searchSkeleton = function( skeleton ) {

				for( var i = 0; i < skeleton.bones.length; i ++ ) {

					var bone = skeleton.bones[i];

					if( bone.name === nodeName ) {

						return childNode;

					}
				}

				return null;

			};

			var boneNode = searchSkeleton( this.skeleton );

			if( boneNode ) return boneNode;
		}

		// (3) search into node subtree.
		{

			var searchNodeSubtree = function( currentNode ) {

				for( var i = 0; i < currentNode.children.length; i ++ ) {

					var childNode = currentNode.children[i];

					if( childNode.name === nodeName ) {

						return childNode;

					}

					var result = searchNodeSubtree( childNode );

					if( result ) return result;

				}

				return null;	

			};

			var subTreeNode = searchNodeSubtree( this.root );

			if( subTreeNode ) return subTreeNode;

		}

		throw new Error( "no node found for name: " + name );

		return node;
	}


};


THREE.Action = function ( clip, startTime, timeScale, weight, loop ) {

	this.clip = clip;
	this.startTime = startTime || 0;
	this.timeScale = timeScale || 1;
	this.weight = weight || 1;
	this.loop = loop || false;

	this.cache = {}; // track name, track, last evaluated time, last evaluated value (with weight included), keyIndex.
};

THREE.Action.prototype = {

	constructor: THREE.Action,

	toClipTime: function( time ) {

		var clipTime = time - this.startTime;

		clipTime *= this.timeScale;

		if( this.loop ) {

			if( clipTime < 0 ) {

				clipTime = clipTime - Math.floor( clipTime / this.clip.duration ) * this.clip.duration;

			}

	   		clipTime = clipTime % this.clip.duration;

	   	}
	   	else {

	   		clipTime = Math.min( clipTime, this.clip.duration );
	   		clipTime = Math.max( clipTime, 0 );

	   	}

   		return clipTime;
	}

	getAt: function( time ) {

		var clipTime = this.toClipTime( time );

		var results = {};

		foreach( var name in clip.tracks ) {

			var track = clip.tracks[name];

			var value = track.getAt( time );

			results[name] = value;
		}

		return results;
	}

};


THREE.Track = function ( name ) {

	this.name = name;

	var nodeName = "";
	var propertyName = "";

	if( name.indexOf( '.') >= 0 ) {
		var nameTokens = name.split( '.' );
		if( nameTokens.length > 1 ) {
			nodeName = nameTokens[0];
		}
		if( nameTokens.length > 2 ) {
			propertyName = nameTokens[1];
		}
	}

	if( nodeName.indexOf( '/' ) >= 0 ) {
		var nodeNameTokens = nodeName.split( '/' );
		if( nameTokens.length > 1 ) {
			nodeName = nameTokens[nameTokens.length - 1];
		}		
	}

	this.nodeName = nodeName;
	this.propertyName = propertyName;

};

THREE.Track.prototype = {

	constructor: THREE.Track,

	getAt: function( time ) {

		return null;

	}

};

THREE.ConstantTrack = function ( name, value ) {

	this.value = value || null;

	THREE.Track.call( this, name );

};

THREE.ConstantTrack.prototype = {

	constructor: THREE.ConstantTrack,

	getAt: function( time ) {

		return this.value;

	}

};

THREE.KeyframeTrack = function ( name, keys ) {

	this.keys = keys || [];	// time in seconds, value as value

	// TODO: sort keys via their times
	this.keys.sort( function( a, b ) { return a.time < b.time; } );

	THREE.Track.call( this, name );

};

THREE.KeyframeTrack.prototype = {

	constructor: THREE.Track,

	getAt: function( time ) {

		if( this.keys.length == 0 ) throw new Error( "no keys in track named " + this.name );
		
		// before the start of the track, return the first key value
		if( this.keys[0].time >= time ) {

			return this.keys[0].value;

		}

		// past the end of the track, return the last key value
		if( this.keys[ this.keys.length - 1 ].time <= time ) {

			return this.keys[ this.keys.length - 1 ].value;

		}

		// interpolate to the required time
		for( var i = 1; i < this.keys.length; i ++ ) {

			if( time <= this.keys[ i ].time ) {

				// linear interpolation to start with
				var alpha = ( time - this.keys[ i - 1 ].time ) / ( this.keys[ i ].time - this.keys[ i - 1 ].time );

				return THREE.AnimationMath.lerp( this.keys[ i - 1 ].value, this.keys[ i ].value, alpha );

			}
		}

		throw new Error( "should never get here." );

	};

};




THREE.Clip = function ( name, duration, tracks, loop ) {

	this.tracks = tracks;

	this.duration = 0;
	this.timeScale = 1;

	this.loop = true;
	this.weight = 0;

	this.interpolationType = THREE.AnimationHandler.LINEAR;

};

THREE.Clip.prototype = {

	constructor: THREE.Clip,

	keyTypes:  [ "pos", "rot", "scl" ],

	play:

		init: function ( data ) {

		if ( data.initialized === true ) return data;

		// loop through all keys

		for ( var h = 0; h < data.hierarchy.length; h ++ ) {

			for ( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

				// remove minus times

				if ( data.hierarchy[ h ].keys[ k ].time < 0 ) {

					 data.hierarchy[ h ].keys[ k ].time = 0;

				}

				// create quaternions

				if ( data.hierarchy[ h ].keys[ k ].rot !== undefined &&
				  ! ( data.hierarchy[ h ].keys[ k ].rot instanceof THREE.Quaternion ) ) {

					var quat = data.hierarchy[ h ].keys[ k ].rot;
					data.hierarchy[ h ].keys[ k ].rot = new THREE.Quaternion().fromArray( quat );

				}

			}

			// prepare morph target keys

			if ( data.hierarchy[ h ].keys.length && data.hierarchy[ h ].keys[ 0 ].morphTargets !== undefined ) {

				// get all used

				var usedMorphTargets = {};

				for ( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

					for ( var m = 0; m < data.hierarchy[ h ].keys[ k ].morphTargets.length; m ++ ) {

						var morphTargetName = data.hierarchy[ h ].keys[ k ].morphTargets[ m ];
						usedMorphTargets[ morphTargetName ] = - 1;

					}

				}

				data.hierarchy[ h ].usedMorphTargets = usedMorphTargets;


				// set all used on all frames

				for ( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

					var influences = {};

					for ( var morphTargetName in usedMorphTargets ) {

						for ( var m = 0; m < data.hierarchy[ h ].keys[ k ].morphTargets.length; m ++ ) {

							if ( data.hierarchy[ h ].keys[ k ].morphTargets[ m ] === morphTargetName ) {

								influences[ morphTargetName ] = data.hierarchy[ h ].keys[ k ].morphTargetsInfluences[ m ];
								break;

							}

						}

						if ( m === data.hierarchy[ h ].keys[ k ].morphTargets.length ) {

							influences[ morphTargetName ] = 0;

						}

					}

					data.hierarchy[ h ].keys[ k ].morphTargetsInfluences = influences;

				}

			}


			// remove all keys that are on the same time

			for ( var k = 1; k < data.hierarchy[ h ].keys.length; k ++ ) {

				if ( data.hierarchy[ h ].keys[ k ].time === data.hierarchy[ h ].keys[ k - 1 ].time ) {

					data.hierarchy[ h ].keys.splice( k, 1 );
					k --;

				}

			}


			// set index

			for ( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

				data.hierarchy[ h ].keys[ k ].index = k;

			}

		}

		data.initialized = true;

		return data;

	},