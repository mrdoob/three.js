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

Object.assign( THREE.QuaternionKeyframeTrack.prototype, THREE.KeyframeTrack.prototype, {

	constructor: THREE.QuaternionKeyframeTrack,

	ValueTypeName: 'quaternion',

	// ValueBufferType is inherited

	DefaultInterpolation: THREE.InterpolateLinear,

	InterpolantFactoryMethodLinear: function( result ) {

		return new THREE.SlerpInterpolant(
				this.times, this.values, this.getValueSize(), result );

	},

	InterpolantFactoryMethodSmooth: undefined // not yet implemented

} );
