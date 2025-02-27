import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A track for numeric keyframe values.
 *
 * @augments KeyframeTrack
 */
class NumberKeyframeTrack extends KeyframeTrack {

	/**
	 * Constructs a new number keyframe track.
	 *
	 * @param {string} name - The keyframe track's name.
	 * @param {Array<number>} times - A list of keyframe times.
	 * @param {Array<number>} values - A list of keyframe values.
	 * @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)} [interpolation] - The interpolation type.
	 */
	constructor( name, times, values, interpolation ) {

		super( name, times, values, interpolation );

	}

}

/**
 * The value type name.
 *
 * @type {String}
 * @default 'number'
 */
NumberKeyframeTrack.prototype.ValueTypeName = 'number';
// ValueBufferType is inherited
// DefaultInterpolation is inherited

export { NumberKeyframeTrack };
