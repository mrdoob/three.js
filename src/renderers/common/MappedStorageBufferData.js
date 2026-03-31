class MappedStorageBufferData {

	constructor( array, readBufferGPU = null ) {

		this.array = array;
		this.readBufferGPU = readBufferGPU;

	}

	destroy() {

		if ( this.readBufferGPU !== null ) {

			this.readBufferGPU.unmap();
			this.readBufferGPU.destroy();
			this.readBufferGPU = null;

		}

	}

}

export default MappedStorageBufferData;
