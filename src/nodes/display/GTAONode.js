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
import { PI, cos, sin, pow, clamp, abs, max, mix, sqrt, acos, dot, normalize, cross } from '../math/MathNode.js';
import { div, mul, add, sub } from '../math/OperatorNode.js';
import { loop } from '../utils/LoopNode.js';
import { passTexture } from './PassNode.js';
import { RepeatWrapping } from '../../constants.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';
import { RenderTarget } from '../../core/RenderTarget.js';
import { Color } from '../../math/Color.js';

const _quadMesh = new QuadMesh();
const _currentClearColor = new Color();

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

		this._aoRenderTarget = new RenderTarget();
		this._aoRenderTarget.texture.name = 'GTAONode.AO';

		this._material = null;
		this._textureNode = passTexture( this, this._aoRenderTarget.texture );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	getTextureNode() {

		return this._textureNode;

	}

	setSize( width, height ) {

		this.resolution.value.set( width, height );
		this._aoRenderTarget.setSize( width, height );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const textureNode = this.textureNode;
		const map = textureNode.value;

		const currentRenderTarget = renderer.getRenderTarget();
		const currentMRT = renderer.getMRT();
		renderer.getClearColor( _currentClearColor );
		const currentClearAlpha = renderer.getClearAlpha();


		const currentTexture = textureNode.value;

		_quadMesh.material = this._material;

		this.setSize( map.image.width, map.image.height );


		const textureType = map.type;

		this._aoRenderTarget.texture.type = textureType;

		// clear

		renderer.setMRT( null );
		renderer.setClearColor( 0xffffff, 1 );

		// ao

		renderer.setRenderTarget( this._aoRenderTarget );
		_quadMesh.render( renderer );

		// restore

		renderer.setRenderTarget( currentRenderTarget );
		renderer.setMRT( currentMRT );
		renderer.setClearColor( _currentClearColor, currentClearAlpha );
		textureNode.value = currentTexture;

	}

	setup( builder ) {

		const { textureNode, depthNode, normalNode, noiseNode } = this;

		const uvNode = uv();

		// const sampleTexture = ( uv ) => textureNode.uv( uv );
		const sampleDepth = ( uv ) => depthNode.uv( uv ).x;
		const sampleNormal = ( uv ) => normalNode.uv( uv );
		const sampleNoise = ( uv ) => noiseNode.uv( uv );

		const getSceneUvAndDepth = tslFn( ( [ sampleViewPos ] )=> {

			const sampleClipPos = cameraProjectionMatrix.mul( sampleViewPos, 1.0 );
			const sampleUv = sampleClipPos.xy.div( sampleClipPos.w.mul( 0.5 ).add( 0.5 ) );
			const sampleSceneDepth = sampleDepth( sampleUv );
			return vec3( sampleUv, sampleSceneDepth );

		} );

		const getViewPosition = tslFn( ( [ screenPosition, depth ] ) => {

			const clipSpacePosition = vec4( vec3( screenPosition, depth ).mul( 2.0 ).sub( 1.0 ), 1.0 ).toVar();
			const viewSpacePosition = vec4( cameraProjectionMatrixInverse.mul( clipSpacePosition ) ).toVar();

			return viewSpacePosition.xyz.div( viewSpacePosition.w );

		} ).setLayout( {
			name: 'getViewPosition',
			type: 'vec3',
			inputs: [
				{ name: 'screenPosition', type: 'vec2', qualifier: 'in' },
				{ name: 'depth', type: 'float', qualifier: 'in' }
			]
		} );

		const ao = tslFn( () => {

			const depth = sampleDepth( uvNode );

			depth.greaterThanEqual( 1.0 ).discard();

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
			const STEPS = add( this.SAMPLES, DIRECTIONS.sub( 1 ) ).div( DIRECTIONS );

			let ao = float( 0 );

			loop( DIRECTIONS, ( { i } ) => {

				const angle = float( i ).div( float( DIRECTIONS ).mul( PI ) );
				const sampleDir = vec4( cos( angle ), sin( angle ), 0., add( 0.5, mul( 0.5, noiseTexel.w ) ) );
				sampleDir.xyz = normalize( kernelMatrix.mul( sampleDir.xyz ) );

				const viewDir = normalize( viewPosition.xyz.negate() );
				const sliceBitangent = normalize( cross( sampleDir.xyz, viewDir ) );
				const sliceTangent = cross( sliceBitangent, viewDir );
				const normalInSlice = normalize( viewNormal.sub( sliceBitangent.mul( dot( viewNormal, sliceBitangent ) ) ) );

				const tangentToNormalInSlice = cross( normalInSlice, sliceBitangent );
				const cosHorizons = vec2( dot( viewDir, tangentToNormalInSlice ), dot( viewDir, tangentToNormalInSlice.negate() ) );

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

				const sinHorizons = sqrt( sub( 1., cosHorizons.mul( cosHorizons ) ) );
				const nx = dot( normalInSlice, sliceTangent );
				const ny = dot( normalInSlice, viewDir );
				const nxb = div( 1.0, mul( 2.0, acos( cosHorizons.y ).sub( acos( cosHorizons.x ) ).add( sinHorizons.x.mul( cosHorizons.x ).sub( sinHorizons.y.mul( cosHorizons.y ) ) ) ) );
				const nyb = div( 1.0, mul( 2.0, sub( 2.0, cosHorizons.x.mul( cosHorizons.x ) ).sub( cosHorizons.y.mul( cosHorizons.y ) ) ) );
				const occlusion = nx.mul( nxb ).add( ny.mul( nyb ) );
				ao.addAssign( occlusion );

			} );

			ao = clamp( ao.div( DIRECTIONS ), 0, 1 );
			ao = pow( ao, this.scale );

			return vec4( vec3( ao ), 1.0 );

		} );

		const material = this._material || ( this._material = builder.createNodeMaterial() );
		material.fragmentNode = ao().context( builder.getSharedContext() );
		material.needsUpdate = true;

		//

		const properties = builder.getNodeProperties( this );
		properties.textureNode = textureNode;

		//

		return this._textureNode;

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
