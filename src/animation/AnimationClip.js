/**
 *
 * Reusable set of Tracks that represent an animation.
 *
 * TODO: MUST add support for importing AnimationClips from JSONLoader data files.
 * 
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationClip = function ( name, tracks, duration ) {

	this.name = name;
	this.tracks = tracks;
	this.duration = duration;

};

THREE.AnimationClip.prototype = {

	constructor: THREE.AnimationClip,

	getAt: function( clipTime ) {

		clipTime = Math.max( 0, Math.min( clipTime, this.duration ) );

		var results = {};

		for( var track in this.tracks ) {

			results[ track.name ] = track.getAt( clipTime );

		}

		return results;
	},
/*
/	importFromData: function( data ) {

		// TODO: Convert this copy-paste code from AnimationHandler into an importer into Tracks and AnimationClips with some improvements to the track names

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

	}*/
};


THREE.AnimationClip.CreateMorphAnimation = function( morphTargetNames, duration ) {

	var tracks = [];
	var frameStep = duration / morphTargetNames;

	for( var i = 0; i < morphTargetNames.length; i ++ ) {

		var keys = [];

		if( ( i - 1 ) >= 0 ) {

			keys.push( { time: ( i - 1 ) * frameStep, value: 0 } );

		}

		keys.push( { time: i * frameStep, value: 1 } );

		if( ( i + 1 ) <= morphTargetNames.length ) {

			keys.push( { time: ( i + 1 ) * frameStep, value: 0 } );

		}

		var morphName = morphTargetNames[i];
		var trackName = '.morphTargetInfluences[' + morphName + ']';
		var track = new THREE.KeyframeTrack( trackName, keys );

		tracks.push( track );
	}

	var clip = new THREE.AnimationClip( 'morphAnimation', duration, tracks );
	console.log( 'morphAnimationClip', clip );

	return clip;
};

THREE.AnimationClip.CreateRotationAnimation = function( node, period, axis ) {

	var keys = [];
	keys.push( { time: 0, value: 0 } );
	keys.push( { time: period, value: 360 } );

	axis = axis || 'x';
	var trackName = node.name + '.rotation[' + axis + ']';

	var track = new THREE.KeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'rotate.x', 10, [ track ] );
	console.log( 'rotateClip', clip );

	return clip;
};

THREE.AnimationClip.CreateShakeAnimation = function( node, duration, shakeScale ) {

	var keys = [];

	for( var i = 0; i < duration * 10; i ++ ) {

		keys.push( { 
			time: ( i / 10.0 ),
			value: new THREE.Vector3( Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0 ).multiply( shakeScale )
		} );

	}

	var trackName = node.name + '.position';

	var track = new THREE.KeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'shake' + duration, trackName, [ track ] );
	console.log( 'shakeClip', clip );

	return clip;
};


THREE.AnimationClip.CreatePulsationAnimation = function( node, duration, pulseScale ) {

	var keys = [];

	for( var i = 0; i < duration * 10; i ++ ) {

		var scaleFactor = Math.random() * pulseScale;
		keys.push( {
			time: ( i / 10.0 ),
			value: new THREE.Vector3( scaleFactor, scaleFactor, scaleFactor )
		} );

	}

	var trackName = node.name + '.scale';

	var track = new THREE.KeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'scale' + duration, trackName, [ track ] );
	console.log( 'scaleClip', clip );

	return clip;
};