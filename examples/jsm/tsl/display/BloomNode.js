import { HalfFloatType, RenderTarget, Vector2, Vector3, TempNode, QuadMesh, NodeMaterial, RendererUtils, NodeUpdateType } from 'three/webgpu';
import { nodeObject, Fn, float, uv, passTexture, uniform, Loop, texture, luminance, smoothstep, mix, vec4, uniformArray, add, int } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

const _BlurDirectionX = /*@__PURE__*/ new Vector2( 1.0, 0.0 );
const _BlurDirectionY = /*@__PURE__*/ new Vector2( 0.0, 1.0 );

let _rendererState;

/**
 * Post processing node for creating a bloom effect.
 * ```js
 * const renderPipeline = new THREE.RenderPipeline( renderer );
 *
 * const scenePass = pass( scene, camera );
 * const scenePassColor = scenePass.getTextureNode( 'output' );
 *
 * const bloomPass = bloom( scenePassColor );
 *
 * renderPipeline.outputNode = scenePassColor.add( bloomPass );
 * ```
 * By default, the node affects the entire image. For a selective bloom,
 * use the `emissive` material property to control which objects should
 * contribute to bloom or not. This can be achieved via MRT.
 * ```js
 * const renderPipeline = new THREE.RenderPipeline( renderer );
 *
 * const scenePass = pass( scene, camera );
 * scenePass.setMRT( mrt( {
 * 	output,
 * 	emissive
 * } ) );
 *
 * const scenePassColor = scenePass.getTextureNode( 'output' );
 * const emissivePass = scenePass.getTextureNode( 'emissive' );
 *
 * const bloomPass = bloom( emissivePass );
 * renderPipeline.outputNode = scenePassColor.add( bloomPass );
 * ```
 * @augments TempNode
 * @three_import import { bloom } from 'three/addons/tsl/display/BloomNode.js';
 */
class BloomNode extends TempNode {

	static get type() {

		return 'BloomNode';

	}

