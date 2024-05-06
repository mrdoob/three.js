import { InterpolateDiscrete } from '../../constants.js';
import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A Track of Boolean keyframe values.
 */
class BooleanKeyframeTrack extends KeyframeTrack {

	// No interpolation parameter because only InterpolateDiscrete is valid.
	constructor( name, times, values ) {

		super( name, times, values );

	}

}

BooleanKeyframeTrack.prototype.ValueTypeName = 'bool';
BooleanKeyframeTrack.prototype.ValueBufferType = Array;
BooleanKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
BooleanKeyframeTrack.prototype.InterpolantFactoryMethodLinear = undefined;
BooleanKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

// Note: Actually this track could have a optimized / compressed
// representation of a single value and a custom interpolant that
// computes "firstValue ^ isOdd( index )".

export { BooleanKeyframeTrack };
