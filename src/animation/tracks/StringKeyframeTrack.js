import { InterpolateDiscrete } from '../../constants.js';
import { KeyframeTrackPrototype } from '../KeyframeTrackPrototype.js';
import { KeyframeTrackConstructor } from '../KeyframeTrackConstructor.js';

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

	KeyframeTrackConstructor.call( this, name, times, values, interpolation );

}

StringKeyframeTrack.prototype = Object.assign( Object.create( KeyframeTrackPrototype ), {

	constructor: StringKeyframeTrack,

	ValueTypeName: 'string',
	ValueBufferType: Array,

	DefaultInterpolation: InterpolateDiscrete,

	InterpolantFactoryMethodLinear: undefined,

	InterpolantFactoryMethodSmooth: undefined

} );


export { StringKeyframeTrack };