	/**
	 * Constructs a new bloom node.
	 *
	 * @param {Node<vec4>} inputNode - The node that represents the input of the effect.
	 * @param {number} [strength=1] - The strength of the bloom.
	 * @param {number} [radius=0] - The radius of the bloom.
	 * @param {number} [threshold=0] - The luminance threshold limits which bright areas contribute to the bloom effect.
	 */
	constructor( inputNode, strength = 1, radius = 0, threshold = 0 ) {

		super( 'vec4' );

		/**
		 * The node that represents the input of the effect.
		 *
		 * @type {Node<vec4>}
		 */
		this.inputNode = inputNode;

		/**
		 * The strength of the bloom.
		 *
		 * @type {UniformNode<float>}
		 */
		this.strength = uniform( strength );

		/**
		 * The radius of the bloom. Must be in the range `[0,1]`.
		 *
		 * @type {UniformNode<float>}
		 */
		this.radius = uniform( radius );

		/**
		 * The luminance threshold limits which bright areas contribute to the bloom effect.
		 *
		 * @type {UniformNode<float>}
		 */
		this.threshold = uniform( threshold );

		/**
		 * Can be used to tweak the extracted luminance from the scene.
		 *
		 * @type {UniformNode<float>}
		 */
		this.smoothWidth = uniform( 0.01 );

		/**
		 * An array that holds the render targets for the horizontal blur passes.
		 *
		 * @private
		 * @type {Array<RenderTarget>}
		 */
		this._renderTargetsHorizontal = [];

		/**
		 * An array that holds the render targets for the vertical blur passes.
		 *
		 * @private
		 * @type {Array<RenderTarget>}
		 */
		this._renderTargetsVertical = [];

		/**
		 * The number if blur mips.
		 *
		 * @private
		 * @type {number}
		 */
		this._nMips = 5;

		/**
		 * The render target for the luminance pass.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._renderTargetBright = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._renderTargetBright.texture.name = 'UnrealBloomPass.bright';
		this._renderTargetBright.texture.generateMipmaps = false;

		//

		for ( let i = 0; i < this._nMips; i ++ ) {

			const renderTargetHorizontal = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );

			renderTargetHorizontal.texture.name = 'UnrealBloomPass.h' + i;
			renderTargetHorizontal.texture.generateMipmaps = false;

			this._renderTargetsHorizontal.push( renderTargetHorizontal );

			const renderTargetVertical = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );

			renderTargetVertical.texture.name = 'UnrealBloomPass.v' + i;
			renderTargetVertical.texture.generateMipmaps = false;

			this._renderTargetsVertical.push( renderTargetVertical );

		}

		/**
		 * The material for the composite pass.
		 *
		 * @private
		 * @type {?NodeMaterial}
		 */
		this._compositeMaterial = null;

		/**
		 * The material for the luminance pass.
		 *
		 * @private
		 * @type {?NodeMaterial}
		 */
		this._highPassFilterMaterial = null;

		/**
		 * The materials for the blur pass.
		 *
		 * @private
		 * @type {Array<NodeMaterial>}
		 */
		this._separableBlurMaterials = [];

		/**
		 * The result of the luminance pass as a texture node for further processing.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._textureNodeBright = texture( this._renderTargetBright.texture );

		/**
		 * The result of the first blur pass as a texture node for further processing.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._textureNodeBlur0 = texture( this._renderTargetsVertical[ 0 ].texture );

		/**
		 * The result of the second blur pass as a texture node for further processing.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._textureNodeBlur1 = texture( this._renderTargetsVertical[ 1 ].texture );

		/**
		 * The result of the third blur pass as a texture node for further processing.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._textureNodeBlur2 = texture( this._renderTargetsVertical[ 2 ].texture );

		/**
		 * The result of the fourth blur pass as a texture node for further processing.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._textureNodeBlur3 = texture( this._renderTargetsVertical[ 3 ].texture );

		/**
		 * The result of the fifth blur pass as a texture node for further processing.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._textureNodeBlur4 = texture( this._renderTargetsVertical[ 4 ].texture );

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureOutput = passTexture( this, this._renderTargetsHorizontal[ 0 ].texture );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	/**
	 * Returns the result of the effect as a texture node.
	 *
	 * @return {PassTextureNode} A texture node that represents the result of the effect.
	 */
	getTextureNode() {

		return this._textureOutput;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		let resx = Math.round( width / 2 );
		let resy = Math.round( height / 2 );

		this._renderTargetBright.setSize( resx, resy );

		for ( let i = 0; i < this._nMips; i ++ ) {

			this._renderTargetsHorizontal[ i ].setSize( resx, resy );
			this._renderTargetsVertical[ i ].setSize( resx, resy );

			this._separableBlurMaterials[ i ].invSize.value.set( 1 / resx, 1 / resy );

			resx = Math.round( resx / 2 );
			resy = Math.round( resy / 2 );

		}

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		// 1. Extract bright areas

		renderer.setRenderTarget( this._renderTargetBright );
		_quadMesh.material = this._highPassFilterMaterial;
		_quadMesh.name = 'Bloom [ High Pass ]';
		_quadMesh.render( renderer );

		// 2. Blur all the mips progressively

		let inputRenderTarget = this._renderTargetBright;

		for ( let i = 0; i < this._nMips; i ++ ) {

			_quadMesh.material = this._separableBlurMaterials[ i ];

			this._separableBlurMaterials[ i ].colorTexture.value = inputRenderTarget.texture;
			this._separableBlurMaterials[ i ].direction.value = _BlurDirectionX;
			renderer.setRenderTarget( this._renderTargetsHorizontal[ i ] );
			_quadMesh.name = `Bloom [ Blur Horizontal - ${ i } ]`;
			_quadMesh.render( renderer );

			this._separableBlurMaterials[ i ].colorTexture.value = this._renderTargetsHorizontal[ i ].texture;
			this._separableBlurMaterials[ i ].direction.value = _BlurDirectionY;
			renderer.setRenderTarget( this._renderTargetsVertical[ i ] );
			_quadMesh.name = `Bloom [ Blur Vertical - ${ i } ]`;
			_quadMesh.render( renderer );

			inputRenderTarget = this._renderTargetsVertical[ i ];

		}

		// 3. Composite all the mips

		renderer.setRenderTarget( this._renderTargetsHorizontal[ 0 ] );
		_quadMesh.material = this._compositeMaterial;
		_quadMesh.name = 'Bloom [ Composite ]';
		_quadMesh.render( renderer );

		// restore

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		// luminosity high pass material

		const luminosityHighPass = Fn( () => {

			const texel = this.inputNode;
			const v = luminance( texel.rgb );

			const alpha = smoothstep( this.threshold, this.threshold.add( this.smoothWidth ), v );

			return mix( vec4( 0 ), texel, alpha );

		} );

		this._highPassFilterMaterial = this._highPassFilterMaterial || new NodeMaterial();
		this._highPassFilterMaterial.fragmentNode = luminosityHighPass().context( builder.getSharedContext() );
		this._highPassFilterMaterial.name = 'Bloom_highPass';
		this._highPassFilterMaterial.needsUpdate = true;

		// gaussian blur materials

		// These sizes have been changed to account for the altered coefficients-calculation to avoid blockiness,
		// while retaining the same blur-strength. For details see https://github.com/mrdoob/three.js/pull/31528
		const kernelSizeArray = [ 6, 10, 14, 18, 22 ];

		for ( let i = 0; i < this._nMips; i ++ ) {

			this._separableBlurMaterials.push( this._getSeparableBlurMaterial( builder, kernelSizeArray[ i ] ) );

		}

		// composite material

		const bloomFactors = uniformArray( [ 1.0, 0.8, 0.6, 0.4, 0.2 ] );
		const bloomTintColors = uniformArray( [ new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ) ] );

		const lerpBloomFactor = Fn( ( [ factor, radius ] ) => {

			const mirrorFactor = float( 1.2 ).sub( factor );
			return mix( factor, mirrorFactor, radius );

		} ).setLayout( {
			name: 'lerpBloomFactor',
			type: 'float',
			inputs: [
				{ name: 'factor', type: 'float' },
				{ name: 'radius', type: 'float' },
			]
		} );


		const compositePass = Fn( () => {

			const color0 = lerpBloomFactor( bloomFactors.element( 0 ), this.radius ).mul( vec4( bloomTintColors.element( 0 ), 1.0 ) ).mul( this._textureNodeBlur0 );
			const color1 = lerpBloomFactor( bloomFactors.element( 1 ), this.radius ).mul( vec4( bloomTintColors.element( 1 ), 1.0 ) ).mul( this._textureNodeBlur1 );
			const color2 = lerpBloomFactor( bloomFactors.element( 2 ), this.radius ).mul( vec4( bloomTintColors.element( 2 ), 1.0 ) ).mul( this._textureNodeBlur2 );
			const color3 = lerpBloomFactor( bloomFactors.element( 3 ), this.radius ).mul( vec4( bloomTintColors.element( 3 ), 1.0 ) ).mul( this._textureNodeBlur3 );
			const color4 = lerpBloomFactor( bloomFactors.element( 4 ), this.radius ).mul( vec4( bloomTintColors.element( 4 ), 1.0 ) ).mul( this._textureNodeBlur4 );

			const sum = color0.add( color1 ).add( color2 ).add( color3 ).add( color4 );

			return sum.mul( this.strength );

		} );

		this._compositeMaterial = this._compositeMaterial || new NodeMaterial();
		this._compositeMaterial.fragmentNode = compositePass().context( builder.getSharedContext() );
		this._compositeMaterial.name = 'Bloom_comp';
		this._compositeMaterial.needsUpdate = true;

		//

		return this._textureOutput;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		for ( let i = 0; i < this._renderTargetsHorizontal.length; i ++ ) {

			this._renderTargetsHorizontal[ i ].dispose();

		}

		for ( let i = 0; i < this._renderTargetsVertical.length; i ++ ) {

			this._renderTargetsVertical[ i ].dispose();

		}

		this._renderTargetBright.dispose();

		if ( this._highPassFilterMaterial !== null ) this._highPassFilterMaterial.dispose();
		if ( this._compositeMaterial !== null ) this._compositeMaterial.dispose();

		for ( let i = 0; i < this._separableBlurMaterials.length; i ++ ) {

			this._separableBlurMaterials[ i ].dispose();

		}

	}

