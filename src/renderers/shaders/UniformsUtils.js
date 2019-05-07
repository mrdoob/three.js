/**
 * Uniform Utilities
 */

export function cloneUniforms( src ) {

	var dst = {};

	for ( var u in src ) {

		dst[ u ] = {};

		for ( var p in src[ u ] ) {

			var property = src[ u ][ p ];

			if ( property && ( property.isColor ||
				property.isMatrix3 || property.isMatrix4 ||
				property.isVector2 || property.isVector3 || property.isVector4 ||
				property.isTexture ) ) {

				dst[ u ][ p ] = property.clone();

			} else if ( Array.isArray( property ) ) {

				dst[ u ][ p ] = property.slice();

			} else {

				dst[ u ][ p ] = property;

			}

		}

	}

	return dst;

}

export function mergeUniforms( uniforms ) {

	var merged = {};

	for ( var u = 0; u < uniforms.length; u ++ ) {

		var tmp = cloneUniforms( uniforms[ u ] );

		for ( var p in tmp ) {

			merged[ p ] = tmp[ p ];

		}

	}

	return merged;

}

export function cloneUniformsGroups( src ) {

	var dst = [];

	for ( var u = 0; u < src.length; u ++ ) {

		dst.push( src[ u ].clone() );

	}

	return dst;

}

// Legacy

var UniformsUtils = { clone: cloneUniforms, merge: mergeUniforms };

export { UniformsUtils };
