/**
 *
 * A Track of vectored keyframe values.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

THREE.VectorKeyframeTrack = function ( name, times, values, interpolation ) {

	THREE.KeyframeTrack.call( this, name, times, values, interpolation );

};

THREE.VectorKeyframeTrack.prototype =
		Object.assign( Object.create( THREE.KeyframeTrack.prototype ), {

	constructor: THREE.VectorKeyframeTrack,

	ValueTypeName: 'vector'

	// ValueBufferType is inherited

	// DefaultInterpolation is inherited

} );
