import {
	InterpolateLinear,
	InterpolateSmooth,
	InterpolateDiscrete
} from '../constants.js';
import { CubicInterpolant } from '../math/interpolants/CubicInterpolant.js';
import { LinearInterpolant } from '../math/interpolants/LinearInterpolant.js';
import { DiscreteInterpolant } from '../math/interpolants/DiscreteInterpolant.js';
import * as AnimationUtils from './AnimationUtils.js';

/**
 * Represents s a timed sequence of keyframes, which are composed of lists of
 * times and related values, and which are used to animate a specific property
 * of an object.
 */
class KeyframeTrack {

	/**
	 * Constructs a new keyframe track.
	 *
	 * @param {string} name - The keyframe track's name.
	 * @param {Array<number>} times - A list of keyframe times.
	 * @param {Array<number>} values - A list of keyframe values.
	 * @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)} [interpolation] - The interpolation type.
	 */
	constructor( name, times, values, interpolation ) {

		if ( name === undefined ) throw new Error( 'THREE.KeyframeTrack: track name is undefined' );
		if ( times === undefined || times.length === 0 ) throw new Error( 'THREE.KeyframeTrack: no keyframes in track named ' + name );

		/**
		 * The track's name can refer to morph targets or bones or
		 * possibly other values within an animated object. See {@link PropertyBinding#parseTrackName}
		 * for the forms of strings that can be parsed for property binding.
		 *
		 * @type {string}
		 */
		this.name = name;

		/**
		 * The keyframe times.
		 *
		 * @type {Float32Array}
		 */
		this.times = AnimationUtils.convertArray( times, this.TimeBufferType );

		/**
		 * The keyframe values.
		 *
		 * @type {Float32Array}
		 */
		this.values = AnimationUtils.convertArray( values, this.ValueBufferType );

		this.setInterpolation( interpolation || this.DefaultInterpolation );

	}

	/**
	 * Converts the keyframe track to JSON.
	 *
	 * @static
	 * @param {KeyframeTrack} track - The keyframe track to serialize.
	 * @return {Object} The serialized keyframe track as JSON.
	 */
	static toJSON( track ) {

		const trackType = track.constructor;

		let json;

		// derived classes can define a static toJSON method
		if ( trackType.toJSON !== this.toJSON ) {

			json = trackType.toJSON( track );

		} else {

			// by default, we assume the data can be serialized as-is
			json = {

				'name': track.name,
				'times': AnimationUtils.convertArray( track.times, Array ),
				'values': AnimationUtils.convertArray( track.values, Array )

			};

			const interpolation = track.getInterpolation();

			if ( interpolation !== track.DefaultInterpolation ) {

				json.interpolation = interpolation;

			}

		}

		json.type = track.ValueTypeName; // mandatory

		return json;

	}

	/**
	 * Factory method for creating a new discrete interpolant.
	 *
	 * @static
	 * @param {TypedArray} [result] - The result buffer.
	 * @return {DiscreteInterpolant} The new interpolant.
	 */
	InterpolantFactoryMethodDiscrete( result ) {

		return new DiscreteInterpolant( this.times, this.values, this.getValueSize(), result );

	}

	/**
	 * Factory method for creating a new linear interpolant.
	 *
	 * @static
	 * @param {TypedArray} [result] - The result buffer.
	 * @return {LinearInterpolant} The new interpolant.
	 */
	InterpolantFactoryMethodLinear( result ) {

		return new LinearInterpolant( this.times, this.values, this.getValueSize(), result );

	}

	/**
	 * Factory method for creating a new smooth interpolant.
	 *
	 * @static
	 * @param {TypedArray} [result] - The result buffer.
	 * @return {CubicInterpolant} The new interpolant.
	 */
	InterpolantFactoryMethodSmooth( result ) {

		return new CubicInterpolant( this.times, this.values, this.getValueSize(), result );

	}

