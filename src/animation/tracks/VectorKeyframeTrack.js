/**
 *
 * A Track that interpolates Vectors
 * 
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.VectorKeyframeTrack = function ( name, keys ) {

	THREE.KeyframeTrack.call( this, name, keys );

	// local cache of value type to avoid allocations during runtime.
	this.result = this.keys[0].value.clone();

};

THREE.VectorKeyframeTrack.prototype = Object.create( THREE.KeyframeTrack.prototype );

THREE.VectorKeyframeTrack.prototype.constructor = THREE.VectorKeyframeTrack;

THREE.VectorKeyframeTrack.prototype.setResult = function( value ) {

	this.result.copy( value );

};

// memoization of the lerp function for speed.
// NOTE: Do not optimize as a prototype initialization closure, as value0 will be different on a per class basis.
THREE.VectorKeyframeTrack.prototype.lerpValues = function( value0, value1, alpha ) {

	return value0.lerp( value1, alpha );

};

THREE.VectorKeyframeTrack.prototype.compareValues = function( value0, value1 ) {

	return value0.equals( value1 );

};

THREE.VectorKeyframeTrack.prototype.clone = function() {

	var clonedKeys = [];

	for( var i = 0; i < this.keys.length; i ++ ) {
		
		var key = this.keys[i];
		clonedKeys.push( {
			time: key.time,
			value: key.value.clone()
		} );
	}

	return new THREE.VectorKeyframeTrack( this.name );

};

THREE.VectorKeyframeTrack.parse = function( name, jsonKeys ) {

	var elementCount = jsonKeys[0].value.length;
	var valueType = THREE[ 'Vector' + elementCount ];

	var keys = [];

	for( var i = 0; i < jsonKeys.length; i ++ ) {
		var jsonKey = jsonKeys[i];
		var key = {
			value: new valueType().fromArray( jsonKey.value ),
			time: jsonKey.time
		};
		keys.push( key );
	}

	return new THREE.VectorKeyframeTrack( name, keys );

};
 