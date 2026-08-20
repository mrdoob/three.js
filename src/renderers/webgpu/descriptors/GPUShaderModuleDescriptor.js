/**
 * Reusable descriptor for `GPUDevice.createShaderModule()`.
 *
 * @private
 */
class GPUShaderModuleDescriptor {

	constructor() {

		/**
		 * The label of the shader module.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The WGSL source code of the shader module.
		 *
		 * @type {string}
		 */
		this.code = '';

		/**
		 * Compilation hints that may help the implementation produce optimized code.
		 *
		 * @type {Array<Object>}
		 */
		this.compilationHints = [];

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';
		this.code = '';
		this.compilationHints.length = 0;

	}

}

export default GPUShaderModuleDescriptor;
