import { Quaternion } from '../math/Quaternion.js';
import { AdditiveAnimationBlendMode } from '../constants.js';

/**
 * Converts an array to a specific type.
 *
 * @param {TypedArray|Array} array - The array to convert.
 * @param {TypedArray.constructor} type - The constructor of a typed array that defines the new type.
 * @return {TypedArray} The converted array.
 */
function convertArray( array, type ) {

	if ( ! array || array.constructor === type ) return array;

	if ( typeof type.BYTES_PER_ELEMENT === 'number' ) {

		return new type( array ); // create typed array

	}

	return Array.prototype.slice.call( array ); // create Array

}

/**
 * Returns `true` if the given object is a typed array.
 *
 * @param {any} object - The object to check.
 * @return {boolean} Whether the given object is a typed array.
 */
function isTypedArray( object ) {

	return ArrayBuffer.isView( object ) && ! ( object instanceof DataView );

}

/**
 * Returns an array by which times and values can be sorted.
 *
 * @param {Array<number>} times - The keyframe time values.
 * @return {Array<number>} The array.
 */
function getKeyframeOrder( times ) {

	function compareTime( i, j ) {

		return times[ i ] - times[ j ];

	}

	const n = times.length;
	const result = new Array( n );
	for ( let i = 0; i !== n; ++ i ) result[ i ] = i;

	result.sort( compareTime );

	return result;

}

/**
 * Sorts the given array by the previously computed order via `getKeyframeOrder()`.
 *
 * @param {Array<number>} values - The values to sort.
 * @param {number} stride - The stride.
 * @param {Array<number>} order - The sort order.
 * @return {Array<number>} The sorted values.
 */
function sortedArray( values, stride, order ) {

	const nValues = values.length;
	const result = new values.constructor( nValues );

	for ( let i = 0, dstOffset = 0; dstOffset !== nValues; ++ i ) {

		const srcOffset = order[ i ] * stride;

		for ( let j = 0; j !== stride; ++ j ) {

			result[ dstOffset ++ ] = values[ srcOffset + j ];

		}

	}

	return result;

}

/**
 * Used for parsing AOS keyframe formats.
 *
 * @param {Array<number>} jsonKeys - A list of JSON keyframes.
 * @param {Array<number>} times - This array will be filled with keyframe times by this function.
 * @param {Array<number>} values - This array will be filled with keyframe values by this function.
 * @param {string} valuePropertyName - The name of the property to use.
 */
function flattenJSON( jsonKeys, times, values, valuePropertyName ) {

	let i = 1, key = jsonKeys[ 0 ];

	while ( key !== undefined && key[ valuePropertyName ] === undefined ) {

		key = jsonKeys[ i ++ ];

	}

	if ( key === undefined ) return; // no data

	let value = key[ valuePropertyName ];
	if ( value === undefined ) return; // no data

	if ( Array.isArray( value ) ) {

		do {

			value = key[ valuePropertyName ];

			if ( value !== undefined ) {

				times.push( key.time );
				values.push( ...value ); // push all elements

			}

			key = jsonKeys[ i ++ ];

		} while ( key !== undefined );

	} else if ( value.toArray !== undefined ) {

		// ...assume THREE.Math-ish

		do {

			value = key[ valuePropertyName ];

			if ( value !== undefined ) {

				times.push( key.time );
				value.toArray( values, values.length );

			}

			key = jsonKeys[ i ++ ];

		} while ( key !== undefined );

	} else {

		// otherwise push as-is

		do {

			value = key[ valuePropertyName ];

			if ( value !== undefined ) {

				times.push( key.time );
				values.push( value );

			}

			key = jsonKeys[ i ++ ];

		} while ( key !== undefined );

	}

}

/**
 * Creates a new clip, containing only the segment of the original clip between the given frames.
 *
 * @param {AnimationClip} sourceClip - The values to sort.
 * @param {string} name - The name of the clip.
 * @param {number} startFrame - The start frame.
 * @param {number} endFrame - The end frame.
 * @param {number} [fps=30] - The FPS.
 * @return {AnimationClip} The new sub clip.
 */
