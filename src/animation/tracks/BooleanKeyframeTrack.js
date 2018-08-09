import { InterpolateDiscrete } from '../../constants.js';
import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 *
 * A Track of Boolean keyframe values.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

class BooleanKeyframeTrack extends KeyframeTrack {

	constructor( name, times, values ) {

		super( name, times, values );

	}

}

BooleanKeyframeTrack.prototype.ValueTypeName = 'bool';

BooleanKeyframeTrack.prototype.ValueBufferType = Array;

BooleanKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;

BooleanKeyframeTrack.prototype.InterpolantFactoryMethodLinear = undefined;

BooleanKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

export { BooleanKeyframeTrack };
