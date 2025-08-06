import * as AnimationUtils from './AnimationUtils.js';
import { KeyframeTrack } from './KeyframeTrack.js';
import { BooleanKeyframeTrack } from './tracks/BooleanKeyframeTrack.js';
import { ColorKeyframeTrack } from './tracks/ColorKeyframeTrack.js';
import { NumberKeyframeTrack } from './tracks/NumberKeyframeTrack.js';
import { QuaternionKeyframeTrack } from './tracks/QuaternionKeyframeTrack.js';
import { StringKeyframeTrack } from './tracks/StringKeyframeTrack.js';
import { VectorKeyframeTrack } from './tracks/VectorKeyframeTrack.js';
import { generateUUID } from '../math/MathUtils.js';
import { NormalAnimationBlendMode } from '../constants.js';

/**
 * A reusable set of keyframe tracks which represent an animation.
 */
class AnimationClip {

	/**
	 * Constructs a new animation clip.
	 *
	 * Note: Instead of instantiating an AnimationClip directly with the constructor, you can
	 * use the static interface of this class for creating clips. In most cases though, animation clips
	 * will automatically be created by loaders when importing animated 3D assets.
	 *
	 * @param {string} [name=''] - The clip's name.
	 * @param {number} [duration=-1] - The clip's duration in seconds. If a negative value is passed,
	 * the duration will be calculated from the passed keyframes.
	 * @param {Array<KeyframeTrack>} tracks - An array of keyframe tracks.
	 * @param {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)} [blendMode=NormalAnimationBlendMode] - Defines how the animation
	 * is blended/combined when two or more animations are simultaneously played.
	 */
	constructor( name = '', duration = - 1, tracks = [], blendMode = NormalAnimationBlendMode ) {

		/**
		 * The clip's name.
		 *
		 * @type {string}
		 */
		this.name = name;

		/**
		 *  An array of keyframe tracks.
		 *
		 * @type {Array<KeyframeTrack>}
		 */
		this.tracks = tracks;

		/**
		 * The clip's duration in seconds.
		 *
		 * @type {number}
		 */
		this.duration = duration;

		/**
		 * Defines how the animation is blended/combined when two or more animations
		 * are simultaneously played.
		 *
		 * @type {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)}
		 */
		this.blendMode = blendMode;

		/**
		 * The UUID of the animation clip.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = generateUUID();

		/**
		 * An object that can be used to store custom data about the animation clip.
		 * It should not hold references to functions as these will not be cloned.
		 *
		 * @type {Object}
		 */
		this.userData = {};

		// this means it should figure out its duration by scanning the tracks
		if ( this.duration < 0 ) {

			this.resetDuration();

		}

	}

	/**
	 * Factory method for creating an animation clip from the given JSON.
	 *
	 * @static
	 * @param {Object} json - The serialized animation clip.
	 * @return {AnimationClip} The new animation clip.
	 */
	static parse( json ) {

		const tracks = [],
			jsonTracks = json.tracks,
			frameTime = 1.0 / ( json.fps || 1.0 );

		for ( let i = 0, n = jsonTracks.length; i !== n; ++ i ) {

			tracks.push( parseKeyframeTrack( jsonTracks[ i ] ).scale( frameTime ) );

		}

		const clip = new this( json.name, json.duration, tracks, json.blendMode );
		clip.uuid = json.uuid;

		clip.userData = JSON.parse( json.userData || '{}' );

		return clip;

	}

	/**
	 * Serializes the given animation clip into JSON.
	 *
	 * @static
	 * @param {AnimationClip} clip - The animation clip to serialize.
	 * @return {Object} The JSON object.
	 */
	static toJSON( clip ) {

		const tracks = [],
			clipTracks = clip.tracks;

		const json = {

			'name': clip.name,
			'duration': clip.duration,
			'tracks': tracks,
			'uuid': clip.uuid,
			'blendMode': clip.blendMode,
			'userData': JSON.stringify( clip.userData ),

		};

		for ( let i = 0, n = clipTracks.length; i !== n; ++ i ) {

			tracks.push( KeyframeTrack.toJSON( clipTracks[ i ] ) );

		}

		return json;

	}

