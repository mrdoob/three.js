import { InterpolateDiscrete } from '../../constants.js';
import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A track for boolean keyframe values.
 *
 * @augments KeyframeTrack
 */
class BooleanKeyframeTrack extends KeyframeTrack {

	/**
	 * Constructs a new boolean keyframe track.
	 *
	 * This keyframe track type has no `interpolation` parameter because the
	 * interpolation is always discrete.
	 *
	 * @param {string} name - The keyframe track's name.
	 * @param {Array<number>} times - A list of keyframe times.
	 * @param {Array<boolean>} values - A list of keyframe values.
	 */
	constructor( name, times, values ) {

		super( name, times, values );

	}

}

/**
 * The value type name.
 *
 * @type {String}
 * @default 'bool'
 */
BooleanKeyframeTrack.prototype.ValueTypeName = 'bool';

/**
 * The value buffer type of this keyframe track.
 *
 * @type {TypedArray|Array}
 * @default Array.constructor
 */
BooleanKeyframeTrack.prototype.ValueBufferType = Array;

/**
 * The default interpolation type of this keyframe track.
 *
 * @type {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)}
 * @default InterpolateDiscrete
 */
BooleanKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
BooleanKeyframeTrack.prototype.InterpolantFactoryMethodLinear = undefined;
BooleanKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

export { BooleanKeyframeTrack };
