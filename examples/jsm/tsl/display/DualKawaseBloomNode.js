import { HalfFloatType, RenderTarget, Vector2, TempNode, QuadMesh, NodeMaterial, RendererUtils, NodeUpdateType } from 'three/webgpu';
import { nodeObject, Fn, float, vec2, uv, passTexture, uniform, texture, luminance, smoothstep, mix, vec4 } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

const luminosityHighPass = Fn( ( { input, threshold, smoothWidth } ) => {

	const v = luminance( input.rgb );
	const alpha = smoothstep( threshold, threshold.add( smoothWidth ), v );

	return mix( vec4( 0 ), input, alpha );

} );

/**
 * Post processing node for creating a bloom effect.
 *
 * The bloom is produced with a Dual Kawase blur: the bright areas are
 * progressively downsampled with a 5-tap filter and then upsampled with an
 * 8-tap filter, accumulating the levels back together.
 * ```js
 * const renderPipeline = new THREE.RenderPipeline( renderer );
 *
 * const scenePass = pass( scene, camera );
 * const scenePassColor = scenePass.getTextureNode( 'output' );
 *
 * const bloomPass = dualKawaseBloom( scenePassColor );
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
 * const bloomPass = dualKawaseBloom( emissivePass );
 * renderPipeline.outputNode = scenePassColor.add( bloomPass );
 * ```
 * @augments TempNode
 * @three_import import { dualKawaseBloom } from 'three/addons/tsl/display/DualKawaseBloomNode.js';
 */
class DualKawaseBloomNode extends TempNode {

