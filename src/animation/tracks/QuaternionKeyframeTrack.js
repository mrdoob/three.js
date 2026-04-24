import { KeyframeTrack } from '../KeyframeTrack.js';
import { QuaternionLinearInterpolant } from '../../math/interpolants/QuaternionLinearInterpolant.js';

/**
 * A track for Quaternion keyframe values.
 *
 * @augments KeyframeTrack
 */
class QuaternionKeyframeTrack extends KeyframeTrack {

	/**
	 * Constructs a new Quaternion keyframe track.
	 *
	 * @param {string} name - The keyframe track's name.
	 * @param {Array<number>} times - A list of keyframe times.
	 * @param {Array<number>} values - A list of keyframe values.
	 * @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)} [interpolation] - The interpolation type.
	 */
	constructor( name, times, values, interpolation ) {

		super( name, times, values, interpolation );

	}

	/**
	 * Overwritten so the method returns Quaternion based interpolant.
	 *
	 * @static
	 * @param {TypedArray} [result] - The result buffer.
	 * @return {QuaternionLinearInterpolant} The new interpolant.
	 */
	InterpolantFactoryMethodLinear( result ) {

		return new QuaternionLinearInterpolant( this.times, this.values, this.getValueSize(), result );

	}

}

/**
 * The value type name.
 *
 * @type {string}
 * @default 'quaternion'
 */
QuaternionKeyframeTrack.prototype.ValueTypeName = 'quaternion';
// ValueBufferType is inherited
// DefaultInterpolation is inherited;
QuaternionKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

export { QuaternionKeyframeTrack };
