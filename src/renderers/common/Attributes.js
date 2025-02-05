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
	 */
	constructor( backend ) {

		super();

		/**
		 * The renderer's backend.
		 *
		 * @type {Backend}
		 */
		this.backend = backend;

	}

	/**
	 * Deletes the data for the given attribute.
	 *
	 * @param {BufferAttribute} attribute - The attribute.
	 * @return {Object} The deleted attribute data.
	 */
	delete( attribute ) {

		const attributeData = super.delete( attribute );

		if ( attributeData !== undefined ) {

			this.backend.destroyAttribute( attribute );

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

		if ( data.version === undefined ) {

			if ( type === AttributeType.VERTEX ) {

				this.backend.createAttribute( attribute );

			} else if ( type === AttributeType.INDEX ) {

				this.backend.createIndexAttribute( attribute );

			} else if ( type === AttributeType.STORAGE ) {

				this.backend.createStorageAttribute( attribute );

			} else if ( type === AttributeType.INDIRECT ) {

				this.backend.createIndirectStorageAttribute( attribute );

			}

			data.version = this._getBufferAttribute( attribute ).version;

		} else {

			const bufferAttribute = this._getBufferAttribute( attribute );

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

}

export default Attributes;
