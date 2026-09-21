/**
 * A WebGL 2 backend utility module for managing vertex array objects (VAOs).
 *
 * VAOs are shared between all owners (render objects and compute pipelines)
 * that use the same GPU buffers and deleted when the last owner releases them.
 *
 * @private
 */
class WebGLVertexArrayUtils {

	/**
	 * Constructs a new utility object.
	 *
	 * @param {WebGLBackend} backend - The WebGL 2 backend.
	 */
	constructor( backend ) {

		/**
		 * A reference to the WebGL 2 backend.
		 *
		 * @type {WebGLBackend}
		 */
		this.backend = backend;

		/**
		 * The VAO cache. Entries are keyed by the IDs of the attribute buffers
		 * and hold one VAO per combination of active storage buffers as well
		 * as a usage counter.
		 *
		 * @type {Map<string,Object>}
		 */
		this.cache = new Map();

	}

	/**
	 * Returns a VAO for the given attributes.
	 *
	 * @param {RenderObject|ComputePipeline} owner - The render object or compute pipeline using the VAO.
	 * @param {Array<BufferAttribute>} attributes - An array of buffer attributes.
	 * @return {WebGLVertexArrayObject} The VAO.
	 */
	getVAO( owner, attributes ) {

		const backend = this.backend;
		const ownerData = backend.get( owner );

		if ( this._needsUpdate( ownerData, attributes ) === false ) return ownerData.vaoGPU;

		// determine key, variant and attribute buffers

		let key = '';
		let variant = '';

		const buffers = [];

		for ( let i = 0; i < attributes.length; i ++ ) {

			const attributeData = backend.get( attributes[ i ] );

			key += ':' + attributeData.id;
			variant += ':' + ( attributeData.activeBufferIndex || 0 );

			buffers.push( attributeData.bufferGPU );

		}

		// get cache entry

		let entry = this.cache.get( key );

		if ( key !== ownerData.vaoKey ) {

			if ( ownerData.vaoKey !== undefined ) this._releaseEntry( ownerData.vaoKey ); // release old VAO

			if ( entry === undefined ) {

				entry = { vaos: new Map(), usedTimes: 0 };

				this.cache.set( key, entry );

			}

			entry.usedTimes ++;

			ownerData.vaoKey = key;

		}

		// get correct VAO variant (variants are needed for dual buffer attributes)

		let vaoGPU = entry.vaos.get( variant );

		if ( vaoGPU === undefined ) {

			vaoGPU = this._createVAO( attributes );

			entry.vaos.set( variant, vaoGPU );

		}

		ownerData.vaoGPU = vaoGPU;
		ownerData.vertexBuffers = buffers;

		return vaoGPU;

	}

	/**
	 * Releases the VAO used by the given owner.
	 *
	 * @param {RenderObject|ComputePipeline} owner - The render object or compute pipeline.
	 */
	releaseVAO( owner ) {

		const ownerData = this.backend.get( owner );

		if ( ownerData.vaoKey === undefined ) return;

		this._releaseEntry( ownerData.vaoKey );

		ownerData.vaoKey = undefined;
		ownerData.vaoGPU = undefined;
		ownerData.vertexBuffers = undefined;

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		const { gl } = this.backend;

		for ( const entry of this.cache.values() ) {

			for ( const vaoGPU of entry.vaos.values() ) {

				gl.deleteVertexArray( vaoGPU );

			}

		}

		this.cache.clear();

	}

	/**
	 * Returns `true` if the given attributes refer to other GPU buffers than
	 * the VAO of the given owner.
	 *
	 * @private
	 * @param {Object} ownerData - The backend data of the owner.
	 * @param {Array<BufferAttribute>} attributes - An array of buffer attributes.
	 * @return {boolean} Whether the owner requires a different VAO or not.
	 */
	_needsUpdate( ownerData, attributes ) {

		const buffers = ownerData.vertexBuffers;

		if ( buffers === undefined || buffers.length !== attributes.length ) return true;

		for ( let i = 0; i < attributes.length; i ++ ) {

			if ( this.backend.get( attributes[ i ] ).bufferGPU !== buffers[ i ] ) return true;

		}

		return false;

	}

	/**
	 * Releases the VAO entry. If possible, the all VAO variants are deleted.
	 *
	 * @private
	 * @param {string} key - The cache key.
	 */
	_releaseEntry( key ) {

		const entry = this.cache.get( key );

		entry.usedTimes --;

		if ( entry.usedTimes === 0 ) {

			const { gl } = this.backend;

			for ( const vaoGPU of entry.vaos.values() ) {

				gl.deleteVertexArray( vaoGPU );

			}

			this.cache.delete( key );

		}

	}

	/**
	 * Creates a VAO from the given attributes.
	 *
	 * @private
	 * @param {Array<BufferAttribute>} attributes - An array of buffer attributes.
	 * @return {WebGLVertexArrayObject} The VAO.
	 */
	_createVAO( attributes ) {

		const { gl, state } = this.backend;

		const vaoGPU = gl.createVertexArray();

		state.setVertexState( vaoGPU );

		for ( let i = 0; i < attributes.length; i ++ ) {

			const attribute = attributes[ i ];
			const attributeData = this.backend.get( attribute );

			gl.bindBuffer( gl.ARRAY_BUFFER, attributeData.bufferGPU );
			gl.enableVertexAttribArray( i );

			let stride, offset;

			if ( attribute.isInterleavedBufferAttribute === true ) {

				stride = attribute.data.stride * attributeData.bytesPerElement;
				offset = attribute.offset * attributeData.bytesPerElement;

			} else {

				stride = 0;
				offset = 0;

			}

			if ( attributeData.isInteger ) {

				gl.vertexAttribIPointer( i, attribute.itemSize, attributeData.type, stride, offset );

			} else {

				gl.vertexAttribPointer( i, attribute.itemSize, attributeData.type, attribute.normalized, stride, offset );

			}

			if ( attribute.isInstancedBufferAttribute && ! attribute.isInterleavedBufferAttribute ) {

				gl.vertexAttribDivisor( i, attribute.meshPerAttribute );

			} else if ( attribute.isInterleavedBufferAttribute && attribute.data.isInstancedInterleavedBuffer ) {

				gl.vertexAttribDivisor( i, attribute.data.meshPerAttribute );

			}

		}

		gl.bindBuffer( gl.ARRAY_BUFFER, null );

		return vaoGPU;

	}

}

export default WebGLVertexArrayUtils;
