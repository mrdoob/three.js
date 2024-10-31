import { Vector2, Vector3 } from 'three';
import { getNormalFromDepth, getViewPosition, convertToTexture, TempNode, nodeObject, Fn, float, NodeUpdateType, uv, uniform, Loop, luminance, vec2, vec3, vec4, uniformArray, int, dot, max, pow, abs, If, textureSize, sin, cos, mat2, PI } from 'three/tsl';

class DenoiseNode extends TempNode {

	static get type() {

		return 'DenoiseNode';

	}

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
		this._sampleVectors = uniformArray( generatePdSamplePointInitializer( 16, 2, 1 ) );

		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	updateBefore() {

		const map = this.textureNode.value;

		this._resolution.value.set( map.image.width, map.image.height );

	}

	setup() {

		const uvNode = uv();

		const sampleTexture = ( uv ) => this.textureNode.uv( uv );
		const sampleDepth = ( uv ) => this.depthNode.uv( uv ).x;
		const sampleNormal = ( uv ) => ( this.normalNode !== null ) ? this.normalNode.uv( uv ).rgb.normalize() : getNormalFromDepth( uv, this.depthNode.value, this.cameraProjectionMatrixInverse );
		const sampleNoise = ( uv ) => this.noiseNode.uv( uv );

		const denoiseSample = Fn( ( [ center, viewNormal, viewPosition, sampleUv ] ) => {

			const texel = sampleTexture( sampleUv ).toVar();
			const depth = sampleDepth( sampleUv ).toVar();
			const normal = sampleNormal( sampleUv ).toVar();
			const neighborColor = texel.rgb;
			const viewPos = getViewPosition( sampleUv, depth, this.cameraProjectionMatrixInverse ).toVar();

			const normalDiff = dot( viewNormal, normal ).toVar();
			const normalSimilarity = pow( max( normalDiff, 0 ), this.normalPhi ).toVar();
			const lumaDiff = abs( luminance( neighborColor ).sub( luminance( center ) ) ).toVar();
			const lumaSimilarity = max( float( 1.0 ).sub( lumaDiff.div( this.lumaPhi ) ), 0 ).toVar();
			const depthDiff = abs( dot( viewPosition.sub( viewPos ), viewNormal ) ).toVar();
			const depthSimilarity = max( float( 1.0 ).sub( depthDiff.div( this.depthPhi ) ), 0 );
			const w = lumaSimilarity.mul( depthSimilarity ).mul( normalSimilarity );

			return vec4( neighborColor.mul( w ), w );

		} );

		const denoise = Fn( ( [ uvNode ] ) => {

			const depth = sampleDepth( uvNode ).toVar();
			const viewNormal = sampleNormal( uvNode ).toVar();

			const texel = sampleTexture( uvNode ).toVar();

			If( depth.greaterThanEqual( 1.0 ).or( dot( viewNormal, viewNormal ).equal( 0.0 ) ), () => {

				return texel;

			} );

			const center = vec3( texel.rgb ).toVar();

			const viewPosition = getViewPosition( uvNode, depth, this.cameraProjectionMatrixInverse ).toVar();

			const noiseResolution = textureSize( this.noiseNode, 0 );
			let noiseUv = vec2( uvNode.x, uvNode.y.oneMinus() );
			noiseUv = noiseUv.mul( this._resolution.div( noiseResolution ) );
			const noiseTexel = sampleNoise( noiseUv ).toVar();

			const x = sin( noiseTexel.element( this.index.mod( 4 ).mul( 2 ).mul( PI ) ) ).toVar();
			const y = cos( noiseTexel.element( this.index.mod( 4 ).mul( 2 ).mul( PI ) ) ).toVar();

			const noiseVec = vec2( x, y ).toVar();
			const rotationMatrix = mat2( noiseVec.x, noiseVec.y.negate(), noiseVec.x, noiseVec.y ).toVar();

			const totalWeight = float( 1.0 ).toVar();
			const denoised = vec3( texel.rgb ).toVar();

			Loop( { start: int( 0 ), end: int( 16 ), type: 'int', condition: '<' }, ( { i } ) => {

				const sampleDir = this._sampleVectors.element( i ).toVar();
				const offset = rotationMatrix.mul( sampleDir.xy.mul( float( 1.0 ).add( sampleDir.z.mul( this.radius.sub( 1 ) ) ) ) ).div( this._resolution ).toVar();
				const sampleUv = uvNode.add( offset ).toVar();

				const result = denoiseSample( center, viewNormal, viewPosition, sampleUv );

				denoised.addAssign( result.xyz );
				totalWeight.addAssign( result.w );

			} );

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

		const output = Fn( () => {

			return denoise( uvNode );

		} );

		const outputNode = output();

		return outputNode;

	}

}

export default DenoiseNode;

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

export const denoise = ( node, depthNode, normalNode, noiseNode, camera ) => nodeObject( new DenoiseNode( convertToTexture( node ), nodeObject( depthNode ), nodeObject( normalNode ), nodeObject( noiseNode ), camera ) );
