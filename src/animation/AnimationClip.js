/**
 *
 * Reusable set of Tracks that represent an animation.
 *
 * TODO: MUST add support for importing AnimationClips from JSONLoader data files.
 * 
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationClip = function ( name, duration, tracks ) {

	this.name = name;
	this.tracks = tracks;
	this.duration = duration || 1;

};

THREE.AnimationClip.prototype = {

	constructor: THREE.AnimationClip,

	getAt: function( clipTime ) {

		clipTime = Math.max( 0, Math.min( clipTime, this.duration ) );

		var results = {};

		for( var trackIndex in this.tracks ) {

			var track = this.tracks[ trackIndex ];
			//console.log( 'track', track );

			results[ track.name ] = track.getAt( clipTime );

		}

		return results;
	},

	clean: function() {
		// sort all keys by time
		// move any keys before 0 to zero

		// remove minus times

		if ( data.hierarchy[ h ].keys[ k ].time < 0 ) {

			 data.hierarchy[ h ].keys[ k ].time = 0;

		}

		// remove second key if there is more than one key at the same time
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

/*
	"animation" : {
	    "name"      : "Action",
        "fps"       : 25,
        "length"    : 2.0,
        "hierarchy" : [
            {
                "parent" : -1,
                "keys"   : [
                    {
                        "time":0,
                        "pos" :[0.532239,5.88733,-0.119685],
                        "rot" :[-0.451519,0.544179,0.544179,0.451519],
                        "scl" :[1,1,1]
                    },
*/
	importFromData: function( data ) {

		var convertTrack = function( trackName, dataKeys, dataKeyToValueFunc ) {

			var keys = [];

			for( var k = 0; k < dataKeys.length; k ++ ) {

				var dataKey = dataKeys[k];
				keys.push( { time: dataKey.time, value: dataKeyToValueFunc( dataKey ) } );
		
			}

			return new THREE.KeyframeTrack( trackName, keys );

		};

		var clipName = data.name;
		var duration = data.length;
		var fps = data.fps;

		var tracks = [];

		var dataTracks = data.hierarchy;

		for ( var h = 0; h < dataTracks.length; h ++ ) {

			var boneName = '.bone[' + h + ']';
			var dataKeys = dataTracks[ h ].keys;

			// skip empty tracks
			if( ! dataKeys || dataKeys.length == 0 ) {
				continue;
			}

			// process morph targets in a way exactly compatible with AnimationHandler.init( data )
			if( dataKeys[0].morphTargets ) {

				// figure out all morph targets used in this track
				var morphTargetNames = {};
				for( var k = 0; k < dataKeys.length; k ++ ) {

					if( dataKeys[k].morphTargets ) {
						for( var m = 0; m < dataKeys[k].morphTargets.length; m ++ ) {

							morphTagetNames[ dataKeys[k].morphTargets[m] ] = -1;
						}
					}

				}

				// create a track for each morph target with all zero morphTargetInfluences except for the keys in which the morphTarget is named.
				for( var morphTargetName in morphTargetNames ) {

					var keys = [];

					for( var m = 0; m < dataKeys[k].morphTargets.length; m ++ ) {

						var dataKey = dataKeys[k];

						keys.push( {
								time: dataKey.time,
								value: (( dataKey.morphTarget === morphTargetName ) ? 1 : 0 )
							});
					
					}

					tracks.push( new THREE.KeyframeTrack( '.morphTargetInfluence[' + morphTargetName + ']', keys ) );

				}

			}
			
			// track contains positions...
			if( dataKeys[0].pos ) {

				tracks.push( convertTracks( boneName + '.position', dataKeys, function( dataValue ) {
						return new THREE.Vector3().fromArray( dataKey.pos )
					} );

			}
			
			// track contains quaternions...
			if( dataKeys[0].rot ) {

				tracks.push( convertTracks( boneName + '.quaternion', dataKeys, function( dataValue ) {
						return new THREE.Quaternion().fromArray( dataKey.rot )
					} );

			}

			// track contains quaternions...
			if( dataKeys[0].scl ) {

				tracks.push( convertTracks( boneName + '.quaternion', dataKeys, function( dataValue ) {
						return new THREE.Vector3().fromArray( dataKey.scl )
					} );

			}
		}

		var clip = new THREE.AnimationClip( clipName, duration, tracks );
		console.log( 'clipFromHierarchy', clip );

		return clip;

	}

		// loop through all keys

		for ( var h = 0; h < data.hierarchy.length; h ++ ) {

			for ( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

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

		}

		data.initialized = true;

		return data;

	}*/
};


// TODO: Fix this for loops.
// TODO: Test this
THREE.AnimationClip.CreateMorphAnimation = function( morphTargets, duration ) {

	var tracks = [];
	var frameStep = duration / morphTargets.length;

	for( var i = 0; i < morphTargets.length; i ++ ) {

		var keys = [];

		if( ( i - 1 ) >= 0 ) {

			keys.push( { time: ( i - 1 ) * frameStep, value: 0 } );

		}

		keys.push( { time: i * frameStep, value: 1 } );

		if( ( i + 1 ) <= morphTargets.length ) {

			keys.push( { time: ( i + 1 ) * frameStep, value: 0 } );

		}

		var morphName = morphTargets[i].name;
		var trackName = '.morphTargetInfluences[' + morphName + ']';
		var track = new THREE.KeyframeTrack( trackName, keys );

		tracks.push( track );
	}

	var clip = new THREE.AnimationClip( 'morphAnimation', duration, tracks );
	//console.log( 'morphAnimationClip', clip );

	return clip;
};

THREE.AnimationClip.CreateRotationAnimation = function( period, axis ) {

	var keys = [];
	keys.push( { time: 0, value: 0 } );
	keys.push( { time: period, value: 360 } );

	axis = axis || 'x';
	var trackName = '.rotation[' + axis + ']';

	var track = new THREE.KeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'rotate.x', 10, [ track ] );
	//console.log( 'rotateClip', clip );

	return clip;
};

THREE.AnimationClip.CreateScaleAxisAnimation = function( period, axis ) {

	var keys = [];
	keys.push( { time: 0, value: 0 } );
	keys.push( { time: period, value: 360 } );

	axis = axis || 'x';
	var trackName = '.scale[' + axis + ']';

	var track = new THREE.KeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'scale.x', 10, [ track ] );
	//console.log( 'scaleClip', clip );

	return clip;
};

