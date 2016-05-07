/**
 *
 * Array utilities
 *
 * @author bhouston / http://clara.io
 */

THREE.Arrays = function () {};

THREE.Arrays.copyPrimitivesToTypedArray = function( primitives, typedArray ) {

  if( ! primitives || primitives.length === 0 ) return;

  var stride = primitives[0].TypedStride;

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
