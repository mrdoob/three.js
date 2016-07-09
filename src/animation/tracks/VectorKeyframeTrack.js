import { KeyframeTrackPrototype } from '../KeyframeTrackPrototype';
import { KeyframeTrackConstructor } from '../KeyframeTrackConstructor';

/**
 *
 * A Track of vectored keyframe values.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

function VectorKeyframeTrack ( name, times, values, interpolation ) {
	this.isVectorKeyframeTrack = true;

	KeyframeTrackConstructor.call( this, name, times, values, interpolation );

};

VectorKeyframeTrack.prototype =
		Object.assign( Object.create( KeyframeTrackPrototype ), {

	constructor: VectorKeyframeTrack,

	ValueTypeName: 'vector'

	// ValueBufferType is inherited

	// DefaultInterpolation is inherited

} );


export { VectorKeyframeTrack };