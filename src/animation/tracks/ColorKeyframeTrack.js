import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A track for color keyframe values.
 *
 * @augments KeyframeTrack
 */
class ColorKeyframeTrack extends KeyframeTrack {

	/**
	 * Constructs a new color keyframe track.
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
 * @type {string}
 * @default 'color'
 */
ColorKeyframeTrack.prototype.ValueTypeName = 'color';
// ValueBufferType is inherited
// DefaultInterpolation is inherited

export { ColorKeyframeTrack };
