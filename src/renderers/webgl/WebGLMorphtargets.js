/**
 * @author mrdoob / http://mrdoob.com/
 */

function numericalSort( a, b ) {

	return a[ 0 ] - b[ 0 ];

}

function absNumericalSort( a, b ) {

	return Math.abs( b[ 1 ] ) - Math.abs( a[ 1 ] );

}

function WebGLMorphtargets( gl ) {

	var influencesList = {};
	var morphInfluences = new Float32Array( 8 );

	var workInfluences = [];

	for ( var i = 0; i < 8; i ++ ) {

		workInfluences[ i ] = [ i, 0 ];

	}

	function update( object, geometry, material, program ) {

		var objectInfluences = object.morphTargetInfluences;

		var length = objectInfluences.length;

		var influences = influencesList[ geometry.id ];

		if ( influences === undefined ) {

			// initialise list

			influences = [];

			for ( var i = 0; i < length; i ++ ) {

				influences[ i ] = [ i, 0 ];

			}

			influencesList[ geometry.id ] = influences;

		}

		// Collect influences

		for ( var i = 0; i < length; i ++ ) {

			var influence = influences[ i ];

			influence[ 0 ] = i;
			influence[ 1 ] = objectInfluences[ i ];

		}

		influences.sort( absNumericalSort );

		for ( var i = 0; i < 8; i ++ ) {

			if ( i < length && influences[ i ][ 1 ] ) {

				workInfluences[ i ][ 0 ] = influences[ i ][ 0 ];
				workInfluences[ i ][ 1 ] = influences[ i ][ 1 ];

			} else {

				workInfluences[ i ][ 0 ] = Number.MAX_SAFE_INTEGER;
				workInfluences[ i ][ 1 ] = 0;

			}

		}

		workInfluences.sort( numericalSort );

		var morphTargets = material.morphTargets && geometry.morphAttributes.position;
		var morphNormals = material.morphNormals && geometry.morphAttributes.normal;

		for ( var i = 0; i < 8; i ++ ) {

			var influence = workInfluences[ i ];
			var index = influence[ 0 ];
			var value = influence[ 1 ];

			if ( index !== Number.MAX_SAFE_INTEGER && value ) {

				if ( morphTargets && geometry.getAttribute( 'morphTarget' + i ) !== morphTargets[ index ] ) {

					geometry.addAttribute( 'morphTarget' + i, morphTargets[ index ] );

				}

				if ( morphNormals && geometry.getAttribute( 'morphNormal' + i ) !== morphNormals[ index ] ) {

					geometry.addAttribute( 'morphNormal' + i, morphNormals[ index ] );

				}

				morphInfluences[ i ] = value;

			} else {

				if ( morphTargets && geometry.getAttribute( 'morphTarget' + i ) !== undefined ) {

					geometry.removeAttribute( 'morphTarget' + i );

				}

				if ( morphNormals && geometry.getAttribute( 'morphNormal' + i ) !== undefined ) {

					geometry.removeAttribute( 'morphNormal' + i );

				}

				morphInfluences[ i ] = 0;

			}

		}

		program.getUniforms().setValue( gl, 'morphTargetInfluences', morphInfluences );

	}

	return {

		update: update

	};

}


export { WebGLMorphtargets };
