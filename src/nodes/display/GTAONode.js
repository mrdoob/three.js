import TempNode from '../core/TempNode.js';
import { cameraProjectionMatrix, cameraProjectionMatrixInverse } from '../accessors/CameraNode.js';
import { texture } from '../accessors/TextureNode.js';
import { textureSize } from '../accessors/TextureSizeNode.js';
import { uv } from '../accessors/UVNode.js';
import { addNodeElement, nodeObject, tslFn, mat3, vec2, vec3, vec4, float, If } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { DataTexture } from '../../textures/DataTexture.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector3 } from '../../math/Vector3.js';
import { Noise } from '../../math/Noise.js';
import { PI, cos, sin, pow, clamp, abs, max, mix, sqrt, acos } from '../math/MathNode.js';
import { div, mul } from '../math/OperatorNode.js';
import { loop } from '../utils/LoopNode.js';
import { RepeatWrapping } from '../../constants.js';

class GTAONode extends TempNode {

	constructor( textureNode, depthNode, normalNode ) {

		super();

		this.textureNode = textureNode;
		this.depthNode = depthNode;
		this.normalNode = normalNode;

		this.radius = uniform( 0.25 );
		this.resolution = uniform( new Vector2() );
		this.thickness = uniform( 1 );
		this.distanceExponent = uniform( 1 );
		this.distanceFallOff = uniform( 1 );
		this.scale = uniform( 1 );
		this.noiseNode = texture( generateMagicSquareNoise() );

		this.SAMPLES = uniform( 16 );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore() {

		const map = this.textureNode.value;

		this.resolution.value.set( map.image.width, map.image.height );

	}

	setup() {

		const { textureNode, depthNode, normalNode, noiseNode } = this;

		const uvNode = uv();

		const sampleTexture = ( uv ) => textureNode.uv( uv );
		const sampleDepth = ( uv ) => depthNode.uv( uv ).x;
		const sampleNormal = ( uv ) => normalNode.uv( uv );
		const sampleNoise = ( uv ) => noiseNode.uv( uv );

		const getSceneUvAndDepth = tslFn( ( [ sampleViewPos ] )=> {

			const sampleClipPos = cameraProjectionMatrix.mul( sampleViewPos, 1.0 );
			const sampleUv = sampleClipPos.xy.div( sampleClipPos.w.mul( 0.5 ).add( 0.5 ) );
			const sampleSceneDepth = sampleDepth( sampleUv );
			return vec3( sampleUv, sampleSceneDepth );

		} );

		const getViewPosition = tslFn( ( [ screenPosition, depth ] )=> {

			const clipSpacePosition = vec4( vec3( screenPosition.xy, depth ).mul( 2.0 ).sub( 1.0 ), 1.0 );
			const viewSpacePosition = cameraProjectionMatrixInverse.mul( clipSpacePosition );

			return viewSpacePosition.xyz.div( viewSpacePosition.w );

		} );

		const ao = tslFn( () => {

			const depth = sampleDepth( uvNode );

			depth.equal( 1.0 ).discard();

			const viewPosition = getViewPosition( uvNode, depth );
			const viewNormal = sampleNormal( uvNode ).rgb.normalize();

			const radiusToUse = this.radius;

			const noiseResolution = textureSize( this.noiseNode, 0 );
			const noiseUv = uvNode.xy.mul( this.resolution.div( noiseResolution ) );
			const noiseTexel = sampleNoise( noiseUv );
			const randomVec = noiseTexel.xyz.mul( 2.0 ).sub( 1.0 );
			const tangent = vec3( randomVec.xy, 0.0 ).normalize();
			const bitangent = vec3( tangent.y.mul( - 1.0 ), tangent.x, 0.0 );
			const kernelMatrix = mat3( tangent, bitangent, vec3( 0.0, 0.0, 1.0 ) );

			const DIRECTIONS = this.SAMPLES.lessThan( 30 ).cond( 3, 5 );
			const STEPS = this.SAMPLES.add( DIRECTIONS.sub( 1 ) ).div( DIRECTIONS );

			let ao = float( 0 );

			loop( DIRECTIONS, ( { i } ) => {

				const angle = float( i ).div( DIRECTIONS ).mul( PI );
				const sampleDir = vec4( cos( angle ), sin( angle ), 0.0, noiseTexel.w.mul( 0.5 ).add( 0.5 ) );
				sampleDir.xyz = kernelMatrix.mul( sampleDir.xyz ).normalize();

				const viewDir = viewPosition.mul( - 1.0 ).normalize();
				const sliceBitangent = sampleDir.xyz.cross( viewDir ).normalize();
				const sliceTangent = sliceBitangent.cross( viewDir );
				const normalInSlice = viewNormal.sub( sliceBitangent.mul( viewNormal.dot( sliceBitangent ) ) );

				const tangentToNormalInSlice = normalInSlice.cross( sliceBitangent );
				const cosHorizons = vec2( viewDir.dot( tangentToNormalInSlice ), viewDir.dot( tangentToNormalInSlice.mul( - 1.0 ) ) );

				loop( STEPS, ( { i } ) => {

					const sampleViewOffset = sampleDir.xyz.mul( radiusToUse ).mul( sampleDir.w ).mul( pow( div( float( i ).add( 1.0 ), STEPS ), this.distanceExponent ) );

					// x

					let sampleSceneUvDepth = getSceneUvAndDepth( viewPosition.add( sampleViewOffset ) ).toVar();
					let sampleSceneViewPosition = getViewPosition( sampleSceneUvDepth.xy, sampleSceneUvDepth.z );
					let viewDelta = sampleSceneViewPosition.sub( viewPosition );

					If( abs( viewDelta.z ).lessThan( this.thickness ), () => {

						const sampleCosHorizon = viewDir.dot( viewDelta.normalize() );
						cosHorizons.x.addAssign( max( 0, mul( sampleCosHorizon.sub( cosHorizons.x ), mix( 1.0, float( 2.0 ).div( float( i ).add( 2 ) ), this.distanceFallOff ) ) ) );

					} );

					// y

					sampleSceneUvDepth = getSceneUvAndDepth( viewPosition.sub( sampleViewOffset ) ).toVar();
					sampleSceneViewPosition = getViewPosition( sampleSceneUvDepth.xy, sampleSceneUvDepth.z );
					viewDelta = sampleSceneViewPosition.sub( viewPosition );

					If( abs( viewDelta.z ).lessThan( this.thickness ), () => {

						const sampleCosHorizon = viewDir.dot( viewDelta.normalize() );
						cosHorizons.y.addAssign( max( 0, mul( sampleCosHorizon.sub( cosHorizons.y ), mix( 1.0, float( 2.0 ).div( float( i ).add( 2 ) ), this.distanceFallOff ) ) ) );

					} );

				} );

				const sinHorizons = sqrt( float( 1.0 ).sub( cosHorizons.mul( cosHorizons ) ) );
				const nx = normalInSlice.dot( sliceTangent );
				const ny = normalInSlice.dot( viewDir );
				const nxb = float( 1.0 ).div( 2.0 ).mul( acos( cosHorizons.y ).sub( acos( cosHorizons.x ).add( sinHorizons.x.mul( cosHorizons.x ) ).sub( sinHorizons.y.mul( cosHorizons.y ) ) ) );
				const nyb = float( 1.0 ).div( 2.0 ).mul( float( 2.0 ).sub( cosHorizons.x.mul( cosHorizons.x ) ).sub( cosHorizons.y.mul( cosHorizons.y ) ) );
				const occlusion = nx.mul( nxb ).add( ny.mul( nyb ) );
				ao = ao.add( occlusion );

			} );

			ao = clamp( ao.div( DIRECTIONS ), 0, 1 );
			ao = pow( ao, this.scale );

			return vec4( vec3( ao ), 1.0 );

		} );

		const outputNode = ao();

		return outputNode;

	}

	generateNoise( size = 64 ) {

		const simplex = new Noise();

		const arraySize = size * size * 4;
		const data = new Uint8Array( arraySize );

		for ( let i = 0; i < size; i ++ ) {

			for ( let j = 0; j < size; j ++ ) {

				const x = i;
				const y = j;

				data[ ( i * size + j ) * 4 ] = ( simplex.noise2d( x, y ) * 0.5 + 0.5 ) * 255;
				data[ ( i * size + j ) * 4 + 1 ] = ( simplex.noise2d( x + size, y ) * 0.5 + 0.5 ) * 255;
				data[ ( i * size + j ) * 4 + 2 ] = ( simplex.noise2d( x, y + size ) * 0.5 + 0.5 ) * 255;
				data[ ( i * size + j ) * 4 + 3 ] = ( simplex.noise2d( x + size, y + size ) * 0.5 + 0.5 ) * 255;

			}

		}

		const noiseTexture = new DataTexture( data, size, size );
		noiseTexture.wrapS = RepeatWrapping;
		noiseTexture.wrapT = RepeatWrapping;
		noiseTexture.needsUpdate = true;

		return noiseTexture;

	}

}

function generateMagicSquareNoise( size = 5 ) {

	const noiseSize = Math.floor( size ) % 2 === 0 ? Math.floor( size ) + 1 : Math.floor( size );
	const magicSquare = generateMagicSquare( noiseSize );
	const noiseSquareSize = magicSquare.length;
	const data = new Uint8Array( noiseSquareSize * 4 );

	for ( let inx = 0; inx < noiseSquareSize; ++ inx ) {

		const iAng = magicSquare[ inx ];
		const angle = ( 2 * Math.PI * iAng ) / noiseSquareSize;
		const randomVec = new Vector3(
			Math.cos( angle ),
			Math.sin( angle ),
			0
		).normalize();
		data[ inx * 4 ] = ( randomVec.x * 0.5 + 0.5 ) * 255;
		data[ inx * 4 + 1 ] = ( randomVec.y * 0.5 + 0.5 ) * 255;
		data[ inx * 4 + 2 ] = 127;
		data[ inx * 4 + 3 ] = 255;

	}

	const noiseTexture = new DataTexture( data, noiseSize, noiseSize );
	noiseTexture.wrapS = RepeatWrapping;
	noiseTexture.wrapT = RepeatWrapping;
	noiseTexture.needsUpdate = true;

	return noiseTexture;

}

function generateMagicSquare( size ) {

	const noiseSize = Math.floor( size ) % 2 === 0 ? Math.floor( size ) + 1 : Math.floor( size );
	const noiseSquareSize = noiseSize * noiseSize;
	const magicSquare = Array( noiseSquareSize ).fill( 0 );
	let i = Math.floor( noiseSize / 2 );
	let j = noiseSize - 1;

	for ( let num = 1; num <= noiseSquareSize; ) {

		if ( i === - 1 && j === noiseSize ) {

			j = noiseSize - 2;
			i = 0;

		} else {

			if ( j === noiseSize ) {

				j = 0;

			}

			if ( i < 0 ) {

				i = noiseSize - 1;

			}

		}

		if ( magicSquare[ i * noiseSize + j ] !== 0 ) {

			j -= 2;
			i ++;
			continue;

		} else {

			magicSquare[ i * noiseSize + j ] = num ++;

		}

		j ++;
		i --;

	}

	return magicSquare;

}

export const ao = ( node, depthNode, normalNode ) => nodeObject( new GTAONode( nodeObject( node ).toTexture(), nodeObject( depthNode ), nodeObject( normalNode ) ) );

addNodeElement( 'ao', ao );

export default GTAONode;
