import Node, { registerNode } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { float, nodeProxy, Fn } from '../tsl/TSLBase.js';
import { uniform } from '../core/UniformNode.js';
import { reference } from './ReferenceNode.js';
import { positionLocal } from './Position.js';
import { normalLocal } from './Normal.js';
import { textureLoad } from './TextureNode.js';
import { instanceIndex, vertexIndex } from '../core/IndexNode.js';
import { ivec2, int } from '../tsl/TSLBase.js';
import { Loop } from '../utils/LoopNode.js';

import { DataArrayTexture } from '../../textures/DataArrayTexture.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';
import { FloatType } from '../../constants.js';

const _morphTextures = /*@__PURE__*/ new WeakMap();
const _morphVec4 = /*@__PURE__*/ new Vector4();

const getMorph = /*@__PURE__*/ Fn( ( { bufferMap, influence, stride, width, depth, offset } ) => {

	const texelIndex = int( vertexIndex ).mul( stride ).add( offset );

	const y = texelIndex.div( width );
	const x = texelIndex.sub( y.mul( width ) );

	const bufferAttrib = textureLoad( bufferMap, ivec2( x, y ) ).depth( depth );

	return bufferAttrib.mul( influence );

} );

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


class MorphNode extends Node {

	constructor( mesh ) {

		super( 'void' );

		this.mesh = mesh;
		this.morphBaseInfluence = uniform( 1 );

		this.updateType = NodeUpdateType.OBJECT;

	}

	setup( builder ) {

		const { geometry } = builder;

		const hasMorphPosition = geometry.morphAttributes.position !== undefined;
		const hasMorphNormals = geometry.hasAttribute( 'normal' ) && geometry.morphAttributes.normal !== undefined;

		const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
		const morphTargetsCount = ( morphAttribute !== undefined ) ? morphAttribute.length : 0;

		// nodes

		const { texture: bufferMap, stride, size } = getEntry( geometry );

		if ( hasMorphPosition === true ) positionLocal.mulAssign( this.morphBaseInfluence );
		if ( hasMorphNormals === true ) normalLocal.mulAssign( this.morphBaseInfluence );

		const width = int( size.width );

		Loop( morphTargetsCount, ( { i } ) => {

			const influence = float( 0 ).toVar();

			if ( this.mesh.count > 1 && ( this.mesh.morphTexture !== null && this.mesh.morphTexture !== undefined ) ) {

				influence.assign( textureLoad( this.mesh.morphTexture, ivec2( int( i ).add( 1 ), int( instanceIndex ) ) ).r );

			} else {

				influence.assign( reference( 'morphTargetInfluences', 'float' ).element( i ).toVar() );

			}

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

	}

	update() {

		const morphBaseInfluence = this.morphBaseInfluence;

		if ( this.mesh.geometry.morphTargetsRelative ) {

			morphBaseInfluence.value = 1;

		} else {

			morphBaseInfluence.value = 1 - this.mesh.morphTargetInfluences.reduce( ( a, b ) => a + b, 0 );

		}

	}

}

export default MorphNode;

MorphNode.type = /*@__PURE__*/ registerNode( 'Morph', MorphNode );

export const morphReference = /*@__PURE__*/ nodeProxy( MorphNode );
