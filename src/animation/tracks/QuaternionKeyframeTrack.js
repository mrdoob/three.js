import { InterpolateLinear } from '../../constants.js';
import { KeyframeTrackPrototype } from '../KeyframeTrackPrototype.js';
import { QuaternionLinearInterpolant } from '../../math/interpolants/QuaternionLinearInterpolant.js';
import { KeyframeTrackConstructor } from '../KeyframeTrackConstructor.js';

/**
 *
 * A Track of quaternion keyframe values.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

function QuaternionKeyframeTrack( name, times, values, interpolation ) {

	KeyframeTrackConstructor.call( this, name, times, values, interpolation );

}

QuaternionKeyframeTrack.prototype = Object.assign( Object.create( KeyframeTrackPrototype ), {

	constructor: QuaternionKeyframeTrack,

	ValueTypeName: 'quaternion',

	// ValueBufferType is inherited

	DefaultInterpolation: InterpolateLinear,

	InterpolantFactoryMethodLinear: function ( result ) {

		return new QuaternionLinearInterpolant( this.times, this.values, this.getValueSize(), result );

	},

	InterpolantFactoryMethodSmooth: undefined // not yet implemented

} );


export { QuaternionKeyframeTrack };
