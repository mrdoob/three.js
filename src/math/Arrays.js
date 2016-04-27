/**
 *
 * Array utilities
 *
 * @author bhouston / http://clara.io
 */

THREE.Arrays = function () {
};

THREE.Arrays.getTypedArray = function( primitive, optionalTypedArray ) {

  if( primitive && primitive.TypedArray ) return primitive.TypedArray;
  if( primitive && primitive.constructor && primitive.constructor.TypedArray ) return primitive.constructor.TypedArray;

  return optionalTypedArray || Int32Array;

};

THREE.Arrays.getTypedStride = function( primitive ) {

  if( primitive && primitive.TypedStride ) return primitive.TypedStride;
  if( primitive && primitive.constructor && primitive.constructor.TypedStride ) return primitive.constructor.TypedStride;

  return 1;

};

THREE.Arrays.copyPrimitivesToTypedArray = function( primitives, typedArray ) {

  if( ! primitives || primitives.length === 0 ) return;

  var stride = THREE.Arrays.getTypedStride( primitives[0] );

  for( var i = 0, offset = 0; i < primitives.length; i ++, offset += stride ) {

    var primitive = primitives[i];

    if( primitive === undefined ) {
      console.warn( 'THREE.Arrays.copyPrimitiveArrayToTypedArray(): primitive is undefined', i );
      for( var j = 0; j < stride; j ++ ) typedArray[offset + j] = 0;
      continue;
    }

    primitive.toArray( typedArray, offset );

  }

  return typedArray;

};
