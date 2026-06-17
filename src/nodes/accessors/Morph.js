
import { float, Fn, ivec2, int, If, uniform } from '../tsl/TSLBase.js';
import { Loop } from '../utils/LoopNode.js';
import { OnObjectUpdate } from '../utils/EventNode.js';
import { textureLoad } from './TextureNode.js';
import { positionLocal } from './Position.js';
import { normalLocal } from './Normal.js';
import { instanceIndex, vertexIndex } from '../core/IndexNode.js';

import { DataArrayTexture } from '../../textures/DataArrayTexture.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';
import { FloatType } from '../../constants.js';
import { uniformArray } from './UniformArrayNode.js';

const _morphTextures = /*@__PURE__*/ new WeakMap();
const _morphVec4 = /*@__PURE__*/ new Vector4();
const _morphInfluencesData = /*@__PURE__*/ new WeakMap();

/**
 * TSL function that retrieves and scales the morphed attribute (position or normal) texel value.
 *
 * @param {Object} params - The parameter object.
 * @param {Node<texture>} params.bufferMap - The morph target data array texture.
 * @param {Node<float>} params.influence - The target's animation influence weight.
 * @param {number} params.stride - The vertex data stride (e.g. 1 or 2).
 * @param {Node<int>} params.width - The texture width limit.
 * @param {Node<int>} params.depth - The target layer index (morph target index).
 * @param {Node<int>} params.offset - The texture offset (e.g. 0 for position, 1 for normal).
 * @returns {Node<vec3>} The scaled morph target translation value.
 */
const getMorph = /*@__PURE__*/ Fn( ( { bufferMap, influence, stride, width, depth, offset } ) => {

	const texelIndex = int( vertexIndex ).mul( stride ).add( offset );

	const y = texelIndex.div( width );
	const x = texelIndex.sub( y.mul( width ) );

	const bufferAttrib = textureLoad( bufferMap, ivec2( x, y ) ).depth( depth ).xyz;

	return bufferAttrib.mul( influence );

} );

/**
 * Resolves or creates a compiled DataArrayTexture containing encoded vertex morph targets data for WebGL2/WebGPU.
 *
 * @param {BufferGeometry} geometry - The geometry to parse.
 * @returns {Object} The resolved morph targets texture data mapping entry.
 */
function getEntry( geometry ) {

	const hasMorphPosition = geometry.morphAttributes.position !== undefined;
	const hasMorphNormals = geometry.morphAttributes.normal !== undefined;
	const hasMorphColors = geometry.morphAttributes.color !== undefined;

	// instead of using attributes, the WebGL 2 code path encodes morph targets
	// into an array of data textures. Each layer represents a single morph target.

	const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
	const morphTargetsCount = ( morphAttribute !== undefined ) ? morphAttribute.length : 0;

	let entry = _morphTextures.get( geometry );

	if ( entry === undefined || entry.count !== morphTargetsCount ) {

		if ( entry !== undefined ) entry.texture.dispose();

		const morphTargets = geometry.morphAttributes.position || [];
		const morphNormals = geometry.morphAttributes.normal || [];
		const morphColors = geometry.morphAttributes.color || [];

		let vertexDataCount = 0;

		if ( hasMorphPosition === true ) vertexDataCount = 1;
		if ( hasMorphNormals === true ) vertexDataCount = 2;
		if ( hasMorphColors === true ) vertexDataCount = 3;

		let width = geometry.attributes.position.count * vertexDataCount;
		let height = 1;

		const maxTextureSize = 4096; // @TODO: Use 'capabilities.maxTextureSize'

		if ( width > maxTextureSize ) {

			height = Math.ceil( width / maxTextureSize );
			width = maxTextureSize;

		}

		const buffer = new Float32Array( width * height * 4 * morphTargetsCount );

		const bufferTexture = new DataArrayTexture( buffer, width, height, morphTargetsCount );
		bufferTexture.type = FloatType;
		bufferTexture.needsUpdate = true;

		// fill buffer

		const vertexDataStride = vertexDataCount * 4;

		for ( let i = 0; i < morphTargetsCount; i ++ ) {

			const morphTarget = morphTargets[ i ];
			const morphNormal = morphNormals[ i ];
			const morphColor = morphColors[ i ];

			const offset = width * height * 4 * i;

			for ( let j = 0; j < morphTarget.count; j ++ ) {

				const stride = j * vertexDataStride;

				if ( hasMorphPosition === true ) {

					_morphVec4.fromBufferAttribute( morphTarget, j );

					buffer[ offset + stride + 0 ] = _morphVec4.x;
					buffer[ offset + stride + 1 ] = _morphVec4.y;
					buffer[ offset + stride + 2 ] = _morphVec4.z;
					buffer[ offset + stride + 3 ] = 0;

				}

				if ( hasMorphNormals === true ) {

					_morphVec4.fromBufferAttribute( morphNormal, j );

					buffer[ offset + stride + 4 ] = _morphVec4.x;
					buffer[ offset + stride + 5 ] = _morphVec4.y;
					buffer[ offset + stride + 6 ] = _morphVec4.z;
					buffer[ offset + stride + 7 ] = 0;

				}

				if ( hasMorphColors === true ) {

					_morphVec4.fromBufferAttribute( morphColor, j );

					buffer[ offset + stride + 8 ] = _morphVec4.x;
					buffer[ offset + stride + 9 ] = _morphVec4.y;
					buffer[ offset + stride + 10 ] = _morphVec4.z;
					buffer[ offset + stride + 11 ] = ( morphColor.itemSize === 4 ) ? _morphVec4.w : 1;

				}

			}

		}

		entry = {
			count: morphTargetsCount,
			texture: bufferTexture,
			stride: vertexDataCount,
			size: new Vector2( width, height )
		};

		_morphTextures.set( geometry, entry );

		function disposeTexture() {

			bufferTexture.dispose();

			_morphTextures.delete( geometry );

			geometry.removeEventListener( 'dispose', disposeTexture );

		}

		geometry.addEventListener( 'dispose', disposeTexture );

	}

	return entry;

}

