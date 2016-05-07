/**
 *
 * Convenient fixed size array
 *
 * @author bhouston / http://clara.io
 */

THREE.FlatArray = function ( type, length, optionalInnerArray ) {

  if( type.TypedStride === undefined || type.TypedArray === undefined )
    throw new Error( "type.TypedStride and type.TypedArray must be defined." );

  this.type = type;
  this.length = length || 0;

  var innerArrayLength = this.length * this.type.TypedStride;
  if( optionalInnerArray && optionalInnerArray.length != innerArrayLength ) throw new Error( "optionalBuffer if defined must be the right length" );
  this.innerArray = optionalInnerArray || new this.type.TypedArray( innerArrayLength );

};

THREE.FlatArray.prototype = {

	constructor: THREE.FlatArray,

  get stride() {

    return this.type.TypedStride;

  },

  getAt: function ( index, optionalValue ) {

    var result = optionalValue || new this.type();

		var offset = index * this.type.TypedStride;
    result.fromArray( this.innerArray, offset );

		return result;

	},

	setAt: function ( index, value ) {

		var offset = index * this.type.TypedStride;
    value.toArray( this.innerArray, offset );

		return this;

	},

  clone: function() {

    return new THREE.FlatArray( this.type, this.length, this.innerArray.slice( 0 ) );

  }
}

THREE.FlatArray.fromPrimitives = function( type, primitives ) {

  var result = new THREE.FlatArray( type, primitives.length );
  THREE.Arrays.copyPrimitivesToTypedArray( primitives, result.innerArray );

  return result;

};
