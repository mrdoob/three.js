/**
 *
 * A Track of keyframe values that represent color.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

THREE.ColorKeyframeTrack = function ( name, times, values, interpolation ) {

	THREE.KeyframeTrack.call( this, name, times, values, interpolation );

};

THREE.ColorKeyframeTrack.prototype =
		Object.assign( Object.create( THREE.KeyframeTrack.prototype ), {

	constructor: THREE.ColorKeyframeTrack,

	ValueTypeName: 'color'

	// ValueBufferType is inherited

	// DefaultInterpolation is inherited


	// Note: Very basic implementation and nothing special yet.
	// However, this is the place for color space parameterization.

} );
