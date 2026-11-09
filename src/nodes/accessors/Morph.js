
import { float, Fn, ivec2, int, If, uniform, vec4 } from '../tsl/TSLBase.js';
import { Loop } from '../utils/LoopNode.js';
import { OnObjectUpdate } from '../utils/EventNode.js';
import { textureLoad } from './TextureNode.js';
import { positionLocal } from './Position.js';
import { normalLocal } from './Normal.js';
import { property } from '../core/PropertyNode.js';
import { varying } from '../core/VaryingNode.js';
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
 * TSL function that retrieves and scales the morphed attribute (position, normal or color) texel value.
 *
 * @param {Object} params - The parameter object.
 * @param {Node<texture>} params.bufferMap - The morph target data array texture.
 * @param {Node<float>} params.influence - The target's animation influence weight.
 * @param {number} params.stride - The vertex data stride (e.g. 1 or 2).
 * @param {Node<int>} params.width - The texture width limit.
 * @param {Node<int>} params.depth - The target layer index (morph target index).
 * @param {Node<int>} params.offset - The texture offset (e.g. 0 for position, 1 for normal, 2 for color).
 * @returns {Node<vec4>} The scaled morph target value.
 */
const getMorph = /*@__PURE__*/ Fn( ( { bufferMap, influence, stride, width, depth, offset } ) => {

	const texelIndex = int( vertexIndex ).mul( stride ).add( offset );

	const y = texelIndex.div( width );
	const x = texelIndex.sub( y.mul( width ) );

	const bufferAttrib = textureLoad( bufferMap, ivec2( x, y ) ).depth( depth );

	return bufferAttrib.mul( influence );

} );

/**
 * The morph target base influence. It is `1` when `morphTargetsRelative`
 * is `true`, otherwise `1 - sum( influences )`.
 *
 * @type {UniformNode<float>}
 */
const morphBase = /*@__PURE__*/ uniform( 1 ).onObjectUpdate( ( { object } ) => {

	return object.geometry.morphTargetsRelative ? 1 : 1 - object.morphTargetInfluences.reduce( ( a, b ) => a + b, 0 );

} );

/**
 * The sum of the weighted color morph targets.
 *
 * @type {PropertyNode<vec4>}
 */
const morphColorSum = /*@__PURE__*/ property( 'vec4', 'morphColorSum' );

/**
 * TSL function that applies the color morph targets to the given color.
 * The result is computed in the vertex stage.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} color - The color to morph. Must be available in the vertex stage.
 * @returns {Node<vec4>} The morphed color.
 */
export const morphColor = /*@__PURE__*/ Fn( ( [ color ], { geometry } ) => {

	if ( geometry.morphAttributes.color[ 0 ].itemSize === 4 ) {

		return varying( color.mul( morphBase ).add( morphColorSum ) );

	}

	return varying( vec4( color.rgb.mul( morphBase ).add( morphColorSum.rgb ), color.a ) );

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
export const morphReference = /*@__PURE__*/ Fn( ( [ mesh ], builder ) => {

	const { geometry } = mesh;

	const hasMorphPosition = geometry.morphAttributes.position !== undefined;
	const hasMorphNormals = geometry.hasAttribute( 'normal' ) && geometry.morphAttributes.normal !== undefined;
	const hasMorphColors = builder.material.vertexColors === true && geometry.morphAttributes.color !== undefined;
	const hasColorAlpha = hasMorphColors === true && geometry.morphAttributes.color[ 0 ].itemSize === 4;

	const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
	const morphTargetsCount = ( morphAttribute !== undefined ) ? morphAttribute.length : 0;

	if ( morphTargetsCount === 0 ) return;

	if ( mesh.morphTexture ) builder.objectSpecific = true;

	// Init

	let morphInfluenceData = _morphInfluencesData.get( mesh );

	if ( morphInfluenceData === undefined || morphInfluenceData.count !== morphTargetsCount ) {

		morphInfluenceData = {
			influences: mesh.morphTargetInfluences ? uniformArray( mesh.morphTargetInfluences, 'float' ) : null,
			count: morphTargetsCount
		};

		_morphInfluencesData.set( mesh, morphInfluenceData );

	}

	const { influences } = morphInfluenceData;

	// Shader

	const { texture: bufferMap, stride, size } = getEntry( geometry );

	if ( hasMorphPosition === true ) positionLocal.mulAssign( morphBase );
	if ( hasMorphNormals === true ) normalLocal.mulAssign( morphBase );
	if ( hasMorphColors === true ) morphColorSum.assign( 0 );

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
				} ).xyz );

			}

			if ( hasMorphNormals === true ) {

				normalLocal.addAssign( getMorph( {
					bufferMap,
					influence,
					stride,
					width,
					depth: i,
					offset: int( 1 )
				} ).xyz );

			}

			if ( hasMorphColors === true ) {

				const morph = getMorph( {
					bufferMap,
					influence,
					stride,
					width,
					depth: i,
					offset: int( 2 )
				} );

				if ( hasColorAlpha === true ) {

					morphColorSum.addAssign( morph );

				} else {

					morphColorSum.rgb.addAssign( morph.rgb );

				}

			}

		} );

	} );

	// Update

	OnObjectUpdate( ( { object } ) => {

		const { influences } = morphInfluenceData;

		if ( influences ) {

			influences.array = object.morphTargetInfluences;
			influences.update();

		}

	} );

}, 'void' );