function subclip( sourceClip, name, startFrame, endFrame, fps = 30 ) {

	const clip = sourceClip.clone();

	clip.name = name;

	const tracks = [];

	for ( let i = 0; i < clip.tracks.length; ++ i ) {

		const track = clip.tracks[ i ];
		const valueSize = track.getValueSize();

		const times = [];
		const values = [];

		for ( let j = 0; j < track.times.length; ++ j ) {

			const frame = track.times[ j ] * fps;

			if ( frame < startFrame || frame >= endFrame ) continue;

			times.push( track.times[ j ] );

			for ( let k = 0; k < valueSize; ++ k ) {

				values.push( track.values[ j * valueSize + k ] );

			}

		}

		if ( times.length === 0 ) continue;

		track.times = convertArray( times, track.times.constructor );
		track.values = convertArray( values, track.values.constructor );

		tracks.push( track );

	}

	clip.tracks = tracks;

	// find minimum .times value across all tracks in the trimmed clip

	let minStartTime = Infinity;

	for ( let i = 0; i < clip.tracks.length; ++ i ) {

		if ( minStartTime > clip.tracks[ i ].times[ 0 ] ) {

			minStartTime = clip.tracks[ i ].times[ 0 ];

		}

	}

	// shift all tracks such that clip begins at t=0

	for ( let i = 0; i < clip.tracks.length; ++ i ) {

		clip.tracks[ i ].shift( - 1 * minStartTime );

	}

	clip.resetDuration();

	return clip;

}

/**
 * Converts the keyframes of the given animation clip to an additive format.
 *
 * @param {AnimationClip} targetClip - The clip to make additive.
 * @param {number} [referenceFrame=0] - The reference frame.
 * @param {AnimationClip} [referenceClip=targetClip] - The reference clip.
 * @param {number} [fps=30] - The FPS.
 * @return {AnimationClip} The updated clip which is now additive.
 */
function makeClipAdditive( targetClip, referenceFrame = 0, referenceClip = targetClip, fps = 30 ) {

	if ( fps <= 0 ) fps = 30;

	const numTracks = referenceClip.tracks.length;
	const referenceTime = referenceFrame / fps;

	// Make each track's values relative to the values at the reference frame
	for ( let i = 0; i < numTracks; ++ i ) {

		const referenceTrack = referenceClip.tracks[ i ];
		const referenceTrackType = referenceTrack.ValueTypeName;

		// Skip this track if it's non-numeric
		if ( referenceTrackType === 'bool' || referenceTrackType === 'string' ) continue;

		// Find the track in the target clip whose name and type matches the reference track
		const targetTrack = targetClip.tracks.find( function ( track ) {

			return track.name === referenceTrack.name
				&& track.ValueTypeName === referenceTrackType;

		} );

		if ( targetTrack === undefined ) continue;

		let referenceOffset = 0;
		const referenceValueSize = referenceTrack.getValueSize();

		if ( referenceTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline ) {

			referenceOffset = referenceValueSize / 3;

		}

		let targetOffset = 0;
		const targetValueSize = targetTrack.getValueSize();

		if ( targetTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline ) {

			targetOffset = targetValueSize / 3;

		}

		const lastIndex = referenceTrack.times.length - 1;
		let referenceValue;

		// Find the value to subtract out of the track
		if ( referenceTime <= referenceTrack.times[ 0 ] ) {

			// Reference frame is earlier than the first keyframe, so just use the first keyframe
			const startIndex = referenceOffset;
			const endIndex = referenceValueSize - referenceOffset;
			referenceValue = referenceTrack.values.slice( startIndex, endIndex );

		} else if ( referenceTime >= referenceTrack.times[ lastIndex ] ) {

			// Reference frame is after the last keyframe, so just use the last keyframe
			const startIndex = lastIndex * referenceValueSize + referenceOffset;
			const endIndex = startIndex + referenceValueSize - referenceOffset;
			referenceValue = referenceTrack.values.slice( startIndex, endIndex );

		} else {

			// Interpolate to the reference value
			const interpolant = referenceTrack.createInterpolant();
			const startIndex = referenceOffset;
			const endIndex = referenceValueSize - referenceOffset;
			interpolant.evaluate( referenceTime );
			referenceValue = interpolant.resultBuffer.slice( startIndex, endIndex );

		}

		// Conjugate the quaternion
		if ( referenceTrackType === 'quaternion' ) {

			const referenceQuat = new Quaternion().fromArray( referenceValue ).normalize().conjugate();
			referenceQuat.toArray( referenceValue );

		}

		// Subtract the reference value from all of the track values

		const numTimes = targetTrack.times.length;
		for ( let j = 0; j < numTimes; ++ j ) {

			const valueStart = j * targetValueSize + targetOffset;

			if ( referenceTrackType === 'quaternion' ) {

				// Multiply the conjugate for quaternion track types
				Quaternion.multiplyQuaternionsFlat(
					targetTrack.values,
					valueStart,
					referenceValue,
					0,
					targetTrack.values,
					valueStart
				);

			} else {

				const valueEnd = targetValueSize - targetOffset * 2;

				// Subtract each value for all other numeric track types
				for ( let k = 0; k < valueEnd; ++ k ) {

					targetTrack.values[ valueStart + k ] -= referenceValue[ k ];

				}

			}

		}

	}

	targetClip.blendMode = AdditiveAnimationBlendMode;

	return targetClip;

}

