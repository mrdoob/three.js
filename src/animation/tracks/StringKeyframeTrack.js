import { InterpolateDiscrete } from '../../constants.js';
import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A track for string keyframe values.
 *
 * @augments KeyframeTrack
 */
class StringKeyframeTrack extends KeyframeTrack {

	/**
	 * Constructs a new string keyframe track.
	 *
	 * This keyframe track type has no `interpolation` parameter because the
	 * interpolation is always discrete.
	 *
	 * @param {string} name - The keyframe track's name.
	 * @param {Array<number>} times - A list of keyframe times.
	 * @param {Array<string>} values - A list of keyframe values.
	 */
	constructor( name, times, values ) {

		super( name, times, values );

	}

}

/**
 * The value type name.
 *
 * @type {string}
 * @default 'string'
 */
StringKeyframeTrack.prototype.ValueTypeName = 'string';

/**
 * The value buffer type of this keyframe track.
 *
 * @type {TypedArray|Array}
 * @default Array.constructor
 */
StringKeyframeTrack.prototype.ValueBufferType = Array;

/**
 * The default interpolation type of this keyframe track.
 *
 * @type {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)}
 * @default InterpolateDiscrete
 */
StringKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
StringKeyframeTrack.prototype.InterpolantFactoryMethodLinear = undefined;
StringKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

export { StringKeyframeTrack };
