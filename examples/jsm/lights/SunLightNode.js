import { AnalyticLightNode } from 'three/webgpu';
import { cameraViewMatrix, lightPosition } from 'three/tsl';
import { sunShadow } from './SunShadowNode.js';

/**
 * Module for representing sun lights as nodes. Register it with the
 * renderer's node library to use {@link SunLight} with `WebGPURenderer`:
 * ```js
 * renderer.library.addLight( SunLightNode, SunLight );
 * ```
 *
 * @augments AnalyticLightNode
 * @three_import import { SunLightNode } from 'three/addons/lights/SunLightNode.js';
 */
class SunLightNode extends AnalyticLightNode {

	static get type() {

		return 'SunLightNode';

	}

	/**
	 * Constructs a new sun light node.
	 *
	 * @param {?SunLight} [light=null] - The sun light source.
	 */
	constructor( light = null ) {

		super( light );

	}

	/**
	 * Overwritten to setup the cascaded shadows of sun lights.
	 *
	 * @return {SunShadowNode} The created shadow node.
	 */
	setupShadowNode() {

		return sunShadow( this.light );

	}

	setupDirect() {

		const lightColor = this.colorNode;
		const lightDirection = cameraViewMatrix.transformDirection( lightPosition( this.light ) );

		return { lightDirection, lightColor };

	}

}

export { SunLightNode };
