/**
 *
 * A Track of numeric keyframe values.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */

THREE.NumberKeyframeTrack = function ( name, times, values, interpolation ) {

	THREE.KeyframeTrack.call( this, name, times, values, interpolation );

};

Object.assign( THREE.NumberKeyframeTrack.prototype, THREE.KeyframeTrack.prototype, {

	constructor: THREE.NumberKeyframeTrack,

	ValueTypeName: 'number',

	// ValueBufferType is inherited

	// DefaultInterpolation is inherited

} );
