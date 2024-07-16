import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UVNode.js';
import { addNodeElement, tslFn, nodeObject, float, int, vec2, vec3, vec4, mat2, If } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { uniforms } from '../accessors/UniformsNode.js';
import { abs, dot, sin, cos, PI, pow, max } from '../math/MathNode.js';
import { loop } from '../utils/LoopNode.js';
import { luminance } from './ColorAdjustmentNode.js';
import { textureSize } from '../accessors/TextureSizeNode.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector3 } from '../../math/Vector3.js';

class DenoiseNode extends TempNode {

	constructor( textureNode, depthNode, normalNode, noiseNode, camera ) {

		super();

		this.textureNode = textureNode;
		this.depthNode = depthNode;
		this.normalNode = normalNode;
		this.noiseNode = noiseNode;

		this.cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );
		this.lumaPhi = uniform( 5 );
		this.depthPhi = uniform( 5 );
		this.normalPhi = uniform( 5 );
		this.radius = uniform( 5 );
		this.index = uniform( 0 );

		this._resolution = uniform( new Vector2() );
		this._sampleVectors = uniforms( generatePdSamplePointInitializer( 16, 2, 1 ) );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	updateBefore() {

		const map = this.textureNode.value;

		this._resolution.value.set( map.image.width, map.image.height );

	}

	setup() {

		const uvNode = uv();

		const sampleTexture = ( uv ) => this.textureNode.uv( uv );
		const sampleDepth = ( uv ) => this.depthNode.uv( uv ).x;
		const sampleNormal = ( uv ) => this.normalNode.uv( uv );
		const sampleNoise = ( uv ) => this.noiseNode.uv( uv );

		const getViewPosition = tslFn( ( [ screenPosition, depth ] ) => {

			screenPosition = vec2( screenPosition.x, screenPosition.y.oneMinus() ).mul( 2.0 ).sub( 1.0 );

			const clipSpacePosition = vec4( vec3( screenPosition, depth ), 1.0 );
			const viewSpacePosition = vec4( this.cameraProjectionMatrixInverse.mul( clipSpacePosition ) );

			return viewSpacePosition.xyz.div( viewSpacePosition.w );

		} );

		const denoiseSample = tslFn( ( [ center, viewNormal, viewPosition, sampleUv ] ) => {

			const texel = sampleTexture( sampleUv );
			const depth = sampleDepth( sampleUv );
			const normal = sampleNormal( sampleUv ).rgb.normalize();
			const neighborColor = texel.rgb;
			const viewPos = getViewPosition( sampleUv, depth );

			const normalDiff = dot( viewNormal, normal ).toVar();
			const normalSimilarity = pow( max( normalDiff, 0 ), this.normalPhi ).toVar();
			const lumaDiff = abs( luminance( neighborColor ).sub( luminance( center ) ) ).toVar();
			const lumaSimilarity = max( float( 1.0 ).sub( lumaDiff.div( this.lumaPhi ) ), 0 ).toVar();
			const depthDiff = abs( dot( viewPosition.sub( viewPos ), viewNormal ) ).toVar();
			const depthSimilarity = max( float( 1.0 ).sub( depthDiff.div( this.depthPhi ) ), 0 );
			const w = lumaSimilarity.mul( depthSimilarity ).mul( normalSimilarity );

			return vec4( neighborColor.mul( w ), w );

		} );

		const denoise = tslFn( ( [ uvNode ] ) => {

			const depth = sampleDepth( uvNode );
			const viewNormal = sampleNormal( uvNode ).rgb.normalize();

			const texel = sampleTexture( uvNode );

			If( depth.greaterThanEqual( 1.0 ).or( dot( viewNormal, viewNormal ).equal( 0.0 ) ), () => {

				return texel;

			} );

			const center = vec3( texel.rgb );

			const viewPosition = getViewPosition( uvNode, depth );

			const noiseResolution = textureSize( this.noiseNode, 0 );
			let noiseUv = vec2( uvNode.x, uvNode.y.oneMinus() );
			noiseUv = noiseUv.mul( this._resolution.div( noiseResolution ) );
			const noiseTexel = sampleNoise( noiseUv );

			const x = sin( noiseTexel.element( this.index.mod( 4 ).mul( 2 ).mul( PI ) ) );
			const y = cos( noiseTexel.element( this.index.mod( 4 ).mul( 2 ).mul( PI ) ) );

			const noiseVec = vec2( x, y );
			const rotationMatrix = mat2( noiseVec.x, noiseVec.y.negate(), noiseVec.x, noiseVec.y );

			const totalWeight = float( 1.0 ).toVar();
			const denoised = vec3( texel.rgb ).toVar();

			loop( { start: int( 0 ), end: int( 16 ), type: 'int', condition: '<' }, ( { i } ) => {

				const sampleDir = this._sampleVectors.element( i ).toVar();
				const offset = rotationMatrix.mul( sampleDir.xy.mul( float( 1.0 ).add( sampleDir.z.mul( this.radius.sub( 1 ) ) ) ) ).div( this._resolution ).toVar();
				const sampleUv = uvNode.add( offset ).toVar();

				const result = denoiseSample( center, viewNormal, viewPosition, sampleUv );

				denoised.addAssign( result.xyz );
				totalWeight.addAssign( result.w );

			} );

			If( totalWeight.greaterThan( float( 0 ) ), () => {

				denoised.divAssign( totalWeight );

			} );

			return vec4( denoised, texel.a );

		} ).setLayout( {
			name: 'denoise',
			type: 'vec4',
			inputs: [
				{ name: 'uv', type: 'vec2' }
			]
		} );

		const output = tslFn( () => {

			return denoise( uvNode );

		} );

		const outputNode = output();

		return outputNode;

	}

}

function generatePdSamplePointInitializer( samples, rings, radiusExponent ) {

	const poissonDisk = generateDenoiseSamples( samples, rings, radiusExponent );

	const array = [];

	for ( let i = 0; i < samples; i ++ ) {

		const sample = poissonDisk[ i ];
		array.push( sample );

	}

	return array;

}

function generateDenoiseSamples( numSamples, numRings, radiusExponent ) {

	const samples = [];

	for ( let i = 0; i < numSamples; i ++ ) {

		const angle = 2 * Math.PI * numRings * i / numSamples;
		const radius = Math.pow( i / ( numSamples - 1 ), radiusExponent );
		samples.push( new Vector3( Math.cos( angle ), Math.sin( angle ), radius ) );

	}

	return samples;

}

export const denoise = ( node, depthNode, normalNode, noiseNode, camera ) => nodeObject( new DenoiseNode( nodeObject( node ).toTexture(), nodeObject( depthNode ), nodeObject( normalNode ), nodeObject( noiseNode ), camera ) );

addNodeElement( 'denoise', denoise );

export default DenoiseNode;