/**
 * TSL function representing the vertex shader morph targets blend setup.
 * Dynamically computes morph targets weights and updates positionLocal and normalLocal in-place.
 *
 * @tsl
 * @function
 * @param {Mesh} mesh - The mesh.
 */
export const morphReference = /*@__PURE__*/ Fn( ( [ mesh ] ) => {

	const { geometry } = mesh;

	const hasMorphPosition = geometry.morphAttributes.position !== undefined;
	const hasMorphNormals = geometry.hasAttribute( 'normal' ) && geometry.morphAttributes.normal !== undefined;

	const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
	const morphTargetsCount = ( morphAttribute !== undefined ) ? morphAttribute.length : 0;

	if ( morphTargetsCount === 0 ) return;

	// Init

	let morphInfluenceData = _morphInfluencesData.get( mesh );

	if ( morphInfluenceData === undefined || morphInfluenceData.count !== morphTargetsCount ) {

		morphInfluenceData = {
			base: uniform( 1 ),
			influences: mesh.morphTargetInfluences ? uniformArray( mesh.morphTargetInfluences, 'float' ) : null,
			count: morphTargetsCount
		};

		_morphInfluencesData.set( mesh, morphInfluenceData );

	}

	const { base, influences } = morphInfluenceData;

	// Shader

	const { texture: bufferMap, stride, size } = getEntry( geometry );

	if ( hasMorphPosition === true ) positionLocal.mulAssign( base );
	if ( hasMorphNormals === true ) normalLocal.mulAssign( base );

	const width = int( size.width );

	Loop( morphTargetsCount, ( { i } ) => {

		const influence = float( 0 ).toVar();

		if ( mesh.count > 1 && ( mesh.morphTexture !== null && mesh.morphTexture !== undefined ) ) {

			influence.assign( textureLoad( mesh.morphTexture, ivec2( int( i ).add( 1 ), int( instanceIndex ) ) ).r );

		} else {

			influence.assign( influences.element( i ).toVar() );

		}

		If( influence.notEqual( 0 ), () => {

			if ( hasMorphPosition === true ) {

				positionLocal.addAssign( getMorph( {
					bufferMap,
					influence,
					stride,
					width,
					depth: i,
					offset: int( 0 )
				} ) );

			}

			if ( hasMorphNormals === true ) {

				normalLocal.addAssign( getMorph( {
					bufferMap,
					influence,
					stride,
					width,
					depth: i,
					offset: int( 1 )
				} ) );

			}

		} );

	} );

	// Update

	OnObjectUpdate( ( { object } ) => {

		const { base, influences } = morphInfluenceData;

		if ( object.geometry.morphTargetsRelative ) {

			base.value = 1;

		} else {

			base.value = 1 - object.morphTargetInfluences.reduce( ( a, b ) => a + b, 0 );

		}

		if ( influences ) {

			influences.array = object.morphTargetInfluences;
			influences.update();

		}

	} );

}, 'void' );


