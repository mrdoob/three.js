import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { If, float, nodeProxy, tslFn, vec4 } from '../shadernode/ShaderNode.js';
import { uniform } from '../core/UniformNode.js';
import { reference } from './ReferenceNode.js';
import { positionLocal } from './PositionNode.js';
import { normalLocal } from './NormalNode.js';
import { textureLoad } from './TextureNode.js';
import { instanceIndex, vertexIndex } from '../core/IndexNode.js';
import { ivec2, int } from '../shadernode/ShaderNode.js';
import { DataArrayTexture, Vector2, Vector4, FloatType, RedFormat } from 'three';
import { loop } from '../utils/LoopNode.js';
import { all } from '../Nodes.js';

const morphTextures = new WeakMap();
const morphVec4 = new Vector4();

const getMorph = tslFn( ( { bufferMap, influence, stride, width, depth, offset } ) => {

	const texelIndex = int( vertexIndex ).mul( stride ).add( offset.mul( 3 ) );

	const y = texelIndex.div( width );
	const x = texelIndex.sub( y.mul( width ) );

	const morphUV = ivec2( x, y );

	// const bufferAttrib = textureLoad( bufferMap, ivec2( x, y ) ).depth( depth );

	const bufferAttrib = vec4( 0. ).toVar();
	bufferAttrib.x = textureLoad( bufferMap, morphUV ).depth( depth ).r;
	morphUV.x.addAssign( 1 );
	bufferAttrib.y = textureLoad( bufferMap, morphUV ).depth( depth ).r;
	morphUV.x.addAssign( 1 );
	bufferAttrib.z = textureLoad( bufferMap, morphUV ).depth( depth ).r;

	If( all( stride.equal( 10 ) ), () => {

		morphUV.x.addAssign( 1 );
		bufferAttrib.a = offset.equal( 2 ).all().cond( textureLoad( bufferMap, morphUV ).depth( depth ).r, 0. );

	} );

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

	let entry = morphTextures.get( geometry );

	if ( entry === undefined || entry.count !== morphTargetsCount ) {

		if ( entry !== undefined ) entry.texture.dispose();

		const morphTargets = geometry.morphAttributes.position || [];
		const morphNormals = geometry.morphAttributes.normal || [];
		const morphColors = geometry.morphAttributes.color || [];

		let vertexDataCount = 0;

		if ( hasMorphPosition === true ) vertexDataCount = 3;
		if ( hasMorphNormals === true ) vertexDataCount = 6;
		if ( hasMorphColors === true ) vertexDataCount = 10;

		let width = geometry.attributes.position.count * vertexDataCount;
		let height = 1;

		const maxTextureSize = 4096; // @TODO: Use 'capabilities.maxTextureSize'

		if ( width > maxTextureSize ) {

			// Align width on stride to simplify the texel fetching in the shader
			const strideWidth = Math.floor( maxTextureSize / vertexDataCount ) * vertexDataCount;
			height = Math.ceil( width / strideWidth );
			width = strideWidth;

		}

		const buffer = new Float32Array( width * height * morphTargetsCount );

		const bufferTexture = new DataArrayTexture( buffer, width, height, morphTargetsCount );
		bufferTexture.type = FloatType;
		bufferTexture.format = RedFormat;
		bufferTexture.needsUpdate = true;

		// fill buffer

		for ( let i = 0; i < morphTargetsCount; i ++ ) {

			const morphTarget = morphTargets[ i ];
			const morphNormal = morphNormals[ i ];
			const morphColor = morphColors[ i ];

			const offset = width * height * i;

			for ( let j = 0; j < morphTarget.count; j ++ ) {

				const stride = j * vertexDataCount;

				if ( hasMorphPosition === true ) {

					morphVec4.fromBufferAttribute( morphTarget, j );

					buffer[ offset + stride + 0 ] = morphVec4.x;
					buffer[ offset + stride + 1 ] = morphVec4.y;
					buffer[ offset + stride + 2 ] = morphVec4.z;

				}

				if ( hasMorphNormals === true ) {

					morphVec4.fromBufferAttribute( morphNormal, j );

					buffer[ offset + stride + 3 ] = morphVec4.x;
					buffer[ offset + stride + 4 ] = morphVec4.y;
					buffer[ offset + stride + 5 ] = morphVec4.z;

				}

				if ( hasMorphColors === true ) {

					morphVec4.fromBufferAttribute( morphColor, j );

					buffer[ offset + stride + 6 ] = morphVec4.x;
					buffer[ offset + stride + 7 ] = morphVec4.y;
					buffer[ offset + stride + 8 ] = morphVec4.z;
					buffer[ offset + stride + 9 ] = ( morphColor.itemSize === 4 ) ? morphVec4.w : 1;

				}

			}

		}

		entry = {
			count: morphTargetsCount,
			texture: bufferTexture,
			stride: vertexDataCount,
			size: new Vector2( width, height )
		};

		morphTextures.set( geometry, entry );

		function disposeTexture() {

			bufferTexture.dispose();

			morphTextures.delete( geometry );

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
		const hasMorphNormals = geometry.morphAttributes.normal !== undefined;

		const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
		const morphTargetsCount = ( morphAttribute !== undefined ) ? morphAttribute.length : 0;

		// nodes

		const { texture: bufferMap, stride, size } = getEntry( geometry );

		if ( hasMorphPosition === true ) positionLocal.mulAssign( this.morphBaseInfluence );
		if ( hasMorphNormals === true ) normalLocal.mulAssign( this.morphBaseInfluence );

		const width = int( size.width );

		loop( morphTargetsCount, ( { i } ) => {

			const influence = float( 0 ).toVar();

			if ( this.mesh.isInstancedMesh === true && ( this.mesh.morphTexture !== null && this.mesh.morphTexture !== undefined ) ) {

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

export const morphReference = nodeProxy( MorphNode );

addNodeClass( 'MorphNode', MorphNode );
