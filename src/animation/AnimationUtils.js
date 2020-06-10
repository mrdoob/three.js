/**
 * @author tschw
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

import { Quaternion } from '../math/Quaternion.js';
import { AdditiveAnimationBlendMode } from '../constants.js';

const AnimationUtils = {

	// same as Array.prototype.slice, but also works on typed arrays
	arraySlice: function ( array, from, to ) {

		if ( AnimationUtils.isTypedArray( array ) ) {

			// in ios9 array.subarray(from, undefined) will return empty array
			// but array.subarray(from) or array.subarray(from, len) is correct
			return new array.constructor( array.subarray( from, to !== undefined ? to : array.length ) );

		}

		return array.slice( from, to );

	},

	// converts an array to a specific type
	convertArray: function ( array, type, forceClone ) {

		if ( ! array || // let 'undefined' and 'null' pass
			! forceClone && array.constructor === type ) return array;

		if ( typeof type.BYTES_PER_ELEMENT === 'number' ) {

			return new type( array ); // create typed array

		}

		return Array.prototype.slice.call( array ); // create Array

	},

	isTypedArray: function ( object ) {

		return ArrayBuffer.isView( object ) &&
			! ( object instanceof DataView );

	},

	// returns an array by which times and values can be sorted
	getKeyframeOrder: function ( times ) {

		function compareTime( i, j ) {

			return times[ i ] - times[ j ];

		}

		const n = times.length;
		const result = new Array( n );
		for ( let i = 0; i !== n; ++ i ) result[ i ] = i;

		result.sort( compareTime );

		return result;

	},

	// uses the array previously returned by 'getKeyframeOrder' to sort data
	sortedArray: function ( values, stride, order ) {

		const nValues = values.length;
		const result = new values.constructor( nValues );

		for ( let i = 0, dstOffset = 0; dstOffset !== nValues; ++ i ) {

			const srcOffset = order[ i ] * stride;

			for ( let j = 0; j !== stride; ++ j ) {

				result[ dstOffset ++ ] = values[ srcOffset + j ];

			}

		}

		return result;

	},

	// function for parsing AOS keyframe formats
	flattenJSON: function ( jsonKeys, times, values, valuePropertyName ) {

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
					values.push.apply( values, value ); // push all elements

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

	},

	subclip: function ( sourceClip, name, startFrame, endFrame, fps ) {

		fps = fps || 30;

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

			track.times = AnimationUtils.convertArray( times, track.times.constructor );
			track.values = AnimationUtils.convertArray( values, track.values.constructor );

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

	},

	makeClipAdditive: function ( targetClip, referenceFrame, referenceClip, fps ) {

		if ( referenceFrame === undefined ) referenceFrame = 0;
		if ( referenceClip === undefined ) referenceClip = targetClip;
		if ( fps === undefined || fps <= 0 ) fps = 30;

		const numTracks = targetClip.tracks.length;
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

			const valueSize = referenceTrack.getValueSize();
			const lastIndex = referenceTrack.times.length - 1;
			let referenceValue;

			// Find the value to subtract out of the track
			if ( referenceTime <= referenceTrack.times[ 0 ] ) {

				// Reference frame is earlier than the first keyframe, so just use the first keyframe
				referenceValue = AnimationUtils.arraySlice( referenceTrack.values, 0, referenceTrack.valueSize );

			} else if ( referenceTime >= referenceTrack.times[ lastIndex ] ) {

				// Reference frame is after the last keyframe, so just use the last keyframe
				const startIndex = lastIndex * valueSize;
				referenceValue = AnimationUtils.arraySlice( referenceTrack.values, startIndex );

			} else {

				// Interpolate to the reference value
				const interpolant = referenceTrack.createInterpolant();
				interpolant.evaluate( referenceTime );
				referenceValue = interpolant.resultBuffer;

			}

			// Conjugate the quaternion
			if ( referenceTrackType === 'quaternion' ) {

				const referenceQuat = new Quaternion(
					referenceValue[ 0 ],
					referenceValue[ 1 ],
					referenceValue[ 2 ],
					referenceValue[ 3 ]
				).normalize().conjugate();
				referenceQuat.toArray( referenceValue );

			}

			// Subtract the reference value from all of the track values

			const numTimes = targetTrack.times.length;
			for ( let j = 0; j < numTimes; ++ j ) {

				const valueStart = j * valueSize;

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

					// Subtract each value for all other numeric track types
					for ( let k = 0; k < valueSize; ++ k ) {

						targetTrack.values[ valueStart + k ] -= referenceValue[ k ];

					}

				}

			}

		}

		targetClip.blendMode = AdditiveAnimationBlendMode;

		return targetClip;

	}

};

export { AnimationUtils };
