/**
 *
 * A Track that interpolates Boolean
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.BooleanKeyframeTrack = function ( name, keys ) {

	THREE.KeyframeTrack.call( this, name, keys );

	// local cache of value type to avoid allocations during runtime.
	this.result = this.keys[0].value;

};

THREE.BooleanKeyframeTrack.prototype = Object.create( THREE.KeyframeTrack.prototype );

THREE.BooleanKeyframeTrack.prototype.constructor = THREE.BooleanKeyframeTrack;

THREE.BooleanKeyframeTrack.prototype.setResult = function( value ) {

	this.result = value;

};

// memoization of the lerp function for speed.
// NOTE: Do not optimize as a prototype initialization closure, as value0 will be different on a per class basis.
THREE.BooleanKeyframeTrack.prototype.lerpValues = function( value0, value1, alpha ) {

	return ( alpha < 1.0 ) ? value0 : value1;

};

THREE.BooleanKeyframeTrack.prototype.compareValues = function( value0, value1 ) {

	return ( value0 === value1 );

};

THREE.BooleanKeyframeTrack.prototype.clone = function() {

	var clonedKeys = [];

	for ( var i = 0; i < this.keys.length; i ++ ) {

		var key = this.keys[i];
		clonedKeys.push( {
			time: key.time,
			value: key.value
		} );
	}

	return new THREE.BooleanKeyframeTrack( this.name, clonedKeys );

};

THREE.BooleanKeyframeTrack.parse = function( json ) {

	return new THREE.BooleanKeyframeTrack( json.name, json.keys );

};
