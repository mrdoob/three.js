import { FloatType, RGBAFormat } from '../../constants.js';
import { DataTexture2DArray } from '../../textures/DataTexture2DArray.js';
import { Vector3 } from '../../math/Vector3.js';
import { Vector2 } from '../../math/Vector2.js';

function numericalSort( a, b ) {

	return a[ 0 ] - b[ 0 ];

}

function absNumericalSort( a, b ) {

	return Math.abs( b[ 1 ] ) - Math.abs( a[ 1 ] );

}

function denormalize( morph, attribute ) {

	let denominator = 1;
	const array = attribute.isInterleavedBufferAttribute ? attribute.data.array : attribute.array;

	if ( array instanceof Int8Array ) denominator = 127;
	else if ( array instanceof Int16Array ) denominator = 32767;
	else if ( array instanceof Int32Array ) denominator = 2147483647;
	else console.error( 'THREE.WebGLMorphtargets: Unsupported morph attribute data type: ', array );

	morph.divideScalar( denominator );

}

function WebGLMorphtargets( gl, capabilities, textures ) {

	const influencesList = {};
	const morphInfluences = new Float32Array( 8 );
	const morphTextures = new WeakMap();
	const morph = new Vector3();

	const workInfluences = [];

	for ( let i = 0; i < 8; i ++ ) {

		workInfluences[ i ] = [ i, 0 ];

	}

	function update( object, geometry, material, program ) {

		const objectInfluences = object.morphTargetInfluences;

		if ( capabilities.isWebGL2 === true ) {

			// instead of using attributes, the WebGL 2 code path encodes morph targets
			// into an array of data textures. Each layer represents a single morph target.

			const numberOfMorphTargets = geometry.morphAttributes.position.length;

			let entry = morphTextures.get( geometry );

			if ( entry === undefined || entry.count !== numberOfMorphTargets ) {

				if ( entry !== undefined ) entry.texture.dispose();

				const hasMorphNormals = geometry.morphAttributes.normal !== undefined;

				const morphTargets = geometry.morphAttributes.position;
				const morphNormals = geometry.morphAttributes.normal || [];

				const numberOfVertices = geometry.attributes.position.count;
				const numberOfVertexData = ( hasMorphNormals === true ) ? 2 : 1; // (v,n) vs. (v)

				let width = numberOfVertices * numberOfVertexData;
				let height = 1;

				if ( width > capabilities.maxTextureSize ) {

					height = Math.ceil( width / capabilities.maxTextureSize );
					width = capabilities.maxTextureSize;

				}

				const buffer = new Float32Array( width * height * 4 * numberOfMorphTargets );

				const texture = new DataTexture2DArray( buffer, width, height, numberOfMorphTargets );
				texture.format = RGBAFormat; // using RGBA since RGB might be emulated (and is thus slower)
				texture.type = FloatType;
				texture.needsUpdate = true;

				// fill buffer

				const vertexDataStride = numberOfVertexData * 4;

				for ( let i = 0; i < numberOfMorphTargets; i ++ ) {

					const morphTarget = morphTargets[ i ];
					const morphNormal = morphNormals[ i ];

					const offset = width * height * 4 * i;

					for ( let j = 0; j < morphTarget.count; j ++ ) {

						morph.fromBufferAttribute( morphTarget, j );

						if ( morphTarget.normalized === true ) denormalize( morph, morphTarget );

						const stride = j * vertexDataStride;

						buffer[ offset + stride + 0 ] = morph.x;
						buffer[ offset + stride + 1 ] = morph.y;
						buffer[ offset + stride + 2 ] = morph.z;
						buffer[ offset + stride + 3 ] = 0;

						if ( hasMorphNormals === true ) {

							morph.fromBufferAttribute( morphNormal, j );

							if ( morphNormal.normalized === true ) denormalize( morph, morphNormal );

							buffer[ offset + stride + 4 ] = morph.x;
							buffer[ offset + stride + 5 ] = morph.y;
							buffer[ offset + stride + 6 ] = morph.z;
							buffer[ offset + stride + 7 ] = 0;

						}

					}

				}

				entry = {
					count: numberOfMorphTargets,
					texture: texture,
					size: new Vector2( width, height )
				};

				morphTextures.set( geometry, entry );

			}

			//

			let morphInfluencesSum = 0;

			for ( let i = 0; i < objectInfluences.length; i ++ ) {

				morphInfluencesSum += objectInfluences[ i ];

			}

			const morphBaseInfluence = geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;

			program.getUniforms().setValue( gl, 'morphTargetBaseInfluence', morphBaseInfluence );
			program.getUniforms().setValue( gl, 'morphTargetInfluences', objectInfluences );

			program.getUniforms().setValue( gl, 'morphTargetsTexture', entry.texture, textures );
			program.getUniforms().setValue( gl, 'morphTargetsTextureSize', entry.size );


		} else {

			// When object doesn't have morph target influences defined, we treat it as a 0-length array
			// This is important to make sure we set up morphTargetBaseInfluence / morphTargetInfluences

			const length = objectInfluences === undefined ? 0 : objectInfluences.length;

			let influences = influencesList[ geometry.id ];

			if ( influences === undefined || influences.length !== length ) {

				// initialise list

				influences = [];

				for ( let i = 0; i < length; i ++ ) {

					influences[ i ] = [ i, 0 ];

				}

				influencesList[ geometry.id ] = influences;

			}

			// Collect influences

			for ( let i = 0; i < length; i ++ ) {

				const influence = influences[ i ];

				influence[ 0 ] = i;
				influence[ 1 ] = objectInfluences[ i ];

			}

			influences.sort( absNumericalSort );

			for ( let i = 0; i < 8; i ++ ) {

				if ( i < length && influences[ i ][ 1 ] ) {

					workInfluences[ i ][ 0 ] = influences[ i ][ 0 ];
					workInfluences[ i ][ 1 ] = influences[ i ][ 1 ];

				} else {

					workInfluences[ i ][ 0 ] = Number.MAX_SAFE_INTEGER;
					workInfluences[ i ][ 1 ] = 0;

				}

			}

			workInfluences.sort( numericalSort );

			const morphTargets = geometry.morphAttributes.position;
			const morphNormals = geometry.morphAttributes.normal;

			let morphInfluencesSum = 0;

			for ( let i = 0; i < 8; i ++ ) {

				const influence = workInfluences[ i ];
				const index = influence[ 0 ];
				const value = influence[ 1 ];

				if ( index !== Number.MAX_SAFE_INTEGER && value ) {

					if ( morphTargets && geometry.getAttribute( 'morphTarget' + i ) !== morphTargets[ index ] ) {

						geometry.setAttribute( 'morphTarget' + i, morphTargets[ index ] );

					}

					if ( morphNormals && geometry.getAttribute( 'morphNormal' + i ) !== morphNormals[ index ] ) {

						geometry.setAttribute( 'morphNormal' + i, morphNormals[ index ] );

					}

					morphInfluences[ i ] = value;
					morphInfluencesSum += value;

				} else {

					if ( morphTargets && geometry.hasAttribute( 'morphTarget' + i ) === true ) {

						geometry.deleteAttribute( 'morphTarget' + i );

					}

					if ( morphNormals && geometry.hasAttribute( 'morphNormal' + i ) === true ) {

						geometry.deleteAttribute( 'morphNormal' + i );

					}

					morphInfluences[ i ] = 0;

				}

			}

			// GLSL shader uses formula baseinfluence * base + sum(target * influence)
			// This allows us to switch between absolute morphs and relative morphs without changing shader code
			// When baseinfluence = 1 - sum(influence), the above is equivalent to sum((target - base) * influence)
			const morphBaseInfluence = geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;

			program.getUniforms().setValue( gl, 'morphTargetBaseInfluence', morphBaseInfluence );
			program.getUniforms().setValue( gl, 'morphTargetInfluences', morphInfluences );

		}

	}

	return {

		update: update

	};

}


export { WebGLMorphtargets };
