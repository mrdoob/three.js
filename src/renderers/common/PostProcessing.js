import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { vec4, renderOutput } from '../../nodes/TSL.js';
import { LinearSRGBColorSpace, NoToneMapping } from '../../constants.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';

/**
 * This module is responsible to manage the post processing setups in apps.
 * You usually create a single instance of this class and use it to define
 * the output of your post processing effect chain.
 * ```js
 * const postProcessing = new PostProcessing( renderer );
 *
 * const scenePass = pass( scene, camera );
 *
 * postProcessing.outputNode = scenePass;
 * ```
 */
class PostProcessing {

	/**
	 * Constructs a new post processing management module.
	 *
	 * @param {Renderer} renderer - A reference to the renderer.
	 * @param {Node<vec4>} outputNode - An optional output node.
	 */
	constructor( renderer, outputNode = vec4( 0, 0, 1, 1 ) ) {

		/**
		 * A reference to the renderer.
		 *
		 * @type {Renderer}
		 */
		this.renderer = renderer;

		/**
		 * A node which defines the final output of the post
		 * processing. This is usually the last node in a chain
		 * of effect nodes.
		 *
		 * @type {Node<vec4>}
		 */
		this.outputNode = outputNode;

		/**
		 * Whether the default output tone mapping and color
		 * space transformation should be enabled or not.
		 *
		 * It is enabled by default by it must be disabled when
		 * effects must be executed after tone mapping and color
		 * space conversion. A typical example is FXAA which
		 * requires sRGB input.
		 *
		 * When set to `false`, the app must control the output
		 * transformation with `RenderOutputNode`.
		 *
		 * ```js
		 * const outputPass = renderOutput( scenePass );
		 * ```
		 *
		 * @type {Boolean}
		 */
		this.outputColorTransform = true;

		/**
		 * Must be set to `true` when the output node changes.
		 *
		 * @type {Node<vec4>}
		 */
		this.needsUpdate = true;

		const material = new NodeMaterial();
		material.name = 'PostProcessing';

		/**
		 * The full screen quad that is used to render
		 * the effects.
		 *
		 * @private
		 * @type {QuadMesh}
		 */
		this._quadMesh = new QuadMesh( material );

	}

	/**
	 * When `PostProcessing` is used to apply post processing effects,
	 * the application must use this version of `render()` inside
	 * its animation loop (not the one from the renderer).
	 */
	render() {

		this._update();

		const renderer = this.renderer;

		const toneMapping = renderer.toneMapping;
		const outputColorSpace = renderer.outputColorSpace;

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = LinearSRGBColorSpace;

		//

		this._quadMesh.render( renderer );

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this._quadMesh.material.dispose();

	}

	/**
	 * Updates the state of the module.
	 *
	 * @private
	 */
	_update() {

		if ( this.needsUpdate === true ) {

			const renderer = this.renderer;

			const toneMapping = renderer.toneMapping;
			const outputColorSpace = renderer.outputColorSpace;

			this._quadMesh.material.fragmentNode = this.outputColorTransform === true ? renderOutput( this.outputNode, toneMapping, outputColorSpace ) : this.outputNode.context( { toneMapping, outputColorSpace } );
			this._quadMesh.material.needsUpdate = true;

			this.needsUpdate = false;

		}

	}

	/**
	 * When `PostProcessing` is used to apply post processing effects,
	 * the application must use this version of `renderAsync()` inside
	 * its animation loop (not the one from the renderer).
	 *
	 * @async
	 * @return {Promise} A Promise that resolves when the render has been finished.
	 */
	async renderAsync() {

		this._update();

		const renderer = this.renderer;

		const toneMapping = renderer.toneMapping;
		const outputColorSpace = renderer.outputColorSpace;

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = LinearSRGBColorSpace;

		//

		await this._quadMesh.renderAsync( renderer );

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;

	}

}

export default PostProcessing;
