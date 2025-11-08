import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import { ColorManagement } from '../../math/ColorManagement.js';
import { vec4, renderOutput } from '../../nodes/TSL.js';
import { NoToneMapping } from '../../constants.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';
import { warnOnce } from '../../utils.js';

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
 *
 * Note: This module can only be used with `WebGPURenderer`.
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
		 * @type {boolean}
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
		this._quadMesh.name = 'Post-Processing';

		/**
		 * The context of the post processing stack.
		 *
		 * @private
		 * @type {?Object}
		 * @default null
		 */
		this._context = null;

	}

	/**
	 * When `PostProcessing` is used to apply post processing effects,
	 * the application must use this version of `render()` inside
	 * its animation loop (not the one from the renderer).
	 */
	render() {

		const renderer = this.renderer;

		this._update();

		if ( this._context.onBeforePostProcessing !== null ) this._context.onBeforePostProcessing();

		const toneMapping = renderer.toneMapping;
		const outputColorSpace = renderer.outputColorSpace;

		renderer.toneMapping = NoToneMapping;
		renderer.outputColorSpace = ColorManagement.workingColorSpace;

		//

		const currentXR = renderer.xr.enabled;
		renderer.xr.enabled = false;

		this._quadMesh.render( renderer );

		renderer.xr.enabled = currentXR;

		//

		renderer.toneMapping = toneMapping;
		renderer.outputColorSpace = outputColorSpace;

		if ( this._context.onAfterPostProcessing !== null ) this._context.onAfterPostProcessing();

	}

	/**
	 * Returns the current context of the post processing stack.
	 *
	 * @readonly
	 * @type {?Object}
	 */
	get context() {

		return this._context;

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

			const context = {
				postProcessing: this,
				onBeforePostProcessing: null,
				onAfterPostProcessing: null
			};

			let outputNode = this.outputNode;

			if ( this.outputColorTransform === true ) {

				outputNode = outputNode.context( context );

				outputNode = renderOutput( outputNode, toneMapping, outputColorSpace );

			} else {

				context.toneMapping = toneMapping;
				context.outputColorSpace = outputColorSpace;

				outputNode = outputNode.context( context );

			}

			this._context = context;

			this._quadMesh.material.fragmentNode = outputNode;
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
	 * @deprecated
	 * @return {Promise} A Promise that resolves when the render has been finished.
	 */
	async renderAsync() {

		warnOnce( 'PostProcessing: "renderAsync()" has been deprecated. Use "render()" and "await renderer.init();" when creating the renderer.' ); // @deprecated r181

		await this.renderer.init();

		this.render();

	}

}

export default PostProcessing;
