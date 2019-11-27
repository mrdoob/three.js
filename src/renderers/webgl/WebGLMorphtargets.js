/**
 * @author mrdoob / http://mrdoob.com/
 */

function absNumericalSort( a, b ) {

	return Math.abs( b[ 1 ] ) - Math.abs( a[ 1 ] );

}

function WebGLMorphtargets( gl ) {

	var influencesList = {};
	var morphInfluences = new Float32Array( 8 );

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

		var morphTargets = material.morphTargets && geometry.morphAttributes.position;
		var morphNormals = material.morphNormals && geometry.morphAttributes.normal;

		// Remove current morphAttributes

		for ( var i = 0; i < length; i ++ ) {

			var influence = influences[ i ];

			if ( influence[ 1 ] !== 0 ) {

				if ( morphTargets ) geometry.deleteAttribute( 'morphTarget' + i );
				if ( morphNormals ) geometry.deleteAttribute( 'morphNormal' + i );

			}

		}

		// Collect influences

		for ( var i = 0; i < length; i ++ ) {

			var influence = influences[ i ];

			influence[ 0 ] = i;
			influence[ 1 ] = objectInfluences[ i ];

		}

		influences.sort( absNumericalSort );

		// Add morphAttributes

		var morphInfluencesSum = 0;

		for ( var i = 0; i < 8; i ++ ) {

			var influence = influences[ i ];

			if ( influence ) {

				var index = influence[ 0 ];
				var value = influence[ 1 ];

				if ( value ) {

					if ( morphTargets ) geometry.setAttribute( 'morphTarget' + i, morphTargets[ index ] );
					if ( morphNormals ) geometry.setAttribute( 'morphNormal' + i, morphNormals[ index ] );

					morphInfluences[ i ] = value;
					morphInfluencesSum += value;
					continue;

				}

			}

			morphInfluences[ i ] = 0;

		}

		// GLSL shader uses formula baseinfluence * base + sum(target * influence)
		// This allows us to switch between absolute morphs and relative morphs without changing shader code
		// When baseinfluence = 1 - sum(influence), the above is equivalent to sum((target - base) * influence)
		var morphBaseInfluence = geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;

		program.getUniforms().setValue( gl, 'morphTargetBaseInfluence', morphBaseInfluence );
		program.getUniforms().setValue( gl, 'morphTargetInfluences', morphInfluences );

	}

	return {

		update: update

	};

}


export { WebGLMorphtargets };
