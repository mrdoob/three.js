import { VRButton } from './VRButton.js';
import { XRButton } from './XRButton.js';

function addWebGPUFeature( sessionInit = {} ) {

	const optionalFeatures = [ ...( sessionInit.optionalFeatures || [] ) ];

	if ( optionalFeatures.includes( 'webgpu' ) === false ) {

		optionalFeatures.push( 'webgpu' );

	}

	return {
		...sessionInit,
		optionalFeatures
	};

}

/**
 * A utility class for creating immersive WebXR buttons that explicitly request
 * the `webgpu` session feature for examples built on `WebGPURenderer`.
 *
 * ```js
 * document.body.appendChild( VRButtonGPU.createButton( renderer ) );
 * ```
 *
 * @hideconstructor
 * @three_import import { VRButtonGPU } from 'three/addons/webxr/VRButtonGPU.js';
 */
class VRButtonGPU {

	/**
	 * Constructs a new VR button that requests the `webgpu` session feature.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {XRSessionInit} [sessionInit={}] - The session configuration.
	 * @return {HTMLElement} The button or an error message if `immersive-vr` isn't supported.
	 */
	static createButton( renderer, sessionInit = {} ) {

		return VRButton.createButton( renderer, addWebGPUFeature( sessionInit ) );

	}

	/**
	 * Constructs a new XR button that requests the `webgpu` session feature.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {XRSessionInit} [sessionInit={}] - The session configuration.
	 * @return {HTMLElement} The button or an error message if WebXR isn't supported.
	 */
	static createXRButton( renderer, sessionInit = {} ) {

		return XRButton.createButton( renderer, addWebGPUFeature( sessionInit ) );

	}

}

export { VRButtonGPU };
