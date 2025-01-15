import { DataTexture, RepeatWrapping, Vector2, Vector3, TempNode } from 'three/webgpu';
import { texture, getNormalFromDepth, getViewPosition, convertToTexture, nodeObject, Fn, float, NodeUpdateType, uv, uniform, Loop, luminance, vec2, vec3, vec4, uniformArray, int, dot, max, pow, abs, If, textureSize, sin, cos, mat2, PI } from 'three/tsl';
import { SimplexNoise } from '../../math/SimplexNoise.js';

/** @module DenoiseNode **/

/**
 * Post processing node for denoising data like raw screen-space ambient occlusion output.
 * Denoise can noticeably improve the quality of ambient occlusion but also add quite some
 * overhead to the post processing setup. It's best to make its usage optional (e.g. via
 * graphic settings).
 *
 * Reference: {@link https://openaccess.thecvf.com/content/WACV2021/papers/Khademi_Self-Supervised_Poisson-Gaussian_Denoising_WACV_2021_paper.pdf}.
 *
 * @augments TempNode
 */
class DenoiseNode extends TempNode {

	static get type() {

		return 'DenoiseNode';

	}

	/**
	 * Constructs a new denoise node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect (e.g. AO).
	 * @param {Node<float>} depthNode - A node that represents the scene's depth.
	 * @param {Node<vec3>?} normalNode - A node that represents the scene's normals.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 */
	constructor( textureNode, depthNode, normalNode, camera ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect (e.g. AO).
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * A node that represents the scene's depth.
		 *
		 * @type {Node<float>}
		 */
		this.depthNode = depthNode;

		/**
		 * A node that represents the scene's normals. If no normals are passed to the
		 * constructor (because MRT is not available), normals can be automatically
		 * reconstructed from depth values in the shader.
		 *
		 * @type {Node<vec3>?}
		 */
		this.normalNode = normalNode;

		/**
		 * The node represents the internal noise texture.
		 *
		 * @type {TextureNode}
		 */
		this.noiseNode = texture( generateDefaultNoise() );

		/**
		 * The luma Phi value.
		 *
		 * @type {UniformNode<float>}
		 */
		this.lumaPhi = uniform( 5 );

		/**
		 * The depth Phi value.
		 *
		 * @type {UniformNode<float>}
		 */
		this.depthPhi = uniform( 5 );

		/**
		 * The normal Phi value.
		 *
		 * @type {UniformNode<float>}
		 */
		this.normalPhi = uniform( 5 );

		/**
		 * The radius.
		 *
		 * @type {UniformNode<float>}
		 */
		this.radius = uniform( 5 );

		/**
		 * The index.
		 *
		 * @type {UniformNode<float>}
		 */
		this.index = uniform( 0 );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node updates
		 * its internal uniforms once per frame in `updateBefore()`.
		 *
		 * @type {String}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * The resolution of the effect.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._resolution = uniform( new Vector2() );

		/**
		 * An array of sample vectors.
		 *
		 * @private
		 * @type {UniformArrayNode<vec3>}
		 */
		this._sampleVectors = uniformArray( generateDenoiseSamples( 16, 2, 1 ) );

		/**
		 * Represents the inverse projection matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );

	}

	/**
	 * This method is used to update internal uniforms once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore() {

		const map = this.textureNode.value;

		this._resolution.value.set( map.image.width, map.image.height );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup( /* builder */ ) {

		const uvNode = uv();

		const sampleTexture = ( uv ) => this.textureNode.sample( uv );
		const sampleDepth = ( uv ) => this.depthNode.sample( uv ).x;
		const sampleNormal = ( uv ) => ( this.normalNode !== null ) ? this.normalNode.sample( uv ).rgb.normalize() : getNormalFromDepth( uv, this.depthNode.value, this._cameraProjectionMatrixInverse );
		const sampleNoise = ( uv ) => this.noiseNode.sample( uv );

		const denoiseSample = Fn( ( [ center, viewNormal, viewPosition, sampleUv ] ) => {

			const texel = sampleTexture( sampleUv ).toVar();
			const depth = sampleDepth( sampleUv ).toVar();
			const normal = sampleNormal( sampleUv ).toVar();
			const neighborColor = texel.rgb;
			const viewPos = getViewPosition( sampleUv, depth, this._cameraProjectionMatrixInverse ).toVar();

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

			const viewPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toVar();

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

/**
 * Generates denoise samples based on the given parameters.
 *
 * @param {Number} numSamples - The number of samples.
 * @param {Number} numRings - The number of rings.
 * @param {Number} radiusExponent - The radius exponent.
 * @return {Array<Vector3>} The denoise samples.
 */
function generateDenoiseSamples( numSamples, numRings, radiusExponent ) {

	const samples = [];

	for ( let i = 0; i < numSamples; i ++ ) {

		const angle = 2 * Math.PI * numRings * i / numSamples;
		const radius = Math.pow( i / ( numSamples - 1 ), radiusExponent );
		samples.push( new Vector3( Math.cos( angle ), Math.sin( angle ), radius ) );

	}

	return samples;

}

/**
 * Generates a default noise texture for the given size.
 *
 * @param {Number} [size=64] - The texture size.
 * @return {DataTexture} The generated noise texture.
 */
function generateDefaultNoise( size = 64 ) {

	const simplex = new SimplexNoise();

	const arraySize = size * size * 4;
	const data = new Uint8Array( arraySize );

	for ( let i = 0; i < size; i ++ ) {

		for ( let j = 0; j < size; j ++ ) {

			const x = i;
			const y = j;

			data[ ( i * size + j ) * 4 ] = ( simplex.noise( x, y ) * 0.5 + 0.5 ) * 255;
			data[ ( i * size + j ) * 4 + 1 ] = ( simplex.noise( x + size, y ) * 0.5 + 0.5 ) * 255;
			data[ ( i * size + j ) * 4 + 2 ] = ( simplex.noise( x, y + size ) * 0.5 + 0.5 ) * 255;
			data[ ( i * size + j ) * 4 + 3 ] = ( simplex.noise( x + size, y + size ) * 0.5 + 0.5 ) * 255;

		}

	}

	const noiseTexture = new DataTexture( data, size, size );
	noiseTexture.wrapS = RepeatWrapping;
	noiseTexture.wrapT = RepeatWrapping;
	noiseTexture.needsUpdate = true;

	return noiseTexture;

}

/**
 * TSL function for creating a denoise effect.
 *
 * @function
 * @param {Node} node - The node that represents the input of the effect (e.g. AO).
 * @param {Node<float>} depthNode - A node that represents the scene's depth.
 * @param {Node<vec3>?} normalNode - A node that represents the scene's normals.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {DenoiseNode}
 */
export const denoise = ( node, depthNode, normalNode, camera ) => nodeObject( new DenoiseNode( convertToTexture( node ), nodeObject( depthNode ), nodeObject( normalNode ), camera ) );
