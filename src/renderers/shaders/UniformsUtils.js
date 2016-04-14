/**
 * Uniform Utilities
 */

THREE.UniformsUtils = {

	merge: function ( uniforms ) {

		var merged = {};

		for ( var u = 0; u < uniforms.length; u ++ ) {

			var tmp = this.clone( uniforms[ u ] );

			for ( var p in tmp ) {

				merged[ p ] = tmp[ p ];

			}

		}

		return merged;

	},

	clone: function ( uniforms_src ) {

		var uniforms_dst = {};

		for ( var u in uniforms_src ) {

			uniforms_dst[ u ] = {};

			for ( var p in uniforms_src[ u ] ) {

				var parameter_src = uniforms_src[ u ][ p ];

				uniforms_dst[ u ][ p ] = this.cloneValue( parameter_src );

			}

		}

		return uniforms_dst;

	},

	cloneValue: function( parameter_src ) {

		if ( parameter_src instanceof THREE.Color ||
			 parameter_src instanceof THREE.Vector2 ||
			 parameter_src instanceof THREE.Vector3 ||
			 parameter_src instanceof THREE.Vector4 ||
			 parameter_src instanceof THREE.Matrix3 ||
			 parameter_src instanceof THREE.Matrix4 ||
			 parameter_src instanceof THREE.Texture ) {

			return parameter_src.clone();

		} else if ( Array.isArray( parameter_src ) ) {

			return parameter_src.slice();

		} else {

			return parameter_src;

		}

	}

};
