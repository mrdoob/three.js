/**
 * A WebGPU backend utility module for managing the device's capabilities.
 *
 * @private
 */
class WebGPUCapabilities {

	/**
	 * Constructs a new utility object.
	 *
	 * @param {WebGPUBackend} backend - The WebGPU backend.
	 */
	constructor( backend ) {

		/**
		 * A reference to the WebGPU backend.
		 *
		 * @type {WebGPUBackend}
		 */
		this.backend = backend;

	}

	/**
	 * Returns the maximum anisotropy texture filtering value.
	 *
	 * @return {number} The maximum anisotropy texture filtering value.
	 */
	getMaxAnisotropy() {

		return 16;

	}

	/**
	 * Returns the maximum number of bytes available for uniform buffers.
	 *
	 * @return {number} The maximum number of bytes available for uniform buffers.
	 */
	getUniformBufferLimit() {

		return this.backend.device.limits.maxUniformBufferBindingSize;

	}

}

export default WebGPUCapabilities;
