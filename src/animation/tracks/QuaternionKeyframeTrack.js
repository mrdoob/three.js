/**
 *
 * A Track of quaternion keyframe values.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

THREE.QuaternionKeyframeTrack = function ( name, times, values, interpolation ) {

	THREE.KeyframeTrack.call( this, name, times, values, interpolation );

};

THREE.QuaternionKeyframeTrack.prototype =
		Object.assign( Object.create( THREE.KeyframeTrack.prototype ), {

	constructor: THREE.QuaternionKeyframeTrack,

	ValueTypeName: 'quaternion',

	// ValueBufferType is inherited

	DefaultInterpolation: THREE.InterpolateLinear,

	InterpolantFactoryMethodLinear: function( result ) {

		return new THREE.QuaternionLinearInterpolant(
				this.times, this.values, this.getValueSize(), result );

	},

	InterpolantFactoryMethodSmooth: undefined // not yet implemented

} );
