import { KeyframeTrack } from '../KeyframeTrack.js';
import { QuaternionLinearInterpolant } from '../../math/interpolants/QuaternionLinearInterpolant.js';

/**
 * A Track of quaternion keyframe values.
 */
class QuaternionKeyframeTrack extends KeyframeTrack {

	InterpolantFactoryMethodLinear( result ) {

		return new QuaternionLinearInterpolant( this.times, this.values, this.getValueSize(), result );

	}

}

QuaternionKeyframeTrack.prototype.ValueTypeName = 'quaternion';
// ValueBufferType is inherited
// DefaultInterpolation is inherited;
QuaternionKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

export { QuaternionKeyframeTrack };
