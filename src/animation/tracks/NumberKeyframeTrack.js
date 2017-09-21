import { KeyframeTrackPrototype } from '../KeyframeTrackPrototype.js';
import { KeyframeTrackConstructor } from '../KeyframeTrackConstructor.js';

/**
 *
 * A Track of numeric keyframe values.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

function NumberKeyframeTrack( name, times, values, interpolation ) {

	KeyframeTrackConstructor.call( this, name, times, values, interpolation );

}

NumberKeyframeTrack.prototype = Object.assign( Object.create( KeyframeTrackPrototype ), {

	constructor: NumberKeyframeTrack,

	ValueTypeName: 'number'

	// ValueBufferType is inherited

	// DefaultInterpolation is inherited

} );


export { NumberKeyframeTrack };