	/**
	 * Returns a new animation clip from the passed morph targets array of a
	 * geometry, taking a name and the number of frames per second.
	 *
	 * Note: The fps parameter is required, but the animation speed can be
	 * overridden via {@link AnimationAction#setDuration}.
	 *
	 * @static
	 * @param {string} name - The name of the animation clip.
	 * @param {Array<Object>} morphTargetSequence - A sequence of morph targets.
	 * @param {number} fps - The Frames-Per-Second value.
	 * @param {boolean} noLoop - Whether the clip should be no loop or not.
	 * @return {AnimationClip} The new animation clip.
	 */
	static CreateFromMorphTargetSequence( name, morphTargetSequence, fps, noLoop ) {

		const numMorphTargets = morphTargetSequence.length;
		const tracks = [];

		for ( let i = 0; i < numMorphTargets; i ++ ) {

			let times = [];
			let values = [];

			times.push(
				( i + numMorphTargets - 1 ) % numMorphTargets,
				i,
				( i + 1 ) % numMorphTargets );

			values.push( 0, 1, 0 );

			const order = AnimationUtils.getKeyframeOrder( times );
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

		return new this( name, - 1, tracks );

	}

	/**
	 * Searches for an animation clip by name, taking as its first parameter
	 * either an array of clips, or a mesh or geometry that contains an
	 * array named "animations" property.
	 *
	 * @static
	 * @param {(Array<AnimationClip>|Object3D)} objectOrClipArray - The array or object to search through.
	 * @param {string} name - The name to search for.
	 * @return {?AnimationClip} The found animation clip. Returns `null` if no clip has been found.
	 */
	static findByName( objectOrClipArray, name ) {

		let clipArray = objectOrClipArray;

		if ( ! Array.isArray( objectOrClipArray ) ) {

			const o = objectOrClipArray;
			clipArray = o.geometry && o.geometry.animations || o.animations;

		}

		for ( let i = 0; i < clipArray.length; i ++ ) {

			if ( clipArray[ i ].name === name ) {

				return clipArray[ i ];

			}

		}

		return null;

	}

	/**
	 * Returns an array of new AnimationClips created from the morph target
	 * sequences of a geometry, trying to sort morph target names into
	 * animation-group-based patterns like "Walk_001, Walk_002, Run_001, Run_002...".
	 *
	 * See {@link MD2Loader#parse} as an example for how the method should be used.
	 *
	 * @static
	 * @param {Array<Object>} morphTargets - A sequence of morph targets.
	 * @param {number} fps - The Frames-Per-Second value.
	 * @param {boolean} noLoop - Whether the clip should be no loop or not.
	 * @return {Array<AnimationClip>} An array of new animation clips.
	 */
	static CreateClipsFromMorphTargetSequences( morphTargets, fps, noLoop ) {

		const animationToMorphTargets = {};

		// tested with https://regex101.com/ on trick sequences
		// such flamingo_flyA_003, flamingo_run1_003, crdeath0059
		const pattern = /^([\w-]*?)([\d]+)$/;

		// sort morph target names into animation groups based
		// patterns like Walk_001, Walk_002, Run_001, Run_002
		for ( let i = 0, il = morphTargets.length; i < il; i ++ ) {

			const morphTarget = morphTargets[ i ];
			const parts = morphTarget.name.match( pattern );

			if ( parts && parts.length > 1 ) {

				const name = parts[ 1 ];

				let animationMorphTargets = animationToMorphTargets[ name ];

				if ( ! animationMorphTargets ) {

					animationToMorphTargets[ name ] = animationMorphTargets = [];

				}

				animationMorphTargets.push( morphTarget );

			}

		}

		const clips = [];

		for ( const name in animationToMorphTargets ) {

			clips.push( this.CreateFromMorphTargetSequence( name, animationToMorphTargets[ name ], fps, noLoop ) );

		}

		return clips;

	}

	/**
	 * Parses the `animation.hierarchy` format and returns a new animation clip.
	 *
	 * @static
	 * @deprecated since r175.
	 * @param {Object} animation - A serialized animation clip as JSON.
	 * @param {Array<Bones>} bones - An array of bones.
	 * @return {?AnimationClip} The new animation clip.
	 */
	static parseAnimation( animation, bones ) {

		console.warn( 'THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185' );

		if ( ! animation ) {

			console.error( 'THREE.AnimationClip: No animation in JSONLoader data.' );
			return null;

		}

		const addNonemptyTrack = function ( trackType, trackName, animationKeys, propertyName, destTracks ) {

			// only return track if there are actually keys.
			if ( animationKeys.length !== 0 ) {

				const times = [];
				const values = [];

				AnimationUtils.flattenJSON( animationKeys, times, values, propertyName );

				// empty keys are filtered out, so check again
				if ( times.length !== 0 ) {

					destTracks.push( new trackType( trackName, times, values ) );

				}

			}

		};

		const tracks = [];

		const clipName = animation.name || 'default';
		const fps = animation.fps || 30;
		const blendMode = animation.blendMode;

		// automatic length determination in AnimationClip.
		let duration = animation.length || - 1;

		const hierarchyTracks = animation.hierarchy || [];

		for ( let h = 0; h < hierarchyTracks.length; h ++ ) {

			const animationKeys = hierarchyTracks[ h ].keys;

			// skip empty tracks
			if ( ! animationKeys || animationKeys.length === 0 ) continue;

			// process morph targets
			if ( animationKeys[ 0 ].morphTargets ) {

				// figure out all morph targets used in this track
				const morphTargetNames = {};

				let k;

				for ( k = 0; k < animationKeys.length; k ++ ) {

					if ( animationKeys[ k ].morphTargets ) {

						for ( let m = 0; m < animationKeys[ k ].morphTargets.length; m ++ ) {

							morphTargetNames[ animationKeys[ k ].morphTargets[ m ] ] = - 1;

						}

					}

				}

				// create a track for each morph target with all zero
				// morphTargetInfluences except for the keys in which
				// the morphTarget is named.
				for ( const morphTargetName in morphTargetNames ) {

					const times = [];
					const values = [];

					for ( let m = 0; m !== animationKeys[ k ].morphTargets.length; ++ m ) {

						const animationKey = animationKeys[ k ];

						times.push( animationKey.time );
						values.push( ( animationKey.morphTarget === morphTargetName ) ? 1 : 0 );

					}

					tracks.push( new NumberKeyframeTrack( '.morphTargetInfluence[' + morphTargetName + ']', times, values ) );

				}

				duration = morphTargetNames.length * fps;

			} else {

				// ...assume skeletal animation

				const boneName = '.bones[' + bones[ h ].name + ']';

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

		const clip = new this( clipName, duration, tracks, blendMode );

		return clip;

	}

	/**
	 * Sets the duration of this clip to the duration of its longest keyframe track.
	 *
	 * @return {AnimationClip} A reference to this animation clip.
	 */
	resetDuration() {

		const tracks = this.tracks;
		let duration = 0;

		for ( let i = 0, n = tracks.length; i !== n; ++ i ) {

			const track = this.tracks[ i ];

			duration = Math.max( duration, track.times[ track.times.length - 1 ] );

		}

		this.duration = duration;

		return this;

	}

	/**
	 * Trims all tracks to the clip's duration.
	 *
	 * @return {AnimationClip} A reference to this animation clip.
	 */
	trim() {

		for ( let i = 0; i < this.tracks.length; i ++ ) {

			this.tracks[ i ].trim( 0, this.duration );

		}

		return this;

	}

	/**
	 * Performs minimal validation on each track in the clip. Returns `true` if all
	 * tracks are valid.
	 *
	 * @return {boolean} Whether the clip's keyframes are valid or not.
	 */
	validate() {

		let valid = true;

		for ( let i = 0; i < this.tracks.length; i ++ ) {

			valid = valid && this.tracks[ i ].validate();

		}

		return valid;

	}

	/**
	 * Optimizes each track by removing equivalent sequential keys (which are
	 * common in morph target sequences).
	 *
	 * @return {AnimationClip} A reference to this animation clip.
	 */
	optimize() {

		for ( let i = 0; i < this.tracks.length; i ++ ) {

			this.tracks[ i ].optimize();

		}

		return this;

	}

	/**
	 * Returns a new animation clip with copied values from this instance.
	 *
	 * @return {AnimationClip} A clone of this instance.
	 */
	clone() {

		const tracks = [];

		for ( let i = 0; i < this.tracks.length; i ++ ) {

			tracks.push( this.tracks[ i ].clone() );

		}

		const clip = new this.constructor( this.name, this.duration, tracks, this.blendMode );

		clip.userData = JSON.parse( JSON.stringify( this.userData ) );

		return clip;

	}

	/**
	 * Serializes this animation clip into JSON.
	 *
	 * @return {Object} The JSON object.
	 */
	toJSON() {

		return this.constructor.toJSON( this );

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

	const trackType = getTrackTypeForValueTypeName( json.type );

	if ( json.times === undefined ) {

		const times = [], values = [];

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

export { AnimationClip };
