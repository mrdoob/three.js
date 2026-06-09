import DataMap from './DataMap.js';
import { AttributeType } from './Constants.js';

import { DynamicDrawUsage } from '../../constants.js';

/**
 * This renderer module manages geometry attributes.
 *
 * @private
 * @augments DataMap
 */
class Attributes extends DataMap {

	/**
	 * Constructs a new attribute management component.
	 *
	 * @param {Backend} backend - The renderer's backend.
	 * @param {Info} info - Renderer component for managing metrics and monitoring data.
	 */
	constructor( backend, info ) {

		super();

		/**
		 * The renderer's backend.
		 *
		 * @type {Backend}
		 */
		this.backend = backend;

		/**
		 * Renderer component for managing metrics and monitoring data.
		 *
		 * @type {Info}
		 */
		this.info = info;

		/**
		 * Generation values for attributes. These values are kept separately from
		 * the attribute data so disposal can remove renderer data without losing
		 * the replacement generation.
		 *
		 * @private
		 * @type {WeakMap<BufferAttribute, number>}
		 */
		this.attributeGenerations = new WeakMap();

	}

	/**
	 * Returns the generation for the given attribute.
	 *
	 * @param {BufferAttribute} attribute - The attribute.
	 * @return {number} The attribute generation.
	 */
	getGeneration( attribute ) {

		return this.attributeGenerations.get( attribute ) || 0;

	}

	/**
	 * Registers a bind group as using the given attribute.
	 *
	 * @param {BufferAttribute} attribute - The attribute.
	 * @param {BindGroup} bindGroup - The bind group.
	 * @return {boolean} Whether the bind group has been registered or not.
	 */
	addBindGroup( attribute, bindGroup ) {

		if ( this.backend.isWebGPUBackend !== true ) return false;

		const data = this.data.get( attribute );

		if ( data !== undefined ) {

			if ( data.bindGroups === undefined ) {

				data.bindGroups = new Set();

			}

			data.bindGroups.add( bindGroup );
			return true;

		}

		return false;

	}

	/**
	 * Registers a render bundle as using the given attribute.
	 *
	 * @param {BufferAttribute} attribute - The attribute.
	 * @param {RenderBundle} renderBundle - The render bundle.
	 * @return {boolean} Whether the render bundle has been registered or not.
	 */
	addRenderBundle( attribute, renderBundle ) {

		const data = this.data.get( attribute );

		if ( data !== undefined ) {

			if ( data.renderBundles === undefined ) {

				data.renderBundles = new Set();

			}

			data.renderBundles.add( renderBundle );
			return true;

		}

		return false;

	}

	/**
	 * Removes a render bundle from the attribute usage list.
	 *
	 * @param {BufferAttribute} attribute - The attribute.
	 * @param {RenderBundle} renderBundle - The render bundle.
	 */
	removeRenderBundle( attribute, renderBundle ) {

		const data = this.data.get( attribute );

		if ( data !== undefined && data.renderBundles !== undefined ) {

			data.renderBundles.delete( renderBundle );

		}

	}

	/**
	 * Deletes the data for the given attribute.
	 *
	 * @param {BufferAttribute} attribute - The attribute.
	 * @return {?Object} The deleted attribute data.
	 */
	delete( attribute ) {

		const attributeData = super.delete( attribute );

		if ( attributeData !== null ) {

			if ( attributeData.onDispose !== undefined ) {

				attribute.removeEventListener( 'dispose', attributeData.onDispose );

			}

			if ( this.backend.isWebGPUBackend === true ) {

				if ( attributeData.bindGroups !== undefined ) {

					for ( const bindGroup of attributeData.bindGroups ) {

						const bindGroupData = this.backend.get( bindGroup );

						bindGroupData.groups = undefined;
						bindGroupData.versions = undefined;

					}

				}

				if ( attributeData.renderBundles !== undefined ) {

					for ( const renderBundle of attributeData.renderBundles ) {

						const renderBundleData = this.backend.get( renderBundle );

						renderBundleData.bundleGPU = undefined;
						renderBundleData.version = undefined;
						renderBundleData.renderObjects = undefined;

					}

				}

				this.attributeGenerations.set( attribute, this.getGeneration( attribute ) + 1 );

			}

			this.backend.destroyAttribute( attribute );

			this.info.destroyAttribute( attribute );

		}

		return attributeData;

	}

	/**
	 * Updates the given attribute. This method creates attribute buffers
	 * for new attributes and updates data for existing ones.
	 *
	 * @param {BufferAttribute} attribute - The attribute to update.
	 * @param {number} type - The attribute type.
	 */
	update( attribute, type ) {

		const data = this.get( attribute );
		const bufferAttribute = this._getBufferAttribute( attribute );

		if ( data.version === undefined ) {

			if ( type === AttributeType.VERTEX ) {

				this.backend.createAttribute( attribute );
				this.info.createAttribute( attribute );

			} else if ( type === AttributeType.INDEX ) {

				this.backend.createIndexAttribute( attribute );
				this.info.createIndexAttribute( attribute );

			} else if ( type === AttributeType.STORAGE ) {

				this.backend.createStorageAttribute( attribute );
				this.info.createStorageAttribute( attribute );

			} else if ( type === AttributeType.INDIRECT ) {

				this.backend.createIndirectStorageAttribute( attribute );
				this.info.createIndirectStorageAttribute( attribute );

			}

			if ( this.backend.isWebGPUBackend === true ) {

				if ( attribute.isBufferAttribute === true ) {

					data.onDispose = () => this.delete( attribute );
					attribute.addEventListener( 'dispose', data.onDispose );

				}

			}

			data.version = bufferAttribute.version;

		} else {

			if ( data.version < bufferAttribute.version || bufferAttribute.usage === DynamicDrawUsage ) {

				this.backend.updateAttribute( attribute );

				data.version = bufferAttribute.version;

			}

		}

	}

	/**
	 * Utility method for handling interleaved buffer attributes correctly.
	 * To process them, their `InterleavedBuffer` is returned.
	 *
	 * @param {BufferAttribute} attribute - The attribute.
	 * @return {BufferAttribute|InterleavedBuffer}
	 */
	_getBufferAttribute( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		return attribute;

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		super.dispose();

		this.attributeGenerations = new WeakMap();

	}

}

export default Attributes;
