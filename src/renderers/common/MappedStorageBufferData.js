
/**
 * This class represents a mapped storage buffer data.
 * It is used for efficient readback of data from the GPU.
 */
class MappedStorageBufferData {

	/**
	 * Constructs a new MappedStorageBufferData.
	 *
	 * @param {ArrayBuffer} array - The mapped data.
	 * @param {GPUBuffer} [readBufferGPU=null] - The GPU buffer the data is mapped from.
	 */
	constructor( array, readBufferGPU = null ) {

		/**
		 * The mapped data as an ArrayBuffer.
		 *
		 * @type {ArrayBuffer}
		 */
		this.array = array;

		/**
		 * The GPU buffer the data is mapped from.
		 *
		 * @private
		 * @type {?GPUBuffer}
		 * @default null
		 */
		this.readBufferGPU = readBufferGPU;

	}

	/**
	 * Releases the mapped data. After calling this method, the `array` property
	 * will be null and the data is no longer accessible.
	 */
	destroy() {

		if ( this.readBufferGPU !== null ) {

			this.readBufferGPU.unmap();
			this.readBufferGPU.destroy();
			this.readBufferGPU = null;

		}

		this.array = null;

	}

}

export default MappedStorageBufferData;