THREE.AnimationClip.CreateShakeAnimation = function( duration, shakeScale ) {

	var keys = [];

	for( var i = 0; i < duration * 10; i ++ ) {

		keys.push( { 
			time: ( i / 10.0 ),
			value: new THREE.Vector3( Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0 ).multiply( shakeScale )
		} );

	}

	var trackName = '.position';

	var track = new THREE.KeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'shake' + duration, duration, [ track ] );
	//console.log( 'shakeClip', clip );

	return clip;
};


THREE.AnimationClip.CreatePulsationAnimation = function( duration, pulseScale ) {

	var keys = [];

	for( var i = 0; i < duration * 10; i ++ ) {

		var scaleFactor = Math.random() * pulseScale;
		keys.push( {
			time: ( i / 10.0 ),
			value: new THREE.Vector3( scaleFactor, scaleFactor, scaleFactor )
		} );

	}

	var trackName = '.scale';

	var track = new THREE.KeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'scale' + duration, duration, [ track ] );
	//console.log( 'scaleClip', clip );

	return clip;
};


THREE.AnimationClip.CreateVisibilityAnimation = function( duration ) {

	var keys = [];
	keys.push( {
		time: 0,
		value: true
	} );
	keys.push( {
		time: duration - 1,
		value: false
	} );
	keys.push( {
		time: duration,
		value: true
	} );

	var trackName = '.visible';

	var track = new THREE.KeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'visible' + duration, duration, [ track ] );
	//console.log( 'scaleClip', clip );

	return clip;
};


THREE.AnimationClip.CreateMaterialColorAnimation = function( duration, colors, loop ) {

	var timeStep = duration / colors.length;
	var keys = [];
	for( var i = 0; i <= colors.length; i ++ ) {
		keys.push( { time: i * timeStep, value: colors[ i % colors.length ] } );
	}

	var trackName = '.material[0].color';

	var track = new THREE.KeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'colorDiffuse', 10, [ track ] );
	//console.log( 'diffuseClip', clip );

	return clip;
};