	/**
	 * Defines the interpolation factor method for this keyframe track.
	 *
	 * @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)} interpolation - The interpolation type.
	 * @return {KeyframeTrack} A reference to this keyframe track.
	 */
	setInterpolation( interpolation ) {

		let factoryMethod;

		switch ( interpolation ) {

			case InterpolateDiscrete:

				factoryMethod = this.InterpolantFactoryMethodDiscrete;

				break;

			case InterpolateLinear:

				factoryMethod = this.InterpolantFactoryMethodLinear;

				break;

			case InterpolateSmooth:

				factoryMethod = this.InterpolantFactoryMethodSmooth;

				break;

		}

		if ( factoryMethod === undefined ) {

			const message = 'unsupported interpolation for ' +
				this.ValueTypeName + ' keyframe track named ' + this.name;

			if ( this.createInterpolant === undefined ) {

				// fall back to default, unless the default itself is messed up
				if ( interpolation !== this.DefaultInterpolation ) {

					this.setInterpolation( this.DefaultInterpolation );

				} else {

					throw new Error( message ); // fatal, in this case

				}

			}

			console.warn( 'THREE.KeyframeTrack:', message );
			return this;

		}

		this.createInterpolant = factoryMethod;

		return this;

	}

	/**
	 * Returns the current interpolation type.
	 *
	 * @return {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)} The interpolation type.
	 */
	getInterpolation() {

		switch ( this.createInterpolant ) {

			case this.InterpolantFactoryMethodDiscrete:

				return InterpolateDiscrete;

			case this.InterpolantFactoryMethodLinear:

				return InterpolateLinear;

			case this.InterpolantFactoryMethodSmooth:

				return InterpolateSmooth;

		}

	}

	/**
	 * Returns the value size.
	 *
	 * @return {number} The value size.
	 */
	getValueSize() {

		return this.values.length / this.times.length;

	}

	/**
	 * Moves all keyframes either forward or backward in time.
	 *
	 * @param {number} timeOffset - The offset to move the time values.
	 * @return {KeyframeTrack} A reference to this keyframe track.
	 */
	shift( timeOffset ) {

		if ( timeOffset !== 0.0 ) {

			const times = this.times;

			for ( let i = 0, n = times.length; i !== n; ++ i ) {

				times[ i ] += timeOffset;

			}

		}

		return this;

	}

	/**
	 * Scale all keyframe times by a factor (useful for frame - seconds conversions).
	 *
	 * @param {number} timeScale - The time scale.
	 * @return {KeyframeTrack} A reference to this keyframe track.
	 */
	scale( timeScale ) {

		if ( timeScale !== 1.0 ) {

			const times = this.times;

			for ( let i = 0, n = times.length; i !== n; ++ i ) {

				times[ i ] *= timeScale;

			}

		}

		return this;

	}

	/**
	 * Removes keyframes before and after animation without changing any values within the defined time range.
	 *
	 * Note: The method does not shift around keys to the start of the track time, because for interpolated
	 * keys this will change their values
	 *
	 * @param {number} startTime - The start time.
	 * @param {number} endTime - The end time.
	 * @return {KeyframeTrack} A reference to this keyframe track.
	 */
	trim( startTime, endTime ) {

		const times = this.times,
			nKeys = times.length;

		let from = 0,
			to = nKeys - 1;

		while ( from !== nKeys && times[ from ] < startTime ) {

			++ from;

		}

		while ( to !== - 1 && times[ to ] > endTime ) {

			-- to;

		}

		++ to; // inclusive -> exclusive bound

		if ( from !== 0 || to !== nKeys ) {

			// empty tracks are forbidden, so keep at least one keyframe
			if ( from >= to ) {

				to = Math.max( to, 1 );
				from = to - 1;

			}

			const stride = this.getValueSize();
			this.times = times.slice( from, to );
			this.values = this.values.slice( from * stride, to * stride );

		}

		return this;

	}

	/**
	 * Performs minimal validation on the keyframe track. Returns `true` if the values
	 * are valid.
	 *
	 * @return {boolean} Whether the keyframes are valid or not.
	 */
	validate() {

		let valid = true;

		const valueSize = this.getValueSize();
		if ( valueSize - Math.floor( valueSize ) !== 0 ) {

			console.error( 'THREE.KeyframeTrack: Invalid value size in track.', this );
			valid = false;

		}

		const times = this.times,
			values = this.values,

			nKeys = times.length;

		if ( nKeys === 0 ) {

			console.error( 'THREE.KeyframeTrack: Track is empty.', this );
			valid = false;

		}

		let prevTime = null;

		for ( let i = 0; i !== nKeys; i ++ ) {

			const currTime = times[ i ];

			if ( typeof currTime === 'number' && isNaN( currTime ) ) {

				console.error( 'THREE.KeyframeTrack: Time is not a valid number.', this, i, currTime );
				valid = false;
				break;

			}

			if ( prevTime !== null && prevTime > currTime ) {

				console.error( 'THREE.KeyframeTrack: Out of order keys.', this, i, currTime, prevTime );
				valid = false;
				break;

			}

			prevTime = currTime;

		}

		if ( values !== undefined ) {

			if ( AnimationUtils.isTypedArray( values ) ) {

				for ( let i = 0, n = values.length; i !== n; ++ i ) {

					const value = values[ i ];

					if ( isNaN( value ) ) {

						console.error( 'THREE.KeyframeTrack: Value is not a valid number.', this, i, value );
						valid = false;
						break;

					}

				}

			}

		}

		return valid;

	}

