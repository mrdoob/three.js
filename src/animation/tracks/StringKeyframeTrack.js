/**
 *
 * A Track that interpolates Strings
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.StringKeyframeTrack = function ( name, keys ) {

	THREE.KeyframeTrack.call( this, name, keys );

	// local cache of value type to avoid allocations during runtime.
	this.result = this.keys[0].value;

};

THREE.StringKeyframeTrack.prototype = Object.create( THREE.KeyframeTrack.prototype );

THREE.StringKeyframeTrack.prototype.constructor = THREE.StringKeyframeTrack;

THREE.StringKeyframeTrack.prototype.setResult = function( value ) {

	this.result = value;

};

// memoization of the lerp function for speed.
// NOTE: Do not optimize as a prototype initialization closure, as value0 will be different on a per class basis.
THREE.StringKeyframeTrack.prototype.lerpValues = function( value0, value1, alpha ) {

	return ( alpha < 1.0 ) ? value0 : value1;

};

THREE.StringKeyframeTrack.prototype.compareValues = function( value0, value1 ) {

	return ( value0 === value1 );

};

THREE.StringKeyframeTrack.prototype.clone = function() {

	var clonedKeys = [];

	for ( var i = 0; i < this.keys.length; i ++ ) {

		var key = this.keys[i];
		clonedKeys.push( {
			time: key.time,
			value: key.value
		} );
	}

	return new THREE.StringKeyframeTrack( this.name, clonedKeys );

};

THREE.StringKeyframeTrack.parse = function( json ) {

	return new THREE.StringKeyframeTrack( json.name, json.keys );

};
