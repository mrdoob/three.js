import { TempNode, NodeMaterial, NodeUpdateType, RenderTarget, Vector2, Vector3, Vector4, HalfFloatType, RedFormat, QuadMesh, RendererUtils } from 'three/webgpu';
import { convertToTexture, nodeObject, Fn, uniform, smoothstep, step, passTexture, uniformArray, outputStruct, property, vec4 } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
let _rendererState;

/**
 * Post processing node for creating depth of field (DOF) effect.
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
	 * @param {Node<float>} focalLengthNode - .
	 * @param {Node<float>} bokehScaleNode - .
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
		 *
		 *
		 * @type {Node<float>}
		 */
		this.focalLengthNode = focalLengthNode;

		/**
		 *
		 *
		 * @type {Node<float>}
		 */
		this.bokehScaleNode = bokehScaleNode;

		/**
		 *
		 *
		 * @private
		 * @type {UniformNode<vec3>}
		 */
		this._focusPointView = uniform( new Vector3() );

		/**
		 *
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


		this._CoCMaterial = new NodeMaterial();

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._CoCRT.textures[ 1 ] );

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

		// coc

		_quadMesh.material = this._CoCMaterial;
		renderer.setClearColor( 0x000000, 0 );

		renderer.setRenderTarget( this._CoCRT );
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

		// bokeh

		const bokeh64 = uniformArray( kernels.points64 );
		const bokeh16 = uniformArray( kernels.points16 );

		return this._textureNode;

	}

	_generateKernels() {

		const GOLDEN_ANGLE = 2.39996323;

		const points64 = [];
		const points16 = [];

		let idx64 = 0;
		let idx16 = 0;

		for ( let i = 0; i < 80; i ++ ) {

			const theta = i * GOLDEN_ANGLE;
			const r = Math.sqrt( i ) / Math.sqrt( 80 );

			const p = new Vector4( r * Math.cos( theta ), r * Math.sin( theta ), 0, 0 );

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

		this._CoCMaterial.dispose();

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
 * @param {Node<float> | number} focalLength - .
 * @param {Node<float> | number} bokehScale - .
 * @returns {DepthOfFieldNode}
 */
export const dof = ( node, viewZNode, focusDistance = 1, focalLength = 1, bokehScale = 1 ) => nodeObject( new DepthOfFieldNode( convertToTexture( node ), nodeObject( viewZNode ), nodeObject( focusDistance ), nodeObject( focalLength ), nodeObject( bokehScale ) ) );
