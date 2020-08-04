import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * A Track of keyframe values that represent color.
 */

function ColorKeyframeTrack( name, times, values, interpolation ) {

	KeyframeTrack.call( this, name, times, values, interpolation );

}

ColorKeyframeTrack.prototype = Object.assign( Object.create( KeyframeTrack.prototype ), {

	constructor: ColorKeyframeTrack,

	ValueTypeName: 'color'

	// ValueBufferType is inherited

	// DefaultInterpolation is inherited

	// Note: Very basic implementation and nothing special yet.
	// However, this is the place for color space parameterization.

} );

export { ColorKeyframeTrack };
