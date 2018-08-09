import { InterpolateLinear } from '../../constants.js';
import { KeyframeTrack } from '../KeyframeTrack.js';
import { QuaternionLinearInterpolant } from '../../math/interpolants/QuaternionLinearInterpolant.js';

/**
 *
 * A Track of quaternion keyframe values.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

class QuaternionKeyframeTrack extends KeyframeTrack {

	constructor( name, times, values, interpolation ) {

		super( name, times, values, interpolation );

	}

	InterpolantFactoryMethodLinear( result ) {

		return new QuaternionLinearInterpolant( this.times, this.values, this.getValueSize(), result );

	}

}

QuaternionKeyframeTrack.prototype.ValueTypeName = 'quaternion';

QuaternionKeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;

QuaternionKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

export { QuaternionKeyframeTrack };