	/**
	 * Optimizes this keyframe track by removing equivalent sequential keys (which are
	 * common in morph target sequences).
	 *
	 * @return {AnimationClip} A reference to this animation clip.
	 */
	optimize() {

		// (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)

		// times or values may be shared with other tracks, so overwriting is unsafe
		const times = this.times.slice(),
			values = this.values.slice(),
			stride = this.getValueSize(),

			smoothInterpolation = this.getInterpolation() === InterpolateSmooth,

			lastIndex = times.length - 1;

		let writeIndex = 1;

		for ( let i = 1; i < lastIndex; ++ i ) {

			let keep = false;

			const time = times[ i ];
			const timeNext = times[ i + 1 ];

			// remove adjacent keyframes scheduled at the same time

			if ( time !== timeNext && ( i !== 1 || time !== times[ 0 ] ) ) {

				if ( ! smoothInterpolation ) {

					// remove unnecessary keyframes same as their neighbors

					const offset = i * stride,
						offsetP = offset - stride,
						offsetN = offset + stride;

					for ( let j = 0; j !== stride; ++ j ) {

						const value = values[ offset + j ];

						if ( value !== values[ offsetP + j ] ||
							value !== values[ offsetN + j ] ) {

							keep = true;
							break;

						}

					}

				} else {

					keep = true;

				}

			}

			// in-place compaction

			if ( keep ) {

				if ( i !== writeIndex ) {

					times[ writeIndex ] = times[ i ];

					const readOffset = i * stride,
						writeOffset = writeIndex * stride;

					for ( let j = 0; j !== stride; ++ j ) {

						values[ writeOffset + j ] = values[ readOffset + j ];

					}

				}

				++ writeIndex;

			}

		}

		// flush last keyframe (compaction looks ahead)

		if ( lastIndex > 0 ) {

			times[ writeIndex ] = times[ lastIndex ];

			for ( let readOffset = lastIndex * stride, writeOffset = writeIndex * stride, j = 0; j !== stride; ++ j ) {

				values[ writeOffset + j ] = values[ readOffset + j ];

			}

			++ writeIndex;

		}

		if ( writeIndex !== times.length ) {

			this.times = times.slice( 0, writeIndex );
			this.values = values.slice( 0, writeIndex * stride );

		} else {

			this.times = times;
			this.values = values;

		}

		return this;

	}

	/**
	 * Returns a new keyframe track with copied values from this instance.
	 *
	 * @return {KeyframeTrack} A clone of this instance.
	 */
	clone() {

		const times = this.times.slice();
		const values = this.values.slice();

		const TypedKeyframeTrack = this.constructor;
		const track = new TypedKeyframeTrack( this.name, times, values );

		// Interpolant argument to constructor is not saved, so copy the factory method directly.
		track.createInterpolant = this.createInterpolant;

		return track;

	}

}

/**
 * The value type name.
 *
 * @type {String}
 * @default ''
 */
KeyframeTrack.prototype.ValueTypeName = '';

/**
 * The time buffer type of this keyframe track.
 *
 * @type {TypedArray|Array}
 * @default Float32Array.constructor
 */
KeyframeTrack.prototype.TimeBufferType = Float32Array;

/**
 * The value buffer type of this keyframe track.
 *
 * @type {TypedArray|Array}
 * @default Float32Array.constructor
 */
KeyframeTrack.prototype.ValueBufferType = Float32Array;

/**
 * The default interpolation type of this keyframe track.
 *
 * @type {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)}
 * @default InterpolateLinear
 */
KeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;

export { KeyframeTrack };
