import { AnimationUtils } from './AnimationUtils.js';
import { KeyframeTrack } from './KeyframeTrack.js';
import { BooleanKeyframeTrack } from './tracks/BooleanKeyframeTrack.js';
import { ColorKeyframeTrack } from './tracks/ColorKeyframeTrack.js';
import { NumberKeyframeTrack } from './tracks/NumberKeyframeTrack.js';
import { QuaternionKeyframeTrack } from './tracks/QuaternionKeyframeTrack.js';
import { StringKeyframeTrack } from './tracks/StringKeyframeTrack.js';
import { VectorKeyframeTrack } from './tracks/VectorKeyframeTrack.js';
import { _Math } from '../math/Math.js';

/**
 *
 * Reusable set of Tracks that represent an animation.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

function AnimationClip( name, duration, tracks ) {

	this.name = name;
	this.tracks = tracks;
	this.duration = ( duration !== undefined ) ? duration : - 1;

	this.uuid = _Math.generateUUID();

	// this means it should figure out its duration by scanning the tracks
	if ( this.duration < 0 ) {

		this.resetDuration();

	}

}

function getTrackTypeForValueTypeName( typeName ) {

	switch ( typeName.toLowerCase() ) {

		case 'scalar':
		case 'double':
		case 'float':
		case 'number':
		case 'integer':

			return NumberKeyframeTrack;

		case 'vector':
		case 'vector2':
		case 'vector3':
		case 'vector4':

			return VectorKeyframeTrack;

		case 'color':

			return ColorKeyframeTrack;

		case 'quaternion':

			return QuaternionKeyframeTrack;

		case 'bool':
		case 'boolean':

			return BooleanKeyframeTrack;

		case 'string':

			return StringKeyframeTrack;

	}

	throw new Error( 'THREE.KeyframeTrack: Unsupported typeName: ' + typeName );

}

function parseKeyframeTrack( json ) {

	if ( json.type === undefined ) {

		throw new Error( 'THREE.KeyframeTrack: track type undefined, can not parse' );

	}

	var trackType = getTrackTypeForValueTypeName( json.type );

	if ( json.times === undefined ) {

		var times = [], values = [];

		AnimationUtils.flattenJSON( json.keys, times, values, 'value' );

		json.times = times;
		json.values = values;

	}

	// derived classes can define a static parse method
	if ( trackType.parse !== undefined ) {

		return trackType.parse( json );

	} else {

		// by default, we assume a constructor compatible with the base
		return new trackType( json.name, json.times, json.values, json.interpolation );

	}

}

Object.assign( AnimationClip, {

	parse: function ( json ) {

		var tracks = [],
			jsonTracks = json.tracks,
			frameTime = 1.0 / ( json.fps || 1.0 );

		for ( var i = 0, n = jsonTracks.length; i !== n; ++ i ) {

			tracks.push( parseKeyframeTrack( jsonTracks[ i ] ).scale( frameTime ) );

		}

		return new AnimationClip( json.name, json.duration, tracks );

	},

	toJSON: function ( clip ) {

		var tracks = [],
			clipTracks = clip.tracks;

		var json = {

			'name': clip.name,
			'duration': clip.duration,
			'tracks': tracks,
			'uuid': clip.uuid

		};

		for ( var i = 0, n = clipTracks.length; i !== n; ++ i ) {

			tracks.push( KeyframeTrack.toJSON( clipTracks[ i ] ) );

		}

		return json;

	},

	CreateFromMorphTargetSequence: function ( name, morphTargetSequence, fps, noLoop ) {

		var numMorphTargets = morphTargetSequence.length;
		var tracks = [];

		for ( var i = 0; i < numMorphTargets; i ++ ) {

			var times = [];
			var values = [];

			times.push(
				( i + numMorphTargets - 1 ) % numMorphTargets,
				i,
				( i + 1 ) % numMorphTargets );

			values.push( 0, 1, 0 );

			var order = AnimationUtils.getKeyframeOrder( times );
			times = AnimationUtils.sortedArray( times, 1, order );
			values = AnimationUtils.sortedArray( values, 1, order );

			// if there is a key at the first frame, duplicate it as the
			// last frame as well for perfect loop.
			if ( ! noLoop && times[ 0 ] === 0 ) {

				times.push( numMorphTargets );
				values.push( values[ 0 ] );

			}

			tracks.push(
				new NumberKeyframeTrack(
					'.morphTargetInfluences[' + morphTargetSequence[ i ].name + ']',
					times, values
				).scale( 1.0 / fps ) );

		}

		return new AnimationClip( name, - 1, tracks );

	},

	findByName: function ( objectOrClipArray, name ) {

		var clipArray = objectOrClipArray;

		if ( ! Array.isArray( objectOrClipArray ) ) {

			var o = objectOrClipArray;
			clipArray = o.geometry && o.geometry.animations || o.animations;

		}

		for ( var i = 0; i < clipArray.length; i ++ ) {

			if ( clipArray[ i ].name === name ) {

				return clipArray[ i ];

			}

		}

		return null;

	},

	CreateClipsFromMorphTargetSequences: function ( morphTargets, fps, noLoop ) {

		var animationToMorphTargets = {};

		// tested with https://regex101.com/ on trick sequences
		// such flamingo_flyA_003, flamingo_run1_003, crdeath0059
		var pattern = /^([\w-]*?)([\d]+)$/;

		// sort morph target names into animation groups based
		// patterns like Walk_001, Walk_002, Run_001, Run_002
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

			clips.push( AnimationClip.CreateFromMorphTargetSequence( name, animationToMorphTargets[ name ], fps, noLoop ) );

		}

		return clips;

	},

	// parse the animation.hierarchy format
	parseAnimation: function ( animation, bones ) {

		if ( ! animation ) {

			console.error( 'THREE.AnimationClip: No animation in JSONLoader data.' );
			return null;

		}

		var addNonemptyTrack = function ( trackType, trackName, animationKeys, propertyName, destTracks ) {

			// only return track if there are actually keys.
			if ( animationKeys.length !== 0 ) {

				var times = [];
				var values = [];

				AnimationUtils.flattenJSON( animationKeys, times, values, propertyName );

				// empty keys are filtered out, so check again
				if ( times.length !== 0 ) {

					destTracks.push( new trackType( trackName, times, values ) );

				}

			}

		};

		var tracks = [];

		var clipName = animation.name || 'default';
		// automatic length determination in AnimationClip.
		var duration = animation.length || - 1;
		var fps = animation.fps || 30;

		var hierarchyTracks = animation.hierarchy || [];

		for ( var h = 0; h < hierarchyTracks.length; h ++ ) {

			var animationKeys = hierarchyTracks[ h ].keys;

			// skip empty tracks
			if ( ! animationKeys || animationKeys.length === 0 ) continue;

			// process morph targets
			if ( animationKeys[ 0 ].morphTargets ) {

				// figure out all morph targets used in this track
				var morphTargetNames = {};

				for ( var k = 0; k < animationKeys.length; k ++ ) {

					if ( animationKeys[ k ].morphTargets ) {

						for ( var m = 0; m < animationKeys[ k ].morphTargets.length; m ++ ) {

							morphTargetNames[ animationKeys[ k ].morphTargets[ m ] ] = - 1;

						}

					}

				}

				// create a track for each morph target with all zero
				// morphTargetInfluences except for the keys in which
				// the morphTarget is named.
				for ( var morphTargetName in morphTargetNames ) {

					var times = [];
					var values = [];

					for ( var m = 0; m !== animationKeys[ k ].morphTargets.length; ++ m ) {

						var animationKey = animationKeys[ k ];

						times.push( animationKey.time );
						values.push( ( animationKey.morphTarget === morphTargetName ) ? 1 : 0 );

					}

					tracks.push( new NumberKeyframeTrack( '.morphTargetInfluence[' + morphTargetName + ']', times, values ) );

				}

				duration = morphTargetNames.length * ( fps || 1.0 );

			} else {

				// ...assume skeletal animation

				var boneName = '.bones[' + bones[ h ].name + ']';

				addNonemptyTrack(
					VectorKeyframeTrack, boneName + '.position',
					animationKeys, 'pos', tracks );

				addNonemptyTrack(
					QuaternionKeyframeTrack, boneName + '.quaternion',
					animationKeys, 'rot', tracks );

				addNonemptyTrack(
					VectorKeyframeTrack, boneName + '.scale',
					animationKeys, 'scl', tracks );

			}

		}

		if ( tracks.length === 0 ) {

			return null;

		}

		var clip = new AnimationClip( clipName, duration, tracks );

		return clip;

	}

} );

Object.assign( AnimationClip.prototype, {

	resetDuration: function () {

		var tracks = this.tracks, duration = 0;

		for ( var i = 0, n = tracks.length; i !== n; ++ i ) {

			var track = this.tracks[ i ];

			duration = Math.max( duration, track.times[ track.times.length - 1 ] );

		}

		this.duration = duration;

		return this;

	},

	trim: function () {

		for ( var i = 0; i < this.tracks.length; i ++ ) {

			this.tracks[ i ].trim( 0, this.duration );

		}

		return this;

	},

	validate: function () {

		var valid = true;

		for ( var i = 0; i < this.tracks.length; i ++ ) {

			valid = valid && this.tracks[ i ].validate();

		}

		return valid;

	},

	optimize: function () {

		for ( var i = 0; i < this.tracks.length; i ++ ) {

			this.tracks[ i ].optimize();

		}

		return this;

	},

	clone: function () {

		var tracks = [];

		for ( var i = 0; i < this.tracks.length; i ++ ) {

			tracks.push( this.tracks[ i ].clone() );

		}

		return new AnimationClip( this.name, this.duration, tracks );

	}

} );


export { AnimationClip };
