import DataMap from './DataMap.js';
import { AttributeType } from './Constants.js';

import { DynamicDrawUsage } from '../../constants.js';

let _generation = 0;

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
		 * Stores weak references to the buffer attributes with attached
		 * `dispose` event listeners.
		 *
		 * @private
		 * @type {Set<WeakRef<BufferAttribute>>}
		 */
		this._tracked = new Set();

		/**
		 * Removes weak references from `_tracked` when their attribute
		 * has been garbage collected without an explicit `dispose()`.
		 *
		 * @private
		 * @type {FinalizationRegistry}
		 */
		this._registry = new FinalizationRegistry( ( ref ) => this._tracked.delete( ref ) );

		/**
		 * Incremented whenever the buffer of an attribute is destroyed. Render objects
		 * only have to verify their attributes if this version has changed.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.disposeVersion = 0;

	}

	/**
	 * Deletes the data for the given attribute.
	 *
	 * @param {BufferAttribute|InterleavedBuffer} attribute - The attribute.
	 * @return {?Object} The deleted attribute data.
	 */
	delete( attribute ) {

		const attributeData = super.delete( attribute );

		if ( attributeData !== null ) {

			this.disposeVersion ++;

			if ( attribute.isBufferAttribute === true ) {

				attribute.removeEventListener( 'dispose', attributeData.onDispose );

				this._tracked.delete( attributeData.ref );
				this._registry.unregister( attributeData.ref );

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
	 * @param {BufferAttribute|InterleavedBuffer} attribute - The attribute to update.
	 * @param {number} type - The attribute type.
	 */
	update( attribute, type ) {

		const data = this.get( attribute );

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

			data.version = attribute.version;
			data.generation = _generation ++;

			// interleaved buffer attributes are not event dispatchers

			if ( attribute.isBufferAttribute === true ) {

				data.onDispose = () => {

					this.delete( attribute );

				};

				attribute.addEventListener( 'dispose', data.onDispose );

				// see #31798 why tracking separate remove listeners is required right now
				data.ref = new WeakRef( attribute );

				this._tracked.add( data.ref );
				this._registry.register( attribute, data.ref, data.ref );

			}

		} else {

			if ( data.version < attribute.version || attribute.usage === DynamicDrawUsage ) {

				this.backend.updateAttribute( attribute );

				data.version = attribute.version;

			}

		}

	}

	dispose() {

		for ( const ref of this._tracked ) {

			const attribute = ref.deref();

			if ( attribute === undefined || this.has( attribute ) === false ) continue;

			this.delete( attribute );

		}

		this._tracked.clear();

		super.dispose();

	}

}

export default Attributes;