	/**
	 * Create a separable blur material for the given kernel radius.
	 *
	 * @private
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {number} kernelRadius - The kernel radius.
	 * @return {NodeMaterial}
	 */
	_getSeparableBlurMaterial( builder, kernelRadius ) {

		const coefficients = [];
		const sigma = kernelRadius / 3;

		for ( let i = 0; i < kernelRadius; i ++ ) {

			coefficients.push( 0.39894 * Math.exp( - 0.5 * i * i / ( sigma * sigma ) ) / sigma );

		}

		//

		const colorTexture = texture( null );
		const gaussianCoefficients = uniformArray( coefficients );
		const invSize = uniform( new Vector2() );
		const direction = uniform( new Vector2( 0.5, 0.5 ) );

		const uvNode = uv();
		const sampleTexel = ( uv ) => colorTexture.sample( uv );

		const separableBlurPass = Fn( () => {

			const diffuseSum = sampleTexel( uvNode ).rgb.mul( gaussianCoefficients.element( 0 ) ).toVar();

			Loop( { start: int( 1 ), end: int( kernelRadius ), type: 'int', condition: '<' }, ( { i } ) => {

				const x = float( i );
				const w = gaussianCoefficients.element( i );
				const uvOffset = direction.mul( invSize ).mul( x );
				const sample1 = sampleTexel( uvNode.add( uvOffset ) ).rgb;
				const sample2 = sampleTexel( uvNode.sub( uvOffset ) ).rgb;
				diffuseSum.addAssign( add( sample1, sample2 ).mul( w ) );

			} );

			return vec4( diffuseSum, 1.0 );

		} );

		const separableBlurMaterial = new NodeMaterial();
		separableBlurMaterial.fragmentNode = separableBlurPass().context( builder.getSharedContext() );
		separableBlurMaterial.name = 'Bloom_separable';
		separableBlurMaterial.needsUpdate = true;

		// uniforms
		separableBlurMaterial.colorTexture = colorTexture;
		separableBlurMaterial.direction = direction;
		separableBlurMaterial.invSize = invSize;

		return separableBlurMaterial;

	}

}

/**
 * TSL function for creating a bloom effect.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {number} [strength=1] - The strength of the bloom.
 * @param {number} [radius=0] - The radius of the bloom.
 * @param {number} [threshold=0] - The luminance threshold limits which bright areas contribute to the bloom effect.
 * @returns {BloomNode}
 */
export const bloom = ( node, strength, radius, threshold ) => new BloomNode( nodeObject( node ), strength, radius, threshold );

export default BloomNode;
