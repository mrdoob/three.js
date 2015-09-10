/**
 * Uniform Utilities
 */

var Color = require( "../../math/Color" ),
	Matrix3 = require( "../../math/Matrix3" ),
	Matrix4 = require( "../../math/Matrix4" ),
	Texture = require( "../../textures/Texture" ),
	Vector2 = require( "../../math/Vector2" ),
	Vector3 = require( "../../math/Vector3" ),
	Vector4 = require( "../../math/Vector4" );

module.exports = {

	merge: function ( uniforms ) {

		var u, tmp, p, merged = {};

		for ( u = 0; u < uniforms.length; u ++ ) {

			tmp = this.clone( uniforms[ u ] );

			for ( p in tmp ) {

				merged[ p ] = tmp[ p ];

			}

		}

		return merged;

	},

	clone: function ( uniforms_src ) {

		var u, p, parameterSrc, uniforms_dst = {};

		for ( u in uniforms_src ) {

			uniforms_dst[ u ] = {};

			for ( p in uniforms_src[ u ] ) {

				parameterSrc = uniforms_src[ u ][ p ];

				if ( parameterSrc instanceof Color ||
						parameterSrc instanceof Vector2 ||
						parameterSrc instanceof Vector3 ||
						parameterSrc instanceof Vector4 ||
						parameterSrc instanceof Matrix3 ||
						parameterSrc instanceof Matrix4 ||
						parameterSrc instanceof Texture ) {

					uniforms_dst[ u ][ p ] = parameterSrc.clone();

				} else if ( Array.isArray( parameterSrc ) ) {

					uniforms_dst[ u ][ p ] = parameterSrc.slice();

				} else {

					uniforms_dst[ u ][ p ] = parameterSrc;

				}

			}

		}

		return uniforms_dst;

	}

};