	static get type() {

		return 'DualKawaseBloomNode';

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
		this.strength = strength.isNode ? strength : uniform( strength );

		/**
		 * The radius of the bloom. Must be in the range `[0,1]`.
		 *
		 * @type {UniformNode<float>}
		 */
		this.radius = radius.isNode ? radius : uniform( radius );

		/**
		 * The luminance threshold limits which bright areas contribute to the bloom effect.
		 *
		 * @type {UniformNode<float>}
		 */
		this.threshold = threshold.isNode ? threshold : uniform( threshold );

		/**
		 * Can be used to tweak the extracted luminance from the scene.
		 *
		 * @type {UniformNode<float>}
		 */
		this.smoothWidth = uniform( 0.01 );

		/**
		 * Scale factor for the internal render targets.
		 *
		 * @private
		 * @type {number}
		 * @default 0.5
		 */
		this._resolutionScale = 0.5;

		/**
		 * Can be used to inject a custom high pass filter (e.g., for anamorphic effects).
		 *
		 * @type {Function}
		 */
		this.highPassFn = luminosityHighPass;

		/**
		 * The number of downsample / upsample levels in the Dual Kawase pyramid.
		 *
		 * @private
		 * @type {number}
		 */
		this._nMips = 6;

		/**
		 * Sample spread of the Dual Kawase filters. Kept small so each level's kernel
		 * stays round (a wide offset makes the diamond sampling pattern visible as a
		 * square halo); the bloom width comes from the depth of the pyramid instead.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._offset = uniform( 3 );

		/**
		 * Per-level mixing factors, redistributed by `radius` between a tight and a wide bloom.
		 * A linear ramp from `1.0` to `0.2` (mean `0.6`) keeps the total bloom energy constant
		 * as `radius` shifts weight between the fine and coarse levels.
		 *
		 * @private
		 * @type {Array<number>}
		 */
		this._bloomFactors = [];

		for ( let i = 0; i < this._nMips; i ++ ) {

			this._bloomFactors.push( this._nMips === 1 ? 0.6 : 1.0 - 0.8 * i / ( this._nMips - 1 ) );

		}

		/**
		 * The render target for the luminance pass.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._renderTargetBright = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._renderTargetBright.texture.name = 'DualKawaseBloom.bright';
		this._renderTargetBright.texture.generateMipmaps = false;

		/**
		 * The render targets for the downsample chain.
		 *
		 * @private
		 * @type {Array<RenderTarget>}
		 */
		this._downsampleRTs = [];

		/**
		 * The render targets for the upsample / accumulation chain.
		 *
		 * @private
		 * @type {Array<RenderTarget>}
		 */
		this._accumRTs = [];

		/**
		 * The resolution of each pyramid level.
		 *
		 * @private
		 * @type {Array<Vector2>}
		 */
		this._levelSizes = [];

		/**
		 * The resolution of the bright pass.
		 *
		 * @private
		 * @type {Vector2}
		 */
		this._brightSize = new Vector2();

		for ( let i = 0; i < this._nMips; i ++ ) {

			const downsampleRT = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
			downsampleRT.texture.name = 'DualKawaseBloom.down' + i;
			downsampleRT.texture.generateMipmaps = false;
			this._downsampleRTs.push( downsampleRT );

			const accumRT = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
			accumRT.texture.name = 'DualKawaseBloom.up' + i;
			accumRT.texture.generateMipmaps = false;
			this._accumRTs.push( accumRT );

			this._levelSizes.push( new Vector2() );

		}

		/**
		 * The material for the luminance pass.
		 *
		 * @private
		 * @type {?NodeMaterial}
		 */
		this._highPassFilterMaterial = null;

		/**
		 * The material for the downsample pass.
		 *
		 * @private
		 * @type {?NodeMaterial}
		 */
		this._downsampleMaterial = null;

		/**
		 * The material for the upsample / accumulation pass.
		 *
		 * @private
		 * @type {?NodeMaterial}
		 */
		this._upsampleMaterial = null;

		/**
		 * The result of the effect is represented as a separate texture node.
		 * The finest accumulation target holds the composited bloom.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureOutput = passTexture( this, this._accumRTs[ 0 ].texture );

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
	 * Sets the resolution scale for the pass.
	 * The resolution scale is a factor that is multiplied with the renderer's width and height.
	 *
	 * @param {number} resolutionScale - The resolution scale to set. A value of `1` means full resolution.
	 * @return {DualKawaseBloomNode} A reference to this node.
	 */
	setResolutionScale( resolutionScale ) {

		this._resolutionScale = resolutionScale;

		return this;

	}

	/**
	 * Gets the current resolution scale of the pass.
	 *
	 * @return {number} The current resolution scale. A value of `1` means full resolution.
	 */
	getResolutionScale() {

		return this._resolutionScale;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		const resx = Math.max( 1, Math.floor( width * this._resolutionScale ) );
		const resy = Math.max( 1, Math.floor( height * this._resolutionScale ) );

		this._renderTargetBright.setSize( resx, resy );
		this._brightSize.set( resx, resy );

		let rx = resx;
		let ry = resy;

		for ( let i = 0; i < this._nMips; i ++ ) {

			// Level 0 blurs in place at bright resolution; the rest halve.

			if ( i > 0 ) {

				rx = Math.max( 1, Math.floor( rx / 2 ) );
				ry = Math.max( 1, Math.floor( ry / 2 ) );

			}

			this._downsampleRTs[ i ].setSize( rx, ry );
			this._accumRTs[ i ].setSize( rx, ry );
			this._levelSizes[ i ].set( rx, ry );

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

		const nMips = this._nMips;
		const downMaterial = this._downsampleMaterial;
		const upMaterial = this._upsampleMaterial;

		// 1. Extract bright areas

		renderer.setRenderTarget( this._renderTargetBright );
		_quadMesh.material = this._highPassFilterMaterial;
		_quadMesh.name = 'Dual Kawase Bloom [ High Pass ]';
		_quadMesh.render( renderer );

		// 2. Downsample chain ( bright -> down0 -> down1 -> ... ). The coarsest level
		// pre-multiplies its `radius` weight so the upsample chain can seed from it.

		_quadMesh.material = downMaterial;

		let sourceTexture = this._renderTargetBright.texture;
		let sourceSize = this._brightSize;

		for ( let i = 0; i < nMips; i ++ ) {

			const isCoarsest = ( i === nMips - 1 );

			downMaterial.colorTexture.value = sourceTexture;
			downMaterial.texelSize.value.set( 1 / sourceSize.x, 1 / sourceSize.y );
			downMaterial.applyWeight.value = isCoarsest ? 1 : 0;
			downMaterial.bloomFactor.value = this._bloomFactors[ i ];
			renderer.setRenderTarget( this._downsampleRTs[ i ] );
			_quadMesh.name = `Dual Kawase Bloom [ Downsample - ${ i } ]`;
			_quadMesh.render( renderer );

			sourceTexture = this._downsampleRTs[ i ].texture;
			sourceSize = this._levelSizes[ i ];

		}

		// 3. Upsample chain with weighted accumulation ( ... -> up1 -> up0 ).
		// Each level adds its matching downsample weighted by `radius`; the
		// coarsest downsample seeds the chain. The finest step ( i = 0 ) lands at
		// bright resolution and applies `strength`, so it doubles as the composite.

		_quadMesh.material = upMaterial;

		for ( let i = nMips - 2; i >= 0; i -- ) {

			const isSeed = ( i === nMips - 2 );

			upMaterial.finalFlag.value = ( i === 0 ) ? 1 : 0;
			upMaterial.bloomFactor.value = this._bloomFactors[ i ];
			upMaterial.prevTexture.value = isSeed ? this._downsampleRTs[ i + 1 ].texture : this._accumRTs[ i + 1 ].texture;
			upMaterial.addTexture.value = this._downsampleRTs[ i ].texture;
			upMaterial.texelSize.value.set( 1 / this._levelSizes[ i + 1 ].x, 1 / this._levelSizes[ i + 1 ].y );

			renderer.setRenderTarget( this._accumRTs[ i ] );
			_quadMesh.name = ( i === 0 ) ? 'Dual Kawase Bloom [ Composite ]' : `Dual Kawase Bloom [ Upsample - ${ i } ]`;
			_quadMesh.render( renderer );

		}

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

		this._highPassFilterMaterial = this._highPassFilterMaterial || new NodeMaterial();
		this._highPassFilterMaterial.fragmentNode = this.highPassFn( { input: this.inputNode, threshold: this.threshold, smoothWidth: this.smoothWidth } ).context( builder.getSharedContext() );
		this._highPassFilterMaterial.name = 'DualKawaseBloom_highPass';
		this._highPassFilterMaterial.needsUpdate = true;

		// downsample material ( Dual Kawase, 5 taps )

		this._downsampleMaterial = this._downsampleMaterial || this._getDownsampleMaterial( builder );

		// upsample material ( Dual Kawase, 8 taps, weighted accumulation )

		this._upsampleMaterial = this._upsampleMaterial || this._getUpsampleMaterial( builder );

		//

		return this._textureOutput;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._renderTargetBright.dispose();

		for ( let i = 0; i < this._nMips; i ++ ) {

			this._downsampleRTs[ i ].dispose();
			this._accumRTs[ i ].dispose();

		}

		if ( this._highPassFilterMaterial !== null ) this._highPassFilterMaterial.dispose();
		if ( this._downsampleMaterial !== null ) this._downsampleMaterial.dispose();
		if ( this._upsampleMaterial !== null ) this._upsampleMaterial.dispose();

	}

	/**
	 * Creates the Dual Kawase downsample material. Each output texel reads the
	 * center plus four diagonal corners of the source.
	 *
	 * @private
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {NodeMaterial}
	 */
	_getDownsampleMaterial( builder ) {

		const colorTexture = texture( null );
		const texelSize = uniform( new Vector2() );
		const offset = this._offset;

		const applyWeight = uniform( 0 );
		const bloomFactor = uniform( 1 );

		const uvNode = uv();

		const downsamplePass = Fn( () => {

			const o = texelSize.mul( 0.5 ).mul( offset );

			const color = colorTexture.sample( uvNode ).mul( 4.0 ).toVar();

			color.addAssign( colorTexture.sample( uvNode.add( vec2( o.x.negate(), o.y.negate() ) ) ) );
			color.addAssign( colorTexture.sample( uvNode.add( vec2( o.x, o.y.negate() ) ) ) );
			color.addAssign( colorTexture.sample( uvNode.add( vec2( o.x.negate(), o.y ) ) ) );
			color.addAssign( colorTexture.sample( uvNode.add( vec2( o.x, o.y ) ) ) );

			// The coarsest level pre-applies its `radius` weight so it can seed the upsample chain.
			const weight = mix( bloomFactor, float( 1.2 ).sub( bloomFactor ), this.radius );

			return vec4( color.rgb.div( 8.0 ).mul( mix( float( 1.0 ), weight, applyWeight ) ), 1.0 );

		} );

		const material = new NodeMaterial();
		material.fragmentNode = downsamplePass().context( builder.getSharedContext() );
		material.name = 'DualKawaseBloom_down';
		material.needsUpdate = true;

		material.colorTexture = colorTexture;
		material.texelSize = texelSize;
		material.applyWeight = applyWeight;
		material.bloomFactor = bloomFactor;

		return material;

	}

	/**
	 * Creates the Dual Kawase upsample material. Each output texel reads four
	 * edge centers and four diagonal corners of the source, then accumulates the
	 * matching downsample level weighted by `radius`.
	 *
	 * @private
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {NodeMaterial}
	 */
	_getUpsampleMaterial( builder ) {

		const prevTexture = texture( null );
		const addTexture = texture( null );
		const texelSize = uniform( new Vector2() );
		const offset = this._offset;

		const finalFlag = uniform( 0 );
		const bloomFactor = uniform( 1 );

		const uvNode = uv();

		const upsamplePass = Fn( () => {

			const o = texelSize.mul( 0.5 ).mul( offset );

			const sum = prevTexture.sample( uvNode.add( vec2( o.x.mul( - 2.0 ), 0.0 ) ) ).rgb.toVar();
			sum.addAssign( prevTexture.sample( uvNode.add( vec2( o.x.mul( 2.0 ), 0.0 ) ) ).rgb );
			sum.addAssign( prevTexture.sample( uvNode.add( vec2( 0.0, o.y.mul( - 2.0 ) ) ) ).rgb );
			sum.addAssign( prevTexture.sample( uvNode.add( vec2( 0.0, o.y.mul( 2.0 ) ) ) ).rgb );

			sum.addAssign( prevTexture.sample( uvNode.add( vec2( o.x.negate(), o.y ) ) ).rgb.mul( 2.0 ) );
			sum.addAssign( prevTexture.sample( uvNode.add( vec2( o.x, o.y ) ) ).rgb.mul( 2.0 ) );
			sum.addAssign( prevTexture.sample( uvNode.add( vec2( o.x.negate(), o.y.negate() ) ) ).rgb.mul( 2.0 ) );
			sum.addAssign( prevTexture.sample( uvNode.add( vec2( o.x, o.y.negate() ) ) ).rgb.mul( 2.0 ) );

			const blurred = sum.div( 12.0 );

			// redistribute the level's contribution between a tight and a wide bloom
			const weight = mix( bloomFactor, float( 1.2 ).sub( bloomFactor ), this.radius );
			const added = addTexture.sample( uvNode ).rgb.mul( weight );

			// keep the total intensity independent of the level count ( the factors sum to `_nMips * 0.6` )
			const norm = 3 / ( this._nMips * 0.6 );
			const result = blurred.add( added ).mul( mix( float( 1.0 ), this.strength.mul( norm ), finalFlag ) );

			return vec4( result, 1.0 );

		} );

		const material = new NodeMaterial();
		material.fragmentNode = upsamplePass().context( builder.getSharedContext() );
		material.name = 'DualKawaseBloom_up';
		material.needsUpdate = true;

		material.prevTexture = prevTexture;
		material.addTexture = addTexture;
		material.texelSize = texelSize;
		material.finalFlag = finalFlag;
		material.bloomFactor = bloomFactor;

		return material;

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
 * @returns {DualKawaseBloomNode}
 */
export const dualKawaseBloom = ( node, strength, radius, threshold ) => new DualKawaseBloomNode( nodeObject( node ), strength, radius, threshold );

export default DualKawaseBloomNode;
