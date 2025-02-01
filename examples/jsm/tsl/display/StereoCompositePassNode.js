import { RenderTarget, StereoCamera, HalfFloatType, LinearFilter, NearestFilter, Vector2, PassNode, QuadMesh, RendererUtils } from 'three/webgpu';
import { texture } from 'three/tsl';

const _size = /*@__PURE__*/ new Vector2();
const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

/**
 * A special (abstract) render pass node that renders the scene
 * as a stereoscopic image. Unlike {@link StereoPassNode}, this
 * node merges the image for the left and right eye
 * into a single one. That is required for effects like
 * anaglyph or parallax barrier.
 *
 * @abstract
 * @augments PassNode
 */
class StereoCompositePassNode extends PassNode {

	static get type() {

		return 'StereoCompositePassNode';

	}

	/**
	 * Constructs a new stereo composite pass node.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to render the scene with.
	 */
	constructor( scene, camera ) {

		super( PassNode.COLOR, scene, camera );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isStereoCompositePassNode = true;

		/**
		 * The internal stereo camera that is used to render the scene.
		 *
		 * @type {StereoCamera}
		 */
		this.stereo = new StereoCamera();
		const _params = { minFilter: LinearFilter, magFilter: NearestFilter, type: HalfFloatType };

		/**
		 * The render target for rendering the left eye's view.
		 *
		 * @type {RenderTarget}
		 */
		this._renderTargetL = new RenderTarget( 1, 1, _params );

		/**
		 * The render target for rendering the right eye's view.
		 *
		 * @type {RenderTarget}
		 */
		this._renderTargetR = new RenderTarget( 1, 1, _params );

		/**
		 * A texture node representing the left's eye view.
		 *
		 * @type {TextureNode}
		 */
		this._mapLeft = texture( this._renderTargetL.texture );

		/**
		 * A texture node representing the right's eye view.
		 *
		 * @type {TextureNode}
		 */
		this._mapRight = texture( this._renderTargetR.texture );

		/**
		 * The node material that implements the composite. All
		 * derived effect passes must provide an instance for rendering.
		 *
		 * @type {NodeMaterial}
		 */
		this._material = null;

	}

	/**
	 * Updates the internal stereo camera.
	 *
	 * @param {Number} coordinateSystem - The current coordinate system.
	 */
	updateStereoCamera( coordinateSystem ) {

		this.stereo.cameraL.coordinateSystem = coordinateSystem;
		this.stereo.cameraR.coordinateSystem = coordinateSystem;
		this.stereo.update( this.camera );

	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {Number} width - The width of the pass.
	 * @param {Number} height - The height of the pass.
	 */
	setSize( width, height ) {

		super.setSize( width, height );

		this._renderTargetL.setSize( this.renderTarget.width, this.renderTarget.height );
		this._renderTargetR.setSize( this.renderTarget.width, this.renderTarget.height );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;
		const { scene, stereo, renderTarget } = this;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		//

		this._pixelRatio = renderer.getPixelRatio();

		this.updateStereoCamera( renderer.coordinateSystem );

		const size = renderer.getSize( _size );
		this.setSize( size.width, size.height );

		// left

		renderer.setRenderTarget( this._renderTargetL );
		renderer.render( scene, stereo.cameraL );

		// right

		renderer.setRenderTarget( this._renderTargetR );
		renderer.render( scene, stereo.cameraR );

		// composite

		renderer.setRenderTarget( renderTarget );
		_quadMesh.material = this._material;
		_quadMesh.render( renderer );

		// restore

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the pass is no longer required.
	 */
	dispose() {

		super.dispose();

		this._renderTargetL.dispose();
		this._renderTargetR.dispose();

		if ( this._material !== null ) {

			this._material.dispose();

		}

	}

}

export default StereoCompositePassNode;
