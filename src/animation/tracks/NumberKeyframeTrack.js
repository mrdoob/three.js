/**
 *
 * A Track that interpolates Numbers
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.NumberKeyframeTrack = function ( name, keys ) {

	THREE.KeyframeTrack.call( this, name, keys );

	// local cache of value type to avoid allocations during runtime.
	this.result = this.keys[0].value;

};

THREE.NumberKeyframeTrack.prototype = Object.create( THREE.KeyframeTrack.prototype );

THREE.NumberKeyframeTrack.prototype.constructor = THREE.NumberKeyframeTrack;

THREE.NumberKeyframeTrack.prototype.setResult = function( value ) {

	this.result = value;

};

// memoization of the lerp function for speed.
// NOTE: Do not optimize as a prototype initialization closure, as value0 will be different on a per class basis.
THREE.NumberKeyframeTrack.prototype.lerpValues = function( value0, value1, alpha ) {

	return value0 * ( 1 - alpha ) + value1 * alpha;

};

THREE.NumberKeyframeTrack.prototype.compareValues = function( value0, value1 ) {

	return ( value0 === value1 );

};

THREE.NumberKeyframeTrack.prototype.clone = function() {

	var clonedKeys = [];

	for ( var i = 0; i < this.keys.length; i ++ ) {

		var key = this.keys[i];
		clonedKeys.push( {
			time: key.time,
			value: key.value
		} );
	}

	return new THREE.NumberKeyframeTrack( this.name, clonedKeys );

};

THREE.NumberKeyframeTrack.parse = function( json ) {

	return new THREE.NumberKeyframeTrack( json.name, json.keys );

};