/**
 * A class with various methods to assist with animations.
 *
 * @hideconstructor
 */
class AnimationUtils {

	/**
	 * Converts an array to a specific type
	 *
	 * @static
	 * @param {TypedArray|Array} array - The array to convert.
	 * @param {TypedArray.constructor} type - The constructor of a type array.
	 * @return {TypedArray} The converted array
	 */
	static convertArray( array, type ) {

		return convertArray( array, type );

	}

	/**
	 * Returns `true` if the given object is a typed array.
	 *
	 * @static
	 * @param {any} object - The object to check.
	 * @return {boolean} Whether the given object is a typed array.
	 */
	static isTypedArray( object ) {

		return isTypedArray( object );

	}

	/**
	 * Returns an array by which times and values can be sorted.
	 *
	 * @static
	 * @param {Array<number>} times - The keyframe time values.
	 * @return {Array<number>} The array.
	 */
	static getKeyframeOrder( times ) {

		return getKeyframeOrder( times );

	}

	/**
	 * Sorts the given array by the previously computed order via `getKeyframeOrder()`.
	 *
	 * @static
	 * @param {Array<number>} values - The values to sort.
	 * @param {number} stride - The stride.
	 * @param {Array<number>} order - The sort order.
	 * @return {Array<number>} The sorted values.
	 */
	static sortedArray( values, stride, order ) {

		return sortedArray( values, stride, order );

	}

	/**
	 * Used for parsing AOS keyframe formats.
	 *
	 * @static
	 * @param {Array<number>} jsonKeys - A list of JSON keyframes.
	 * @param {Array<number>} times - This array will be filled with keyframe times by this method.
	 * @param {Array<number>} values - This array will be filled with keyframe values by this method.
	 * @param {string} valuePropertyName - The name of the property to use.
	 */
	static flattenJSON( jsonKeys, times, values, valuePropertyName ) {

		flattenJSON( jsonKeys, times, values, valuePropertyName );

	}

	/**
	 * Creates a new clip, containing only the segment of the original clip between the given frames.
	 *
	 * @static
	 * @param {AnimationClip} sourceClip - The values to sort.
	 * @param {string} name - The name of the clip.
	 * @param {number} startFrame - The start frame.
	 * @param {number} endFrame - The end frame.
	 * @param {number} [fps=30] - The FPS.
	 * @return {AnimationClip} The new sub clip.
	 */
	static subclip( sourceClip, name, startFrame, endFrame, fps = 30 ) {

		return subclip( sourceClip, name, startFrame, endFrame, fps );

	}

	/**
	 * Converts the keyframes of the given animation clip to an additive format.
	 *
	 * @static
	 * @param {AnimationClip} targetClip - The clip to make additive.
	 * @param {number} [referenceFrame=0] - The reference frame.
	 * @param {AnimationClip} [referenceClip=targetClip] - The reference clip.
	 * @param {number} [fps=30] - The FPS.
	 * @return {AnimationClip} The updated clip which is now additive.
	 */
	static makeClipAdditive( targetClip, referenceFrame = 0, referenceClip = targetClip, fps = 30 ) {

		return makeClipAdditive( targetClip, referenceFrame, referenceClip, fps );

	}

}

export {
	convertArray,
	isTypedArray,
	getKeyframeOrder,
	sortedArray,
	flattenJSON,
	subclip,
	makeClipAdditive,
	AnimationUtils
};
