import { TempNode, NodeMaterial, NodeUpdateType, RenderTarget, Vector2, HalfFloatType, RedFormat, QuadMesh, RendererUtils } from 'three/webgpu';
import { convertToTexture, nodeObject, Fn, uniform, smoothstep, step, texture, max, uniformArray, outputStruct, property, vec4, vec3, uv, Loop, min, mix } from 'three/tsl';
import { gaussianBlur } from './GaussianBlurNode.js';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
let _rendererState;

/**
 * Post processing node for creating depth of field (DOF) effect.
 *
 * References:
 * - {@link https://pixelmischiefblog.wordpress.com/2016/11/25/bokeh-depth-of-field/}
 * - {@link https://www.adriancourreges.com/blog/2016/09/09/doom-2016-graphics-study/}
 *
 * @augments TempNode
 * @three_import import { dof } from 'three/addons/tsl/display/DepthOfFieldNode.js';
 */
class DepthOfFieldNode extends TempNode {

	static get type() {

		return 'DepthOfFieldNode';

	}

	/**
	 * Constructs a new DOF node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 * @param {Node<float>} viewZNode - Represents the viewZ depth values of the scene.
	 * @param {Node<float>} focusDistanceNode - Defines the effect's focus which is the distance along the camera's look direction in world units.
	 * @param {Node<float>} focalLengthNode - How far an object can be from the focal plane before it goes completely out-of-focus in world units.
	 * @param {Node<float>} bokehScaleNode - A unitless value for artistic purposes to adjust the size of the bokeh.
	 */
	constructor( textureNode, viewZNode, focusDistanceNode, focalLengthNode, bokehScaleNode ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * Represents the viewZ depth values of the scene.
		 *
		 * @type {Node<float>}
		 */
		this.viewZNode = viewZNode;

		/**
		 * Defines the effect's focus which is the distance along the camera's look direction in world units.
		 *
		 * @type {Node<float>}
		 */
		this.focusDistanceNode = focusDistanceNode;

		/**
		 * How far an object can be from the focal plane before it goes completely out-of-focus in world units.
		 *
		 * @type {Node<float>}
		 */
		this.focalLengthNode = focalLengthNode;

		/**
		 * A unitless value for artistic purposes to adjust the size of the bokeh.
		 *
		 * @type {Node<float>}
		 */
		this.bokehScaleNode = bokehScaleNode;

		/**
		 * The inverse size of the resolution.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._invSize = uniform( new Vector2() );

		/**
		 * The render target used for the near and far field.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._CoCRT = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, format: RedFormat, count: 2 } );
		this._CoCRT.textures[ 0 ].name = 'DepthOfField.NearField';
		this._CoCRT.textures[ 1 ].name = 'DepthOfField.FarField';

		/**
		 * The render target used for blurring the near field.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._CoCBlurredRT = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, format: RedFormat } );
		this._CoCBlurredRT.texture.name = 'DepthOfField.NearFieldBlurred';

		/**
		 * The render target used for the first blur pass.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._blur64RT = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._blur64RT.texture.name = 'DepthOfField.Blur64';

		/**
		 * The render target used for the near field's second blur pass.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._blur16NearRT = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._blur16NearRT.texture.name = 'DepthOfField.Blur16Near';

		/**
		 * The render target used for the far field's second blur pass.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._blur16FarRT = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._blur16FarRT.texture.name = 'DepthOfField.Blur16Far';

		/**
		 * The render target used for the composite
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._compositeRT = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._compositeRT.texture.name = 'DepthOfField.Composite';

		/**
		 * The material used for the CoC/near and far fields.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._CoCMaterial = new NodeMaterial();

		/**
		 * The material used for blurring the near field.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._CoCBlurredMaterial = new NodeMaterial();

		/**
		 * The material used for the 64 tap blur.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._blur64Material = new NodeMaterial();

		/**
		 * The material used for the 16 tap blur.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._blur16Material = new NodeMaterial();

		/**
		 * The material used for the final composite.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._compositeMaterial = new NodeMaterial();

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._textureNode = texture( this._compositeRT.texture );

		/**
		 * The result of the CoC pass as a texture node.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._CoCTextureNode = texture( this._CoCRT.texture );

		/**
		 * The result of the blur64 pass as a texture node.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._blur64TextureNode = texture( this._blur64RT.texture );

		/**
		 * The result of the near field's blur16 pass as a texture node.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._blur16NearTextureNode = texture( this._blur16NearRT.texture );

		/**
		 * The result of the far field's blur16 pass as a texture node.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._blur16FarTextureNode = texture( this._blur16FarRT.texture );

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node updates
		 * its internal uniforms once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		this._invSize.value.set( 1 / width, 1 / height );

		this._CoCRT.setSize( width, height );
		this._compositeRT.setSize( width, height );

		// blur runs in half resolution

		const halfResX = Math.round( width / 2 );
		const halfResY = Math.round( height / 2 );

		this._CoCBlurredRT.setSize( halfResX, halfResY );
		this._blur64RT.setSize( halfResX, halfResY );
		this._blur16NearRT.setSize( halfResX, halfResY );
		this._blur16FarRT.setSize( halfResX, halfResY );

	}

	/**
	 * Returns the result of the effect as a texture node.
	 *
	 * @return {PassTextureNode} A texture node that represents the result of the effect.
	 */
	getTextureNode() {

		return this._textureNode;

	}

	/**
	 * This method is used to update the effect's uniforms once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		// resize

		const map = this.textureNode.value;
		this.setSize( map.image.width, map.image.height );

		// save state

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.setClearColor( 0x000000, 0 );

		// coc

		_quadMesh.material = this._CoCMaterial;
		renderer.setRenderTarget( this._CoCRT );
		_quadMesh.name = 'DoF [ CoC ]';
		_quadMesh.render( renderer );

		// blur near field to avoid visible aliased edges when the near field
		// is blended with the background

		this._CoCTextureNode.value = this._CoCRT.textures[ 0 ];

		_quadMesh.material = this._CoCBlurredMaterial;
		renderer.setRenderTarget( this._CoCBlurredRT );
		_quadMesh.name = 'DoF [ CoC Blur ]';
		_quadMesh.render( renderer );

		// blur64 near

		this._CoCTextureNode.value = this._CoCBlurredRT.texture;

		_quadMesh.material = this._blur64Material;
		renderer.setRenderTarget( this._blur64RT );
		_quadMesh.name = 'DoF [ Blur64 Near ]';
		_quadMesh.render( renderer );

		// blur16 near

		_quadMesh.material = this._blur16Material;
		renderer.setRenderTarget( this._blur16NearRT );
		_quadMesh.name = 'DoF [ Blur16 Near ]';
		_quadMesh.render( renderer );

		// blur64 far

		this._CoCTextureNode.value = this._CoCRT.textures[ 1 ];

		_quadMesh.material = this._blur64Material;
		renderer.setRenderTarget( this._blur64RT );
		_quadMesh.name = 'DoF [ Blur64 Far ]';
		_quadMesh.render( renderer );

		// blur16 far

		_quadMesh.material = this._blur16Material;
		renderer.setRenderTarget( this._blur16FarRT );
		_quadMesh.name = 'DoF [ Blur16 Far ]';
		_quadMesh.render( renderer );

		// composite

		_quadMesh.material = this._compositeMaterial;
		renderer.setRenderTarget( this._compositeRT );
		_quadMesh.name = 'DoF [ Composite ]';
		_quadMesh.render( renderer );

		// restore

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup( builder ) {

		const kernels = this._generateKernels();

		// CoC, near and far fields

		const nearField = property( 'float' );
		const farField = property( 'float' );

		const outputNode = outputStruct( nearField, farField );

		const CoC = Fn( () => {

			const signedDist = this.viewZNode.negate().sub( this.focusDistanceNode );
			const CoC = smoothstep( 0, this.focalLengthNode, signedDist.abs() );

			nearField.assign( step( signedDist, 0 ).mul( CoC ) );
			farField.assign( step( 0, signedDist ).mul( CoC ) );

			return vec4( 0 );

		} );

		this._CoCMaterial.colorNode = CoC().context( builder.getSharedContext() );
		this._CoCMaterial.outputNode = outputNode;
		this._CoCMaterial.needsUpdate = true;

		// blurred CoC for near field

		this._CoCBlurredMaterial.colorNode = gaussianBlur( this._CoCTextureNode, 1, 2 );
		this._CoCBlurredMaterial.needsUpdate = true;

		// bokeh 64 blur pass

		const bokeh64 = uniformArray( kernels.points64 );

		const blur64 = Fn( () => {

			const acc = vec3();
			const uvNode = uv();

			const CoC = this._CoCTextureNode.sample( uvNode ).r;
			const sampleStep = this._invSize.mul( this.bokehScaleNode ).mul( CoC );

			Loop( 64, ( { i } ) => {

				const sUV = uvNode.add( sampleStep.mul( bokeh64.element( i ) ) );
				const tap = this.textureNode.sample( sUV );

				acc.addAssign( tap.rgb );

			} );

			acc.divAssign( 64 );

			return vec4( acc, CoC );

		} );

		this._blur64Material.fragmentNode = blur64().context( builder.getSharedContext() );
		this._blur64Material.needsUpdate = true;

		// bokeh 16 blur pass

		const bokeh16 = uniformArray( kernels.points16 );

		const blur16 = Fn( () => {

			const uvNode = uv();

			const col = this._blur64TextureNode.sample( uvNode ).toVar();
			const maxVal = col.rgb;
			const CoC = col.a;
			const sampleStep = this._invSize.mul( this.bokehScaleNode ).mul( CoC );

			Loop( 16, ( { i } ) => {

				const sUV = uvNode.add( sampleStep.mul( bokeh16.element( i ) ) );
				const tap = this._blur64TextureNode.sample( sUV );

				maxVal.assign( max( tap.rgb, maxVal ) );

			} );

			return vec4( maxVal, CoC );

		} );

		this._blur16Material.fragmentNode = blur16().context( builder.getSharedContext() );
		this._blur16Material.needsUpdate = true;

		// composite

		const composite = Fn( () => {

			const uvNode = uv();

			const near = this._blur16NearTextureNode.sample( uvNode );
			const far = this._blur16FarTextureNode.sample( uvNode );
			const beauty = this.textureNode.sample( uvNode );

			// TODO: applying the bokeh scale to the near field CoC value introduces blending
			// issues around edges of blurred foreground objects when their are rendered above
			// the background. for now, don't apply the bokeh scale to the blend factors. that
			// will cause less blur for objects which are partly out-of-focus (CoC between 0 and 1).

			const blendNear = min( near.a, 0.5 ).mul( 2 );
			const blendFar = min( far.a, 0.5 ).mul( 2 );

			const result = vec4( 0, 0, 0, 1 ).toVar();
			result.rgb = mix( beauty.rgb, far.rgb, blendFar );
			result.rgb = mix( result.rgb, near.rgb, blendNear );

			return result;

		} );

		this._compositeMaterial.fragmentNode = composite().context( builder.getSharedContext() );
		this._compositeMaterial.needsUpdate = true;

		return this._textureNode;

	}

	_generateKernels() {

		// Vogel's method, see https://www.shadertoy.com/view/4fBXRG
		// this approach allows to generate uniformly distributed sample
		// points in a disc-shaped pattern. Blurring with these samples
		// produces a typical optical lens blur

		const GOLDEN_ANGLE = 2.39996323;
		const SAMPLES = 80;

		const points64 = [];
		const points16 = [];

		let idx64 = 0;
		let idx16 = 0;

		for ( let i = 0; i < SAMPLES; i ++ ) {

			const theta = i * GOLDEN_ANGLE;
			const r = Math.sqrt( i ) / Math.sqrt( SAMPLES );

			const p = new Vector2( r * Math.cos( theta ), r * Math.sin( theta ) );

			if ( i % 5 === 0 ) {

				points16[ idx16 ] = p;
				idx16 ++;

			} else {

				points64[ idx64 ] = p;
				idx64 ++;

			}

		}

		return { points16, points64 };

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._CoCRT.dispose();
		this._CoCBlurredRT.dispose();
		this._blur64RT.dispose();
		this._blur16NearRT.dispose();
		this._blur16FarRT.dispose();
		this._compositeRT.dispose();

		this._CoCMaterial.dispose();
		this._CoCBlurredMaterial.dispose();
		this._blur64Material.dispose();
		this._blur16Material.dispose();
		this._compositeMaterial.dispose();

	}

}

export default DepthOfFieldNode;

/**
 * TSL function for creating a depth-of-field effect (DOF) for post processing.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {Node<float>} viewZNode - Represents the viewZ depth values of the scene.
 * @param {Node<float> | number} focusDistance - Defines the effect's focus which is the distance along the camera's look direction in world units.
 * @param {Node<float> | number} focalLength - How far an object can be from the focal plane before it goes completely out-of-focus in world units.
 * @param {Node<float> | number} bokehScale - A unitless value for artistic purposes to adjust the size of the bokeh.
 * @returns {DepthOfFieldNode}
 */
export const dof = ( node, viewZNode, focusDistance = 1, focalLength = 1, bokehScale = 1 ) => new DepthOfFieldNode( convertToTexture( node ), nodeObject( viewZNode ), nodeObject( focusDistance ), nodeObject( focalLength ), nodeObject( bokehScale ) );
