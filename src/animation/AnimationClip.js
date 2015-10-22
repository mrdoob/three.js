/**
 *
 * Reusable set of Tracks that represent an animation.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationClip = function ( name, duration, tracks ) {

	this.name = name;
	this.tracks = tracks;
	this.duration = ( duration !== undefined ) ? duration : -1;

	// this means it should figure out its duration by scanning the tracks
	if ( this.duration < 0 ) {
		for ( var i = 0; i < this.tracks.length; i ++ ) {
			var track = this.tracks[i];
			this.duration = Math.max( track.keys[ track.keys.length - 1 ].time );
		}
	}

	// maybe only do these on demand, as doing them here could potentially slow down loading
	// but leaving these here during development as this ensures a lot of testing of these functions
	this.trim();
	this.optimize();

	this.results = [];

};

THREE.AnimationClip.prototype = {

	constructor: THREE.AnimationClip,

	getAt: function( clipTime ) {

		clipTime = Math.max( 0, Math.min( clipTime, this.duration ) );

		for ( var i = 0; i < this.tracks.length; i ++ ) {

			var track = this.tracks[ i ];

			this.results[ i ] = track.getAt( clipTime );

		}

		return this.results;
	},

	trim: function() {

		for ( var i = 0; i < this.tracks.length; i ++ ) {

			this.tracks[ i ].trim( 0, this.duration );

		}

		return this;

	},

	optimize: function() {

		for ( var i = 0; i < this.tracks.length; i ++ ) {

			this.tracks[ i ].optimize();

		}

		return this;

	}

};


THREE.AnimationClip.CreateFromMorphTargetSequence = function( name, morphTargetSequence, fps ) {


	var numMorphTargets = morphTargetSequence.length;
	var tracks = [];

	for ( var i = 0; i < numMorphTargets; i ++ ) {

		var keys = [];

		keys.push( { time: ( i + numMorphTargets - 1 ) % numMorphTargets, value: 0 } );
		keys.push( { time: i, value: 1 } );
		keys.push( { time: ( i + 1 ) % numMorphTargets, value: 0 } );

		keys.sort( THREE.KeyframeTrack.keyComparer );

		// if there is a key at the first frame, duplicate it as the last frame as well for perfect loop.
		if ( keys[0].time === 0 ) {
			keys.push( {
				time: numMorphTargets,
				value: keys[0].value
			});
		}

		tracks.push( new THREE.NumberKeyframeTrack( '.morphTargetInfluences[' + morphTargetSequence[i].name + ']', keys ).scale( 1.0 / fps ) );
	}

	return new THREE.AnimationClip( name, -1, tracks );

};

THREE.AnimationClip.findByName = function( clipArray, name ) {

	for ( var i = 0; i < clipArray.length; i ++ ) {

		if ( clipArray[i].name === name ) {

			return clipArray[i];

		}
	}

	return null;

};

THREE.AnimationClip.CreateClipsFromMorphTargetSequences = function( morphTargets, fps ) {

	var animationToMorphTargets = {};

	// tested with https://regex101.com/ on trick sequences such flamingo_flyA_003, flamingo_run1_003, crdeath0059
	var pattern = /^([\w-]*?)([\d]+)$/;

	// sort morph target names into animation groups based patterns like Walk_001, Walk_002, Run_001, Run_002
	for ( var i = 0, il = morphTargets.length; i < il; i ++ ) {

		var morphTarget = morphTargets[ i ];
		var parts = morphTarget.name.match( pattern );

		if ( parts && parts.length > 1 ) {

			var name = parts[ 1 ];

			var animationMorphTargets = animationToMorphTargets[ name ];
			if ( ! animationMorphTargets ) {
				animationToMorphTargets[ name ] = animationMorphTargets = [];
			}

			animationMorphTargets.push( morphTarget );

		}

	}

	var clips = [];

	for ( var name in animationToMorphTargets ) {

		clips.push( THREE.AnimationClip.CreateFromMorphTargetSequence( name, animationToMorphTargets[ name ], fps ) );
	}

	return clips;

};

// parse the standard JSON format for clips
THREE.AnimationClip.parse = function( json ) {

	var tracks = [];

	for ( var i = 0; i < json.tracks.length; i ++ ) {

		tracks.push( THREE.KeyframeTrack.parse( json.tracks[i] ).scale( 1.0 / json.fps ) );

	}

	return new THREE.AnimationClip( json.name, json.duration, tracks );

};


// parse the animation.hierarchy format
THREE.AnimationClip.parseAnimation = function( animation, bones, nodeName ) {

	if ( ! animation ) {
		console.error( "  no animation in JSONLoader data" );
		return null;
	}

	var convertTrack = function( trackName, animationKeys, propertyName, trackType, animationKeyToValueFunc ) {

		var keys = [];

		for ( var k = 0; k < animationKeys.length; k ++ ) {

			var animationKey = animationKeys[k];

			if ( animationKey[propertyName] !== undefined ) {

				keys.push( { time: animationKey.time, value: animationKeyToValueFunc( animationKey ) } );
			}

		}

		// only return track if there are actually keys.
		if ( keys.length > 0 ) {

			return new trackType( trackName, keys );

		}

		return null;

	};

	var tracks = [];

	var clipName = animation.name || 'default';
	var duration = animation.length || -1; // automatic length determination in AnimationClip.
	var fps = animation.fps || 30;

	var hierarchyTracks = animation.hierarchy || [];

	for ( var h = 0; h < hierarchyTracks.length; h ++ ) {

		var animationKeys = hierarchyTracks[ h ].keys;

		// skip empty tracks
		if ( ! animationKeys || animationKeys.length == 0 ) {
			continue;
		}

		// process morph targets in a way exactly compatible with AnimationHandler.init( animation )
		if ( animationKeys[0].morphTargets ) {

			// figure out all morph targets used in this track
			var morphTargetNames = {};
			for ( var k = 0; k < animationKeys.length; k ++ ) {

				if ( animationKeys[k].morphTargets ) {
					for ( var m = 0; m < animationKeys[k].morphTargets.length; m ++ ) {

						morphTargetNames[ animationKeys[k].morphTargets[m] ] = -1;
					}
				}

			}

			// create a track for each morph target with all zero morphTargetInfluences except for the keys in which the morphTarget is named.
			for ( var morphTargetName in morphTargetNames ) {

				var keys = [];

				for ( var m = 0; m < animationKeys[k].morphTargets.length; m ++ ) {

					var animationKey = animationKeys[k];

					keys.push( {
							time: animationKey.time,
							value: (( animationKey.morphTarget === morphTargetName ) ? 1 : 0 )
						});

				}

				tracks.push( new THREE.NumberKeyframeTrack( nodeName + '.morphTargetInfluence[' + morphTargetName + ']', keys ) );

			}

			duration = morphTargetNames.length * ( fps || 1.0 );

		} else {

			var boneName = nodeName + '.bones[' + bones[ h ].name + ']';

			// track contains positions...
			var positionTrack = convertTrack( boneName + '.position', animationKeys, 'pos', THREE.VectorKeyframeTrack, function( animationKey ) {
					return new THREE.Vector3().fromArray( animationKey.pos )
				} );

			if ( positionTrack ) tracks.push( positionTrack );

			// track contains quaternions...
			var quaternionTrack = convertTrack( boneName + '.quaternion', animationKeys, 'rot', THREE.QuaternionKeyframeTrack, function( animationKey ) {
					if ( animationKey.rot.slerp ) {
						return animationKey.rot.clone();
					} else {
						return new THREE.Quaternion().fromArray( animationKey.rot );
					}
				} );

			if ( quaternionTrack ) tracks.push( quaternionTrack );

			// track contains quaternions...
			var scaleTrack = convertTrack( boneName + '.scale', animationKeys, 'scl', THREE.VectorKeyframeTrack, function( animationKey ) {
					return new THREE.Vector3().fromArray( animationKey.scl )
				} );

			if ( scaleTrack ) tracks.push( scaleTrack );

		}
	}

	if ( tracks.length === 0 ) {

		return null;

	}

	var clip = new THREE.AnimationClip( clipName, duration, tracks );

	return clip;

};
