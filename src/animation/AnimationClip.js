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

	this.name = name || "";
	this.duration = duration || 0;
	this.tracks = tracks || [];

};

THREE.AnimationClip.prototype = {

	constructor: THREE.AnimationClip,

	getAt: function( clipTime ) {

		var results = [];

		for( var i = 0; i < this.tracks.length; i ++ ) {

			var track = this.tracks[i];

			results.push( { name: track.name, value: this.getAt( time ) } );

		}

		return results;
	},

	importFromData: function( data ) {

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

	}
};


THREE.AnimationClip.CreateMorphAnimation = function( morphTargetNames, duration ) {
	// TODO
	//  - should create three keys per morphTarget track.
	//  - one track per morphTarget name.
};

THREE.AnimationClip.CreateRotationAnimation = function( node, period ) {
	// TODO
	//  - create a single track representing the rotation
	//  - create a few quaternion keys representing the rotation path
};

THREE.AnimationClip.CreateShakeAnimation = function( node, duration, shakeScale ) {
	// TODO
	//  - create a single track representing the shake
	//  - multiple random vector by shake scalar/vector
};


THREE.AnimationClip.CreatePulsationAnimation = function( node, duration, pulseScale ) {
	// TODO
	//  - create a single track representing the shake
	//  - multiple random vector by pulse scalar/vector
};