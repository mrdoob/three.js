/**
 * Sets up a construction-time WebGL fallback for WebGPU XR examples.
 *
 * WebGPU XR requires the browser to expose `XRGPUBinding`. If the API is not
 * available, this helper mutates the renderer parameters to use the existing
 * WebGL fallback backend.
 *
 * @param {Object} parameters - The parameters passed to `WebGPURenderer`.
 * @return {Object} The same parameters object.
 */
function setWebGLXRFallback( parameters ) {

	if ( ! ( 'XRGPUBinding' in window ) ) {

		parameters.forceWebGL = true;

	}

	return parameters;

}

export { setWebGLXRFallback };
