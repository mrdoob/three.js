import { InterpolateDiscrete } from '../../constants.js';
import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 *
 * A Track that interpolates Strings
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

function StringKeyframeTrack( name, times, values, interpolation ) {

	KeyframeTrack.call( this, name, times, values, interpolation );

}

StringKeyframeTrack.prototype = Object.assign( Object.create( KeyframeTrack.prototype ), {

	constructor: StringKeyframeTrack,

	ValueTypeName: 'string',
	ValueBufferType: Array,

	DefaultInterpolation: InterpolateDiscrete,

	InterpolantFactoryMethodLinear: undefined,

	InterpolantFactoryMethodSmooth: undefined

} );

export { StringKeyframeTrack };
