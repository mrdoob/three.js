/**
 * A WebGL 2 backend utility module for managing vertex array objects (VAOs).
 *
 * VAOs are shared between all owners (render objects and compute pipelines)
 * that use the same GPU buffers and deleted when the last owner releases them
 * or when one of their buffers is destroyed.
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
	 * @param {?BufferAttribute} [index=null] - The index attribute.
	 * @return {WebGLVertexArrayObject} The VAO.
	 */
	getVAO( owner, attributes, index = null ) {

		const backend = this.backend;
		const ownerData = backend.get( owner );

		const indexData = ( index !== null ) ? backend.get( index ) : null;
		const indexGPU = ( indexData !== null ) ? indexData.bufferGPU : null;

		if ( this._needsUpdate( ownerData, attributes, indexGPU ) === false ) return ownerData.vaoGPU;

		// determine key, variant and attribute buffers

		let key = '';
		let variant = '';

		const buffers = [];
		const buffersData = [];

		for ( let i = 0; i < attributes.length; i ++ ) {

			const attribute = attributes[ i ];
			const attributeData = backend.get( backend.getBufferAttribute( attribute ) );

			key += ':' + attributeData.id;

			if ( attribute.isInterleavedBufferAttribute ) key += '.' + attribute.offset;

			variant += ':' + ( attributeData.activeBufferIndex || 0 );

			buffers.push( attributeData.bufferGPU );
			buffersData.push( attributeData );

		}

		// the element buffer binding is part of the VAO state

		if ( indexData !== null ) {

			key += '|' + indexData.id;

			buffersData.push( indexData );

		}

		// get cache entry

		let entry = this.cache.get( key );

		if ( key !== ownerData.vaoKey ) {

			if ( ownerData.vaoKey !== undefined ) this._releaseEntry( ownerData.vaoKey ); // release old VAO

			if ( entry === undefined ) {

				entry = { vaos: new Map(), buffersData, usedTimes: 0 };

				this.cache.set( key, entry );

				// each buffer knows its VAOs so they can be deleted with the buffer

				for ( const bufferData of buffersData ) {

					if ( bufferData.vaoKeys === undefined ) bufferData.vaoKeys = new Set();

					bufferData.vaoKeys.add( key );

				}

			}

			entry.usedTimes ++;

			ownerData.vaoKey = key;

		}

		// get correct VAO variant (variants are needed for dual buffer attributes)

		let vaoGPU = entry.vaos.get( variant );

		if ( vaoGPU === undefined ) {

			vaoGPU = this._createVAO( attributes, indexGPU );

			entry.vaos.set( variant, vaoGPU );

		}

		ownerData.vaoGPU = vaoGPU;
		ownerData.vertexBuffers = buffers;
		ownerData.indexBuffer = indexGPU;

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
		ownerData.indexBuffer = undefined;

	}

	/**
	 * Deletes all VAOs referencing the given attribute buffer. Must be called
	 * when the buffer is destroyed since VAOs keep the memory of attached buffers
	 * allocated. Owners of deleted VAOs request a new one with their next draw.
	 *
	 * @param {Object} bufferData - The backend data of the attribute buffer.
	 */
	releaseBuffer( bufferData ) {

		if ( bufferData.vaoKeys === undefined ) return;

		for ( const key of bufferData.vaoKeys ) {

			this._deleteEntry( key );

		}

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
	 * @param {?WebGLBuffer} indexGPU - The index buffer.
	 * @return {boolean} Whether the owner requires a different VAO or not.
	 */
	_needsUpdate( ownerData, attributes, indexGPU ) {

		const buffers = ownerData.vertexBuffers;

		if ( buffers === undefined || buffers.length !== attributes.length || ownerData.indexBuffer !== indexGPU ) return true;

		for ( let i = 0; i < attributes.length; i ++ ) {

			const bufferAttribute = this.backend.getBufferAttribute( attributes[ i ] );

			if ( this.backend.get( bufferAttribute ).bufferGPU !== buffers[ i ] ) return true;

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

		if ( entry === undefined ) return; // already deleted with one of its buffers

		entry.usedTimes --;

		if ( entry.usedTimes === 0 ) this._deleteEntry( key );

	}

	/**
	 * Deletes all VAO variants of the given cache entry.
	 *
	 * @private
	 * @param {string} key - The cache key.
	 */
	_deleteEntry( key ) {

		const { gl, state } = this.backend;

		const entry = this.cache.get( key );

		for ( const vaoGPU of entry.vaos.values() ) {

			if ( state.currentVAO === vaoGPU ) state.resetVertexState();

			gl.deleteVertexArray( vaoGPU );

		}

		for ( const bufferData of entry.buffersData ) {

			bufferData.vaoKeys.delete( key );

		}

		this.cache.delete( key );

	}

	/**
	 * Creates a VAO from the given attributes.
	 *
	 * @private
	 * @param {Array<BufferAttribute>} attributes - An array of buffer attributes.
	 * @param {?WebGLBuffer} indexGPU - The index buffer.
	 * @return {WebGLVertexArrayObject} The VAO.
	 */
	_createVAO( attributes, indexGPU ) {

		const { gl, state } = this.backend;

		const vaoGPU = gl.createVertexArray();

		state.setVertexState( vaoGPU, indexGPU );

		for ( let i = 0; i < attributes.length; i ++ ) {

			const attribute = attributes[ i ];
			const bufferAttribute = this.backend.getBufferAttribute( attribute );
			const attributeData = this.backend.get( bufferAttribute );

			gl.bindBuffer( gl.ARRAY_BUFFER, attributeData.bufferGPU );
			gl.enableVertexAttribArray( i );

			let stride, offset;

			if ( attribute.isInterleavedBufferAttribute === true ) {

				// interleaved attributes can also view a buffer attribute

				const bufferStride = bufferAttribute.isInterleavedBuffer === true ? bufferAttribute.stride : bufferAttribute.itemSize;

				stride = bufferStride * attributeData.bytesPerElement;
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

			if ( bufferAttribute.isInstancedBufferAttribute === true || bufferAttribute.isInstancedInterleavedBuffer === true ) {

				gl.vertexAttribDivisor( i, bufferAttribute.meshPerAttribute );

			}

		}

		gl.bindBuffer( gl.ARRAY_BUFFER, null );

		return vaoGPU;

	}

}

export default WebGLVertexArrayUtils;
